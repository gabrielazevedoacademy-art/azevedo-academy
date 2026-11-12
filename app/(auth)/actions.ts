'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; success?: string } | undefined;

function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === 'string' ? value : '';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

async function origin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

function translate(message: string) {
  const m = message.toLowerCase();
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.';
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail pelo link que enviamos antes de entrar.';
  if (m.includes('already registered')) return 'Este e-mail já tem uma conta. Entre com sua senha.';
  if (m.includes('password should be') || m.includes('weak')) return 'Use uma senha com pelo menos 8 caracteres.';
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
  if (m.includes('invalid') && m.includes('email')) return 'Confira o e-mail digitado.';
  return 'Não foi possível concluir agora. Tente novamente em instantes.';
}

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get('email') || '').trim(),
    password: String(formData.get('password') || '')
  });
  if (error) return { error: translate(error.message) };
  redirect(safeNext(formData.get('next')));
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const name = String(formData.get('name') || '').trim();
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  if (password.length < 8) return { error: 'Use uma senha com pelo menos 8 caracteres.' };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name }, emailRedirectTo: `${await origin()}/auth/callback` }
  });
  if (error) return { error: translate(error.message) };
  if (data.session) redirect('/');
  return { success: `Conta criada. Enviamos um link de confirmação para ${email}. Abra o e-mail para ativar sua conta.` };
}

export async function requestPasswordReset(_: AuthState, formData: FormData): Promise<AuthState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(String(formData.get('email') || '').trim(), {
    redirectTo: `${await origin()}/auth/callback?next=/nova-senha`
  });
  if (error) return { error: translate(error.message) };
  return { success: 'Se existir uma conta com esse e-mail, você vai receber um link para criar uma nova senha.' };
}

export async function updatePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const password = String(formData.get('password') || '');
  if (password.length < 8) return { error: 'Use uma senha com pelo menos 8 caracteres.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translate(error.message) };
  redirect('/');
}
