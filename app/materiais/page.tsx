import type { Metadata } from 'next';
import MaterialCover from '@/components/materials/MaterialCover';
import MaterialsShell from '@/components/materials/MaterialsShell';
import { KIND_LABEL, listMaterials, materialUrl } from '@/lib/materials';

export const metadata: Metadata = {
  title: 'Materiais gratuitos | Azevedo Academy',
  description: 'Prompts, arquivos e links gratuitos para usar IA no dia a dia. Copie, baixe e aplique.',
  alternates: { canonical: '/materiais' }
};

export default async function MateriaisPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const { items, user, supabase } = await listMaterials();
  const { data: admin } = user ? await supabase.rpc('is_admin_account') : { data: false };

  const categories = [...new Set(items.map((m) => m.category).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const active = categoria && categories.includes(categoria) ? categoria : null;
  const shown = active ? items.filter((m) => m.category === active) : items;

  return (
    <MaterialsShell user={user} admin={Boolean(admin)}>
      <main className="mt-main" id="materiais">
        <section className="mt-hero">
          <h1>Materiais gratuitos</h1>
          <p>Prompts, arquivos e links para você aplicar IA no seu trabalho. Copie, baixe e use à vontade.</p>
        </section>

        {categories.length > 1 && (
          <nav className="mt-filters" aria-label="Filtrar por categoria">
            <a href="/materiais" aria-current={!active ? 'page' : undefined}>
              Todos
            </a>
            {categories.map((c) => (
              <a key={c} href={`/materiais?categoria=${encodeURIComponent(c)}`} aria-current={active === c ? 'page' : undefined}>
                {c}
              </a>
            ))}
          </nav>
        )}

        {shown.length === 0 ? (
          <p className="mt-empty">Os primeiros materiais chegam em breve. Volte daqui a pouco.</p>
        ) : (
          <ul className="mt-grid">
            {shown.map((m) => (
              <li key={m.id}>
                <a className="mt-card" href={materialUrl(m.slug)}>
                  <span className="mt-cover">
                    <MaterialCover m={m} />
                    {m.requires_login && !user && <span className="mt-lock">Com login</span>}
                  </span>
                  <span className="mt-card-info">
                    <span className="mt-card-meta">
                      {KIND_LABEL[m.kind]}
                      {m.category && <span>{m.category}</span>}
                    </span>
                    <strong>{m.title}</strong>
                    {m.summary && <span className="mt-card-summary">{m.summary}</span>}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </main>
    </MaterialsShell>
  );
}
