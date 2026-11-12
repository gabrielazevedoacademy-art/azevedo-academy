'use client';

import { useRef, useState } from 'react';
import type { CatalogItem } from '@/lib/catalog';
import Card from './Card';

type Props = {
  id: string;
  title: string;
  items: CatalogItem[];
  ratio: string;
  empty: React.ReactNode;
};

// Limite de 3 linhas por largura de tela: 4 colunas (12), 3 colunas (9), 2 colunas (6)
export default function CatalogSection({ id, title, items, ratio, empty }: Props) {
  const [expanded, setExpanded] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const headingId = `${id}-titulo`;

  function toggle() {
    if (expanded) sectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setExpanded((v) => !v);
  }

  return (
    <section id={id} ref={sectionRef} className="section" aria-labelledby={headingId}>
      <div className="container">
        <h2 id={headingId} className="section-title">{title}</h2>

        {items.length ? (
          <>
            <div className="grid" data-expanded={expanded}>
              {items.map((item) => (
                <Card key={item.href + item.title} item={item} ratio={ratio} />
              ))}
            </div>
            <div
              className="grid-more"
              data-count-4={items.length > 12}
              data-count-3={items.length > 9}
              data-count-2={items.length > 6}
            >
              <button className="button button-outline" type="button" aria-expanded={expanded} onClick={toggle}>
                {expanded ? 'Ver menos' : 'Ver mais'}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-empty" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="card">
                  <div className="card-media" style={{ '--ratio': ratio } as React.CSSProperties} />
                </div>
              ))}
            </div>
            <p className="empty-message">{empty}</p>
          </>
        )}
      </div>
    </section>
  );
}
