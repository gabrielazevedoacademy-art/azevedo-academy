import { notFound } from 'next/navigation';
import MaterialEditor from '@/components/admin/MaterialEditor';
import { isUuid, requireAdminPage } from '@/lib/admin/guard';

export const metadata = { title: 'Editar material | Painel Azevedo Academy' };

export default async function EditMaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireAdminPage(`/admin/materiais/${id}`);
  const [{ data: m }, { data: c }, { data: cats }, { data: stats }] = await Promise.all([
    supabase.from('materials').select('*').eq('id', id).maybeSingle(),
    supabase.from('material_content').select('*').eq('material_id', id).maybeSingle(),
    supabase.from('materials').select('category'),
    supabase.rpc('admin_material_stats')
  ]);
  if (!m) notFound();
  const categories = [...new Set(((cats ?? []) as { category: string }[]).map((x) => x.category).filter(Boolean))].sort();
  const s = ((stats ?? []) as { material_id: string; copies: number; downloads: number; opens: number; people: number }[]).find(
    (x) => x.material_id === id
  );

  return (
    <div className="adm-page">
      <nav className="adm-crumbs" aria-label="Você está em">
        <a href="/admin/materiais">Materiais</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{m.title}</span>
      </nav>
      <MaterialEditor
        material={{
          id: m.id,
          title: m.title,
          slug: m.slug,
          summary: m.summary,
          description: m.description,
          kind: m.kind,
          category: m.category,
          coverPath: m.cover_path,
          requiresLogin: m.requires_login,
          published: m.is_published,
          prompt: c?.prompt ?? '',
          url: c?.url ?? '',
          fileName: c?.file_name ?? null,
          fileSize: c?.file_size ?? null,
          filePath: c?.file_path ?? null
        }}
        categories={categories}
        stats={s ?? null}
      />
    </div>
  );
}
