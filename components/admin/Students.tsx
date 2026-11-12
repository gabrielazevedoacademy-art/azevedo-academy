'use client';

import { useMemo, useState, useTransition } from 'react';
import { resendConfirmation, sendPasswordReset } from '@/app/admin/alunos/actions';
import Turnstile from '@/components/Turnstile';
import { notify } from './ui';

export type StudentRow = {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  providers: string[];
  email_confirmed: boolean;
  created_at: string;
  last_sign_in_at: string | null;
  is_admin: boolean;
};

const fmt = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
      }).format(new Date(iso))
    : 'Nunca entrou';

const providerLabel: Record<string, string> = { email: 'E-mail e senha', google: 'Google' };

type Filter = 'todos' | 'confirmados' | 'pendentes' | 'google';

export default function Students({ users }: { users: StudentRow[] }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('todos');
  // Código da proteção contra robôs, exigido pelo Supabase para enviar e-mails
  const [captcha, setCaptcha] = useState('');
  const [round, setRound] = useState(0);
  const used = () => setRound((r) => r + 1);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users.filter((u) => {
      if (filter === 'confirmados' && !u.email_confirmed) return false;
      if (filter === 'pendentes' && u.email_confirmed) return false;
      if (filter === 'google' && !u.providers.includes('google')) return false;
      return !q || u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q);
    });
  }, [users, query, filter]);

  return (
    <section className="adm-panel adm-students" aria-labelledby="contas">
      <div className="adm-students-head">
        <h2 id="contas" className="adm-section-title">Contas</h2>
        <div className="adm-students-tools">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nome ou e-mail"
            aria-label="Buscar por nome ou e-mail"
          />
          <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="Filtrar contas">
            <option value="todos">Todas</option>
            <option value="confirmados">E-mail confirmado</option>
            <option value="pendentes">Aguardando confirmação</option>
            <option value="google">Entram com Google</option>
          </select>
        </div>
      </div>

      {list.length === 0 ? (
        <p className="adm-materials-empty">
          {users.length ? 'Nenhuma conta encontrada com essa busca.' : 'Ainda não há contas criadas.'}
        </p>
      ) : (
        <ul className="adm-student-list">
          {list.map((u) => (
            <StudentItem key={u.id} user={u} captcha={captcha} onUsed={used} />
          ))}
        </ul>
      )}
      <div className="adm-captcha">
        <Turnstile resetKey={round || undefined} onToken={setCaptcha} />
      </div>
      <p className="adm-hint">
        {list.length === users.length ? `${users.length} contas` : `${list.length} de ${users.length} contas`}. Para
        ajudar quem perdeu a senha, envie o link de nova senha: a própria pessoa cria a senha pelo e-mail.
      </p>
    </section>
  );
}

function StudentItem({ user, captcha, onUsed }: { user: StudentRow; captcha: string; onUsed: () => void }) {
  const [pending, start] = useTransition();
  const initial = (user.name || user.email).trim().charAt(0).toUpperCase() || 'A';

  return (
    <li className="adm-student">
      <span className="adm-student-avatar" aria-hidden="true">
        {user.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar_url} alt="" referrerPolicy="no-referrer" />
        ) : (
          initial
        )}
      </span>
      <div className="adm-student-main">
        <strong>
          {user.name || 'Sem nome'}
          {user.is_admin && <span className="adm-tag adm-tag-admin">Admin</span>}
        </strong>
        <span className="adm-student-email">{user.email}</span>
        <span className="adm-student-meta">
          <span>Criada em {fmt(user.created_at)}</span>
          <span>Último acesso: {fmt(user.last_sign_in_at)}</span>
          <span>{user.providers.map((p) => providerLabel[p] ?? p).join(' + ')}</span>
        </span>
      </div>
      <div className="adm-student-side">
        <span className="adm-status" data-on={user.email_confirmed}>
          {user.email_confirmed ? 'Confirmado' : 'Aguardando confirmação'}
        </span>
        <div className="adm-student-actions">
          {!user.email_confirmed && (
            <button
              type="button"
              className="adm-btn adm-btn-ghost adm-btn-small"
              disabled={pending || !captcha}
              onClick={() => start(async () => { notify(await resendConfirmation(user.id, captcha)); onUsed(); })}
            >
              Reenviar confirmação
            </button>
          )}
          <button
            type="button"
            className="adm-btn adm-btn-ghost adm-btn-small"
            disabled={pending || !captcha}
            onClick={() => start(async () => { notify(await sendPasswordReset(user.id, captcha)); onUsed(); })}
          >
            {pending ? 'Enviando…' : 'Enviar link de nova senha'}
          </button>
        </div>
      </div>
    </li>
  );
}
