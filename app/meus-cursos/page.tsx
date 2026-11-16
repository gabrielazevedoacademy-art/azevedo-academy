import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CourseShell, { CheckIcon } from '@/components/course/CourseShell';
import { publicImage } from '@/lib/admin/storage';
import { courses as catalog } from '@/lib/catalog';
import { lessonUrl } from '@/lib/course-data';
import { createClient } from '@/lib/supabase/server';
import { needsSecondFactor, verifyUrl } from '@/lib/supabase/mfa';

export const metadata: Metadata = { title: 'Meus cursos | Azevedo Academy', robots: { index: false } };

type Row = {
  course_id: string;
  slug: string;
  title: string;
  cover_path: string | null;
  total_lessons: number;
  done_lessons: number;
  last_activity: string | null;
  next_lesson_id: string | null;
};

// Cursos liberados para o aluno: o que ele está fazendo, o que ainda não começou e o que já concluiu
export default async function MeusCursosPage() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) redirect('/entrar?next=/meus-cursos');
  if (await needsSecondFactor(supabase)) redirect(verifyUrl('/meus-cursos'));

  const { data } = await supabase.rpc('my_courses');
  const rows = ((data ?? []) as Row[]).filter((r) => r.total_lessons > 0);
  const finished = rows.filter((r) => r.done_lessons >= r.total_lessons);
  const going = rows
    .filter((r) => r.last_activity && r.done_lessons < r.total_lessons)
    .sort((a, b) => (b.last_activity ?? '').localeCompare(a.last_activity ?? ''));
  const fresh = rows.filter((r) => !r.last_activity && r.done_lessons < r.total_lessons);

  const cover = (r: Row) => publicImage(r.cover_path) ?? catalog.find((c) => c.slug === r.slug)?.image ?? null;

  const Section = ({ id, title, items, action }: { id: string; title: string; items: Row[]; action: string }) =>
    items.length ? (
      <section className="course-modules my-courses" aria-labelledby={id}>
        <h2 id={id}>{title}</h2>
        <ul className="course-module-grid">
          {items.map((r) => {
            const img = cover(r);
            const done = r.done_lessons >= r.total_lessons;
            return (
              <li key={r.course_id}>
                <div className="course-module-card my-course-card">
                  <a className="my-course-link" href={`/cursos/${r.slug}`} aria-label={`Abrir o curso ${r.title}`}>
                    <span className="course-module-cover">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={img} alt="" loading="lazy" />
                      ) : (
                        <span className="course-module-number">{r.title.slice(0, 1)}</span>
                      )}
                      {done && (
                        <span className="course-module-done">
                          <CheckIcon />
                          Concluído
                        </span>
                      )}
                    </span>
                  </a>
                  <span className="course-module-info">
                    <strong>
                      <a href={`/cursos/${r.slug}`}>{r.title}</a>
                    </strong>
                    <span className="course-module-meta">
                      {r.done_lessons} de {r.total_lessons} {r.total_lessons === 1 ? 'aula concluída' : 'aulas concluídas'}
                    </span>
                    <span className="course-progress-bar" aria-hidden="true">
                      <span style={{ width: `${(r.done_lessons / r.total_lessons) * 100}%` }} />
                    </span>
                    {r.next_lesson_id && (
                      <a className="course-cta my-course-cta" href={lessonUrl(r.slug, r.next_lesson_id)}>
                        {action}
                      </a>
                    )}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    ) : null;

  return (
    <CourseShell crumbs={[{ label: 'Meus cursos' }]}>
      <section className="course-hero course-hero-module">
        <h1>Meus cursos</h1>
        {rows.length > 0 && <p className="course-hero-desc">Continue de onde parou ou comece um curso novo.</p>}
      </section>
      {rows.length === 0 ? (
        <section className="course-modules">
          <div className="course-empty my-courses-empty">
            <p>Você ainda não tem cursos liberados.</p>
            <a className="course-cta" href="/#cursos">
              Ver os cursos
            </a>
          </div>
        </section>
      ) : (
        <>
          <Section id="andamento" title="Continuar assistindo" items={going} action="Continuar" />
          <Section id="novos" title="Disponíveis para você" items={fresh} action="Começar" />
          <Section id="concluidos" title="Concluídos" items={finished} action="Rever o curso" />
        </>
      )}
    </CourseShell>
  );
}
