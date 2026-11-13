'use client';

import { useState } from 'react';
import { formatBytes } from '@/lib/admin/storage';
import VideoPlayer, { type SavedProgress } from './VideoPlayer';

export type OutlineLesson = {
  id: string;
  title: string;
  durationMinutes: number | null;
  canWatch: boolean;
  isFreePreview: boolean;
};
export type OutlineModule = { id: string; title: string; lessons: OutlineLesson[] };
export type CurrentLesson = {
  id: string;
  title: string;
  description: string;
  youtubeId: string | null;
  materials: { id: string; title: string; href: string | null; kind: 'file' | 'link'; size: number | null; ext: string }[];
};

const Check = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
const Lock = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function CoursePlayer({
  userId,
  slug,
  modules,
  completed: initialCompleted,
  current,
  saved
}: {
  userId: string;
  slug: string;
  modules: OutlineModule[];
  completed: string[];
  current: CurrentLesson | null;
  saved: SavedProgress;
}) {
  const [completed, setCompleted] = useState(() => new Set(initialCompleted));
  const [ratio, setRatio] = useState(0);
  const lessons = modules.flatMap((m) => m.lessons);
  const done = lessons.filter((l) => completed.has(l.id)).length;
  const index = current ? lessons.findIndex((l) => l.id === current.id) : -1;
  const prev = index > 0 ? lessons.slice(0, index).reverse().find((l) => l.canWatch) : undefined;
  const next = index >= 0 ? lessons.slice(index + 1).find((l) => l.canWatch) : undefined;
  const isDone = current ? completed.has(current.id) : false;
  const href = (id: string) => `/cursos/${slug}/aula/${id}`;

  return (
    <>
      <div className="course-layout">
        <main className="course-main">
          {current ? (
            <>
              {current.youtubeId ? (
                <VideoPlayer
                  userId={userId}
                  lessonId={current.id}
                  youtubeId={current.youtubeId}
                  saved={saved}
                  onProgress={setRatio}
                  onComplete={() => setCompleted((s) => new Set(s).add(current.id))}
                />
              ) : (
                <div className="course-video course-video-empty">O vídeo desta aula chega em breve.</div>
              )}

              <div className="course-lesson-head">
                <h1>{current.title}</h1>
                <div className="course-lesson-status" role="status">
                  {isDone ? (
                    <span className="course-done">
                      <Check />
                      Aula concluída
                    </span>
                  ) : current.youtubeId ? (
                    <span className="course-watch">
                      <span className="course-watch-bar" aria-hidden="true">
                        <span style={{ width: `${Math.round(ratio * 100)}%` }} />
                      </span>
                      {Math.round(ratio * 100)}% assistido
                    </span>
                  ) : null}
                </div>
              </div>
              {!isDone && current.youtubeId && (
                <p className="course-hint">A aula é marcada como concluída quando você assiste ao vídeo inteiro.</p>
              )}

              <nav className="course-nav" aria-label="Navegar entre aulas">
                {prev ? (
                  <a className="course-nav-btn" href={href(prev.id)}>
                    Aula anterior
                  </a>
                ) : (
                  <span />
                )}
                {next && (
                  <a className="course-nav-btn course-nav-next" href={href(next.id)}>
                    Próxima aula
                  </a>
                )}
              </nav>

              {current.description && <div className="course-desc">{current.description}</div>}

              {current.materials.length > 0 && (
                <section className="course-materials" aria-labelledby="materiais">
                  <h2 id="materiais">Materiais complementares</h2>
                  <ul>
                    {current.materials.map((m) => (
                      <li key={m.id}>
                        <a href={m.href ?? '#'} target="_blank" rel="noopener noreferrer">
                          <span className="course-mat-icon">{m.kind === 'link' ? 'Link' : m.ext.slice(0, 4) || 'Arq'}</span>
                          <span className="course-mat-text">
                            <strong>{m.title}</strong>
                            {m.kind === 'file' && m.size ? <span>{formatBytes(m.size)}</span> : null}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </>
          ) : (
            <div className="course-locked">
              <Lock />
              <h1>{lessons.length ? 'Este curso é exclusivo para alunos' : 'As aulas deste curso chegam em breve'}</h1>
              <p>
                {lessons.length
                  ? 'Você já pode ver o conteúdo ao lado. O acesso às aulas é liberado com a inscrição no curso.'
                  : 'Assim que as primeiras aulas forem publicadas, elas aparecem aqui.'}
              </p>
            </div>
          )}
        </main>

        <aside className="course-side" aria-label="Conteúdo do curso">
          <div className="course-progress">
            <strong>
              {done} de {lessons.length} {lessons.length === 1 ? 'aula concluída' : 'aulas concluídas'}
            </strong>
            <span className="course-progress-bar" aria-hidden="true">
              <span style={{ width: `${lessons.length ? (done / lessons.length) * 100 : 0}%` }} />
            </span>
          </div>
          {modules.map((m, mi) => (
            <section key={m.id} className="course-module">
              <h2>
                <a href={`/cursos/${slug}/modulo/${m.id}`}>
                  <span>Módulo {mi + 1}</span>
                  {m.title}
                </a>
              </h2>
              <ol>
                {m.lessons.map((l) => {
                  const state = completed.has(l.id) ? 'done' : l.canWatch ? 'open' : 'locked';
                  const body = (
                    <>
                      <span className="course-lesson-mark" data-state={state}>
                        {state === 'done' ? <Check /> : state === 'locked' ? <Lock /> : null}
                      </span>
                      <span className="course-lesson-name">
                        {l.title}
                        {(l.durationMinutes || (l.isFreePreview && !l.canWatch)) && (
                          <span>{l.durationMinutes ? `${l.durationMinutes} min` : 'Amostra grátis'}</span>
                        )}
                      </span>
                    </>
                  );
                  return (
                    <li key={l.id}>
                      {l.canWatch ? (
                        <a
                          className="course-lesson-link"
                          href={href(l.id)}
                          aria-current={current?.id === l.id ? 'page' : undefined}
                        >
                          {body}
                        </a>
                      ) : (
                        <span className="course-lesson-link" aria-disabled="true">
                          {body}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </section>
          ))}
        </aside>
      </div>
    </>
  );
}
