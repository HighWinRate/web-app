import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  const { refId, status, txHash, cryptoAmount, cryptoCurrency } = await request
    .json()
    .catch(() => ({}));

  if (!refId || !status) {
    return new NextResponse(
      JSON.stringify({ message: 'refId and status are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const admin = createAdminClient();
  const { data: transaction, error } = await admin
    .from('transactions')
    .select('id, user_id, product_id, status')
    .eq('ref_id', refId)
    .single();

  if (error || !transaction) {
    return new NextResponse(
      JSON.stringify({ message: 'Transaction not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (transaction.status !== 'pending') {
    return NextResponse.json({ message: 'Transaction already processed' });
  }

  const updates: Record<string, unknown> = {
    status,
    tx_hash: txHash ?? null,
    crypto_amount: cryptoAmount ?? null,
    crypto_currency: cryptoCurrency ?? null,
  };

  if (status === 'completed') {
    updates.paid_at = new Date().toISOString();
  } else {
    updates.paid_at = null;
  }

  const { error: updateError } = await admin
    .from('transactions')
    .update(updates)
    .eq('id', transaction.id);

  if (updateError) {
    return new NextResponse(
      JSON.stringify({ message: updateError.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  if (status === 'completed') {
    const { error: purchaseError } = await admin.rpc('complete_purchase', {
      _transaction_id: transaction.id,
    });

    if (purchaseError) {
      return new NextResponse(
        JSON.stringify({ message: purchaseError.message }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  return NextResponse.json({
    message: status === 'completed' ? 'Payment successful' : 'Payment updated',
  });
}

