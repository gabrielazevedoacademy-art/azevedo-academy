import type { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/site-url';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

export const revalidate = 3600;

// Páginas públicas que o Google deve encontrar. Conta, painel e aulas ficam de fora (exigem login).
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/materiais`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/cadastro`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }
  ];
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    const { data } = await supabase.from('materials').select('slug, updated_at').eq('is_published', true);
    for (const m of (data ?? []) as { slug: string; updated_at: string }[])
      pages.push({ url: `${SITE_URL}/materiais/${m.slug}`, lastModified: new Date(m.updated_at), changeFrequency: 'monthly', priority: 0.7 });
  } catch {
    // sem banco, o sitemap sai só com as páginas fixas
  }
  return pages;
}
