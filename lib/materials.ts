import 'server-only';
import { createClient } from '@/lib/supabase/server';

/*
  Biblioteca de materiais gratuitos (prompts, arquivos e links).
  Título, capa e resumo são públicos. O conteúdo só vem do banco para quem pode ver:
  item aberto para todos, ou item "só com login" para quem entrou na conta.
*/

export type MaterialKind = 'prompt' | 'file' | 'link';
export type MaterialCard = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description: string;
  kind: MaterialKind;
  category: string;
  cover_path: string | null;
  requires_login: boolean;
  published_at: string | null;
};
export type MaterialContent = {
  prompt: string;
  url: string | null;
  file_path: string | null;
  file_name: string | null;
  file_size: number | null;
};

export const KIND_LABEL: Record<MaterialKind, string> = { prompt: 'Prompt', file: 'Arquivo', link: 'Link' };
const FIELDS = 'id, slug, title, summary, description, kind, category, cover_path, requires_login, published_at';

export async function listMaterials() {
  const supabase = await createClient();
  const [{ data }, { data: auth }] = await Promise.all([
    supabase.from('materials').select(FIELDS).eq('is_published', true).order('position').order('published_at', { ascending: false }),
    supabase.auth.getUser()
  ]);
  return { items: (data ?? []) as MaterialCard[], user: auth.user, supabase };
}

export async function getMaterial(slug: string) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data } = await supabase.from('materials').select(FIELDS).eq('slug', slug).eq('is_published', true).maybeSingle();
  if (!data) return null;
  const material = data as MaterialCard;
  // As regras do banco só devolvem o conteúdo para quem pode ver
  const { data: content } = await supabase
    .from('material_content')
    .select('prompt, url, file_path, file_name, file_size')
    .eq('material_id', material.id)
    .maybeSingle();
  return { material, content: (content as MaterialContent | null) ?? null, user: auth.user, supabase };
}

export const materialUrl = (slug: string) => `/materiais/${slug}`;
