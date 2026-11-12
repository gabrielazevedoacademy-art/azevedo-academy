'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { requestPasswordReset, signIn, signInWithGoogle, signUp, updatePassword, type AuthState } from '@/app/(auth)/actions';

function Submit({ children, pending: pendingLabel, water = false }: { children: string; pending: string; water?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button className={`button button-dark auth-submit${water ? ' auth-submit-water' : ''}`} type="submit" disabled={pending} aria-busy={pending}>
      <span className="auth-submit-label">{pending ? pendingLabel : children}</span>
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A10.6 10.6 0 0 0 12 1 11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
    </svg>
  );
}

function GoogleSubmit() {
  const { pending } = useFormStatus();
  return (
    <button className="auth-google" type="submit" disabled={pending} aria-busy={pending}>
      <GoogleIcon />
      {pending ? 'Abrindo o Google…' : 'Continuar com Google'}
    </button>
  );
}

export function GoogleButton({ next = '/' }: { next?: string }) {
  const [state, action] = useActionState(signInWithGoogle, undefined);
  return (
    <form action={action} className="auth-google-form">
      <Message state={state} />
      <input type="hidden" name="next" value={next} />
      <GoogleSubmit />
      <div className="auth-divider" role="presentation">
        <span>ou</span>
      </div>
    </form>
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
      <Submit pending="Entrando…" water>
        Entrar
      </Submit>
    </form>
  );
}

// E-mail digitado duas vezes; o navegador avisa na hora se não forem iguais
function EmailPair() {
  const [email, setEmail] = useState('');
  const [confirm, setConfirm] = useState('');
  const mismatch = confirm.length > 0 && confirm.trim().toLowerCase() !== email.trim().toLowerCase();
  return (
    <>
      <div className="auth-field">
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="email" inputMode="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="auth-field">
        <label htmlFor="email_confirm">Confirme seu e-mail</label>
        <input
          id="email_confirm"
          name="email_confirm"
          type="email"
          autoComplete="off"
          inputMode="email"
          required
          value={confirm}
          aria-invalid={mismatch}
          aria-describedby="email_confirm_hint"
          onChange={(e) => {
            setConfirm(e.target.value);
            e.target.setCustomValidity(
              e.target.value.trim().toLowerCase() !== email.trim().toLowerCase() ? 'Os e-mails não são iguais.' : ''
            );
          }}
          onPaste={(e) => e.preventDefault()}
        />
        <span id="email_confirm_hint" className={mismatch ? 'auth-hint auth-hint-error' : 'auth-hint'}>
          {mismatch ? 'Os e-mails não são iguais.' : 'Digite o mesmo e-mail de novo.'}
        </span>
      </div>
    </>
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
      <EmailPair />
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
