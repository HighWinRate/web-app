// Trading Journal Type Definitions

export interface TradingAccount {
  id: string;
  user_id: string;
  name: string;
  initial_balance: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface TradingSymbol {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

export interface TradingSetup {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  order: number;
}

export interface EntryChecklist {
  id: string;
  user_id: string;
  name: string;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

export interface ExitChecklist {
  id: string;
  user_id: string;
  name: string;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

export interface ChecklistResults {
  [itemId: string]: boolean;
}

export type OperationType = 'trade' | 'withdrawal' | 'deposit';
export type Direction = 'buy' | 'sell';
export type TradeOutcome = 'win' | 'loss' | 'neutral';

export interface JournalEntry {
  id: string;
  account_id: string;
  user_id: string;
  row_number: number;
  
  // Entry fields
  entry_date: string;
  show_entry_time: boolean;
  symbol_id?: string;
  symbol?: TradingSymbol; // Populated in joins
  operation_type: OperationType;
  setup_id?: string;
  setup?: TradingSetup; // Populated in joins
  direction?: Direction;
  size?: number;
  entry_emotions?: string;
  
  // Rules fields
  entry_checklist_id?: string;
  entry_checklist?: EntryChecklist; // Populated in joins
  entry_checklist_results?: ChecklistResults;
  entry_screenshot_url?: string;
  exit_screenshot_url?: string;
  
  // Risk management
  risk_percentage?: number;
  
  // Exit fields
  net_pnl?: number;
  gross_pnl?: number;
  commission?: number;
  swap?: number;
  exit_date?: string;
  show_exit_time: boolean;
  exit_checklist_id?: string;
  exit_checklist?: ExitChecklist; // Populated in joins
  exit_checklist_results?: ChecklistResults;
  exit_emotions?: string;
  notes?: string;
  
  created_at: string;
  updated_at: string;
}

// Computed fields for UI
export interface JournalEntryWithCalculations extends JournalEntry {
  outcome: TradeOutcome;
  entry_day_of_week: string;
  exit_day_of_week?: string;
  entry_score: number; // Number of checked items in entry checklist
  exit_score: number; // Number of checked items in exit checklist
  new_balance: number;
  balance_change_percentage: number;
}

// Form data types for creating/updating
export interface CreateAccountData {
  name: string;
  initial_balance: number;
  currency: string;
}

export interface UpdateAccountData {
  name?: string;
  initial_balance?: number;
  currency?: string;
}

export interface CreateSymbolData {
  name: string;
}

export interface CreateSetupData {
  name: string;
  description?: string;
}

export interface CreateChecklistData {
  name: string;
  items: Omit<ChecklistItem, 'id'>[];
}

export interface UpdateChecklistData {
  name?: string;
  items?: ChecklistItem[];
}

export interface CreateJournalEntryData {
  account_id: string;
  entry_date: string;
  show_entry_time?: boolean;
  symbol_id?: string;
  operation_type: OperationType;
  setup_id?: string;
  direction?: Direction;
  size?: number;
  entry_emotions?: string;
  entry_checklist_id?: string;
  entry_checklist_results?: ChecklistResults;
  risk_percentage?: number;
  exit_checklist_id?: string;
  exit_checklist_results?: ChecklistResults;
  notes?: string;
}

export interface UpdateJournalEntryData {
  entry_date?: string;
  show_entry_time?: boolean;
  symbol_id?: string;
  operation_type?: OperationType;
  setup_id?: string;
  direction?: Direction;
  size?: number;
  entry_emotions?: string;
  entry_checklist_id?: string;
  entry_checklist_results?: ChecklistResults;
  risk_percentage?: number;
  net_pnl?: number;
  gross_pnl?: number;
  commission?: number;
  swap?: number;
  exit_date?: string;
  show_exit_time?: boolean;
  exit_checklist_id?: string;
  exit_checklist_results?: ChecklistResults;
  exit_emotions?: string;
  notes?: string;
}

// PnL Modal data
export interface PnLData {
  mode: 'simple' | 'detailed';
  net_pnl?: number;
  gross_pnl?: number;
  commission?: number;
  swap?: number;
}

// Statistics
export interface AccountStatistics {
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  neutral_trades: number;
  win_rate: number;
  total_pnl: number;
  current_balance: number;
  balance_change_percentage: number;
  average_win: number;
  average_loss: number;
  largest_win: number;
  largest_loss: number;
  profit_factor: number;
}

// Trial limits
export interface TrialLimits {
  has_subscription: boolean;
  account_count: number;
  trade_count: number;
  can_add_account: boolean;
  can_add_trade: boolean;
  max_accounts: number; // Always 1 for trial
  max_trades: number; // Always 10 for trial
}
