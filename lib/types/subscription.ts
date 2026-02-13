// Subscription Type Definitions

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  is_active: boolean;
  description?: string;
  created_at: string;
  updated_at: string;
}

export type SubscriptionStatus = 'active' | 'expired' | 'cancelled';

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  plan?: SubscriptionPlan; // Populated in joins
  start_date: string;
  end_date: string;
  status: SubscriptionStatus;
  auto_renew: boolean;
  transaction_id?: string;
  created_at: string;
  updated_at: string;
}

// With computed fields
export interface UserSubscriptionWithDetails extends UserSubscription {
  plan_name: string;
  days_remaining: number;
  is_expiring_soon: boolean; // Within 7 days
  is_expired: boolean;
}

// Subscription check result
export interface SubscriptionAccess {
  has_access: boolean;
  subscription: UserSubscriptionWithDetails | null;
  access_type: 'trial' | 'active_subscription' | 'expired' | 'grace_period' | 'no_access';
  message?: string;
}

// For purchase flow
export interface PurchaseSubscriptionData {
  plan_id: string;
  redirect_url?: string;
}

// For renewal
export interface RenewSubscriptionData {
  plan_id: string;
}

// Admin: Create subscription after payment
export interface CreateSubscriptionData {
  user_id: string;
  plan_id: string;
  transaction_id?: string;
  start_date?: string; // Defaults to now
}

// Admin: Subscription list filters
export interface SubscriptionFilters {
  status?: SubscriptionStatus;
  expiring_within_days?: number;
  search?: string; // User email or name
  plan_id?: string;
}

// Expiring subscriptions (for notifications)
export interface ExpiringSubscription {
  subscription_id: string;
  user_id: string;
  user_email: string;
  user_name: string;
  plan_name: string;
  end_date: string;
  days_remaining: number;
}
