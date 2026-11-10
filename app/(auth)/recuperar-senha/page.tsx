import Link from 'next/link';
import { ResetForm } from '@/components/AuthForms';

export const metadata = { title: 'Recuperar senha' };

export default function RecuperarSenhaPage() {
  return (
    <div className="auth-card">
      <h1>Recuperar senha</h1>
      <p className="page-lead">Enviamos um link para você criar uma nova senha.</p>
      <ResetForm />
      <p className="auth-foot"><Link className="link" href="/entrar">Voltar para entrar</Link></p>
    </div>
  );
}
