import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteLesson } from '@/app/admin/actions';
import { ConfirmSubmit, LessonForm } from '@/components/admin/Forms';
import MaterialTable from '@/components/admin/MaterialTable';
import { MaterialCreator } from '@/components/admin/Uploaders';
import { Eye } from '@/components/icons';
import { requireAdmin } from '@/lib/auth';
import { getMaterials } from '@/lib/courses';
import type { Lesson, Module } from '@/lib/types';

export default async function AdminLesson({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('lessons').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const lesson = data as Lesson;

  const [{ data: course }, { data: modules }, { data: content }, materials] = await Promise.all([
    supabase.from('courses').select('id, title, slug').eq('id', lesson.course_id).single(),
    supabase.from('modules').select('*').eq('course_id', lesson.course_id).order('position'),
    supabase.from('lesson_contents').select('youtube_id, body').eq('lesson_id', id).maybeSingle(),
    getMaterials(supabase, { lessonId: id })
  ]);
  const path = `/admin/aulas/${id}`;

  return (
    <>
      <div className="admin-top">
        <div>
          <Link className="eyebrow" href={`/admin/cursos/${lesson.course_id}`}>{course?.title}</Link>
          <h1 style={{ marginTop: 12 }}>{lesson.title}</h1>
        </div>
        <Link className="btn btn-ghost" href={`/cursos/${course?.slug}/aula/${id}`} target="_blank"><Eye width={16} height={16} /> Ver aula</Link>
      </div>

      <LessonForm lesson={lesson} modules={(modules ?? []) as Module[]} youtubeId={content?.youtube_id ?? null} body={content?.body ?? null} />

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head"><h2>Materiais da aula</h2></div>
        <MaterialTable materials={materials} revalidate={path} />
      </section>
      <MaterialCreator scope={{ lessonId: id, courseId: lesson.course_id, revalidate: path }} />

      <form action={deleteLesson} className="panel-actions">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="course_id" value={lesson.course_id} />
        <input type="hidden" name="redirect" value="1" />
        <ConfirmSubmit className="btn btn-danger" message={`Excluir a aula "${lesson.title}"?`}>Excluir aula</ConfirmSubmit>
      </form>
    </>
  );
}
