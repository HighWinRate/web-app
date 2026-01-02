import { SupabaseClient } from '@supabase/supabase-js';
import { Category, Course, File } from '@/lib/api';

type CourseRecord = Course & {
  category_id?: string | null;
};

type ProductCourseRow = {
  course_id?: string | null;
  product_id?: string | null;
};

type PurchaseRow = {
  product_id?: string | null;
};

export async function getCourses(client: SupabaseClient): Promise<Course[]> {
  const { data, error } = await client
    .from('courses')
    .select('*')
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  const courses = (data as CourseRecord[] | null) ?? [];
  if (courses.length === 0) {
    return [];
  }

  const categoryIds = courses
    .map((course) => course.category?.id || course.category_id)
    .filter((id): id is string => Boolean(id));

  const categoryMap = new Map<string, Category>();
  if (categoryIds.length > 0) {
    const { data: categories, error: categoryError } = await client
      .from('categories')
      .select('id, name, slug')
      .in('id', [...new Set(categoryIds)]);
    if (categoryError) {
      throw categoryError;
    }
    categories?.forEach((category) => categoryMap.set(category.id, category));
  }

  const courseIds = courses.map((course) => course.id);
  const { data: filesCourses } = await client
    .from('files_courses_courses')
    .select('filesId, coursesId')
    .in('coursesId', courseIds);

  const fileIds = [
    ...new Set(
      (filesCourses || [])
        .map((relation) => relation.filesId)
        .filter((id): id is string => Boolean(id))
    ),
  ];

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

  const filesByCourse = new Map<string, string[]>();
  (filesCourses || []).forEach((relation) => {
    if (!relation.coursesId || !relation.filesId) return;
    const existing = filesByCourse.get(relation.coursesId) || [];
    existing.push(relation.filesId);
    filesByCourse.set(relation.coursesId, existing);
  });

  return courses.map((course) => ({
    ...course,
    category:
      course.category_id && categoryMap.has(course.category_id)
        ? categoryMap.get(course.category_id) || undefined
        : course.category || undefined,
    files: (filesByCourse.get(course.id) || [])
      .map((fileId) => fileMap.get(fileId))
      .filter(Boolean) as File[],
  }));
}

export async function getCourseById(
  client: SupabaseClient,
  id: string
): Promise<Course | null> {
  const { data, error } = await client
    .from('courses')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }

  const course = data as CourseRecord | null;
  if (!course) {
    return null;
  }

  const { data: category } = await client
    .from('categories')
    .select('id, name, slug')
    .eq('id', course.category_id)
    .single();

  const { data: filesCourses } = await client
    .from('files_courses_courses')
    .select('filesId')
    .eq('coursesId', id);

  const fileIds = [
    ...new Set(
      (filesCourses || [])
        .map((relation) => relation.filesId)
        .filter((fileId): fileId is string => Boolean(fileId))
    ),
  ];

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
    ...course,
    category: category || undefined,
    files,
  };
}

export async function userHasCourseAccess(
  client: SupabaseClient,
  userId: string,
  courseId: string
): Promise<boolean> {
  const { data: courseProducts, error } = await client
    .from('product_courses')
    .select('product_id')
    .eq('course_id', courseId);

  if (error) {
    throw error;
  }

  const productIds = [
    ...new Set(
      (courseProducts || [])
        .map((relation: { product_id?: string | null }) => relation.product_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (productIds.length === 0) {
    return false;
  }

  const { data: purchases, error: purchasesError } = await client
    .from('user_purchases')
    .select('id')
    .eq('user_id', userId)
    .in('product_id', productIds)
    .limit(1);

  if (purchasesError) {
    throw purchasesError;
  }

  return (purchases?.length ?? 0) > 0;
}

export async function getUserCourses(
  client: SupabaseClient,
  userId: string
): Promise<Course[]> {
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
        .map((purchase: PurchaseRow) => purchase.product_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (productIds.length === 0) {
    return [];
  }

  const { data: productCourses, error: productCoursesError } = await client
    .from('product_courses')
    .select('course_id')
    .in('product_id', productIds);

  if (productCoursesError) {
    throw productCoursesError;
  }

  const courseIds = [
    ...new Set(
      (productCourses || [])
        .map((relation: ProductCourseRow) => relation.course_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  if (courseIds.length === 0) {
    return [];
  }

  const { data: coursesData, error: coursesError } = await client
    .from('courses')
    .select('*')
    .in('id', courseIds)
    .order('title', { ascending: true });

  if (coursesError) {
    throw coursesError;
  }

  return (coursesData || []) as Course[];
}
