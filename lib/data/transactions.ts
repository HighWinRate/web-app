import { SupabaseClient } from '@supabase/supabase-js';
import {
  DiscountCode,
  Product,
  Transaction,
} from '@/lib/api';

export interface UserPurchaseWithProduct {
  id: string;
  purchased_at: string;
  transaction_id: string | null;
  product: Product;
}

export interface TransactionWithRelations extends Transaction {
  product?: Product | null;
  discount_code?: DiscountCode | null;
}

export async function getUserPurchases(
  client: SupabaseClient,
  userId: string,
): Promise<UserPurchaseWithProduct[]> {
  const { data: purchases, error } = await client
    .from('user_purchases')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  if (!purchases || purchases.length === 0) {
    return [];
  }

  const productIds = [
    ...new Set(
      purchases
        .map((purchase: any) => purchase.product_id)
        .filter((id: string | null): id is string => Boolean(id)),
    ),
  ];

  if (productIds.length === 0) {
    throw new Error('No products found for purchases');
  }

  const { data: products, error: productsError } = await client
    .from<Product>('products')
    .select('*')
    .in('id', productIds);

  if (productsError) {
    throw productsError;
  }

  const productsMap = new Map<string, Product>();
  products?.forEach((product) => productsMap.set(product.id, product));

  return purchases
    .map((purchase: any) => {
      const product = purchase.product_id
        ? productsMap.get(purchase.product_id)
        : undefined;
      if (!product) {
        return null;
      }
      return {
        id: purchase.id,
        purchased_at: purchase.purchased_at,
        transaction_id: purchase.transaction_id,
        product,
      };
    })
    .filter(Boolean) as UserPurchaseWithProduct[];
}

export async function getUserTransactions(
  client: SupabaseClient,
  userId: string,
): Promise<TransactionWithRelations[]> {
  const { data: transactions, error } = await client
    .from<Transaction>('transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  if (!transactions || transactions.length === 0) {
    return [];
  }

  const productIds = [
    ...new Set(
      transactions
        .map((transaction) => transaction.product_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const discountCodeIds = [
    ...new Set(
      transactions
        .map((transaction) => transaction.discount_code_id)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const productsMap = new Map<string, Product>();
  if (productIds.length > 0) {
    const { data: products, error: productsError } = await client
      .from<Product>('products')
      .select('id, title, description, price, thumbnail')
      .in('id', productIds);
    if (productsError) {
      throw productsError;
    }
    products?.forEach((product) => productsMap.set(product.id, product));
  }

  const discountCodesMap = new Map<string, DiscountCode>();
  if (discountCodeIds.length > 0) {
    const { data: discountCodes, error: discountError } = await client
      .from<DiscountCode>('discount_codes')
      .select('id, code, amount, type')
      .in('id', discountCodeIds);
    if (discountError) {
      throw discountError;
    }
    discountCodes?.forEach((code) => discountCodesMap.set(code.id, code));
  }

  return transactions.map((transaction) => ({
    ...transaction,
    product: transaction.product_id
      ? productsMap.get(transaction.product_id) || null
      : null,
    discount_code: transaction.discount_code_id
      ? discountCodesMap.get(transaction.discount_code_id) || null
      : null,
  }));
}

export async function userOwnsProduct(
  client: SupabaseClient,
  userId: string,
  productId: string,
): Promise<boolean> {
  const { data, error } = await client
    .from('user_purchases')
    .select('id')
    .eq('user_id', userId)
    .eq('product_id', productId)
    .limit(1);

  if (error) {
    throw error;
  }

  return (data?.length ?? 0) > 0;
}

