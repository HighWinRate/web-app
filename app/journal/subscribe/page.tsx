import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getActivePlans,
  getUserActiveSubscription,
} from '@/lib/data/subscriptions';
import { SubscriptionPlans } from '@/components/subscription/SubscriptionPlans';

export default async function SubscribePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectedFrom=/journal/subscribe');
  }

  const [plans, currentSubscription] = await Promise.all([
    getActivePlans(),
    getUserActiveSubscription(user.id),
  ]);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            انتخاب اشتراک ژورنال معاملاتی
          </h1>
          <p className="text-xl text-gray-400">
            دسترسی نامحدود به تمام امکانات ژورنال
          </p>
        </div>

        {/* Current Subscription Status */}
        {currentSubscription && !currentSubscription.is_expired ? (
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 mb-8">
            <p className="text-blue-400">
              شما اشتراک {currentSubscription.plan_name} فعال دارید که تا{' '}
              {new Date(currentSubscription.end_date).toLocaleDateString(
                'fa-IR',
              )}{' '}
              اعتبار دارد.
            </p>
          </div>
        ) : (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="bg-yellow-500/20 p-3 rounded-lg">
                <svg
                  className="w-6 h-6 text-yellow-400"
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
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-yellow-400 mb-2">
                  شما در حال استفاده از نسخه آزمایشی هستید
                </h3>
                <ul className="text-gray-300 space-y-1 text-sm">
                  <li>✓ محدودیت: فقط 1 حساب معاملاتی</li>
                  <li>✓ محدودیت: حداکثر 10 ترید</li>
                  <li>⚠️ برای دسترسی نامحدود، یک اشتراک خریداری کنید</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <SubscriptionPlans
          plans={plans}
          currentSubscription={currentSubscription}
        />
      </div>
    </div>
  );
}
