import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getAccountById,
  getAccountEntries,
  createEntry,
} from '@/lib/data/journal';
import { checkTrialLimits } from '@/lib/data/subscriptions';
import type { CreateJournalEntryData } from '@/lib/types/journal';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const { id } = await params;
    const account = await getAccountById(id);

    if (!account) {
      return NextResponse.json({ error: 'حساب یافت نشد' }, { status: 404 });
    }

    // Verify ownership
    if (account.user_id !== user.id) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const entries = await getAccountEntries(id);

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت ورودی‌ها' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const { id } = await params;
    const account = await getAccountById(id);

    if (!account) {
      return NextResponse.json({ error: 'حساب یافت نشد' }, { status: 404 });
    }

    // Verify ownership
    if (account.user_id !== user.id) {
      return NextResponse.json({ error: 'دسترسی مجاز نیست' }, { status: 403 });
    }

    const body: CreateJournalEntryData = await request.json();

    // Check trial limits only for trades
    if (body.operation_type === 'trade') {
      const limits = await checkTrialLimits(user.id);
      if (!limits.can_add_trade) {
        return NextResponse.json(
          {
            error:
              'شما به محدودیت تریدها رسیده‌اید. برای افزودن تریدهای بیشتر، اشتراک خریداری کنید.',
            limit_reached: true,
          },
          { status: 403 },
        );
      }
    }

    // Validation
    if (!body.entry_date || !body.operation_type) {
      return NextResponse.json(
        { error: 'تاریخ ورود و نوع عملیات الزامی هستند' },
        { status: 400 },
      );
    }

    const entry = await createEntry(user.id, {
      ...body,
      account_id: id,
    });

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد ورودی' },
      { status: 500 },
    );
  }
}
