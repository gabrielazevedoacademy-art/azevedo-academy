import Link from 'next/link';
import MaterialList from '@/components/MaterialList';
import { ArrowRight, Lock } from '@/components/icons';
import { getSessionProfile } from '@/lib/auth';
import { getMaterials } from '@/lib/courses';

export const metadata = { title: 'Materiais gratuitos', description: 'Guias, templates e arquivos gratuitos da Azevedo Academy.' };

export default async function MateriaisPage() {
  const { supabase, user } = await getSessionProfile();
  const materials = user ? await getMaterials(supabase, { standalone: true }) : [];

  return (
    <main className="page">
      <div className="container" style={{ maxWidth: 860 }}>
        <span className="eyebrow reveal">Materiais</span>
        <h1 className="page-title reveal" style={{ '--d': 80 } as React.CSSProperties}>Materiais gratuitos.</h1>
        <p className="page-lead reveal" style={{ '--d': 160 } as React.CSSProperties}>
          Guias, templates e arquivos para você aplicar IA no seu trabalho hoje.
        </p>

        <section className="section">
          {!user ? (
            <div className="empty">
              <Lock width={28} height={28} style={{ margin: '0 auto 16px', color: 'var(--orange)' }} />
              <h3>Crie sua conta gratuita</h3>
              <p>Os materiais ficam liberados para quem tem cadastro.</p>
              <Link className="btn btn-cta" href="/cadastro?next=/materiais"><span>Criar conta grátis</span><span className="btn-arrow"><ArrowRight /></span></Link>
            </div>
          ) : materials.length ? (
            <MaterialList materials={materials} />
          ) : (
            <div className="empty"><h3>Em breve</h3><p>Os primeiros materiais estão sendo preparados.</p></div>
          )}
        </section>
      </div>
    </main>
  );
}
