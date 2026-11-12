'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export type AccountState = { error?: string; success?: string } | undefined;

export async function updateName(_: AccountState, formData: FormData): Promise<AccountState> {
  const name = String(formData.get('name') || '').trim();
  if (!name) return { error: 'Digite seu nome.' };
  if (name.length > 80) return { error: 'Use um nome com até 80 caracteres.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ data: { full_name: name } });
  if (error) return { error: 'Não foi possível salvar agora. Tente novamente.' };
  revalidatePath('/perfil');
  return { success: 'Nome atualizado.' };
}

export async function changePassword(_: AccountState, formData: FormData): Promise<AccountState> {
  const password = String(formData.get('password') || '');
  if (password.length < 8) return { error: 'Use uma senha com pelo menos 8 caracteres.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.message.toLowerCase().includes('different from the old')) return { error: 'A nova senha precisa ser diferente da atual.' };
    return { error: 'Não foi possível trocar a senha agora. Tente novamente.' };
  }
  return { success: 'Senha alterada.' };
}
