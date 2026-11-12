import { redirect } from 'next/navigation';
import { MfaVerify } from '@/components/MfaForms';
import { createClient } from '@/lib/supabase/server';
import { needsSecondFactor } from '@/lib/supabase/mfa';

export const metadata = { title: 'Verificação em duas etapas | Azevedo Academy' };

const safe = (v?: string) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/');

export default async function VerificarPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safe((await searchParams).next);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  if (!(await needsSecondFactor(supabase))) redirect(next);

  return (
    <>
      <h1>Confirme que é você</h1>
      <p className="auth-sub">Abra o app autenticador no celular e digite o código da Azevedo Academy.</p>
      <MfaVerify next={next} />
      <p className="auth-alt">
        Perdeu o acesso ao app? Escreva para <a href="mailto:gabriel.azevedo.academy@gmail.com">o suporte</a>.
      </p>
      <form action="/auth/sair" method="post" className="auth-alt">
        <button type="submit" className="auth-forgot account-cancel">Sair da conta</button>
      </form>
    </>
  );
}
