'use server';

import { revalidatePath } from 'next/cache';
import { isUuid } from '@/lib/admin/guard';
import { createClient } from '@/lib/supabase/server';

export type CommentResult = { ok?: boolean; error?: string };

const FAILED = 'Não foi possível concluir agora. Tente de novo em instantes.';

// Publica uma dúvida ou resposta. Autor, nome e selo de equipe são definidos pelo banco.
export async function postComment(lessonId: string, body: string, parentId: string | null): Promise<CommentResult> {
  const text = String(body ?? '').trim();
  if (!isUuid(lessonId) || (parentId && !isUuid(parentId))) return { error: FAILED };
  if (!text) return { error: 'Escreva sua mensagem antes de enviar.' };
  if (text.length > 2000) return { error: 'Use até 2.000 caracteres.' };

  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Entre na sua conta para comentar.' };

  const { error } = await supabase.from('lesson_comments').insert({ lesson_id: lessonId, body: text, parent_id: parentId });
  if (error) {
    if (error.message.includes('rate_limited')) return { error: 'Você enviou muitas mensagens seguidas. Espere alguns minutos e tente de novo.' };
    return { error: FAILED };
  }
  revalidatePath('/cursos', 'layout');
  revalidatePath('/admin/comentarios');
  return { ok: true };
}

// Aluno apaga o próprio comentário; o administrador apaga qualquer um (regras do banco)
export async function deleteComment(id: string): Promise<CommentResult> {
  if (!isUuid(id)) return { error: FAILED };
  const supabase = await createClient();
  const { data, error } = await supabase.from('lesson_comments').delete().eq('id', id).select('id');
  if (error || !data?.length) return { error: FAILED };
  revalidatePath('/cursos', 'layout');
  revalidatePath('/admin/comentarios');
  return { ok: true };
}

// Só o administrador consegue ocultar ou mostrar (regras do banco)
export async function setCommentHidden(id: string, hidden: boolean): Promise<CommentResult> {
  if (!isUuid(id)) return { error: FAILED };
  const supabase = await createClient();
  const { data, error } = await supabase.from('lesson_comments').update({ is_hidden: hidden }).eq('id', id).select('id');
  if (error || !data?.length) return { error: 'Sua conta não tem permissão para moderar comentários.' };
  revalidatePath('/cursos', 'layout');
  revalidatePath('/admin/comentarios');
  return { ok: true };
}
