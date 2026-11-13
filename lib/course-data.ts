import 'server-only';
import { redirect } from 'next/navigation';
import { publicImage } from '@/lib/admin/storage';
import { youtubeThumb } from '@/lib/admin/youtube';
import { createClient } from '@/lib/supabase/server';
import { needsSecondFactor, verifyUrl } from '@/lib/supabase/mfa';

/*
  Dados do curso para as telas do aluno (curso → módulo → aula).
  Pede login, respeita a verificação em duas etapas e só revela o vídeo
  das aulas que a pessoa pode assistir.
*/

export type CourseLesson = {
  id: string;
  title: string;
  durationMinutes: number | null;
  canWatch: boolean;
  isFreePreview: boolean;
  thumb: string | null;
};
export type CourseModule = { id: string; title: string; lessons: CourseLesson[] };

type Row = {
  course_title: string;
  course_description: string | null;
  course_status: string;
  module_id: string | null;
  module_title: string | null;
  lesson_id: string | null;
  lesson_title: string | null;
  duration_minutes: number | null;
  thumbnail_path: string | null;
  is_free_preview: boolean | null;
  can_watch: boolean | null;
};

export async function loadCourse(slug: string, path: string) {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(path)}`);
  if (await needsSecondFactor(supabase)) redirect(verifyUrl(path));

  const { data } = await supabase.rpc('course_outline', { p_slug: slug });
  const rows = (data ?? []) as Row[];
  if (!rows.length) return null;

  const modules: CourseModule[] = [];
  for (const r of rows) {
    if (!r.module_id) continue;
    let m = modules.find((x) => x.id === r.module_id);
    if (!m) modules.push((m = { id: r.module_id, title: r.module_title ?? '', lessons: [] }));
    if (r.lesson_id)
      m.lessons.push({
        id: r.lesson_id,
        title: r.lesson_title ?? '',
        durationMinutes: r.duration_minutes,
        canWatch: Boolean(r.can_watch),
        isFreePreview: Boolean(r.is_free_preview),
        thumb: publicImage(r.thumbnail_path)
      });
  }
  const lessons = modules.flatMap((m) => m.lessons);
  const ids = lessons.map((l) => l.id);

  const [{ data: videos }, { data: progress }] = await Promise.all([
    // Só volta o vídeo das aulas liberadas (regras do banco); serve de capa quando não há thumbnail
    ids.length ? supabase.from('lessons').select('id, youtube_id').in('id', ids) : Promise.resolve({ data: [] }),
    ids.length
      ? supabase
          .from('lesson_progress')
          .select('lesson_id, completed_at, watched, duration_seconds')
          .eq('user_id', user.id)
          .in('lesson_id', ids)
      : Promise.resolve({ data: [] })
  ]);
  const yt = new Map(((videos ?? []) as { id: string; youtube_id: string | null }[]).map((v) => [v.id, v.youtube_id]));
  for (const l of lessons) if (!l.thumb && yt.get(l.id)) l.thumb = youtubeThumb(yt.get(l.id)!);

  const prog = (progress ?? []) as {
    lesson_id: string;
    completed_at: string | null;
    watched: string | null;
    duration_seconds: number | null;
  }[];
  const done = prog.filter((p) => p.completed_at).map((p) => p.lesson_id);

  return {
    supabase,
    user,
    slug,
    title: rows[0].course_title,
    description: rows[0].course_description ?? '',
    draft: rows[0].course_status !== 'published',
    modules,
    lessons,
    done,
    progress: prog,
    // Próxima aula a assistir: a primeira liberada ainda não concluída
    nextLesson: lessons.find((l) => l.canWatch && !done.includes(l.id)) ?? lessons.find((l) => l.canWatch) ?? null
  };
}

export const lessonUrl = (slug: string, id: string) => `/cursos/${slug}/aula/${id}`;
export const moduleUrl = (slug: string, id: string) => `/cursos/${slug}/modulo/${id}`;
