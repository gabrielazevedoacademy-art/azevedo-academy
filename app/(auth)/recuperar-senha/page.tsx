import { ResetForm } from '@/components/AuthForms';

export const metadata = { title: 'Recuperar senha | Azevedo Academy' };

export default function RecuperarSenhaPage() {
  return (
    <>
      <h1>Recuperar senha</h1>
      <p className="auth-sub">Enviamos um link para você criar uma nova senha.</p>
      <ResetForm />
      <p className="auth-alt">
        Lembrou a senha? <a href="/entrar">Entrar</a>
      </p>
    </>
  );
}
