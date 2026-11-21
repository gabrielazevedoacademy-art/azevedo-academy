import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { CatalogItem } from '@/lib/catalog';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

// Ordena os cards de cursos conforme a ordem salva no painel (arrastar e soltar)
// e aplica o link de venda (Kiwify) definido no painel. Se o banco não responder, mantém o arquivo.
export async function orderCourses(items: CatalogItem[]) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    const { data } = await supabase.rpc('course_order');
    const rows = (data ?? []) as { slug: string; external_url: string | null }[];
    const rank = new Map(rows.map((r, i) => [r.slug, i]));
    const link = new Map(rows.filter((r) => r.external_url).map((r) => [r.slug, r.external_url!]));
    return items
      .map((item) => (item.slug && link.has(item.slug) ? { ...item, href: link.get(item.slug), comingSoon: false } : item))
      .map((item, i) => ({ item, key: item.slug && rank.has(item.slug) ? rank.get(item.slug)! : 1000 + i }))
      .sort((a, b) => a.key - b.key)
      .map((x) => x.item);
  } catch {
    return items;
  }
}
