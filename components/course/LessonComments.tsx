'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { deleteComment, postComment, setCommentHidden } from '@/app/cursos/actions';

export type LessonComment = {
  id: string;
  parent_id: string | null;
  user_id: string;
  body: string;
  author_name: string;
  is_staff: boolean;
  is_hidden: boolean;
  created_at: string;
};

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('') || '?';

function when(iso: string) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'agora';
  if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 7) {
    const d = Math.floor(diff / 86400);
    return `há ${d} ${d === 1 ? 'dia' : 'dias'}`;
  }
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

function Composer({
  lessonId,
  parentId,
  placeholder,
  submitLabel,
  autoFocus,
  onDone
}: {
  lessonId: string;
  parentId: string | null;
  placeholder: string;
  submitLabel: string;
  autoFocus?: boolean;
  onDone?: () => void;
}) {
  const router = useRouter();
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [pending, start] = useTransition();

  return (
    <form
      className="cmt-form"
      onSubmit={(e) => {
        e.preventDefault();
        setError('');
        start(async () => {
          const r = await postComment(lessonId, text, parentId);
          if (r.error) return setError(r.error);
          setText('');
          onDone?.();
          router.refresh();
        });
      }}
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={2000}
        rows={parentId ? 2 : 3}
        autoFocus={autoFocus}
        required
      />
      <div className="cmt-form-row">
        {error ? (
          <p className="cmt-error" role="alert">
            {error}
          </p>
        ) : (
          <span />
        )}
        <div className="cmt-form-actions">
          {onDone && (
            <button type="button" className="cmt-link" onClick={onDone}>
              Cancelar
            </button>
          )}
          <button type="submit" className="cmt-send" disabled={pending || !text.trim()}>
            {pending ? 'Enviando…' : submitLabel}
          </button>
        </div>
      </div>
    </form>
  );
}

function Item({
  c,
  me,
  isAdmin,
  onReply
}: {
  c: LessonComment;
  me: string;
  isAdmin: boolean;
  onReply?: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [confirming, setConfirming] = useState(false);
  const run = (fn: () => Promise<{ error?: string }>) =>
    start(async () => {
      const r = await fn();
      if (r.error) alertLater(r.error);
      router.refresh();
    });

  return (
    <article className="cmt" data-hidden={c.is_hidden} aria-busy={pending}>
      <span className="cmt-avatar" data-staff={c.is_staff} aria-hidden="true">
        {initials(c.author_name)}
      </span>
      <div className="cmt-body">
        <header>
          <strong>{c.author_name}</strong>
          {c.is_staff && <span className="cmt-badge">Equipe</span>}
          {c.is_hidden && <span className="cmt-badge cmt-badge-hidden">Oculto para os alunos</span>}
          <time dateTime={c.created_at}>{when(c.created_at)}</time>
        </header>
        <p>{c.body}</p>
        <div className="cmt-actions">
          {onReply && (
            <button type="button" className="cmt-link" onClick={onReply}>
              Responder
            </button>
          )}
          {isAdmin && (
            <button type="button" className="cmt-link" onClick={() => run(() => setCommentHidden(c.id, !c.is_hidden))}>
              {c.is_hidden ? 'Mostrar' : 'Ocultar'}
            </button>
          )}
          {(c.user_id === me || isAdmin) &&
            (confirming ? (
              <>
                <button type="button" className="cmt-link cmt-danger" onClick={() => run(() => deleteComment(c.id))}>
                  Confirmar exclusão
                </button>
                <button type="button" className="cmt-link" onClick={() => setConfirming(false)}>
                  Cancelar
                </button>
              </>
            ) : (
              <button type="button" className="cmt-link" onClick={() => setConfirming(true)}>
                Excluir
              </button>
            ))}
        </div>
      </div>
    </article>
  );
}

// Mostra o erro sem travar a interface (o comentário volta ao estado anterior no refresh)
function alertLater(message: string) {
  const el = document.getElementById('cmt-status');
  if (el) el.textContent = message;
}

export default function LessonComments({
  lessonId,
  comments,
  me,
  isAdmin
}: {
  lessonId: string;
  comments: LessonComment[];
  me: string;
  isAdmin: boolean;
}) {
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const threads = comments.filter((c) => !c.parent_id).reverse(); // mais recentes primeiro
  const replies = (id: string) => comments.filter((c) => c.parent_id === id);
  const visible = comments.filter((c) => !c.is_hidden).length;

  return (
    <section className="cmts" id="comentarios" aria-labelledby="cmts-title">
      <h2 id="cmts-title">
        Dúvidas e comentários{visible > 0 && <span> {visible}</span>}
      </h2>
      <Composer lessonId={lessonId} parentId={null} placeholder="Escreva sua dúvida ou comentário sobre esta aula" submitLabel="Publicar" />
      <p id="cmt-status" className="cmt-error" role="status" />
      {threads.length === 0 ? (
        <p className="cmt-empty">Ainda não há comentários. Tem alguma dúvida sobre a aula? Pergunte aqui.</p>
      ) : (
        <ol className="cmt-list">
          {threads.map((t) => (
            <li key={t.id}>
              <Item c={t} me={me} isAdmin={isAdmin} onReply={() => setReplyTo(replyTo === t.id ? null : t.id)} />
              {(replies(t.id).length > 0 || replyTo === t.id) && (
                <ol className="cmt-replies">
                  {replies(t.id).map((r) => (
                    <li key={r.id}>
                      <Item c={r} me={me} isAdmin={isAdmin} />
                    </li>
                  ))}
                  {replyTo === t.id && (
                    <li>
                      <Composer
                        lessonId={lessonId}
                        parentId={t.id}
                        placeholder={`Responder a ${t.author_name}`}
                        submitLabel="Responder"
                        autoFocus
                        onDone={() => setReplyTo(null)}
                      />
                    </li>
                  )}
                </ol>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
