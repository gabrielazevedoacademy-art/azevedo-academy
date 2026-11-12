import { redirect } from 'next/navigation';
import { MfaSetup } from '@/components/MfaForms';
import { createClient } from '@/lib/supabase/server';
import { needsSecondFactor, verifyUrl } from '@/lib/supabase/mfa';

export const metadata = { title: 'Segurança da conta | Azevedo Academy' };

const safe = (v?: string) => (v && v.startsWith('/') && !v.startsWith('//') ? v : '/configuracoes');

export default async function SegurancaPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const next = safe((await searchParams).next);
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect(`/entrar?next=${encodeURIComponent('/seguranca')}`);
  // Quem já tem a verificação precisa passar por ela antes de mexer aqui
  if (await needsSecondFactor(supabase)) redirect(verifyUrl('/seguranca'));

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp?.find((f) => f.status === 'verified') ?? null;
  const { data: admin } = await supabase.rpc('is_admin_account');

  return (
    <>
      <h1>Verificação em duas etapas</h1>
      <p className="auth-sub">
        {admin === true && !factor
          ? 'Para proteger os dados dos alunos, o painel de administrador só abre com a verificação em duas etapas ativada.'
          : 'Uma segunda proteção para a sua conta: mesmo que alguém descubra sua senha, não entra sem o código do seu celular.'}
      </p>
      <MfaSetup next={next} active={Boolean(factor)} factorId={factor?.id ?? null} />
      <p className="auth-alt">
        <a href="/configuracoes">Voltar para Configurações</a>
      </p>
    </>
  );
}
