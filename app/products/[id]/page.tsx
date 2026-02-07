import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getProductById } from '@/lib/data/products';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const product = await getProductById(supabase, id);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}

