import { redirect } from 'next/navigation';
import { GoogleButton, SignInForm } from '@/components/AuthForms';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Entrar | Azevedo Academy' };

const notices: Record<string, string> = {
  link: 'Esse link expirou ou já foi usado. Entre com sua senha ou peça um novo link.'
};

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ next?: string; aviso?: string }> }) {
  const { next = '/', aviso } = await searchParams;
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect('/');

  return (
    <>
      <h1>Entrar</h1>
      <p className="auth-sub">Acesse seus cursos e ferramentas.</p>
      <GoogleButton next={next.startsWith('/') ? next : '/'} />
      <SignInForm next={next.startsWith('/') ? next : '/'} notice={aviso ? notices[aviso] : undefined} />
      <p className="auth-legal">
        Ao entrar com o Google pela primeira vez, você concorda com os <a href="/termos">Termos de Uso</a> e com a{' '}
        <a href="/privacidade">Política de Privacidade</a>.
      </p>
      <p className="auth-alt">
        Ainda não tem conta? <a href="/cadastro">Criar conta</a>
      </p>
    </>
  );
}
