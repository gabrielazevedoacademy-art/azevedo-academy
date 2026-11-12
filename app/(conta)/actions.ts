'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
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
  if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password))
    return { error: 'Use uma senha com pelo menos 8 caracteres, com letras e números.' };
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    if (error.message.toLowerCase().includes('different from the old')) return { error: 'A nova senha precisa ser diferente da atual.' };
    if (error.message.toLowerCase().includes('reauthentication'))
      return { error: 'Por segurança, saia e entre de novo na sua conta para trocar a senha.' };
    if (error.message.toLowerCase().includes('password should')) return { error: 'Use uma senha com pelo menos 8 caracteres, com letras e números.' };
    return { error: 'Não foi possível trocar a senha agora. Tente novamente.' };
  }
  return { success: 'Senha alterada.' };
}

// Direito de exclusão (LGPD art. 18, VI): apaga a conta e os dados ligados a ela
export async function deleteAccount(_: AccountState, formData: FormData): Promise<AccountState> {
  if (String(formData.get('confirm') || '').trim().toUpperCase() !== 'EXCLUIR')
    return { error: 'Digite EXCLUIR para confirmar.' };
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/entrar?next=/configuracoes');
  const { data: admin } = await supabase.rpc('is_admin_account');
  if (admin === true) return { error: 'Contas de administrador não podem ser excluídas por aqui.' };
  const { error } = await supabase.rpc('delete_my_account');
  if (error) return { error: 'Não foi possível excluir agora. Tente de novo ou escreva para o nosso e-mail de contato.' };
  await supabase.auth.signOut();
  redirect('/conta-excluida');
}
