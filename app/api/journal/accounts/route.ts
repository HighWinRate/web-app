import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserAccounts,
  createAccount,
} from '@/lib/data/journal';
import { checkTrialLimits } from '@/lib/data/subscriptions';
import type { CreateAccountData } from '@/lib/types/journal';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const accounts = await getUserAccounts(user.id);

    return NextResponse.json({ accounts });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت حساب‌ها' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    // Check trial limits
    const limits = await checkTrialLimits(user.id);
    if (!limits.can_add_account) {
      return NextResponse.json(
        {
          error:
            'شما به محدودیت حساب رسیده‌اید. برای افزودن حساب بیشتر، اشتراک خریداری کنید.',
          limit_reached: true,
        },
        { status: 403 },
      );
    }

    const body: CreateAccountData = await request.json();

    // Validation
    if (!body.name || !body.initial_balance || !body.currency) {
      return NextResponse.json(
        { error: 'نام، بالانس اولیه و واحد پول الزامی هستند' },
        { status: 400 },
      );
    }

    const account = await createAccount(user.id, body);

    return NextResponse.json({ account }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating account:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'حسابی با این نام قبلا ایجاد شده است' },
        { status: 409 },
      );
    }

    return NextResponse.json(
      { error: 'خطا در ایجاد حساب' },
      { status: 500 },
    );
  }
}
