'use server';

import { headers } from 'next/headers';
import { getAdmin, isUuid } from '@/lib/admin/guard';
import type { Result } from '../actions';

async function origin() {
  const h = await headers();
  const host = h.get('x-forwarded-host') || h.get('host');
  const proto = h.get('x-forwarded-proto') || 'https';
  return `${proto}://${host}`;
}

// Busca o e-mail pelo id no próprio banco (o navegador nunca escolhe para quem enviar)
async function target(userId: string) {
  const ctx = await getAdmin();
  if (!ctx.isAdmin || !isUuid(userId)) return null;
  const { data } = await ctx.supabase.rpc('admin_list_users');
  const user = ((data ?? []) as { id: string; email: string; email_confirmed: boolean }[]).find((u) => u.id === userId);
  return user ? { supabase: ctx.supabase, user } : null;
}

function rateMessage(message: string) {
  const m = message.toLowerCase();
  if (m.includes('captcha')) return 'A verificação de segurança expirou. Aguarde um instante e clique de novo.';
  if (m.includes('rate limit') || m.includes('security purposes') || m.includes('seconds'))
    return 'Um e-mail acabou de ser enviado para essa conta. Aguarde um minuto e tente de novo.';
  return 'Não foi possível enviar agora. Tente de novo em instantes.';
}

export async function sendPasswordReset(userId: string, captchaToken: string): Promise<Result> {
  const t = await target(userId);
  if (!t) return { error: 'Conta não encontrada ou sem permissão.' };
  const { error } = await t.supabase.auth.resetPasswordForEmail(t.user.email, {
    redirectTo: `${await origin()}/auth/callback?next=/nova-senha`,
    captchaToken
  });
  if (error) return { error: rateMessage(error.message) };
  await t.supabase.rpc('admin_log', { p_action: 'password_reset_sent', p_target: userId });
  return { ok: `Link para criar nova senha enviado para ${t.user.email}.` };
}

export async function resendConfirmation(userId: string, captchaToken: string): Promise<Result> {
  const t = await target(userId);
  if (!t) return { error: 'Conta não encontrada ou sem permissão.' };
  if (t.user.email_confirmed) return { ok: 'Essa conta já está confirmada.' };
  const { error } = await t.supabase.auth.resend({
    type: 'signup',
    email: t.user.email,
    options: { emailRedirectTo: `${await origin()}/auth/callback`, captchaToken }
  });
  if (error) return { error: rateMessage(error.message) };
  await t.supabase.rpc('admin_log', { p_action: 'confirmation_resent', p_target: userId });
  return { ok: `E-mail de confirmação reenviado para ${t.user.email}.` };
}
