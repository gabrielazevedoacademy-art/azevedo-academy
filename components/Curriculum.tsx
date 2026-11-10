import Link from 'next/link';
import { formatDuration } from '@/lib/format';
import type { ModuleWithLessons } from '@/lib/types';
import { Check, Lock, Play } from './icons';

type Props = {
  courseSlug: string;
  modules: ModuleWithLessons[];
  canWatch: boolean;
  done?: Set<string>;
  currentLessonId?: string;
  openAll?: boolean;
};

export default function Curriculum({ courseSlug, modules, canWatch, done, currentLessonId, openAll }: Props) {
  if (!modules.length) return <p className="empty">As aulas deste curso estão sendo preparadas.</p>;
  return (
    <div className="curriculum">
      {modules.map((m, mi) => {
        const containsCurrent = m.lessons.some((l) => l.id === currentLessonId);
        return (
          <details key={m.id} className="module" open={openAll || containsCurrent || (!currentLessonId && mi === 0)}>
            <summary>
              <span>
                {m.title}
                <span className="module-count"> · {m.lessons.length} {m.lessons.length === 1 ? 'aula' : 'aulas'}</span>
              </span>
              <span className="chev" aria-hidden>+</span>
            </summary>
            <div className="lesson-list">
              {m.lessons.map((l) => {
                const unlocked = canWatch || l.is_preview;
                const isDone = done?.has(l.id);
                const content = (
                  <>
                    <span className={`lesson-icon${isDone ? ' is-done' : ''}`}>
                      {isDone ? <Check /> : unlocked ? <Play /> : <Lock />}
                    </span>
                    <span className="lesson-title">{l.title}</span>
                    {l.is_preview && !canWatch && <span className="badge badge-orange">Prévia</span>}
                    {l.duration_minutes ? <span>{formatDuration(l.duration_minutes)}</span> : null}
                  </>
                );
                return unlocked ? (
                  <Link key={l.id} className="lesson-row" href={`/cursos/${courseSlug}/aula/${l.id}`} aria-current={l.id === currentLessonId ? 'page' : undefined}>
                    {content}
                  </Link>
                ) : (
                  <div key={l.id} className="lesson-row">{content}</div>
                );
              })}
            </div>
          </details>
        );
      })}
    </div>
  );
}
