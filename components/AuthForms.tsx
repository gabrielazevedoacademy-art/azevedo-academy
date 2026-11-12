'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestPasswordReset, signIn, signUp, updatePassword, type AuthState } from '@/app/(auth)/actions';

function Submit({ children, pending: pendingLabel }: { children: string; pending: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="button button-dark auth-submit" type="submit" disabled={pending} aria-busy={pending}>
      {pending ? pendingLabel : children}
    </button>
  );
}

function Message({ state }: { state: AuthState }) {
  if (state?.error) return <p className="auth-alert auth-alert-error" role="alert">{state.error}</p>;
  if (state?.success) return <p className="auth-alert auth-alert-success" role="status">{state.success}</p>;
  return null;
}

function PasswordField({ id, label, autoComplete, hint }: { id: string; label: string; autoComplete: string; hint?: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="auth-field">
      <label htmlFor={id}>{label}</label>
      <div className="auth-password">
        <input id={id} name="password" type={visible ? 'text' : 'password'} autoComplete={autoComplete} minLength={8} required />
        <button type="button" onClick={() => setVisible((v) => !v)} aria-pressed={visible} aria-label={visible ? 'Esconder senha' : 'Mostrar senha'}>
          {visible ? 'Esconder' : 'Mostrar'}
        </button>
      </div>
      {hint && <span className="auth-hint">{hint}</span>}
    </div>
  );
}

export function SignInForm({ next, notice }: { next: string; notice?: string }) {
  const [state, action] = useActionState(signIn, notice ? { error: notice } : undefined);
  return (
    <form action={action} className="auth-form">
      <Message state={state} />
      <input type="hidden" name="next" value={next} />
      <div className="auth-field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <PasswordField id="password" label="Senha" autoComplete="current-password" />
      <a className="auth-forgot" href="/recuperar-senha">Esqueci minha senha</a>
      <Submit pending="Entrando…">Entrar</Submit>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState(signUp, undefined);
  if (state?.success) return <Message state={state} />;
  return (
    <form action={action} className="auth-form">
      <Message state={state} />
      <div className="auth-field">
        <label htmlFor="name">Nome</label>
        <input id="name" name="name" autoComplete="name" required />
      </div>
      <div className="auth-field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <PasswordField id="password" label="Senha" autoComplete="new-password" hint="Pelo menos 8 caracteres." />
      <Submit pending="Criando conta…">Criar conta</Submit>
    </form>
  );
}

export function ResetForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  if (state?.success) return <Message state={state} />;
  return (
    <form action={action} className="auth-form">
      <Message state={state} />
      <div className="auth-field">
        <label htmlFor="email">E-mail da conta</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required />
      </div>
      <Submit pending="Enviando…">Enviar link</Submit>
    </form>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <form action={action} className="auth-form">
      <Message state={state} />
      <PasswordField id="password" label="Nova senha" autoComplete="new-password" hint="Pelo menos 8 caracteres." />
      <Submit pending="Salvando…">Salvar nova senha</Submit>
    </form>
  );
}
