'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export async function enrollFree(formData: FormData) {
  const courseId = String(formData.get('courseId'));
  const slug = String(formData.get('slug'));
  const firstLesson = String(formData.get('firstLesson') || '');
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/entrar?next=/cursos/${slug}`);

  await supabase.from('enrollments').upsert(
    { user_id: data.user.id, course_id: courseId, source: 'free' },
    { onConflict: 'user_id,course_id', ignoreDuplicates: true }
  );
  revalidatePath('/painel');
  redirect(firstLesson ? `/cursos/${slug}/aula/${firstLesson}` : `/cursos/${slug}`);
}

export async function toggleLessonDone(formData: FormData) {
  const lessonId = String(formData.get('lessonId'));
  const done = formData.get('done') === '1';
  const path = String(formData.get('path') || '/painel');
  const goNext = String(formData.get('goNext') || '');
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;

  if (done) {
    await supabase.from('lesson_progress').delete().eq('user_id', data.user.id).eq('lesson_id', lessonId);
  } else {
    await supabase.from('lesson_progress').upsert({ user_id: data.user.id, lesson_id: lessonId }, { ignoreDuplicates: true });
  }
  revalidatePath(path);
  if (goNext && !done) redirect(goNext);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase
    .from('profiles')
    .update({
      full_name: String(formData.get('full_name') || '').trim() || null,
      whatsapp: String(formData.get('whatsapp') || '').trim() || null
    })
    .eq('id', data.user.id);
  revalidatePath('/painel');
}
