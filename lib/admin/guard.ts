import 'server-only';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

// Quem é admin está na tabela admin_emails do Supabase (e-mail confirmado).
export async function getAdmin() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, isAdmin: false } as const;
  const { data } = await supabase.rpc('is_admin');
  return { supabase, user, isAdmin: data === true } as const;
}

export async function requireAdminPage(next = '/admin') {
  const ctx = await getAdmin();
  if (!ctx.user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  if (!ctx.isAdmin) notFound();
  return { supabase: ctx.supabase, user: ctx.user };
}

export const isUuid = (v: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
