import { createServerSupabaseClient } from '../supabase/server';
import { createAdminClient } from '../supabase/admin';
import type {
  SubscriptionPlan,
  UserSubscription,
  UserSubscriptionWithDetails,
  SubscriptionAccess,
  CreateSubscriptionData,
} from '../types/subscription';
import type { TrialLimits } from '../types/journal';

// =============================
// Subscription Plans
// =============================

export async function getActivePlans(): Promise<SubscriptionPlan[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .order('duration_days', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function getPlanById(
  planId: string,
): Promise<SubscriptionPlan | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single();

  if (error) throw error;
  return data;
}

// =============================
// User Subscriptions
// =============================

export async function getUserActiveSubscription(
  userId: string,
): Promise<UserSubscriptionWithDetails | null> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      plan:subscription_plans(*)
    `,
    )
    .eq('user_id', userId)
    .eq('status', 'active')
    .gt('end_date', new Date().toISOString())
    .order('end_date', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows found
    throw error;
  }

  if (!data || !data.plan) return null;

  const now = new Date();
  const endDate = new Date(data.end_date);
  const daysRemaining = Math.max(
    0,
    Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
  );

  return {
    ...data,
    plan_name: data.plan.name,
    days_remaining: daysRemaining,
    is_expiring_soon: daysRemaining <= 7,
    is_expired: daysRemaining <= 0,
  } as UserSubscriptionWithDetails;
}

export async function getUserSubscriptionHistory(
  userId: string,
): Promise<UserSubscription[]> {
  const supabase = await createServerSupabaseClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      plan:subscription_plans(*)
    `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function hasActiveSubscription(
  userId: string,
): Promise<boolean> {
  const subscription = await getUserActiveSubscription(userId);
  return subscription !== null && !subscription.is_expired;
}

export async function checkSubscriptionAccess(
  userId: string,
): Promise<SubscriptionAccess> {
  const subscription = await getUserActiveSubscription(userId);

  if (!subscription) {
    return {
      has_access: true, // Trial access
      subscription: null,
      access_type: 'trial',
      message: 'دسترسی آزمایشی - محدود به 1 حساب و 10 ترید',
    };
  }

  if (subscription.is_expired) {
    const now = new Date();
    const endDate = new Date(subscription.end_date);
    const daysSinceExpiry = Math.floor(
      (now.getTime() - endDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceExpiry <= 3) {
      // Grace period: read-only access
      return {
        has_access: true,
        subscription,
        access_type: 'grace_period',
        message: `اشتراک شما منقضی شده است. ${3 - daysSinceExpiry} روز تا قطع کامل دسترسی`,
      };
    }

    return {
      has_access: false,
      subscription,
      access_type: 'expired',
      message: 'اشتراک شما منقضی شده است. لطفا تمدید کنید.',
    };
  }

  return {
    has_access: true,
    subscription,
    access_type: 'active_subscription',
    message: subscription.is_expiring_soon
      ? `${subscription.days_remaining} روز تا پایان اشتراک شما`
      : undefined,
  };
}

// =============================
// Trial Limits
// =============================

export async function checkTrialLimits(userId: string): Promise<TrialLimits> {
  const supabase = await createServerSupabaseClient();

  // Check if user has active subscription
  const hasSubscription = await hasActiveSubscription(userId);

  // Get account count
  const { count: accountCount, error: accountError } = await supabase
    .from('trading_accounts')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (accountError) throw accountError;

  // Get trade count (only trades, not withdrawals/deposits)
  const { count: tradeCount, error: tradeError } = await supabase
    .from('journal_entries')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('operation_type', 'trade');

  if (tradeError) throw tradeError;

  const MAX_TRIAL_ACCOUNTS = 1;
  const MAX_TRIAL_TRADES = 10;

  return {
    has_subscription: hasSubscription,
    account_count: accountCount || 0,
    trade_count: tradeCount || 0,
    can_add_account: hasSubscription || (accountCount || 0) < MAX_TRIAL_ACCOUNTS,
    can_add_trade: hasSubscription || (tradeCount || 0) < MAX_TRIAL_TRADES,
    max_accounts: MAX_TRIAL_ACCOUNTS,
    max_trades: MAX_TRIAL_TRADES,
  };
}

// =============================
// Admin Functions (using service role)
// =============================

export async function createSubscription(
  subscriptionData: CreateSubscriptionData,
): Promise<UserSubscription> {
  const supabase = createAdminClient();

  const { user_id, plan_id, transaction_id, start_date } = subscriptionData;

  // Get plan details
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('duration_days')
    .eq('id', plan_id)
    .single();

  if (planError) throw planError;

  // Calculate dates
  const startDate = start_date ? new Date(start_date) : new Date();
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.duration_days);

  // Create subscription
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id,
      plan_id,
      transaction_id,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      auto_renew: false,
    })
    .select(
      `
      *,
      plan:subscription_plans(*)
    `,
    )
    .single();

  if (error) throw error;
  return data;
}

export async function renewSubscription(
  userId: string,
  planId: string,
  transactionId?: string,
): Promise<UserSubscription> {
  const supabase = createAdminClient();

  // Get current subscription
  const currentSubscription = await getUserActiveSubscription(userId);

  // Get new plan details
  const { data: plan, error: planError } = await supabase
    .from('subscription_plans')
    .select('duration_days')
    .eq('id', planId)
    .single();

  if (planError) throw planError;

  // Calculate new dates
  let startDate: Date;
  if (currentSubscription && !currentSubscription.is_expired) {
    // Add to existing subscription
    startDate = new Date(currentSubscription.end_date);
  } else {
    // Start from now
    startDate = new Date();
  }

  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + plan.duration_days);

  // Create new subscription
  const { data, error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan_id: planId,
      transaction_id: transactionId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active',
      auto_renew: false,
    })
    .select(
      `
      *,
      plan:subscription_plans(*)
    `,
    )
    .single();

  if (error) throw error;
  return data;
}

export async function cancelSubscription(
  subscriptionId: string,
): Promise<UserSubscription> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscriptionId)
    .select(
      `
      *,
      plan:subscription_plans(*)
    `,
    )
    .single();

  if (error) throw error;
  return data;
}

export async function getExpiringSubscriptions(
  daysBeforeExpiry: number,
): Promise<UserSubscriptionWithDetails[]> {
  const supabase = createAdminClient();

  const now = new Date();
  const targetDate = new Date(now);
  targetDate.setDate(targetDate.getDate() + daysBeforeExpiry);

  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(
      `
      *,
      plan:subscription_plans(*),
      user:users(id, email, first_name, last_name)
    `,
    )
    .eq('status', 'active')
    .gte('end_date', now.toISOString())
    .lte('end_date', targetDate.toISOString())
    .order('end_date', { ascending: true });

  if (error) throw error;

  return (
    data?.map((sub) => {
      const endDate = new Date(sub.end_date);
      const daysRemaining = Math.max(
        0,
        Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      );

      return {
        ...sub,
        plan_name: sub.plan?.name || '',
        days_remaining: daysRemaining,
        is_expiring_soon: daysRemaining <= 7,
        is_expired: daysRemaining <= 0,
      };
    }) || []
  );
}

export async function expireSubscriptions(): Promise<number> {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('user_subscriptions')
    .update({ status: 'expired' })
    .eq('status', 'active')
    .lt('end_date', new Date().toISOString())
    .select('id');

  if (error) throw error;
  return data?.length || 0;
}
