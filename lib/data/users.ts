import { SupabaseClient } from '@supabase/supabase-js';
import { User } from '@/lib/api';

export async function getUserProfile(
  client: SupabaseClient,
  userId: string,
): Promise<User | null> {
  const { data: user, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return user || null;
}

export async function updateUserProfile(
  client: SupabaseClient,
  userId: string,
  updates: Partial<User>,
): Promise<User> {
  const { data: updatedUser, error } = await client
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  if (!updatedUser) {
    throw new Error('Unable to update user profile');
  }

  return updatedUser;
}

