import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getAccountById,
  getAccountEntries,
  getAccountStatistics,
  getUserSymbols,
  getUserSetups,
  getUserEntryChecklists,
  getUserExitChecklists,
} from '@/lib/data/journal';
import { checkTrialLimits } from '@/lib/data/subscriptions';
import { JournalTable } from '@/components/journal/JournalTable';
import { Button } from '@/components/ui/Button';

interface PageProps {
  params: Promise<{ accountId: string }>;
}

export default async function JournalAccountPage({ params }: PageProps) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?redirectedFrom=/journal');
  }

  const { accountId } = await params;
  const account = await getAccountById(accountId);

  if (!account) {
    notFound();
  }

  // Verify ownership
  if (account.user_id !== user.id) {
    redirect('/journal');
  }

  const [entries, statistics, limits, symbols, setups, entryChecklists, exitChecklists] =
    await Promise.all([
      getAccountEntries(accountId),
      getAccountStatistics(accountId),
      checkTrialLimits(user.id),
      getUserSymbols(user.id),
      getUserSetups(user.id),
      getUserEntryChecklists(user.id),
      getUserExitChecklists(user.id),
    ]);

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              href="/journal"
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <h1 className="text-3xl font-bold text-white">{account.name}</h1>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <span className="text-gray-400">بالانس اولیه: </span>
              <span className="text-white font-medium">
                {new Intl.NumberFormat('fa-IR').format(account.initial_balance)}{' '}
                {account.currency}
              </span>
            </div>
            <div>
              <span className="text-gray-400">بالانس فعلی: </span>
              <span
                className={`font-medium ${
                  statistics.current_balance >= account.initial_balance
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {new Intl.NumberFormat('fa-IR').format(
                  statistics.current_balance,
                )}{' '}
                {account.currency}
              </span>
            </div>
            <div>
              <span className="text-gray-400">تغییر: </span>
              <span
                className={`font-medium ${
                  statistics.balance_change_percentage >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                }`}
              >
                {statistics.balance_change_percentage >= 0 ? '+' : ''}
                {statistics.balance_change_percentage.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
        <Link href="/journal/settings">
          <Button variant="secondary">تنظیمات</Button>
        </Link>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <StatCard
          label="کل تریدها"
          value={statistics.total_trades.toString()}
        />
        <StatCard
          label="نرخ برد"
          value={`${statistics.win_rate.toFixed(1)}%`}
          valueColor={
            statistics.win_rate >= 50 ? 'text-green-400' : 'text-red-400'
          }
        />
        <StatCard
          label="تریدهای برنده"
          value={statistics.winning_trades.toString()}
          valueColor="text-green-400"
        />
        <StatCard
          label="تریدهای بازنده"
          value={statistics.losing_trades.toString()}
          valueColor="text-red-400"
        />
        <StatCard
          label="کل سود/زیان"
          value={`${new Intl.NumberFormat('fa-IR').format(statistics.total_pnl)} ${account.currency}`}
          valueColor={
            statistics.total_pnl >= 0 ? 'text-green-400' : 'text-red-400'
          }
        />
      </div>

      {/* Journal Table */}
      <JournalTable
        account={account}
        initialEntries={entries}
        limits={limits}
        symbols={symbols}
        setups={setups}
        entryChecklists={entryChecklists}
        exitChecklists={exitChecklists}
      />
    </div>
  );
}

function StatCard({
  label,
  value,
  valueColor = 'text-white',
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
      <div className="text-sm text-gray-400 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
    </div>
  );
}
