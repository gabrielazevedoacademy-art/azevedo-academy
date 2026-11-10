import 'server-only';
import { redirect } from 'next/navigation';
import { cache } from 'react';
import { createClient } from './supabase/server';
import type { Profile } from './types';

export const getSessionProfile = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { supabase, user: null, profile: null as Profile | null };
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  return { supabase, user: data.user, profile: (profile as Profile | null) ?? null };
});

export async function requireUser(next = '/painel') {
  const session = await getSessionProfile();
  if (!session.user) redirect(`/entrar?next=${encodeURIComponent(next)}`);
  return session as typeof session & { user: NonNullable<typeof session.user> };
}

export async function requireAdmin() {
  const session = await requireUser('/admin');
  if (session.profile?.role !== 'admin') redirect('/painel');
  return session;
}
