'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

export type AuthState = { error?: string; success?: string } | undefined;

const PASSWORD_RULE = 'Use uma senha com pelo menos 8 caracteres, com letras e números.';
const weakPassword = (p: string) => p.length < 8 || !/[A-Za-z]/.test(p) || !/\d/.test(p);

const DISPOSABLE = 'E-mails temporários não são aceitos. Use um e-mail que você acessa sempre, como Gmail ou Outlook.';

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
  if (m.includes('password should') || m.includes('weak')) return PASSWORD_RULE;
  if (m.includes('reauthentication')) return 'Por segurança, saia e entre de novo antes de trocar a senha.';
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.';
  if (m.includes('disposable_email') || m.includes('database error saving new user')) return DISPOSABLE;
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
  const emailConfirm = String(formData.get('email_confirm') || '').trim();
  const password = String(formData.get('password') || '');
  if (email.toLowerCase() !== emailConfirm.toLowerCase()) return { error: 'Os e-mails não são iguais. Confira e digite de novo.' };
  if (weakPassword(password)) return { error: PASSWORD_RULE };

  const supabase = await createClient();
  // E-mails descartáveis são barrados antes de criar a conta (o banco também bloqueia)
  const { data: disposable } = await supabase.rpc('is_disposable_email', { p_email: email });
  if (disposable === true) return { error: DISPOSABLE };
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
  if (weakPassword(password)) return { error: PASSWORD_RULE };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: translate(error.message) };
  redirect('/');
}

// O botão do Google só redireciona quando o provedor estiver ativo no Supabase.
// Até lá, mostra um aviso amigável em vez da página de erro do Supabase.
async function googleEnabled() {
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { apikey: SUPABASE_KEY },
      next: { revalidate: 60 }
    });
    if (!res.ok) return false;
    const data = (await res.json()) as { external?: { google?: boolean } };
    return Boolean(data.external?.google);
  } catch {
    return false;
  }
}

export async function signInWithGoogle(_: AuthState, formData: FormData): Promise<AuthState> {
  if (!(await googleEnabled())) return { error: 'O login com Google estará disponível em breve. Por enquanto, use seu e-mail e senha.' };
  const supabase = await createClient();
  const next = safeNext(formData.get('next'));
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${await origin()}/auth/callback?next=${encodeURIComponent(next)}` }
  });
  if (error || !data.url) return { error: 'Não foi possível abrir o login do Google. Tente novamente.' };
  redirect(data.url);
}
