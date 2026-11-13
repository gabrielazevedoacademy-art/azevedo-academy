import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CoursePlayer, { type CurrentLesson, type OutlineModule } from '@/components/course/CoursePlayer';
import type { SavedProgress } from '@/components/course/VideoPlayer';
import { MATERIAL_BUCKET } from '@/lib/admin/storage';
import { createClient } from '@/lib/supabase/server';
import { needsSecondFactor, verifyUrl } from '@/lib/supabase/mfa';
import './curso.css';

export const metadata: Metadata = { title: 'Curso | Azevedo Academy', robots: { index: false } };

type Row = {
  course_title: string;
  course_status: string;
  module_id: string | null;
  module_title: string | null;
  lesson_id: string | null;
  lesson_title: string | null;
  duration_minutes: number | null;
  is_free_preview: boolean | null;
  can_watch: boolean | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function CursoPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ aula?: string }>;
}) {
  const { slug } = await params;
  const { aula } = await searchParams;
  const path = `/cursos/${slug}`;
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect(`/entrar?next=${encodeURIComponent(path)}`);
  if (await needsSecondFactor(supabase)) redirect(verifyUrl(path));

  const { data } = await supabase.rpc('course_outline', { p_slug: slug });
  const rows = (data ?? []) as Row[];

  if (!rows.length)
    return (
      <div className="course-page">
        <div className="course-locked course-missing">
          <h1>Este curso ainda não está disponível</h1>
          <p>Ele aparece aqui assim que for publicado.</p>
          <a className="course-nav-btn" href="/#cursos">
            Ver os cursos
          </a>
        </div>
      </div>
    );

  // Monta módulos e aulas a partir das linhas do índice
  const modules: OutlineModule[] = [];
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
        isFreePreview: Boolean(r.is_free_preview)
      });
  }
  const lessons = modules.flatMap((m) => m.lessons);

  const { data: progress } = lessons.length
    ? await supabase
        .from('lesson_progress')
        .select('lesson_id, completed_at, watched, duration_seconds')
        .eq('user_id', user.id)
        .in(
          'lesson_id',
          lessons.map((l) => l.id)
        )
    : { data: [] };
  const done = (progress ?? []).filter((p) => p.completed_at).map((p) => p.lesson_id as string);

  // Aula aberta: a pedida no link, senão a primeira ainda não concluída
  const watchable = lessons.filter((l) => l.canWatch);
  const pick =
    watchable.find((l) => aula && UUID.test(aula) && l.id === aula) ??
    watchable.find((l) => !done.includes(l.id)) ??
    watchable[0];

  let current: CurrentLesson | null = null;
  let saved: SavedProgress = null;
  if (pick) {
    const { data: lesson } = await supabase
      .from('lessons')
      .select('id, title, description, youtube_id, lesson_materials(id, title, kind, url, file_path, file_size, position)')
      .eq('id', pick.id)
      .order('position', { referencedTable: 'lesson_materials' })
      .maybeSingle();
    if (lesson) {
      const mats = (lesson.lesson_materials ?? []) as {
        id: string;
        title: string;
        kind: 'file' | 'link';
        url: string | null;
        file_path: string | null;
        file_size: number | null;
      }[];
      const paths = mats.filter((m) => m.file_path).map((m) => m.file_path!);
      const signed = new Map<string, string>();
      if (paths.length) {
        const { data: urls } = await supabase.storage.from(MATERIAL_BUCKET).createSignedUrls(paths, 60 * 60);
        (urls ?? []).forEach((u) => u.path && u.signedUrl && signed.set(u.path, u.signedUrl));
      }
      current = {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description ?? '',
        youtubeId: lesson.youtube_id,
        materials: mats.map((m) => ({
          id: m.id,
          title: m.title,
          kind: m.kind,
          size: m.file_size,
          href: m.kind === 'link' ? m.url : (signed.get(m.file_path!) ?? null),
          ext: m.file_path?.match(/\.([A-Za-z0-9]{1,6})$/)?.[1]?.toLowerCase() ?? ''
        }))
      };
      const p = (progress ?? []).find((x) => x.lesson_id === lesson.id);
      saved = p
        ? { watched: p.watched ?? '', durationSeconds: p.duration_seconds, completed: Boolean(p.completed_at) }
        : null;
    }
  }

  return (
    <CoursePlayer
      userId={user.id}
      slug={slug}
      courseTitle={rows[0].course_title}
      draft={rows[0].course_status !== 'published'}
      modules={modules}
      completed={done}
      current={current}
      saved={saved}
    />
  );
}
