import { SupabaseClient } from '@supabase/supabase-js';
import { Category, Course, File, Product } from '@/lib/api';

type ProductRecord = Product & {
  category_id?: string | null;
};

function uniqueIds(ids: Array<string | undefined | null>) {
  return [...new Set(ids.filter((id): id is string => Boolean(id)))];
}

export async function getProducts(client: SupabaseClient): Promise<Product[]> {
  const { data: products, error } = await client
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  if (!products || products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.id);
  const categoryIds = uniqueIds(products.map((product) => product.category_id));

  const categoryMap = new Map<string, Category>();
  if (categoryIds.length > 0) {
    const { data: categories, error: categoryError } = await client
      .from('categories')
      .select('id, name, slug')
      .in('id', categoryIds);
    if (categoryError) {
      throw categoryError;
    }
    categories?.forEach((category) => categoryMap.set(category.id, category));
  }

  const { data: productCourses } = await client
    .from('product_courses')
    .select('product_id, course_id')
    .in('product_id', productIds);

  const courseIds = uniqueIds(productCourses?.map((pc) => pc.course_id) || []);
  const courseMap = new Map<string, any>();
  if (courseIds.length > 0) {
    const { data: courses, error: courseError } = await client
      .from('courses')
      .select('*')
      .in('id', courseIds);
    if (courseError) {
      throw courseError;
    }
    courses?.forEach((course) => courseMap.set(course.id, course));
  }

  const { data: filesProducts } = await client
    .from('files_products')
    .select('product_id, file_id')
    .in('product_id', productIds);

  const fileIds = uniqueIds(filesProducts?.map((fp) => fp.file_id) || []);
  const fileMap = new Map<string, File>();
  if (fileIds.length > 0) {
    const { data: files, error: fileError } = await client
      .from('files')
      .select('id, name, type, path, size, isFree, mimetype, url, created_at')
      .in('id', fileIds);
    if (fileError) {
      throw fileError;
    }
    files?.forEach((file) => fileMap.set(file.id, file));
  }

  const productCoursesMap = new Map<string, string[]>();
  productCourses?.forEach((relation) => {
    if (!relation.product_id || !relation.course_id) return;
    const existing = productCoursesMap.get(relation.product_id) || [];
    existing.push(relation.course_id);
    productCoursesMap.set(relation.product_id, existing);
  });

  const productFilesMap = new Map<string, string[]>();
  filesProducts?.forEach((relation) => {
    if (!relation.product_id || !relation.file_id) return;
    const existing = productFilesMap.get(relation.product_id) || [];
    existing.push(relation.file_id);
    productFilesMap.set(relation.product_id, existing);
  });

  return products.map((product) => ({
    ...product,
    category: product.category_id ? categoryMap.get(product.category_id) || null : null,
    courses: (productCoursesMap.get(product.id) || [])
      .map((courseId) => courseMap.get(courseId))
      .filter(Boolean) as Course[],
    files: (productFilesMap.get(product.id) || [])
      .map((fileId) => fileMap.get(fileId))
      .filter(Boolean) as File[],
  }));
}

export async function getProductById(
  client: SupabaseClient,
  id: string,
): Promise<Product | null> {
  const { data: product, error } = await client
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  if (!product) {
    return null;
  }

  const { data: category } = await client
    .from('categories')
    .select('id, name, slug')
    .eq('id', product.category_id)
    .single();

  const { data: productCourses } = await client
    .from('product_courses')
    .select('course_id')
    .eq('product_id', id);

  const courseIds = uniqueIds(productCourses?.map((pc) => pc.course_id) || []);
  let courses: any[] = [];
  if (courseIds.length > 0) {
    const { data: coursesData, error: courseError } = await client
      .from('courses')
      .select('*')
      .in('id', courseIds);
    if (courseError) {
      throw courseError;
    }
    courses = coursesData || [];
  }

  const { data: filesProducts } = await client
    .from('files_products')
    .select('file_id')
    .eq('product_id', id);

  const fileIds = uniqueIds(filesProducts?.map((fp) => fp.file_id) || []);
  let files: File[] = [];
  if (fileIds.length > 0) {
    const { data: filesData, error: fileError } = await client
      .from('files')
      .select('id, name, type, path, size, isFree, mimetype, url, created_at')
      .in('id', fileIds);
    if (fileError) {
      throw fileError;
    }
    files = filesData || [];
  }

  return {
    ...product,
    category: category || null,
    courses,
    files,
  };
}

