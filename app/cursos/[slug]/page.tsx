import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import CourseShell, { CheckIcon, CourseUnavailable, LockIcon } from '@/components/course/CourseShell';
import { lessonUrl, loadCourse, moduleUrl } from '@/lib/course-data';

export const metadata: Metadata = { title: 'Curso | Azevedo Academy', robots: { index: false } };

// Tela do curso: apresenta o curso e os módulos. As aulas ficam dentro de cada módulo.
export default async function CursoPage({
  params,
  searchParams
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ aula?: string }>;
}) {
  const { slug } = await params;
  const { aula } = await searchParams;
  if (aula) redirect(lessonUrl(slug, aula)); // links antigos

  const course = await loadCourse(slug, `/cursos/${slug}`);
  if (!course) return <CourseUnavailable />;

  const total = course.lessons.length;
  const doneCount = course.lessons.filter((l) => course.done.includes(l.id)).length;
  const started = doneCount > 0 || course.progress.length > 0;

  return (
    <CourseShell crumbs={[{ label: course.title }]} draft={course.draft}>
      <section className="course-hero">
        <h1>{course.title}</h1>
        {course.description && <p className="course-hero-desc">{course.description}</p>}
        <div className="course-hero-row">
          {course.nextLesson && (
            <a className="course-cta" href={lessonUrl(slug, course.nextLesson.id)}>
              {started ? 'Continuar de onde parei' : 'Começar o curso'}
            </a>
          )}
          {total > 0 && (
            <div className="course-progress course-progress-inline">
              <strong>
                {doneCount} de {total} {total === 1 ? 'aula concluída' : 'aulas concluídas'}
              </strong>
              <span className="course-progress-bar" aria-hidden="true">
                <span style={{ width: `${(doneCount / total) * 100}%` }} />
              </span>
            </div>
          )}
        </div>
      </section>

      <section className="course-modules" aria-labelledby="modulos">
        <h2 id="modulos">Módulos</h2>
        {course.modules.length === 0 ? (
          <p className="course-empty">Os módulos deste curso chegam em breve.</p>
        ) : (
          <ul className="course-module-grid">
            {course.modules.map((m, i) => {
              const n = m.lessons.length;
              const d = m.lessons.filter((l) => course.done.includes(l.id)).length;
              const open = m.lessons.some((l) => l.canWatch);
              const cover = m.lessons.find((l) => l.thumb)?.thumb ?? null;
              return (
                <li key={m.id}>
                  <a className="course-module-card" href={moduleUrl(slug, m.id)} data-locked={!open}>
                    <span className="course-module-cover">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={cover} alt="" loading="lazy" />
                      ) : (
                        <span className="course-module-number">{String(i + 1).padStart(2, '0')}</span>
                      )}
                      {n > 0 && d === n && (
                        <span className="course-module-done">
                          <CheckIcon />
                          Concluído
                        </span>
                      )}
                      {!open && n > 0 && (
                        <span className="course-module-lock">
                          <LockIcon />
                        </span>
                      )}
                    </span>
                    <span className="course-module-info">
                      <span className="course-module-label">Módulo {i + 1}</span>
                      <strong>{m.title}</strong>
                      <span className="course-module-meta">
                        {n} {n === 1 ? 'aula' : 'aulas'}
                        {n > 0 && `, ${d} concluída${d === 1 ? '' : 's'}`}
                      </span>
                      {n > 0 && (
                        <span className="course-progress-bar" aria-hidden="true">
                          <span style={{ width: `${(d / n) * 100}%` }} />
                        </span>
                      )}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </CourseShell>
  );
}
