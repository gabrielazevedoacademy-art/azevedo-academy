import { redirect } from 'next/navigation';
import { SignUpForm } from '@/components/AuthForms';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Criar conta | Azevedo Academy' };

export default async function CadastroPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (data.user) redirect('/');

  return (
    <>
      <h1>Criar conta</h1>
      <p className="auth-sub">Leva menos de um minuto.</p>
      <SignUpForm />
      <p className="auth-alt">
        Já tem conta? <a href="/entrar">Entrar</a>
      </p>
    </>
  );
}
