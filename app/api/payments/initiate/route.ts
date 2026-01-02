import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const EXCHANGE_RATE = 0.00005;
const MOCK_CRYPTO_ADDRESS = 'mock_crypto_address_12345';

export async function POST(request: Request) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return new NextResponse(
      JSON.stringify({ message: 'Authentication required' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const body = await request.json().catch(() => ({}));
  const { productId, cryptoCurrency, discountCode } = body;
  if (!productId || !cryptoCurrency) {
    return new NextResponse(
      JSON.stringify({ message: 'productId and cryptoCurrency are required' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const admin = createAdminClient();

  const { data: product, error: productError } = await admin
    .from('products')
    .select('id, price')
    .eq('id', productId)
    .single();

  if (productError || !product) {
    return new NextResponse(
      JSON.stringify({ message: 'Product not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } },
    );
  }

  const productPrice = product.price;

  const transactionRefId = `TX-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  let discountResult: any = null;
  if (discountCode) {
    discountResult = await admin.rpc('validate_discount', {
      _code: discountCode.trim(),
      _product_id: productId,
      _user_id: session.user.id,
    });

    if (!discountResult?.is_valid) {
      return new NextResponse(
        JSON.stringify({ message: discountResult?.message || 'Invalid discount' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
    }
  }

  const finalPrice = discountResult?.final_price ?? productPrice;
  const cryptoAmount = EXCHANGE_RATE > 0 ? finalPrice * EXCHANGE_RATE : 0;

  const { data: transaction, error: transactionError } = await admin
    .from('transactions')
    .insert({
      user_id: session.user.id,
      product_id: productId,
      amount: finalPrice,
      discount_amount: discountResult?.discount_amount ?? 0,
      discount_code_id: discountResult?.discount_code_id ?? null,
      ref_id: transactionRefId,
      status: 'pending',
      gateway: 'crypto_mock',
      crypto_currency: cryptoCurrency,
      crypto_amount: cryptoAmount,
    })
    .select()
    .single();

  if (transactionError || !transaction) {
    return new NextResponse(
      JSON.stringify({ message: transactionError?.message || 'Failed to create transaction' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }

  return NextResponse.json({
    transactionId: transaction.id,
    refId: transaction.ref_id,
    cryptoAddress: MOCK_CRYPTO_ADDRESS,
    cryptoAmount,
    cryptoCurrency,
    originalPrice: productPrice,
    discountAmount: discountResult?.discount_amount ?? 0,
    finalPrice,
    status: transaction.status,
    message: 'Payment initiated. Awaiting confirmation.',
  });
}

