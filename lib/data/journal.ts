import { createServerSupabaseClient } from '../supabase/server';
import type {
  TradingAccount,
  CreateAccountData,
  UpdateAccountData,
  TradingSymbol,
  CreateSymbolData,
  TradingSetup,
  CreateSetupData,
  EntryChecklist,
  ExitChecklist,
  CreateChecklistData,
  UpdateChecklistData,
  JournalEntry,
  CreateJournalEntryData,
  UpdateJournalEntryData,
  AccountStatistics,
} from '../types/journal';

// =============================
// Trading Accounts
// =============================

export async function getUserAccounts(
  userId: string,
): Promise<TradingAccount[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getAccountById(
  accountId: string,
): Promise<TradingAccount | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error) throw error;
  return data;
}

export async function createAccount(
  userId: string,
  accountData: CreateAccountData,
): Promise<TradingAccount> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_accounts')
    .insert({
      user_id: userId,
      ...accountData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateAccount(
  accountId: string,
  accountData: UpdateAccountData,
): Promise<TradingAccount> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_accounts')
    .update(accountData)
    .eq('id', accountId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAccount(accountId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('trading_accounts')
    .delete()
    .eq('id', accountId);

  if (error) throw error;
}

// =============================
// Trading Symbols
// =============================

export async function getUserSymbols(userId: string): Promise<TradingSymbol[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_symbols')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSymbol(
  userId: string,
  symbolData: CreateSymbolData,
): Promise<TradingSymbol> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_symbols')
    .insert({
      user_id: userId,
      ...symbolData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSymbol(symbolId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('trading_symbols')
    .delete()
    .eq('id', symbolId);

  if (error) throw error;
}

// =============================
// Trading Setups
// =============================

export async function getUserSetups(userId: string): Promise<TradingSetup[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_setups')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createSetup(
  userId: string,
  setupData: CreateSetupData,
): Promise<TradingSetup> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_setups')
    .insert({
      user_id: userId,
      ...setupData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSetup(
  setupId: string,
  setupData: CreateSetupData,
): Promise<TradingSetup> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('trading_setups')
    .update(setupData)
    .eq('id', setupId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSetup(setupId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('trading_setups')
    .delete()
    .eq('id', setupId);

  if (error) throw error;
}

// =============================
// Entry Checklists
// =============================

export async function getUserEntryChecklists(
  userId: string,
): Promise<EntryChecklist[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('entry_checklists')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createEntryChecklist(
  userId: string,
  checklistData: CreateChecklistData,
): Promise<EntryChecklist> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('entry_checklists')
    .insert({
      user_id: userId,
      ...checklistData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateEntryChecklist(
  checklistId: string,
  checklistData: UpdateChecklistData,
): Promise<EntryChecklist> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('entry_checklists')
    .update(checklistData)
    .eq('id', checklistId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEntryChecklist(checklistId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('entry_checklists')
    .delete()
    .eq('id', checklistId);

  if (error) throw error;
}

// =============================
// Exit Checklists
// =============================

export async function getUserExitChecklists(
  userId: string,
): Promise<ExitChecklist[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('exit_checklists')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createExitChecklist(
  userId: string,
  checklistData: CreateChecklistData,
): Promise<ExitChecklist> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('exit_checklists')
    .insert({
      user_id: userId,
      ...checklistData,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExitChecklist(
  checklistId: string,
  checklistData: UpdateChecklistData,
): Promise<ExitChecklist> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('exit_checklists')
    .update(checklistData)
    .eq('id', checklistId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteExitChecklist(checklistId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('exit_checklists')
    .delete()
    .eq('id', checklistId);

  if (error) throw error;
}

// =============================
// Journal Entries
// =============================

export async function getAccountEntries(
  accountId: string,
): Promise<JournalEntry[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('journal_entries')
    .select(
      `
      *,
      symbol:trading_symbols(*),
      setup:trading_setups(*),
      entry_checklist:entry_checklists(*)
    `,
    )
    .eq('account_id', accountId)
    .order('entry_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function getEntryById(
  entryId: string,
): Promise<JournalEntry | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('journal_entries')
    .select(
      `
      *,
      symbol:trading_symbols(*),
      setup:trading_setups(*),
      entry_checklist:entry_checklists(*)
    `,
    )
    .eq('id', entryId)
    .single();

  if (error) throw error;
  return data;
}

export async function createEntry(
  userId: string,
  entryData: CreateJournalEntryData,
): Promise<JournalEntry> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('journal_entries')
    .insert({
      user_id: userId,
      ...entryData,
    })
    .select(
      `
      *,
      symbol:trading_symbols(*),
      setup:trading_setups(*),
      entry_checklist:entry_checklists(*)
    `,
    )
    .single();

  if (error) throw error;
  return data;
}

export async function updateEntry(
  entryId: string,
  entryData: UpdateJournalEntryData,
): Promise<JournalEntry> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('journal_entries')
    .update(entryData)
    .eq('id', entryId)
    .select(
      `
      *,
      symbol:trading_symbols(*),
      setup:trading_setups(*),
      entry_checklist:entry_checklists(*)
    `,
    )
    .single();

  if (error) throw error;
  return data;
}

export async function deleteEntry(entryId: string): Promise<void> {
  const supabase = await createServerSupabaseClient();

  const { error } = await supabase
    .from('journal_entries')
    .delete()
    .eq('id', entryId);

  if (error) throw error;
}

// =============================
// Statistics
// =============================

export async function getAccountStatistics(
  accountId: string,
): Promise<AccountStatistics> {
  const supabase = await createServerSupabaseClient();

  // Get account details
  const { data: account, error: accountError } = await supabase
    .from('trading_accounts')
    .select('initial_balance')
    .eq('id', accountId)
    .single();

  if (accountError) throw accountError;

  // Get all entries for this account
  const { data: entries, error: entriesError } = await supabase
    .from('journal_entries')
    .select('operation_type, net_pnl')
    .eq('account_id', accountId);

  if (entriesError) throw entriesError;

  // Calculate statistics
  const trades = entries?.filter((e) => e.operation_type === 'trade') || [];
  const total_pnl = entries?.reduce(
    (sum, e) => sum + (e.net_pnl || 0),
    0,
  ) || 0;

  const winning_trades = trades.filter((t) => (t.net_pnl || 0) > 0);
  const losing_trades = trades.filter((t) => (t.net_pnl || 0) < 0);
  const neutral_trades = trades.filter((t) => {
    const pnl = t.net_pnl || 0;
    return pnl >= -100 && pnl <= 100; // Small threshold for neutral
  });

  const total_wins = winning_trades.reduce(
    (sum, t) => sum + (t.net_pnl || 0),
    0,
  );
  const total_losses = Math.abs(
    losing_trades.reduce((sum, t) => sum + (t.net_pnl || 0), 0),
  );

  const current_balance = account.initial_balance + total_pnl;
  const balance_change_percentage =
    (total_pnl / account.initial_balance) * 100;

  return {
    total_trades: trades.length,
    winning_trades: winning_trades.length,
    losing_trades: losing_trades.length,
    neutral_trades: neutral_trades.length,
    win_rate:
      trades.length > 0 ? (winning_trades.length / trades.length) * 100 : 0,
    total_pnl,
    current_balance,
    balance_change_percentage,
    average_win:
      winning_trades.length > 0 ? total_wins / winning_trades.length : 0,
    average_loss: losing_trades.length > 0 ? total_losses / losing_trades.length : 0,
    largest_win: winning_trades.length > 0
      ? Math.max(...winning_trades.map((t) => t.net_pnl || 0))
      : 0,
    largest_loss: losing_trades.length > 0
      ? Math.abs(Math.min(...losing_trades.map((t) => t.net_pnl || 0)))
      : 0,
    profit_factor: total_losses > 0 ? total_wins / total_losses : total_wins > 0 ? Infinity : 0,
  };
}
