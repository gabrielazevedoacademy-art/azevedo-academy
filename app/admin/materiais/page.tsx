import MaterialTable from '@/components/admin/MaterialTable';
import { MaterialCreator } from '@/components/admin/Uploaders';
import { requireAdmin } from '@/lib/auth';
import { getMaterials } from '@/lib/courses';

export const metadata = { title: 'Materiais' };

export default async function AdminMaterials() {
  const { supabase } = await requireAdmin();
  const materials = await getMaterials(supabase, { standalone: true });
  return (
    <>
      <div className="admin-top">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 style={{ marginTop: 12 }}>Materiais gratuitos</h1>
          <p>Arquivos e links da página /materiais, liberados para quem tem conta.</p>
        </div>
      </div>
      <section className="panel">
        <MaterialTable materials={materials} revalidate="/admin/materiais" />
      </section>
      <MaterialCreator scope={{ revalidate: '/admin/materiais' }} title="Novo material gratuito" />
    </>
  );
}
