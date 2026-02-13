import { NextRequest, NextResponse } from 'next/server';
import { getActivePlans } from '@/lib/data/subscriptions';

export async function GET(request: NextRequest) {
  try {
    const plans = await getActivePlans();

    return NextResponse.json({ plans });
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت پلن‌ها' },
      { status: 500 },
    );
  }
}
