import type { SupabaseClient } from '@supabase/supabase-js';

// Verdadeiro quando a conta tem verificação em duas etapas e a sessão atual ainda não passou por ela
export async function needsSecondFactor(supabase: SupabaseClient) {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  return data?.nextLevel === 'aal2' && data.currentLevel !== 'aal2';
}

export const verifyUrl = (next: string) => `/verificar?next=${encodeURIComponent(next)}`;
