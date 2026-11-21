'use client';

import { useEffect, useState, useTransition } from 'react';
import { reorderMaterials } from '@/app/admin/materiais/actions';
import { useSortable } from './sortable';
import { Icon, notify } from './ui';

export type MaterialRow = {
  id: string;
  title: string;
  kind: 'prompt' | 'file' | 'link';
  category: string;
  cover: string | null;
  requiresLogin: boolean;
  published: boolean;
  uses: number;
};

const KIND = { prompt: 'Prompt', file: 'Arquivo', link: 'Link' };

export default function MaterialList({ materials: initial }: { materials: MaterialRow[] }) {
  const [items, setItems] = useState(initial);
  const [, start] = useTransition();
  useEffect(() => setItems(initial), [initial]);

  const sort = useSortable({
    items,
    getId: (m) => m.id,
    onChange: setItems,
    onCommit: (list) => start(async () => notify(await reorderMaterials(list.map((m) => m.id))))
  });

  return (
    <>
      {items.length > 1 && (
        <p className="adm-hint adm-sort-hint">
          Arraste para mudar a ordem em que aparecem no site. No celular, segure o card por um instante antes de arrastar.
        </p>
      )}
      <ul className="adm-courses" ref={(el) => void (sort.containerRef.current = el)}>
        {items.map((m) => (
          <li key={m.id} data-sort-id={m.id} className="adm-sortable" data-dragging={sort.dragging === m.id} {...sort.handle(m.id)}>
            <a className="adm-course" href={`/admin/materiais/${m.id}`} draggable={false}>
              <span className="adm-grip adm-course-grip" aria-hidden="true">
                {Icon.grip}
              </span>
              <span className="adm-course-cover adm-material-cover">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.cover ? <img src={m.cover} alt="" draggable={false} /> : <span>{KIND[m.kind]}</span>}
              </span>
              <span className="adm-course-text">
                <strong>{m.title}</strong>
                <span>
                  {[KIND[m.kind], m.category, m.uses ? `${m.uses} ${m.uses === 1 ? 'uso' : 'usos'}` : null].filter(Boolean).join(', ')}
                </span>
              </span>
              <span className="adm-course-tags">
                <span className="adm-tag" data-tone={m.requiresLogin ? 'login' : 'open'}>
                  {m.requiresLogin ? 'Com login' : 'Aberto'}
                </span>
                <span className="adm-status" data-on={m.published}>
                  {m.published ? 'Publicado' : 'Rascunho'}
                </span>
              </span>
              <svg className="adm-course-go" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
