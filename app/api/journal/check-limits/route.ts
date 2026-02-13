import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { checkTrialLimits } from '@/lib/data/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const limits = await checkTrialLimits(user.id);

    return NextResponse.json({ limits });
  } catch (error) {
    console.error('Error checking limits:', error);
    return NextResponse.json(
      { error: 'خطا در بررسی محدودیت‌ها' },
      { status: 500 },
    );
  }
}
