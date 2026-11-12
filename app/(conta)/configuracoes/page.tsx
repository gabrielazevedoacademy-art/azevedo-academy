import { redirect } from 'next/navigation';
import { PasswordForm } from '@/components/AccountForms';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Configurações | Azevedo Academy' };

export default async function ConfiguracoesPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar?next=/configuracoes');
  const viaGoogle = data.user.app_metadata?.provider === 'google';

  return (
    <>
      <h1>Configurações</h1>
      <p className="auth-sub">{data.user.email}</p>

      <section className="account-section" aria-labelledby="senha">
        <h2 id="senha">Senha</h2>
        {viaGoogle ? (
          <p className="account-note">Você entra com a sua conta Google, então não precisa de senha aqui.</p>
        ) : (
          <PasswordForm />
        )}
      </section>

      <section className="account-section" aria-labelledby="sessao">
        <h2 id="sessao">Sessão</h2>
        <form action="/auth/sair" method="post">
          <button className="auth-google account-logout" type="submit">Sair da conta</button>
        </form>
      </section>

      <p className="auth-alt">
        <a href="/">Voltar ao site</a>
      </p>
    </>
  );
}
