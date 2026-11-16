'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { createNotification, deleteNotification } from '@/app/admin/novidades/actions';
import { ConfirmButton, notify } from './ui';

export type NotificationRow = {
  id: string;
  kind: 'course' | 'lesson' | 'update';
  title: string;
  body: string;
  url: string | null;
  created_at: string;
};

const kindLabel = { course: 'Curso novo', lesson: 'Aula nova', update: 'Aviso' };
const fmt = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

export default function ManualNotifications({ rows }: { rows: NotificationRow[] }) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [link, setLink] = useState('');
  const [pending, start] = useTransition();

  return (
    <section className="adm-ann adm-notes" aria-labelledby="avisos">
      <h2 id="avisos" className="adm-section-title">
        Notificações
      </h2>
      <p className="adm-hint">
        Cursos e aulas publicados avisam os alunos sozinhos. Use este espaço para outras atualizações, como uma live ou uma
        mudança na plataforma.
      </p>
      <form
        className="adm-panel adm-form"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await createNotification(title, body, link);
            notify(r);
            if (!r?.error) {
              setTitle('');
              setBody('');
              setLink('');
              router.refresh();
            }
          });
        }}
      >
        <div className="adm-grid-2">
          <div className="adm-field">
            <label htmlFor="nt-t">Título</label>
            <input id="nt-t" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={140} required placeholder="Ex.: Live na quinta às 20h" />
          </div>
          <div className="adm-field">
            <label htmlFor="nt-l">Link (opcional)</label>
            <input id="nt-l" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/meus-cursos ou https://…" />
          </div>
        </div>
        <div className="adm-field">
          <label htmlFor="nt-b">Texto (opcional)</label>
          <textarea id="nt-b" value={body} onChange={(e) => setBody(e.target.value)} maxLength={400} rows={2} />
        </div>
        <div>
          <button type="submit" className="adm-btn adm-btn-dark" disabled={pending || !title.trim()}>
            {pending ? 'Enviando…' : 'Enviar para todos'}
          </button>
        </div>
      </form>

      {rows.length > 0 && (
        <ul className="adm-notes-list">
          {rows.map((n) => (
            <li key={n.id}>
              <span className="adm-ann-status" data-tone={n.kind === 'update' ? 'info' : 'live'}>
                {kindLabel[n.kind]}
              </span>
              <div>
                <strong>{n.title}</strong>
                {n.body && <p>{n.body}</p>}
              </div>
              <time dateTime={n.created_at}>{fmt(n.created_at)}</time>
              <ConfirmButton
                label="Remover"
                className="adm-btn adm-btn-quiet"
                onConfirm={async () => {
                  const r = await deleteNotification(n.id);
                  router.refresh();
                  return r;
                }}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
