import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CopyPrompt, OpenLink } from '@/components/materials/MaterialActions';
import MaterialCover from '@/components/materials/MaterialCover';
import MaterialsShell from '@/components/materials/MaterialsShell';
import { formatBytes, publicImage } from '@/lib/admin/storage';
import { getMaterial, KIND_LABEL, materialUrl } from '@/lib/materials';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await getMaterial((await params).slug);
  if (!found) return { title: 'Material não encontrado | Azevedo Academy', robots: { index: false } };
  const { material: m } = found;
  const cover = publicImage(m.cover_path);
  return {
    title: `${m.title} | Materiais Azevedo Academy`,
    description: m.summary || 'Material gratuito da Azevedo Academy.',
    alternates: { canonical: materialUrl(m.slug) },
    openGraph: {
      title: m.title,
      description: m.summary || 'Material gratuito da Azevedo Academy.',
      url: materialUrl(m.slug),
      ...(cover ? { images: [{ url: cover }] } : {})
    }
  };
}

export default async function MaterialPage({ params }: Props) {
  const { slug } = await params;
  const found = await getMaterial(slug);
  if (!found) notFound();
  const { material: m, content, user, supabase } = found;
  const { data: admin } = user ? await supabase.rpc('is_admin_account') : { data: false };
  const here = materialUrl(m.slug);
  const locked = !content;

  return (
    <MaterialsShell user={user} admin={Boolean(admin)} crumb={{ label: m.title, href: here }}>
      <main className="mt-main mt-detail">
        <div className="mt-detail-cover">
          <span className="mt-cover">
            <MaterialCover m={m} large />
          </span>
        </div>
        <article className="mt-detail-body">
          <p className="mt-card-meta">
            {KIND_LABEL[m.kind]}
            {m.category && <span>{m.category}</span>}
          </p>
          <h1>{m.title}</h1>
          {m.summary && <p className="mt-lead">{m.summary}</p>}
          {m.description && <div className="mt-description">{m.description}</div>}

          {locked ? (
            <div className="mt-locked">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="5" y="11" width="14" height="10" rx="2" />
                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
              </svg>
              <div>
                <strong>Entre na sua conta para acessar este material</strong>
                <p>É grátis. Leva menos de um minuto para criar a conta.</p>
                <div className="mt-locked-actions">
                  <a className="button button-dark" href={`/cadastro?next=${encodeURIComponent(here)}`}>
                    Criar conta grátis
                  </a>
                  <a className="mt-link" href={`/entrar?next=${encodeURIComponent(here)}`}>
                    Já tenho conta
                  </a>
                </div>
              </div>
            </div>
          ) : m.kind === 'prompt' && content.prompt ? (
            <CopyPrompt id={m.id} text={content.prompt} />
          ) : m.kind === 'file' && content.file_path ? (
            <div className="mt-action">
              <a className="button button-dark" href={`${here}/baixar`}>
                Baixar arquivo
              </a>
              <span>
                {content.file_name}
                {content.file_size ? `, ${formatBytes(content.file_size)}` : ''}
              </span>
            </div>
          ) : m.kind === 'link' && content.url ? (
            <OpenLink id={m.id} url={content.url} />
          ) : (
            <p className="mt-empty">Este material ainda está sendo preparado.</p>
          )}
        </article>
      </main>
    </MaterialsShell>
  );
}
