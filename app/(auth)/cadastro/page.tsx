import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SignUpForm } from '@/components/AuthForms';
import { getSessionProfile } from '@/lib/auth';

export const metadata = { title: 'Criar conta' };

export default async function CadastroPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next = '/painel' } = await searchParams;
  const { user } = await getSessionProfile();
  if (user) redirect('/painel');

  return (
    <div className="auth-card">
      <h1>Crie sua conta</h1>
      <p className="page-lead">Acesse cursos gratuitos, materiais e seus produtos.</p>
      <SignUpForm next={next} />
      <p className="auth-foot">Já tem conta? <Link className="link" href={`/entrar?next=${encodeURIComponent(next)}`}>Entrar</Link></p>
    </div>
  );
}
