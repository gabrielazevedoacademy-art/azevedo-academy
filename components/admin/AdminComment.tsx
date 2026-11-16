'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteComment, postComment, setCommentHidden } from '@/app/cursos/actions';
import { ConfirmButton, notify } from './ui';

type Reply = { id: string; body: string; author: string; staff: boolean; hidden: boolean; createdAt: string };
export type AdminCommentRow = Reply & {
  lessonId: string;
  where: string;
  href: string | null;
  replies: Reply[];
};

const date = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });

function Line({ c, reply }: { c: Reply; reply?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="adm-cmt" data-reply={reply} data-hidden={c.hidden} aria-busy={pending}>
      <div className="adm-cmt-head">
        <strong>{c.author}</strong>
        {c.staff && <span className="adm-cmt-tag">Equipe</span>}
        {c.hidden && <span className="adm-cmt-tag adm-cmt-tag-muted">Oculto</span>}
        <time dateTime={c.createdAt}>{date(c.createdAt)}</time>
      </div>
      <p>{c.body}</p>
      <div className="adm-cmt-actions">
        <button
          type="button"
          className="adm-btn adm-btn-quiet"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await setCommentHidden(c.id, !c.hidden);
              notify(r.error ? { error: r.error } : { ok: c.hidden ? 'Comentário visível de novo.' : 'Comentário oculto.' });
              router.refresh();
            })
          }
        >
          {c.hidden ? 'Mostrar' : 'Ocultar'}
        </button>
        <ConfirmButton
          label="Excluir"
          className="adm-btn adm-btn-quiet"
          onConfirm={async () => {
            const r = await deleteComment(c.id);
            router.refresh();
            return r.error ? { error: r.error } : { ok: 'Comentário excluído.' };
          }}
        />
      </div>
    </div>
  );
}

export default function AdminComment({ row }: { row: AdminCommentRow }) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [pending, start] = useTransition();

  return (
    <article className="adm-panel adm-cmt-card">
      <p className="adm-cmt-where">
        {row.href ? (
          <a href={row.href} target="_blank" rel="noopener noreferrer">
            {row.where || 'Abrir aula'}
          </a>
        ) : (
          row.where
        )}
      </p>
      <Line c={row} />
      {row.replies.map((r) => (
        <Line key={r.id} c={r} reply />
      ))}
      <form
        className="adm-cmt-reply"
        onSubmit={(e) => {
          e.preventDefault();
          start(async () => {
            const r = await postComment(row.lessonId, text, row.id);
            notify(r.error ? { error: r.error } : { ok: 'Resposta publicada.' });
            if (!r.error) setText('');
            router.refresh();
          });
        }}
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={`Responder a ${row.author}`}
          aria-label={`Responder a ${row.author}`}
          rows={2}
          maxLength={2000}
        />
        <button type="submit" className="adm-btn adm-btn-dark" disabled={pending || !text.trim()}>
          {pending ? 'Enviando…' : 'Responder'}
        </button>
      </form>
    </article>
  );
}
