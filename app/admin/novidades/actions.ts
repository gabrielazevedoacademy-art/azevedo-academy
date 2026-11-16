'use server';

import { revalidatePath } from 'next/cache';
import type { Result } from '@/app/admin/actions';
import { getAdmin, isUuid } from '@/lib/admin/guard';
import { IMAGE_BUCKET } from '@/lib/admin/storage';
import { cleanLink, fromLocalInput } from '@/lib/links';

const DENIED: Result = { error: 'Sua conta não tem permissão para editar o painel.' };
const FAILED: Result = { error: 'Não foi possível salvar agora. Tente de novo em instantes.' };

async function db() {
  const ctx = await getAdmin();
  return ctx.isAdmin ? ctx.supabase : null;
}
const refresh = () => revalidatePath('/admin/novidades');

export type AnnouncementInput = {
  title: string;
  body: string;
  imagePath: string | null;
  ctaLabel: string;
  ctaUrl: string;
  startsAt: string; // datetime-local, horário de Brasília
  endsAt: string;
  isActive: boolean;
};

export async function saveAnnouncement(id: string | null, input: AnnouncementInput): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (id && !isUuid(id)) return FAILED;

  const title = input.title.trim();
  const body = input.body.trim();
  const label = input.ctaLabel.trim();
  if (!title) return { error: 'Escreva o título do banner.' };
  if (title.length > 120) return { error: 'Use um título com até 120 caracteres.' };
  if (body.length > 600) return { error: 'Use um texto com até 600 caracteres.' };
  const url = cleanLink(input.ctaUrl);
  if (url === undefined) return { error: 'Confira o link do botão: use um endereço do site (como /meus-cursos) ou https://.' };
  if (url && !label) return { error: 'Escreva o texto do botão.' };
  if (label && !url) return { error: 'Cole o link do botão.' };
  if (label.length > 40) return { error: 'Use um texto de botão com até 40 caracteres.' };
  const starts = fromLocalInput(input.startsAt);
  const ends = fromLocalInput(input.endsAt);
  if (!starts || !ends || isNaN(+starts) || isNaN(+ends)) return { error: 'Defina o início e o fim do período.' };
  if (ends <= starts) return { error: 'O fim do período precisa ser depois do início.' };
  if (input.imagePath && !/^banners\/[\w.-]+$/.test(input.imagePath)) return FAILED;

  const row = {
    title,
    body,
    image_path: input.imagePath,
    cta_label: label || null,
    cta_url: url,
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
    is_active: input.isActive,
    updated_at: new Date().toISOString()
  };
  const { error } = id
    ? await supabase.from('announcements').update(row).eq('id', id)
    : await supabase.from('announcements').insert(row);
  if (error) return FAILED;
  refresh();
  return { ok: id ? 'Banner atualizado.' : 'Banner criado.' };
}

export async function setAnnouncementActive(id: string, active: boolean): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { error } = await supabase.from('announcements').update({ is_active: active, updated_at: new Date().toISOString() }).eq('id', id);
  if (error) return FAILED;
  refresh();
  return { ok: active ? 'Banner ativado.' : 'Banner pausado.' };
}

export async function deleteAnnouncement(id: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { data, error } = await supabase.from('announcements').delete().eq('id', id).select('image_path');
  if (error) return FAILED;
  const img = data?.[0]?.image_path;
  if (img) await supabase.storage.from(IMAGE_BUCKET).remove([img]);
  refresh();
  return { ok: 'Banner excluído.' };
}

export async function createNotification(title: string, body: string, link: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  const t = title.trim();
  const b = body.trim();
  if (!t) return { error: 'Escreva o título do aviso.' };
  if (t.length > 140) return { error: 'Use um título com até 140 caracteres.' };
  if (b.length > 400) return { error: 'Use um texto com até 400 caracteres.' };
  const url = cleanLink(link);
  if (url === undefined) return { error: 'Confira o link: use um endereço do site (como /meus-cursos) ou https://.' };
  const ctx = await getAdmin();
  const { error } = await supabase
    .from('notifications')
    .insert({ kind: 'update', title: t, body: b, url, created_by: ctx.user?.id ?? null });
  if (error) return FAILED;
  refresh();
  return { ok: 'Aviso enviado para todos os alunos.' };
}

export async function deleteNotification(id: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  if (error) return FAILED;
  refresh();
  return { ok: 'Aviso removido.' };
}
