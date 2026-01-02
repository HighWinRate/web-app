import { SupabaseClient } from '@supabase/supabase-js';
import { File as FileType } from '@/lib/api';

export interface FileWithRelations extends FileType {
  productIds: string[];
  courseIds: string[];
}

export async function getFileById(
  client: SupabaseClient,
  id: string,
): Promise<FileWithRelations | null> {
  const { data: file, error } = await client
    .from<FileType>('files')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  if (!file) {
    return null;
  }

  const { data: filesProducts } = await client
    .from('files_products')
    .select('product_id')
    .eq('file_id', id);

  const { data: filesCourses } = await client
    .from('files_courses_courses')
    .select('coursesId')
    .eq('filesId', id);

  const productIds = filesProducts
    ? filesProducts
        .map((relation) => relation.product_id)
        .filter((val): val is string => Boolean(val))
    : [];
  const courseIds = filesCourses
    ? filesCourses
        .map((relation) => relation.coursesId)
        .filter((val): val is string => Boolean(val))
    : [];

  return {
    ...file,
    productIds,
    courseIds,
  };
}

export async function getUserFiles(
  client: SupabaseClient,
  userId: string,
): Promise<FileWithRelations[]> {
  const { data: purchases, error: purchasesError } = await client
    .from('user_purchases')
    .select('product_id')
    .eq('user_id', userId);

  if (purchasesError) {
    throw purchasesError;
  }

  const productIds = [
    ...new Set(
      (purchases || [])
        .map((purchase: any) => purchase.product_id)
        .filter((id: string | null): id is string => Boolean(id)),
    ),
  ];

  const { data: filesProducts, error: filesProductsError } = await client
    .from('files_products')
    .select('file_id')
    .in('product_id', productIds);

  if (filesProductsError) {
    throw filesProductsError;
  }

  const fileIds = [
    ...new Set(
      (filesProducts || [])
        .map((relation: any) => relation.file_id)
        .filter((id: string | null): id is string => Boolean(id)),
    ),
  ];

  const fileMap = new Map<string, FileWithRelations>();
  const result: FileWithRelations[] = [];
  for (const id of fileIds) {
    const file = await getFileById(client, id);
    if (file) {
      result.push(file);
    }
  }

  return result;
}

