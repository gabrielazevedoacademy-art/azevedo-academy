import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CourseShell, { CheckIcon, CourseUnavailable, LockIcon } from '@/components/course/CourseShell';
import { lessonUrl, loadCourse, moduleUrl } from '@/lib/course-data';

export const metadata: Metadata = { title: 'Módulo | Azevedo Academy', robots: { index: false } };

// Tela do módulo: lista as aulas na ordem definida no painel
export default async function ModuloPage({ params }: { params: Promise<{ slug: string; moduleId: string }> }) {
  const { slug, moduleId } = await params;
  const course = await loadCourse(slug, moduleUrl(slug, moduleId));
  if (!course) return <CourseUnavailable />;
  const index = course.modules.findIndex((m) => m.id === moduleId);
  if (index < 0) notFound();
  const mod = course.modules[index];
  const prev = course.modules[index - 1];
  const next = course.modules[index + 1];
  const doneCount = mod.lessons.filter((l) => course.done.includes(l.id)).length;

  return (
    <CourseShell crumbs={[{ label: course.title, href: `/cursos/${slug}` }, { label: `Módulo ${index + 1}` }]} draft={course.draft}>
      <section className="course-hero course-hero-module">
        <span className="course-module-label">Módulo {index + 1}</span>
        <h1>{mod.title}</h1>
        {mod.lessons.length > 0 && (
          <div className="course-progress course-progress-inline">
            <strong>
              {doneCount} de {mod.lessons.length} {mod.lessons.length === 1 ? 'aula concluída' : 'aulas concluídas'}
            </strong>
            <span className="course-progress-bar" aria-hidden="true">
              <span style={{ width: `${(doneCount / mod.lessons.length) * 100}%` }} />
            </span>
          </div>
        )}
      </section>

      <section className="course-lessons" aria-label="Aulas do módulo">
        {mod.lessons.length === 0 ? (
          <p className="course-empty">As aulas deste módulo chegam em breve.</p>
        ) : (
          <ol className="course-lesson-list">
            {mod.lessons.map((l, i) => {
              const done = course.done.includes(l.id);
              const body = (
                <>
                  <span className="course-lesson-thumb">
                    {l.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={l.thumb} alt="" loading="lazy" />
                    ) : (
                      <span>{i + 1}</span>
                    )}
                    {!l.canWatch && (
                      <span className="course-module-lock">
                        <LockIcon />
                      </span>
                    )}
                  </span>
                  <span className="course-lesson-info">
                    <span className="course-module-label">Aula {i + 1}</span>
                    <strong>{l.title}</strong>
                    <span className="course-module-meta">
                      {l.durationMinutes ? `${l.durationMinutes} min` : ''}
                      {!l.canWatch && (l.durationMinutes ? ', ' : '') + 'exclusiva para alunos'}
                    </span>
                  </span>
                  <span className="course-lesson-mark" data-state={done ? 'done' : l.canWatch ? 'open' : 'locked'}>
                    {done ? <CheckIcon /> : null}
                  </span>
                </>
              );
              return (
                <li key={l.id}>
                  {l.canWatch ? (
                    <a className="course-lesson-row" href={lessonUrl(slug, l.id)}>
                      {body}
                    </a>
                  ) : (
                    <span className="course-lesson-row" aria-disabled="true">
                      {body}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <nav className="course-nav course-module-nav" aria-label="Outros módulos">
        {prev ? (
          <a className="course-nav-btn" href={moduleUrl(slug, prev.id)}>
            Módulo anterior
          </a>
        ) : (
          <a className="course-nav-btn" href={`/cursos/${slug}`}>
            Todos os módulos
          </a>
        )}
        {next && (
          <a className="course-nav-btn course-nav-next" href={moduleUrl(slug, next.id)}>
            Próximo módulo
          </a>
        )}
      </nav>
    </CourseShell>
  );
}
