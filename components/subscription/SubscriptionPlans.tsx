'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import type {
  SubscriptionPlan,
  UserSubscriptionWithDetails,
} from '@/lib/types/subscription';

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentSubscription: UserSubscriptionWithDetails | null;
}

export function SubscriptionPlans({
  plans,
  currentSubscription,
}: SubscriptionPlansProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    setIsLoading(planId);
    try {
      const res = await fetch('/api/subscriptions/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ plan_id: planId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'خطا در ایجاد خرید');
      }

      // Redirect to transactions page
      router.push(
        `/transactions/${data.transaction.id}?message=تراکنش ایجاد شد. لطفا پرداخت را انجام دهید`,
      );
    } catch (error: any) {
      alert(error.message);
      console.error(error);
    } finally {
      setIsLoading(null);
    }
  };

  const monthlyPlan = plans.find((p) => p.duration_days === 30);
  const yearlyPlan = plans.find((p) => p.duration_days === 365);

  if (!monthlyPlan && !yearlyPlan) {
    return (
      <Card className="text-center py-12">
        <p className="text-gray-400">در حال حاضر پلنی موجود نیست</p>
      </Card>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Monthly Plan */}
      {monthlyPlan && (
        <PlanCard
          plan={monthlyPlan}
          isPopular={false}
          onPurchase={handlePurchase}
          isLoading={isLoading === monthlyPlan.id}
          disabled={isLoading !== null}
        />
      )}

      {/* Yearly Plan */}
      {yearlyPlan && (
        <PlanCard
          plan={yearlyPlan}
          isPopular={true}
          onPurchase={handlePurchase}
          isLoading={isLoading === yearlyPlan.id}
          disabled={isLoading !== null}
          savings={
            monthlyPlan
              ? Math.round(
                  ((monthlyPlan.price * 12 - yearlyPlan.price) /
                    (monthlyPlan.price * 12)) *
                    100,
                )
              : undefined
          }
        />
      )}
    </div>
  );
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  isPopular: boolean;
  onPurchase: (planId: string) => void;
  isLoading: boolean;
  disabled: boolean;
  savings?: number;
}

function PlanCard({
  plan,
  isPopular,
  onPurchase,
  isLoading,
  disabled,
  savings,
}: PlanCardProps) {
  return (
    <Card
      className={`p-6 relative ${
        isPopular ? 'border-2 border-blue-500' : ''
      }`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            محبوب‌ترین
          </span>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
        {savings && (
          <div className="text-sm text-green-400 mb-2">
            صرفه‌جویی {savings}%
          </div>
        )}
        <div className="mb-4">
          <span className="text-4xl font-bold text-white">
            {new Intl.NumberFormat('fa-IR').format(plan.price)}
          </span>
          <span className="text-gray-400 mr-2">تومان</span>
        </div>
        <p className="text-gray-400">{plan.duration_days} روز دسترسی</p>
      </div>

      {plan.description && (
        <p className="text-gray-300 text-center mb-6">{plan.description}</p>
      )}

      <div className="space-y-3 mb-6">
        <Feature text="حساب‌های نامحدود" />
        <Feature text="تریدهای نامحدود" />
        <Feature text="سمبل‌ها و ستاپ‌های نامحدود" />
        <Feature text="چک‌لیست‌های سفارشی" />
        <Feature text="آپلود اسکرین‌شات" />
        <Feature text="آمار و تحلیل کامل" />
        <Feature text="پشتیبانی اختصاصی" />
      </div>

      <Button
        variant={isPopular ? 'primary' : 'secondary'}
        onClick={() => onPurchase(plan.id)}
        isLoading={isLoading}
        disabled={disabled}
        className="w-full"
      >
        {isLoading ? 'در حال پردازش...' : 'خرید اشتراک'}
      </Button>
    </Card>
  );
}

function Feature({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2">
      <svg
        className="w-5 h-5 text-green-400 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
      <span className="text-gray-300">{text}</span>
    </div>
  );
}
