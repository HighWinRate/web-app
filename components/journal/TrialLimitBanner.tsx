'use client';

import Link from 'next/link';
import { Button } from '../ui/Button';
import type { TrialLimits } from '@/lib/types/journal';

interface TrialLimitBannerProps {
  limits: TrialLimits;
}

export function TrialLimitBanner({ limits }: TrialLimitBannerProps) {
  if (limits.has_subscription) {
    return null; // No banner for subscribed users
  }

  const accountProgress = (limits.account_count / limits.max_accounts) * 100;
  const tradeProgress = (limits.trade_count / limits.max_trades) * 100;
  const isNearLimit = accountProgress >= 80 || tradeProgress >= 80;
  const isAtLimit = !limits.can_add_account || !limits.can_add_trade;

  if (!isNearLimit && !isAtLimit) {
    return null; // Only show when near or at limit
  }

  return (
    <div
      className={`mb-6 rounded-lg border p-4 ${
        isAtLimit
          ? 'border-red-500/50 bg-red-500/10'
          : 'border-yellow-500/50 bg-yellow-500/10'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h3
            className={`text-lg font-semibold mb-2 ${
              isAtLimit ? 'text-red-400' : 'text-yellow-400'
            }`}
          >
            {isAtLimit
              ? 'به محدودیت نسخه آزمایشی رسیده‌اید'
              : 'در حال نزدیک شدن به محدودیت'}
          </h3>
          <p className="text-sm text-gray-300 mb-3">
            نسخه آزمایشی محدود به {limits.max_accounts} حساب و{' '}
            {limits.max_trades} ترید است.
          </p>

          <div className="space-y-2">
            {/* Account Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">حساب‌ها</span>
                <span
                  className={
                    limits.account_count >= limits.max_accounts
                      ? 'text-red-400'
                      : 'text-gray-300'
                  }
                >
                  {limits.account_count} / {limits.max_accounts}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    limits.account_count >= limits.max_accounts
                      ? 'bg-red-500'
                      : accountProgress >= 80
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(accountProgress, 100)}%` }}
                />
              </div>
            </div>

            {/* Trade Progress */}
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">تریدها</span>
                <span
                  className={
                    limits.trade_count >= limits.max_trades
                      ? 'text-red-400'
                      : 'text-gray-300'
                  }
                >
                  {limits.trade_count} / {limits.max_trades}
                </span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    limits.trade_count >= limits.max_trades
                      ? 'bg-red-500'
                      : tradeProgress >= 80
                        ? 'bg-yellow-500'
                        : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(tradeProgress, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <Link href="/journal/subscribe">
          <Button variant="primary" size="default">
            ارتقا به نسخه کامل
          </Button>
        </Link>
      </div>
    </div>
  );
}
