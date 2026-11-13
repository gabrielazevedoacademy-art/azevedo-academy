'use client';

import { useEffect, useState, useTransition } from 'react';
import { reorderCourses } from '@/app/admin/actions';
import { useSortable } from './sortable';
import { Icon, notify } from './ui';

export type CourseRow = {
  id: string;
  title: string;
  cover: string | null;
  summary: string;
  published: boolean;
  free: boolean;
};

export default function CourseList({ courses: initial }: { courses: CourseRow[] }) {
  const [courses, setCourses] = useState(initial);
  const [, start] = useTransition();
  useEffect(() => setCourses(initial), [initial]);

  const sort = useSortable({
    items: courses,
    getId: (c) => c.id,
    onChange: setCourses,
    onCommit: (list) => start(async () => notify(await reorderCourses(list.map((c) => c.id))))
  });

  return (
    <>
      {courses.length > 1 && (
        <p className="adm-hint adm-sort-hint">
          Arraste os cursos para mudar a ordem em que aparecem no site. No celular, segure o card por um instante antes de
          arrastar.
        </p>
      )}
      <ul className="adm-courses" ref={(el) => void (sort.containerRef.current = el)}>
        {courses.map((c) => (
          <li
            key={c.id}
            data-sort-id={c.id}
            className="adm-sortable"
            data-dragging={sort.dragging === c.id}
            {...sort.handle(c.id)}
          >
            <a className="adm-course" href={`/admin/cursos/${c.id}`} draggable={false}>
              <span className="adm-grip adm-course-grip" aria-hidden="true">
                {Icon.grip}
              </span>
              <span className="adm-course-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {c.cover ? <img src={c.cover} alt="" draggable={false} /> : <img src="/logo.svg" alt="" className="is-logo" draggable={false} />}
              </span>
              <span className="adm-course-text">
                <strong>{c.title}</strong>
                <span>{c.summary}</span>
              </span>
              <span className="adm-course-tags">
                {c.free && <span className="adm-tag adm-tag-free">Grátis</span>}
                <span className="adm-status" data-on={c.published}>
                  {c.published ? 'Publicado' : 'Rascunho'}
                </span>
              </span>
              <svg className="adm-course-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
