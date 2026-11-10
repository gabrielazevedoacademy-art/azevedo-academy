'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { requestPasswordReset, signIn, signInWithGoogle, signUp, updatePassword, type AuthState } from '@/app/(auth)/actions';
import SubmitButton from './SubmitButton';
import { ArrowRight, Google } from './icons';

function Feedback({ state }: { state: AuthState }) {
  if (state?.error) return <p className="alert alert-error" role="alert" style={{ marginBottom: 16 }}>{state.error}</p>;
  if (state?.success) return <p className="alert alert-success" role="status" style={{ marginBottom: 16 }}>{state.success}</p>;
  return null;
}

export function GoogleButton({ next }: { next: string }) {
  return (
    <form action={signInWithGoogle}>
      <input type="hidden" name="next" value={next} />
      <SubmitButton className="btn btn-google btn-block" pendingLabel="Abrindo o Google…">
        <Google /> Continuar com Google
      </SubmitButton>
    </form>
  );
}

export function SignInForm({ next, initialError }: { next: string; initialError?: string }) {
  const [state, action] = useActionState(signIn, initialError ? { error: initialError } : undefined);
  return (
    <>
      <Feedback state={state} />
      <GoogleButton next={next} />
      <div className="divider">ou</div>
      <form action={action}>
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label className="label" htmlFor="email">E-mail</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
        </div>
        <div className="field">
          <label className="label" htmlFor="password" style={{ display: 'flex', justifyContent: 'space-between' }}>
            Senha <Link className="link" href="/recuperar-senha" style={{ fontSize: 12 }}>Esqueci a senha</Link>
          </label>
          <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <SubmitButton className="btn btn-cta btn-block" style={{ marginTop: 24, justifyContent: 'space-between' }} pendingLabel="Entrando…">
          <span>Entrar</span><span className="btn-arrow"><ArrowRight /></span>
        </SubmitButton>
      </form>
    </>
  );
}

export function SignUpForm({ next }: { next: string }) {
  const [state, action] = useActionState(signUp, undefined);
  if (state?.success) return <Feedback state={state} />;
  return (
    <>
      <Feedback state={state} />
      <GoogleButton next={next} />
      <div className="divider">ou</div>
      <form action={action}>
        <input type="hidden" name="next" value={next} />
        <div className="field">
          <label className="label" htmlFor="name">Nome</label>
          <input className="input" id="name" name="name" autoComplete="name" required placeholder="Como quer ser chamado" />
        </div>
        <div className="field">
          <label className="label" htmlFor="email">E-mail</label>
          <input className="input" id="email" name="email" type="email" autoComplete="email" required placeholder="voce@email.com" />
        </div>
        <div className="field">
          <label className="label" htmlFor="password">Senha</label>
          <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
          <span className="hint">Mínimo de 8 caracteres.</span>
        </div>
        <SubmitButton className="btn btn-cta btn-block" style={{ marginTop: 24, justifyContent: 'space-between' }} pendingLabel="Criando conta…">
          <span>Criar conta</span><span className="btn-arrow"><ArrowRight /></span>
        </SubmitButton>
      </form>
    </>
  );
}

export function ResetForm() {
  const [state, action] = useActionState(requestPasswordReset, undefined);
  return (
    <>
      <Feedback state={state} />
      {!state?.success && (
        <form action={action}>
          <div className="field">
            <label className="label" htmlFor="email">E-mail da conta</label>
            <input className="input" id="email" name="email" type="email" autoComplete="email" required />
          </div>
          <SubmitButton className="btn btn-primary btn-block" style={{ marginTop: 24 }} pendingLabel="Enviando…">Enviar link</SubmitButton>
        </form>
      )}
    </>
  );
}

export function NewPasswordForm() {
  const [state, action] = useActionState(updatePassword, undefined);
  return (
    <>
      <Feedback state={state} />
      <form action={action}>
        <div className="field">
          <label className="label" htmlFor="password">Nova senha</label>
          <input className="input" id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <SubmitButton className="btn btn-primary btn-block" style={{ marginTop: 24 }} pendingLabel="Salvando…">Salvar nova senha</SubmitButton>
      </form>
    </>
  );
}
