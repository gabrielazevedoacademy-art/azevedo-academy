import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CourseCover } from '@/components/CourseCard';
import Curriculum from '@/components/Curriculum';
import MaterialList from '@/components/MaterialList';
import SubmitButton from '@/components/SubmitButton';
import { ArrowRight } from '@/components/icons';
import { getSessionProfile } from '@/lib/auth';
import { flattenLessons, getCourseBySlug, getCurriculum, getMaterials, getProgress, hasAccess } from '@/lib/courses';
import { formatDuration, formatPrice } from '@/lib/format';
import { enrollFree } from '../../actions';

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params) {
  const { slug } = await params;
  const { supabase } = await getSessionProfile();
  const course = await getCourseBySlug(supabase, slug);
  return course ? { title: course.title, description: course.subtitle ?? undefined } : {};
}

export default async function CoursePage({ params }: Params) {
  const { slug } = await params;
  const { supabase, user } = await getSessionProfile();
  const course = await getCourseBySlug(supabase, slug);
  if (!course) notFound();

  const curriculum = await getCurriculum(supabase, course.id);
  const lessons = flattenLessons(curriculum);
  const access = user ? await hasAccess(supabase, course.id) : false;
  const done = user ? await getProgress(supabase, user.id) : new Set<string>();
  const materials = access ? await getMaterials(supabase, { courseLevelOf: course.id }) : [];

  const totalMinutes = lessons.reduce((s, l) => s + (l.duration_minutes ?? 0), 0);
  const completed = lessons.filter((l) => done.has(l.id)).length;
  const progress = lessons.length ? Math.round((completed / lessons.length) * 100) : 0;
  const nextLesson = lessons.find((l) => !done.has(l.id)) ?? lessons[0];

  let cta: React.ReactNode;
  if (access && nextLesson) {
    cta = (
      <Link className="btn btn-cta btn-block" style={{ justifyContent: 'space-between' }} href={`/cursos/${course.slug}/aula/${nextLesson.id}`}>
        <span>{completed ? 'Continuar curso' : 'Começar curso'}</span><span className="btn-arrow"><ArrowRight /></span>
      </Link>
    );
  } else if (course.is_free) {
    cta = user ? (
      <form action={enrollFree}>
        <input type="hidden" name="courseId" value={course.id} />
        <input type="hidden" name="slug" value={course.slug} />
        <input type="hidden" name="firstLesson" value={lessons[0]?.id ?? ''} />
        <SubmitButton className="btn btn-cta btn-block" style={{ justifyContent: 'space-between' }}>
          <span>Acessar grátis</span><span className="btn-arrow"><ArrowRight /></span>
        </SubmitButton>
      </form>
    ) : (
      <Link className="btn btn-cta btn-block" style={{ justifyContent: 'space-between' }} href={`/cadastro?next=/cursos/${course.slug}`}>
        <span>Criar conta e acessar grátis</span><span className="btn-arrow"><ArrowRight /></span>
      </Link>
    );
  } else if (course.checkout_url) {
    cta = (
      <a className="btn btn-cta btn-block" style={{ justifyContent: 'space-between' }} href={course.checkout_url} target="_blank" rel="noopener noreferrer">
        <span>Quero este curso</span><span className="btn-arrow"><ArrowRight /></span>
      </a>
    );
  } else {
    cta = <span className="btn btn-ghost btn-block" aria-disabled="true">Em breve</span>;
  }

  return (
    <main className="page">
      <div className="container">
        <div className="course-hero">
          <div>
            <span className="eyebrow reveal">{course.is_free ? 'Curso gratuito' : 'Curso completo'}</span>
            <h1 className="page-title reveal" style={{ '--d': 80 } as React.CSSProperties}>{course.title}</h1>
            {course.subtitle && <p className="page-lead reveal" style={{ '--d': 160 } as React.CSSProperties}>{course.subtitle}</p>}
            <div className="course-stats reveal" style={{ '--d': 240 } as React.CSSProperties}>
              <div><strong>{curriculum.length}</strong>módulos</div>
              <div><strong>{lessons.length}</strong>aulas</div>
              {totalMinutes > 0 && <div><strong>{formatDuration(totalMinutes)}</strong>de conteúdo</div>}
            </div>
          </div>

          <aside className="course-side">
            <CourseCover course={course} />
            {access ? (
              <div>
                <div className="progress"><span style={{ width: `${progress}%` }} /></div>
                <p style={{ marginTop: 8, color: 'var(--muted)', fontSize: 13 }}>{progress}% concluído · {completed} de {lessons.length} aulas</p>
              </div>
            ) : (
              <div className="price" style={{ fontSize: '2rem' }}>{course.is_free ? 'Grátis' : formatPrice(course.price_cents)}</div>
            )}
            {cta}
            {!access && !course.is_free && (
              <p className="hint">Depois da compra, entre aqui com o mesmo e-mail usado no pagamento para liberar o acesso.</p>
            )}
          </aside>
        </div>

        {course.description && (
          <section className="section" style={{ maxWidth: 760 }}>
            <div className="section-head"><h2>Sobre o curso</h2></div>
            <p className="prose">{course.description}</p>
          </section>
        )}

        <section className="section" style={{ maxWidth: 860 }}>
          <div className="section-head"><h2>Conteúdo</h2></div>
          <Curriculum courseSlug={course.slug} modules={curriculum} canWatch={access} done={done} />
        </section>

        {materials.length > 0 && (
          <section className="section" style={{ maxWidth: 860 }}>
            <div className="section-head"><h2>Materiais do curso</h2></div>
            <MaterialList materials={materials} />
          </section>
        )}
      </div>
    </main>
  );
}
