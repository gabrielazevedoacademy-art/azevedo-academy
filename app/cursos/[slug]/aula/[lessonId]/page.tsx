import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import CoursePlayer, { type CurrentLesson } from '@/components/course/CoursePlayer';
import CourseShell, { CourseUnavailable } from '@/components/course/CourseShell';
import type { SavedProgress } from '@/components/course/VideoPlayer';
import { MATERIAL_BUCKET } from '@/lib/admin/storage';
import { lessonUrl, loadCourse, moduleUrl } from '@/lib/course-data';

export const metadata: Metadata = { title: 'Aula | Azevedo Academy', robots: { index: false } };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Tela da aula: vídeo, materiais e o índice do curso ao lado
export default async function AulaPage({ params }: { params: Promise<{ slug: string; lessonId: string }> }) {
  const { slug, lessonId } = await params;
  if (!UUID.test(lessonId)) notFound();
  const course = await loadCourse(slug, lessonUrl(slug, lessonId));
  if (!course) return <CourseUnavailable />;

  const mi = course.modules.findIndex((m) => m.lessons.some((l) => l.id === lessonId));
  if (mi < 0) notFound();
  const mod = course.modules[mi];
  const entry = mod.lessons.find((l) => l.id === lessonId)!;
  // Aula bloqueada: volta para o módulo, onde o cadeado explica
  if (!entry.canWatch) redirect(moduleUrl(slug, mod.id));

  const { data: lesson } = await course.supabase
    .from('lessons')
    .select('id, title, description, youtube_id, lesson_materials(id, title, kind, url, file_path, file_size, position)')
    .eq('id', lessonId)
    .order('position', { referencedTable: 'lesson_materials' })
    .maybeSingle();
  if (!lesson) redirect(moduleUrl(slug, mod.id));

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
    const { data: urls } = await course.supabase.storage.from(MATERIAL_BUCKET).createSignedUrls(paths, 60 * 60);
    (urls ?? []).forEach((u: { path: string | null; signedUrl: string | null }) => u.path && u.signedUrl && signed.set(u.path, u.signedUrl));
  }

  const current: CurrentLesson = {
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
  const p = course.progress.find((x) => x.lesson_id === lesson.id);
  const saved: SavedProgress = p
    ? { watched: p.watched ?? '', durationSeconds: p.duration_seconds, completed: Boolean(p.completed_at) }
    : null;

  return (
    <CourseShell
      crumbs={[
        { label: course.title, href: `/cursos/${slug}` },
        { label: `Módulo ${mi + 1}`, href: moduleUrl(slug, mod.id) },
        { label: lesson.title }
      ]}
      draft={course.draft}
    >
      <CoursePlayer
        userId={course.user.id}
        slug={slug}
        modules={course.modules}
        completed={course.done}
        current={current}
        saved={saved}
      />
    </CourseShell>
  );
}
