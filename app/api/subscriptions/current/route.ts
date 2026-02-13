import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserActiveSubscription,
  checkSubscriptionAccess,
} from '@/lib/data/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'غیرمجاز' }, { status: 401 });
    }

    const subscription = await getUserActiveSubscription(user.id);
    const access = await checkSubscriptionAccess(user.id);

    return NextResponse.json({ subscription, access });
  } catch (error) {
    console.error('Error fetching current subscription:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت اشتراک' },
      { status: 500 },
    );
  }
}
