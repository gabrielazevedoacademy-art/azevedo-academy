import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { CatalogItem } from '@/lib/catalog';
import { SUPABASE_KEY, SUPABASE_URL } from '@/lib/supabase/env';

// Ordena os cards de cursos conforme a ordem salva no painel (arrastar e soltar).
// Se o banco não responder, mantém a ordem do arquivo.
export async function orderCourses(items: CatalogItem[]) {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });
    const { data } = await supabase.rpc('course_order');
    const rank = new Map(((data ?? []) as { slug: string }[]).map((r, i) => [r.slug, i]));
    return items
      .map((item, i) => ({ item, key: item.slug && rank.has(item.slug) ? rank.get(item.slug)! : 1000 + i }))
      .sort((a, b) => a.key - b.key)
      .map((x) => x.item);
  } catch {
    return items;
  }
}
