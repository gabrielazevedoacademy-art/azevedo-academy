import { NewPasswordForm } from '@/components/AuthForms';
import { requireUser } from '@/lib/auth';

export const metadata = { title: 'Nova senha' };

export default async function NovaSenhaPage() {
  await requireUser('/nova-senha');
  return (
    <div className="auth-card">
      <h1>Nova senha</h1>
      <p className="page-lead">Escolha uma nova senha para sua conta.</p>
      <NewPasswordForm />
    </div>
  );
}
