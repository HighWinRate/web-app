import { SupabaseClient } from '@supabase/supabase-js';
import { Ticket, TicketMessage } from '@/lib/api';

export async function getUserTickets(
  client: SupabaseClient,
  userId: string,
): Promise<Ticket[]> {
  const { data: tickets, error } = await client
    .from<Ticket>('tickets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return tickets || [];
}

export async function getTicketById(
  client: SupabaseClient,
  ticketId: string,
): Promise<Ticket | null> {
  const { data: ticket, error } = await client
    .from<Ticket>('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  return ticket || null;
}

export async function getTicketMessages(
  client: SupabaseClient,
  ticketId: string,
): Promise<TicketMessage[]> {
  const { data: messages, error } = await client
    .from<TicketMessage>('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return messages || [];
}

