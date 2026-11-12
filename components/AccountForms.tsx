'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { changePassword, deleteAccount, updateName, type AccountState } from '@/app/(conta)/actions';

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
        <span className="auth-hint">Pelo menos 8 caracteres, com letras e números.</span>
      </div>
      <Save label="Trocar senha" pending="Salvando…" />
    </form>
  );
}

function DeleteSubmit({ ready }: { ready: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className="auth-google account-delete" type="submit" disabled={!ready || pending} aria-busy={pending}>
      {pending ? 'Excluindo…' : 'Excluir minha conta'}
    </button>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState(deleteAccount, undefined);
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  if (!open)
    return (
      <button className="auth-google account-logout" type="button" onClick={() => setOpen(true)}>
        Excluir minha conta
      </button>
    );
  return (
    <form action={action} className="auth-form">
      <Message state={state} />
      <p className="account-note">
        Sua conta, seus dados e seu acesso aos cursos serão apagados de forma definitiva. Isso não pode ser desfeito.
      </p>
      <div className="auth-field">
        <label htmlFor="confirm">Para confirmar, digite EXCLUIR</label>
        <input id="confirm" name="confirm" autoComplete="off" value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <DeleteSubmit ready={text.trim().toUpperCase() === 'EXCLUIR'} />
      <button className="auth-forgot account-cancel" type="button" onClick={() => { setOpen(false); setText(''); }}>
        Cancelar
      </button>
    </form>
  );
}
