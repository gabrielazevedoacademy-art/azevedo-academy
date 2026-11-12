import type { User } from '@supabase/supabase-js';

export type ViewUser = { name: string; email: string; avatar: string | null; initial: string };

// Dados do usuário para exibir no site (nome, e-mail, foto e inicial)
export function toViewUser(user: User): ViewUser {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const email = user.email ?? '';
  const name = (meta.full_name || meta.name || email.split('@')[0] || '').trim();
  const avatar = meta.avatar_url || meta.picture || null;
  const initial = (name || email).trim().charAt(0).toUpperCase() || 'A';
  return { name, email, avatar, initial };
}
