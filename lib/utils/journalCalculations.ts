import type {
  JournalEntry,
  JournalEntryWithCalculations,
  TradeOutcome,
  TradingAccount,
} from '../types/journal';

/**
 * Calculate trade outcome (win/loss/neutral) based on PnL
 */
export function calculateOutcome(netPnl?: number): TradeOutcome {
  if (!netPnl) return 'neutral';
  if (netPnl > 100) return 'win'; // Threshold can be configurable
  if (netPnl < -100) return 'loss';
  return 'neutral';
}

/**
 * Get day of week in Persian
 */
export function getDayOfWeek(date: string): string {
  return new Date(date).toLocaleDateString('fa-IR', { weekday: 'long' });
}

/**
 * Calculate entry score (number of checked items in checklist)
 */
export function calculateEntryScore(
  checklistResults?: { [key: string]: boolean },
): number {
  if (!checklistResults) return 0;
  return Object.values(checklistResults).filter((v) => v === true).length;
}

/**
 * Calculate new balance for an entry
 */
export function calculateNewBalance(
  initialBalance: number,
  entries: JournalEntry[],
  currentIndex: number,
): number {
  // Sum all PnL up to and including current entry
  const entriesUpToCurrent = entries.slice(0, currentIndex + 1);
  const totalChange = entriesUpToCurrent.reduce(
    (sum, e) => sum + (e.net_pnl || 0),
    0,
  );
  return initialBalance + totalChange;
}

/**
 * Calculate balance change percentage
 */
export function calculateBalanceChangePercentage(
  initialBalance: number,
  newBalance: number,
): number {
  if (initialBalance === 0) return 0;
  return ((newBalance - initialBalance) / initialBalance) * 100;
}

/**
 * Enhance journal entry with calculated fields
 */
export function enhanceJournalEntry(
  entry: JournalEntry,
  account: TradingAccount,
  allEntries: JournalEntry[],
  currentIndex: number,
): JournalEntryWithCalculations {
  const newBalance = calculateNewBalance(
    account.initial_balance,
    allEntries,
    currentIndex,
  );

  return {
    ...entry,
    outcome: calculateOutcome(entry.net_pnl),
    entry_day_of_week: getDayOfWeek(entry.entry_date),
    exit_day_of_week: entry.exit_date
      ? getDayOfWeek(entry.exit_date)
      : undefined,
    entry_score: calculateEntryScore(entry.entry_checklist_results),
    exit_score: calculateEntryScore(entry.exit_checklist_results), // Same function, different data
    new_balance: newBalance,
    balance_change_percentage: calculateBalanceChangePercentage(
      account.initial_balance,
      newBalance,
    ),
  };
}

/**
 * Format number in Persian
 */
export function formatPersianNumber(num: number): string {
  return new Intl.NumberFormat('fa-IR').format(num);
}

/**
 * Format currency
 */
export function formatCurrency(num: number, currency: string): string {
  return `${formatPersianNumber(num)} ${currency}`;
}

/**
 * Format percentage
 */
export function formatPercentage(num: number, decimals: number = 2): string {
  return `${formatPersianNumber(parseFloat(num.toFixed(decimals)))}%`;
}

/**
 * Get color class based on value (for PnL, percentage, etc.)
 */
export function getValueColorClass(value: number): string {
  if (value > 0) return 'text-green-400';
  if (value < 0) return 'text-red-400';
  return 'text-gray-400';
}

/**
 * Get outcome icon and color
 */
export function getOutcomeDisplay(outcome: TradeOutcome): {
  icon: string;
  color: string;
} {
  switch (outcome) {
    case 'win':
      return { icon: '🟢', color: 'text-green-400' };
    case 'loss':
      return { icon: '🔴', color: 'text-red-400' };
    case 'neutral':
      return { icon: '⚪', color: 'text-gray-400' };
  }
}
