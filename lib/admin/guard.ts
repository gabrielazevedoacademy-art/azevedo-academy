import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/*
  Quem é admin está na tabela admin_emails do Supabase (e-mail confirmado).
  Para usar o painel, a conta de admin precisa da verificação em duas etapas:
  sem ela, o banco nem libera os dados (is_admin exige sessão verificada, "aal2").
*/
export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false, isAdminAccount: false, aal: null } as const;
  const [{ data: account }, { data: aal }] = await Promise.all([
    supabase.rpc('is_admin_account'),
    supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  ]);
  const isAdminAccount = account === true;
  const isAdmin = isAdminAccount && aal?.currentLevel === 'aal2';
  return { supabase, user, isAdmin, isAdminAccount, aal } as const;
}

export async function requireAdminPage(next = '/admin') {
  const ctx = await getAdmin();
  if (!ctx.user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  if (!ctx.isAdminAccount) notFound();
  if (!ctx.isAdmin) {
    // Já tem o app autenticador: pede o código. Ainda não tem: leva para ativar.
    if (ctx.aal?.nextLevel === 'aal2') redirect(`/verificar?next=${encodeURIComponent(next)}`);
    redirect(`/seguranca?next=${encodeURIComponent(next)}`);
  }
  return { supabase: ctx.supabase, user: ctx.user };
}

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
