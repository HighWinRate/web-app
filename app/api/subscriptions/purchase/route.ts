import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPlanById } from '@/lib/data/subscriptions';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const body = await request.json();
    const { plan_id, redirect_url } = body;

    if (!plan_id) {
      return NextResponse.json(
        { error: 'شناسه پلن الزامی است' },
        { status: 400 },
      );
    }

    // Get plan details
    const plan = await getPlanById(plan_id);

    if (!plan || !plan.is_active) {
      return NextResponse.json(
        { error: 'پلن یافت نشد یا غیرفعال است' },
        { status: 404 },
      );
    }

    // Get default bank account (first active one)
    const adminClient = createAdminClient();
    const { data: bankAccount } = await adminClient
      .from('bank_accounts')
      .select('id')
      .eq('is_active', true)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();

    // Generate unique ref_id (TX-timestamp-random)
    const refId = `TX-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // Create transaction for subscription (no product needed)
    const { data: transaction, error: transactionError } = await adminClient
      .from('transactions')
      .insert({
        user_id: user.id,
        product_id: null, // No product - this is a subscription
        subscription_plan_id: plan_id,
        amount: plan.price,
        status: 'pending',
        gateway: 'manual',
        ref_id: refId,
        bank_account_id: bankAccount?.id || null,
      })
      .select()
      .single();

    if (transactionError) throw transactionError;

    // Return transaction details
    // In production, this would redirect to payment gateway
    return NextResponse.json({
      transaction,
      plan,
      message: 'تراکنش ایجاد شد. لطفا پرداخت را انجام دهید.',
      // payment_url: `${redirect_url || '/payments'}?transaction_id=${transaction.id}`,
    });
  } catch (error) {
    console.error('Error creating subscription purchase:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد خرید اشتراک' },
      { status: 500 },
    );
  }
}
