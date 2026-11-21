'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { Result } from '@/app/admin/actions';
import { getAdmin, isUuid } from '@/lib/admin/guard';
import { IMAGE_BUCKET, MATERIAL_BUCKET } from '@/lib/admin/storage';
import { cleanLink } from '@/lib/links';

const DENIED: Result = { error: 'Sua conta não tem permissão para editar o painel.' };
const FAILED: Result = { error: 'Não foi possível salvar agora. Tente de novo em instantes.' };

async function db() {
  const ctx = await getAdmin();
  return ctx.isAdmin ? ctx.supabase : null;
}

function refresh(slug?: string) {
  revalidatePath('/admin/materiais', 'layout');
  revalidatePath('/materiais');
  if (slug) revalidatePath(`/materiais/${slug}`);
}

function slugify(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'material'
  );
}

export async function createMaterial(): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  const { data: last } = await supabase.from('materials').select('position').order('position', { ascending: false }).limit(1);
  const position = ((last?.[0]?.position as number | undefined) ?? -1) + 1;
  const slug = `material-${Date.now().toString(36)}`;
  const { data, error } = await supabase.from('materials').insert({ title: 'Novo material', slug, position }).select('id').single();
  if (error || !data) return FAILED;
  await supabase.from('material_content').insert({ material_id: data.id });
  refresh();
  redirect(`/admin/materiais/${data.id}`);
}

export type MaterialInput = {
  title: string;
  slug: string;
  summary: string;
  description: string;
  kind: 'prompt' | 'file' | 'link';
  category: string;
  prompt: string;
  url: string;
  requiresLogin: boolean;
  published: boolean;
};

export async function saveMaterial(id: string, f: MaterialInput): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id) || !['prompt', 'file', 'link'].includes(f.kind)) return FAILED;

  const title = f.title.trim();
  if (!title) return { error: 'Dê um título ao material.' };
  if (title.length > 120) return { error: 'Use um título com até 120 caracteres.' };
  if (f.summary.trim().length > 200) return { error: 'Use um resumo com até 200 caracteres.' };
  if (f.description.trim().length > 4000) return { error: 'Use uma descrição com até 4.000 caracteres.' };
  if (f.category.trim().length > 40) return { error: 'Use uma categoria com até 40 caracteres.' };
  const slug = slugify(f.slug || title);
  const url = f.kind === 'link' ? cleanLink(f.url) : null;
  if (url === undefined || (url && !url.startsWith('https://'))) return { error: 'Cole o link completo, começando com https://.' };

  const { data: current } = await supabase.from('material_content').select('file_path').eq('material_id', id).maybeSingle();
  if (f.published) {
    if (f.kind === 'prompt' && !f.prompt.trim()) return { error: 'Escreva o prompt antes de publicar.' };
    if (f.kind === 'link' && !url) return { error: 'Cole o link antes de publicar.' };
    if (f.kind === 'file' && !current?.file_path) return { error: 'Envie o arquivo antes de publicar.' };
  }

  const { data: before } = await supabase.from('materials').select('slug, published_at').eq('id', id).single();
  const { error } = await supabase
    .from('materials')
    .update({
      title,
      slug,
      summary: f.summary.trim(),
      description: f.description.trim(),
      kind: f.kind,
      category: f.category.trim(),
      requires_login: f.requiresLogin,
      is_published: f.published,
      published_at: f.published ? (before?.published_at ?? new Date().toISOString()) : before?.published_at ?? null,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);
  if (error?.code === '23505') return { error: 'Esse endereço já é usado por outro material.' };
  if (error) return FAILED;
  const { error: e2 } = await supabase
    .from('material_content')
    .upsert({ material_id: id, prompt: f.kind === 'prompt' ? f.prompt : '', url }, { onConflict: 'material_id' });
  if (e2) return FAILED;

  refresh(slug);
  if (before?.slug && before.slug !== slug) revalidatePath(`/materiais/${before.slug}`);
  return { ok: f.published ? 'Material salvo e publicado.' : 'Material salvo como rascunho.' };
}

export async function setMaterialCover(id: string, path: string | null): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id) || (path && !path.startsWith(`materiais/${id}/`))) return FAILED;
  const { data: old } = await supabase.from('materials').select('cover_path, slug').eq('id', id).single();
  const { error } = await supabase.from('materials').update({ cover_path: path }).eq('id', id);
  if (error) return FAILED;
  if (old?.cover_path && old.cover_path !== path) await supabase.storage.from(IMAGE_BUCKET).remove([old.cover_path]);
  refresh(old?.slug);
  return { ok: path ? 'Capa atualizada.' : 'Capa removida.' };
}

export async function setMaterialFile(id: string, file: { path: string; name: string; size: number } | null): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id) || (file && !file.path.startsWith(`biblioteca/${id}/`))) return FAILED;
  const { data: old } = await supabase.from('material_content').select('file_path').eq('material_id', id).maybeSingle();
  const { error } = await supabase.from('material_content').upsert(
    {
      material_id: id,
      file_path: file?.path ?? null,
      file_name: file ? file.name.slice(0, 200) : null,
      file_size: file?.size ?? null
    },
    { onConflict: 'material_id' }
  );
  if (error) return FAILED;
  if (old?.file_path && old.file_path !== file?.path) await supabase.storage.from(MATERIAL_BUCKET).remove([old.file_path]);
  refresh();
  return { ok: file ? 'Arquivo enviado.' : 'Arquivo removido.' };
}

export async function deleteMaterial(id: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const [{ data: m }, { data: c }] = await Promise.all([
    supabase.from('materials').select('cover_path, slug').eq('id', id).single(),
    supabase.from('material_content').select('file_path').eq('material_id', id).maybeSingle()
  ]);
  const { error } = await supabase.from('materials').delete().eq('id', id);
  if (error) return FAILED;
  if (m?.cover_path) await supabase.storage.from(IMAGE_BUCKET).remove([m.cover_path]);
  if (c?.file_path) await supabase.storage.from(MATERIAL_BUCKET).remove([c.file_path]);
  refresh(m?.slug);
  redirect('/admin/materiais');
}

export async function reorderMaterials(ids: string[]): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!ids.every(isUuid)) return FAILED;
  const results = await Promise.all(ids.map((id, position) => supabase.from('materials').update({ position }).eq('id', id)));
  if (results.some((r) => r.error)) return FAILED;
  refresh();
  return { ok: 'Ordem salva.' };
}
