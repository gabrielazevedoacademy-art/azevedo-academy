import 'server-only';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Course, Lesson, Material, ModuleWithLessons } from './types';

export async function getCurriculum(supabase: SupabaseClient, courseId: string): Promise<ModuleWithLessons[]> {
  const [{ data: modules }, { data: lessons }] = await Promise.all([
    supabase.from('modules').select('*').eq('course_id', courseId).order('position').order('created_at'),
    supabase.from('lessons').select('*').eq('course_id', courseId).order('position').order('created_at')
  ]);
  return (modules ?? []).map((m) => ({ ...m, lessons: ((lessons ?? []) as Lesson[]).filter((l) => l.module_id === m.id) }));
}

export async function getCourseBySlug(supabase: SupabaseClient, slug: string) {
  const { data } = await supabase.from('courses').select('*').eq('slug', slug).maybeSingle();
  return data as Course | null;
}

export async function hasAccess(supabase: SupabaseClient, courseId: string) {
  const { data } = await supabase.rpc('has_course_access', { p_course_id: courseId });
  return Boolean(data);
}

export async function getEnrollments(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from('enrollments').select('course_id, created_at, expires_at').eq('user_id', userId);
  return data ?? [];
}

export async function getProgress(supabase: SupabaseClient, userId: string) {
  const { data } = await supabase.from('lesson_progress').select('lesson_id').eq('user_id', userId);
  return new Set((data ?? []).map((r) => r.lesson_id as string));
}

export async function getMaterials(supabase: SupabaseClient, filter: { lessonId?: string; courseLevelOf?: string; standalone?: boolean }) {
  let q = supabase.from('materials').select('*').order('position').order('created_at');
  if (filter.lessonId) q = q.eq('lesson_id', filter.lessonId);
  if (filter.courseLevelOf) q = q.eq('course_id', filter.courseLevelOf).is('lesson_id', null);
  if (filter.standalone) q = q.is('course_id', null).is('lesson_id', null);
  const { data } = await q;
  return (data ?? []) as Material[];
}

export function flattenLessons(curriculum: ModuleWithLessons[]) {
  return curriculum.flatMap((m) => m.lessons);
}
