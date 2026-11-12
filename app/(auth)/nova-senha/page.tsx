import { redirect } from 'next/navigation';
import { NewPasswordForm } from '@/components/AuthForms';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Nova senha | Azevedo Academy' };

export default async function NovaSenhaPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar?aviso=link');

  return (
    <>
      <h1>Nova senha</h1>
      <p className="auth-sub">Escolha a nova senha da sua conta.</p>
      <NewPasswordForm />
    </>
  );
}
