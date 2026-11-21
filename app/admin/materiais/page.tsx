import MaterialList, { type MaterialRow } from '@/components/admin/MaterialList';
import NewMaterial from '@/components/admin/NewMaterial';
import { requireAdminPage } from '@/lib/admin/guard';
import { publicImage } from '@/lib/admin/storage';

export const metadata = { title: 'Materiais | Painel Azevedo Academy' };

export default async function AdminMateriaisPage() {
  const { supabase } = await requireAdminPage('/admin/materiais');
  const [{ data }, { data: stats }] = await Promise.all([
    supabase.from('materials').select('id, title, kind, category, cover_path, requires_login, is_published').order('position'),
    supabase.rpc('admin_material_stats')
  ]);
  const usage = new Map(((stats ?? []) as { material_id: string; copies: number; downloads: number; opens: number }[]).map((s) => [s.material_id, s]));
  const rows: MaterialRow[] = ((data ?? []) as {
    id: string;
    title: string;
    kind: 'prompt' | 'file' | 'link';
    category: string;
    cover_path: string | null;
    requires_login: boolean;
    is_published: boolean;
  }[]).map((m) => {
    const s = usage.get(m.id);
    return {
      id: m.id,
      title: m.title,
      kind: m.kind,
      category: m.category,
      cover: publicImage(m.cover_path),
      requiresLogin: m.requires_login,
      published: m.is_published,
      uses: s ? s.copies + s.downloads + s.opens : 0
    };
  });

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Materiais</h1>
          <p>Prompts, arquivos e links gratuitos que aparecem em /materiais. Você decide quais pedem login.</p>
        </div>
        <NewMaterial />
      </header>
      {rows.length === 0 ? (
        <div className="adm-empty">
          <p>Nenhum material ainda. Crie o primeiro: um prompt, um arquivo para baixar ou um link.</p>
        </div>
      ) : (
        <MaterialList materials={rows} />
      )}
    </div>
  );
}
