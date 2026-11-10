import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import Curriculum from '@/components/Curriculum';
import MaterialList from '@/components/MaterialList';
import SubmitButton from '@/components/SubmitButton';
import { ArrowLeft, ArrowRight, Check } from '@/components/icons';
import { getSessionProfile } from '@/lib/auth';
import { flattenLessons, getCourseBySlug, getCurriculum, getMaterials, getProgress, hasAccess } from '@/lib/courses';
import { toggleLessonDone } from '../../../../actions';

type Params = { params: Promise<{ slug: string; lessonId: string }> };

export async function generateMetadata({ params }: Params) {
  const { lessonId } = await params;
  const { supabase } = await getSessionProfile();
  const { data } = await supabase.from('lessons').select('title').eq('id', lessonId).maybeSingle();
  return data ? { title: data.title, robots: { index: false } } : {};
}

export default async function LessonPage({ params }: Params) {
  const { slug, lessonId } = await params;
  const { supabase, user } = await getSessionProfile();
  const course = await getCourseBySlug(supabase, slug);
  if (!course) notFound();

  const curriculum = await getCurriculum(supabase, course.id);
  const lessons = flattenLessons(curriculum);
  const index = lessons.findIndex((l) => l.id === lessonId);
  if (index === -1) notFound();
  const lesson = lessons[index];

  if (!user) redirect(`/entrar?next=/cursos/${slug}/aula/${lessonId}`);
  const access = await hasAccess(supabase, course.id);
  if (!access && !lesson.is_preview) redirect(`/cursos/${slug}`);

  const [{ data: content }, materials, done] = await Promise.all([
    supabase.from('lesson_contents').select('youtube_id, body').eq('lesson_id', lesson.id).maybeSingle(),
    getMaterials(supabase, { lessonId: lesson.id }),
    getProgress(supabase, user.id)
  ]);

  const prev = lessons[index - 1];
  const next = lessons[index + 1];
  const isDone = done.has(lesson.id);
  const path = `/cursos/${slug}/aula/${lesson.id}`;
  const nextUnlocked = next && (access || next.is_preview);

  return (
    <main className="page page--tight">
      <div className="container">
        <Link href={`/cursos/${slug}`} className="eyebrow" style={{ marginBottom: 20 }}>{course.title}</Link>
        <div className="player-layout" style={{ marginTop: 16 }}>
          <div>
            <div className="player">
              {content?.youtube_id ? (
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${content.youtube_id}?rel=0&modestbranding=1&color=white`}
                  title={lesson.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <div className="player-empty">O vídeo desta aula ainda não foi publicado.</div>
              )}
            </div>

            <div className="lesson-head">
              <div>
                <h1>{lesson.title}</h1>
                {lesson.summary && <p className="page-lead" style={{ marginTop: 10 }}>{lesson.summary}</p>}
              </div>
              {access && (
                <form action={toggleLessonDone}>
                  <input type="hidden" name="lessonId" value={lesson.id} />
                  <input type="hidden" name="done" value={isDone ? '1' : '0'} />
                  <input type="hidden" name="path" value={path} />
                  <SubmitButton className={`btn btn-sm ${isDone ? 'btn-orange' : 'btn-ghost'}`}>
                    <Check width={14} height={14} /> {isDone ? 'Concluída' : 'Marcar como concluída'}
                  </SubmitButton>
                </form>
              )}
            </div>

            {content?.body && <p className="prose" style={{ marginTop: 24 }}>{content.body}</p>}

            {materials.length > 0 && (
              <section style={{ marginTop: 40 }}>
                <h2 style={{ fontSize: '1.3rem', marginBottom: 16 }}>Materiais da aula</h2>
                <MaterialList materials={materials} />
              </section>
            )}

            <nav className="lesson-nav" aria-label="Navegação entre aulas">
              {prev ? (
                <Link className="btn btn-ghost" href={`/cursos/${slug}/aula/${prev.id}`}><ArrowLeft width={16} height={16} /> Anterior</Link>
              ) : <span />}
              {nextUnlocked ? (
                access && !isDone ? (
                  <form action={toggleLessonDone}>
                    <input type="hidden" name="lessonId" value={lesson.id} />
                    <input type="hidden" name="done" value="0" />
                    <input type="hidden" name="path" value={path} />
                    <input type="hidden" name="goNext" value={`/cursos/${slug}/aula/${next.id}`} />
                    <SubmitButton className="btn btn-cta" style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>Concluir e avançar</span><span className="btn-arrow"><ArrowRight /></span>
                    </SubmitButton>
                  </form>
                ) : (
                  <Link className="btn btn-cta" href={`/cursos/${slug}/aula/${next.id}`}>
                    <span>Próxima aula</span><span className="btn-arrow"><ArrowRight /></span>
                  </Link>
                )
              ) : !access ? (
                <Link className="btn btn-orange" href={`/cursos/${slug}`}>Ver curso completo</Link>
              ) : null}
            </nav>
          </div>

          <aside className="player-side" aria-label="Aulas do curso">
            <h2>Aulas</h2>
            <Curriculum courseSlug={slug} modules={curriculum} canWatch={access} done={done} currentLessonId={lesson.id} />
          </aside>
        </div>
      </div>
    </main>
  );
}
