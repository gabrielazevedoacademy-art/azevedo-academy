'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

type Item = {
  id: string;
  kind: 'course' | 'lesson' | 'update';
  title: string;
  body: string;
  url: string | null;
  created_at: string;
  unread: boolean;
};

const icon = {
  course: <path d="M4 6h16v12H4zM10 9.5l4.5 2.5-4.5 2.5z" />,
  lesson: <path d="M6 4v16l13-8z" />,
  update: <path d="M12 3l2.4 5.6L20 9.3l-4.3 3.9 1.2 5.8L12 16l-4.9 3 1.2-5.8L4 9.3l5.6-.7z" />
};

function when(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 3600) return `há ${Math.max(1, Math.floor(diff / 60))} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  const d = Math.floor(diff / 86400);
  if (d < 7) return `há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

// Sino de novidades: cursos novos, aulas novas e avisos do administrador
export default function NotificationBell() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) return;
      supabase.rpc('my_notifications').then(({ data: rows }) => {
        const list = (rows ?? []) as Item[];
        setItems(list);
        setUnread(list.filter((i) => i.unread).length);
      });
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => root.current && !root.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  if (items === null) return null;

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Ao abrir, tudo passa a contar como visto (os itens novos continuam destacados até fechar)
    if (next && unread > 0) {
      setUnread(0);
      createClient().rpc('mark_notifications_seen');
    }
    if (!next) setItems((list) => list?.map((i) => ({ ...i, unread: false })) ?? list);
  };

  return (
    <div className="notif" ref={root}>
      <button
        type="button"
        className="notif-button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={unread ? `Notificações, ${unread} ${unread === 1 ? 'nova' : 'novas'}` : 'Notificações'}
        onClick={toggle}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M6 9a6 6 0 0 1 12 0c0 5 2 6.5 2 6.5H4S6 14 6 9" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
        {unread > 0 && <span className="notif-count">{unread > 9 ? '9+' : unread}</span>}
      </button>
      <div id={panelId} className="notif-panel" role="dialog" aria-label="Notificações" hidden={!open}>
        <p className="notif-title">Novidades</p>
        {items.length === 0 ? (
          <p className="notif-empty">Nenhuma novidade por enquanto. Quando sair um curso ou uma aula nova, ela aparece aqui.</p>
        ) : (
          <ul>
            {items.map((i) => {
              const body = (
                <>
                  <span className="notif-icon" data-kind={i.kind} aria-hidden="true">
                    <svg viewBox="0 0 24 24">{icon[i.kind]}</svg>
                  </span>
                  <span className="notif-text">
                    <strong>{i.title}</strong>
                    {i.body && <span>{i.body}</span>}
                    <time dateTime={i.created_at}>{when(i.created_at)}</time>
                  </span>
                  {i.unread && <span className="notif-dot" aria-label="Nova" />}
                </>
              );
              return (
                <li key={i.id}>
                  {i.url ? (
                    <a
                      className="notif-item"
                      href={i.url}
                      {...(i.url.startsWith('https://') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {body}
                    </a>
                  ) : (
                    <div className="notif-item">{body}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
