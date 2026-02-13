import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getUserActiveSubscription,
  getUserSubscriptionHistory,
} from '@/lib/data/subscriptions';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default async function SubscriptionPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectedFrom=/subscription');
  }

  const [activeSubscription, history] = await Promise.all([
    getUserActiveSubscription(user.id),
    getUserSubscriptionHistory(user.id),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">اشتراک من</h1>
          <p className="text-gray-400">
            مدیریت اشتراک و مشاهده تاریخچه پرداخت‌ها
          </p>
        </div>

        {/* Current Subscription */}
        {activeSubscription && !activeSubscription.is_expired ? (
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white mb-1">
                  اشتراک فعال
                </h2>
                <p className="text-2xl font-bold text-blue-400">
                  {activeSubscription.plan_name}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                فعال
              </span>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div>
                <div className="text-sm text-gray-400 mb-1">تاریخ شروع</div>
                <div className="text-white">
                  {new Date(activeSubscription.start_date).toLocaleDateString(
                    'fa-IR',
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">تاریخ پایان</div>
                <div className="text-white">
                  {new Date(activeSubscription.end_date).toLocaleDateString(
                    'fa-IR',
                  )}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-400 mb-1">روزهای باقیمانده</div>
                <div
                  className={`text-xl font-bold ${
                    activeSubscription.days_remaining <= 7
                      ? 'text-yellow-400'
                      : 'text-white'
                  }`}
                >
                  {activeSubscription.days_remaining} روز
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    activeSubscription.is_expiring_soon
                      ? 'bg-yellow-500'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.max(
                      (activeSubscription.days_remaining /
                        (activeSubscription.plan?.duration_days || 30)) *
                        100,
                      5,
                    )}%`,
                  }}
                />
              </div>
            </div>

            {activeSubscription.is_expiring_soon && (
              <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4 mb-4">
                <p className="text-yellow-400">
                  ⚠️ اشتراک شما در حال اتمام است. برای ادامه دسترسی، تمدید کنید.
                </p>
              </div>
            )}

            <Link href="/journal/subscribe">
              <Button variant="primary" className="w-full">
                تمدید اشتراک
              </Button>
            </Link>
          </Card>
        ) : (
          <Card className="p-6 mb-6 text-center">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              اشتراک فعالی ندارید
            </h3>
            <p className="text-gray-400 mb-6">
              با خرید اشتراک، از تمام امکانات ژورنال بهره‌مند شوید
            </p>
            <Link href="/journal/subscribe">
              <Button variant="primary">خرید اشتراک</Button>
            </Link>
          </Card>
        )}

        {/* Subscription History */}
        {history.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              تاریخچه اشتراک‌ها
            </h3>
            <div className="space-y-3">
              {history.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg"
                >
                  <div>
                    <div className="text-white font-medium">
                      {sub.plan?.name}
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(sub.start_date).toLocaleDateString('fa-IR')} -{' '}
                      {new Date(sub.end_date).toLocaleDateString('fa-IR')}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      sub.status === 'active'
                        ? 'bg-green-500/20 text-green-400'
                        : sub.status === 'expired'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-gray-500/20 text-gray-400'
                    }`}
                  >
                    {sub.status === 'active'
                      ? 'فعال'
                      : sub.status === 'expired'
                        ? 'منقضی'
                        : 'لغو شده'}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
