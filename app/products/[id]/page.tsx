import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getProductById } from '@/lib/data/products';

interface Params {
  params: {
    id: string;
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const supabase = await createServerSupabaseClient();
  const product = await getProductById(supabase, params.id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

