'use server';

import { notFound } from 'next/navigation';
import CourseDetailClient from '@/components/CourseDetailClient';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getCourseById } from '@/lib/data/courses';

interface Params {
  params: Promise<{
    id: string;
  }>;
}

export default async function CourseDetailPage({ params }: Params) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const course = await getCourseById(supabase, id);

  if (!course) {
    notFound();
  }

  return <CourseDetailClient course={course} />;
}
