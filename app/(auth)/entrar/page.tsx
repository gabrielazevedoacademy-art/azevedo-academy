import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/AuthForms';
import { getSessionProfile } from '@/lib/auth';

export const metadata = { title: 'Entrar' };

const errors: Record<string, string> = {
  google: 'Não foi possível entrar com o Google. Tente novamente.',
  link: 'O link expirou ou já foi usado. Entre com sua senha ou peça um novo link.'
};

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const { next = '/painel', erro } = await searchParams;
  const { user } = await getSessionProfile();
  if (user) redirect(next.startsWith('/') ? next : '/painel');

  return (
    <div className="auth-card">
      <h1>Bem-vindo de volta</h1>
      <p className="page-lead">Entre para continuar seus cursos.</p>
      <SignInForm next={next} initialError={erro ? errors[erro] : undefined} />
      <p className="auth-foot">Ainda não tem conta? <Link className="link" href={`/cadastro?next=${encodeURIComponent(next)}`}>Criar conta</Link></p>
    </div>
  );
}
