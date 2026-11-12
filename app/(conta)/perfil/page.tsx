import { redirect } from 'next/navigation';
import { NameForm } from '@/components/AccountForms';
import Avatar from '@/components/Avatar';
import { createClient } from '@/lib/supabase/server';
import { toViewUser } from '@/lib/user';

export const metadata = { title: 'Meu perfil | Azevedo Academy' };

export default async function PerfilPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar?next=/perfil');
  const user = toViewUser(data.user);
  const since = new Date(data.user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return (
    <>
      <div className="account-head">
        <Avatar user={user} size={72} />
        <div>
          <h1>{user.name || 'Meu perfil'}</h1>
          <p>{user.email}</p>
        </div>
      </div>
      <p className="account-since">Aluno desde {since}</p>
      <section className="account-section" aria-labelledby="dados">
        <h2 id="dados">Seus dados</h2>
        <NameForm name={user.name} />
      </section>
      <p className="auth-alt">
        <a href="/">Voltar ao site</a>
      </p>
    </>
  );
}
