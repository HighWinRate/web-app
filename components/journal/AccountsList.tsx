'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { CreateAccountModal } from './CreateAccountModal';
import type { TradingAccount, TrialLimits } from '@/lib/types/journal';

interface AccountsListProps {
  initialAccounts: TradingAccount[];
  limits: TrialLimits;
}

export function AccountsList({ initialAccounts, limits }: AccountsListProps) {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleAccountCreated = (newAccount: TradingAccount) => {
    setAccounts((prev) => [newAccount, ...prev]);
    setIsCreateModalOpen(false);
  };

  const handleAccountDeleted = (accountId: string) => {
    setAccounts((prev) => prev.filter((acc) => acc.id !== accountId));
  };

  if (accounts.length === 0) {
    return (
      <>
        <Card className="text-center py-12">
          <div className="max-w-md mx-auto">
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">
              هنوز حسابی ایجاد نکرده‌اید
            </h3>
            <p className="text-gray-400 mb-6">
              برای شروع ثبت تریدهای خود، ابتدا یک حساب معاملاتی ایجاد کنید
            </p>
            <Button
              variant="primary"
              onClick={() => setIsCreateModalOpen(true)}
              disabled={!limits.can_add_account}
            >
              {limits.can_add_account
                ? 'ایجاد اولین حساب'
                : 'محدودیت حساب‌ها'}
            </Button>
            {!limits.can_add_account && (
              <p className="text-sm text-red-400 mt-2">
                برای ایجاد حساب بیشتر، اشتراک خریداری کنید
              </p>
            )}
          </div>
        </Card>

        <CreateAccountModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={handleAccountCreated}
        />
      </>
    );
  }

  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">
          حساب‌های معاملاتی ({accounts.length})
        </h2>
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
          disabled={!limits.can_add_account}
        >
          {limits.can_add_account ? 'افزودن حساب جدید' : 'محدودیت حساب‌ها'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            onDelete={handleAccountDeleted}
          />
        ))}
      </div>

      <CreateAccountModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleAccountCreated}
      />
    </>
  );
}

interface AccountCardProps {
  account: TradingAccount;
  onDelete: (id: string) => void;
}

function AccountCard({ account, onDelete }: AccountCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('آیا از حذف این حساب اطمینان دارید؟')) {
      return;
    }

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/journal/accounts/${account.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('خطا در حذف حساب');
      }

      onDelete(account.id);
    } catch (error) {
      alert('خطا در حذف حساب');
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Link href={`/journal/${account.id}`}>
      <Card className="hover:border-blue-500/50 transition-colors cursor-pointer group">
        <div className="p-4">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
              {account.name}
            </h3>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={isDeleting}
              className="text-gray-400 hover:text-red-400 transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">بالانس اولیه:</span>
              <span className="text-white font-medium">
                {new Intl.NumberFormat('fa-IR').format(account.initial_balance)}{' '}
                {account.currency}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-700">
            <span className="text-xs text-gray-500">
              ایجاد شده:{' '}
              {new Date(account.created_at).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
