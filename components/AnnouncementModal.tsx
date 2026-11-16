'use client';

import { useEffect, useRef, useState } from 'react';

export type AnnouncementView = {
  title: string;
  body: string;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
};

// Janela de novidade que aparece ao entrar no site
export default function AnnouncementModal({
  a,
  onClose,
  preview
}: {
  a: AnnouncementView;
  onClose: (dontShowAgain: boolean) => void;
  preview?: boolean;
}) {
  const [dontShow, setDontShow] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const done = useRef(onClose);
  done.current = onClose;
  const state = useRef(dontShow);
  state.current = dontShow;

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && done.current(state.current);
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
    };
  }, []);

  const external = a.ctaUrl?.startsWith('https://');

  return (
    <div className="ann-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose(dontShow)}>
      <div className="ann" role="dialog" aria-modal="true" aria-labelledby="ann-title">
        <button ref={closeRef} type="button" className="ann-close" aria-label="Fechar" onClick={() => onClose(dontShow)}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
        {a.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img className="ann-image" src={a.imageUrl} alt="" />
        )}
        <div className="ann-content">
          <h2 id="ann-title">{a.title}</h2>
          {a.body && <p>{a.body}</p>}
          {a.ctaLabel && a.ctaUrl && (
            <a
              className="button button-dark ann-cta"
              href={preview ? undefined : a.ctaUrl}
              onClick={() => !preview && onClose(dontShow)}
              {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            >
              {a.ctaLabel}
            </a>
          )}
          <label className="ann-dismiss">
            <input type="checkbox" checked={dontShow} onChange={(e) => setDontShow(e.target.checked)} />
            Não mostrar novamente
          </label>
        </div>
      </div>
    </div>
  );
}
