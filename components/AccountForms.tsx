'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { changePassword, updateName, type AccountState } from '@/app/(conta)/actions';

function Save({ label, pending }: { label: string; pending: string }) {
  const { pending: busy } = useFormStatus();
  return (
    <button className="button button-dark account-save" type="submit" disabled={busy} aria-busy={busy}>
      {busy ? pending : label}
    </button>
  );
}

function Message({ state }: { state: AccountState }) {
  if (state?.error) return <p className="auth-alert auth-alert-error" role="alert">{state.error}</p>;
  if (state?.success) return <p className="auth-alert auth-alert-success" role="status">{state.success}</p>;
  return null;
}

export function NameForm({ name }: { name: string }) {
  const [state, action] = useActionState(updateName, undefined);
  return (
    <form action={action} className="auth-form">
      <Message state={state} />
      <div className="auth-field">
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" autoComplete="name" defaultValue={name} maxLength={80} required />
      </div>
      <Save label="Salvar nome" pending="Salvando…" />
    </form>
  );
}

export function PasswordForm() {
  const [state, action] = useActionState(changePassword, undefined);
  const [visible, setVisible] = useState(false);
  return (
    <form action={action} className="auth-form">
      <Message state={state} />
      <div className="auth-field">
        <label htmlFor="password">Nova senha</label>
        <div className="auth-password">
          <input id="password" name="password" type={visible ? 'text' : 'password'} autoComplete="new-password" minLength={8} required />
          <button type="button" onClick={() => setVisible((v) => !v)} aria-pressed={visible} aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}>
            {visible ? 'Esconder' : 'Mostrar'}
          </button>
        </div>
        <span className="auth-hint">Pelo menos 8 caracteres.</span>
      </div>
      <Save label="Trocar senha" pending="Salvando…" />
    </form>
  );
}
