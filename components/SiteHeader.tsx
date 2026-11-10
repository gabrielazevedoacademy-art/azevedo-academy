import Link from 'next/link';
import { getSessionProfile } from '@/lib/auth';
import { HeaderNav, MobileMenu } from './HeaderNav';

export default async function SiteHeader() {
  const { user, profile } = await getSessionProfile();
  const name = profile?.full_name || user?.email || '';
  const initial = name.trim().charAt(0).toUpperCase() || 'A';
  const isAdmin = profile?.role === 'admin';

  const links = [
    { href: '/', label: 'Home' },
    { href: '/cursos', label: 'Cursos' },
    { href: '/materiais', label: 'Materiais' },
    { href: '/ferramentas', label: 'Ferramentas' }
  ];
  const mobileLinks = [
    ...links,
    ...(user ? [{ href: '/painel', label: 'Meu painel' }] : [{ href: '/entrar', label: 'Entrar' }]),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : [])
  ];

  return (
    <header className="app-header">
      <div className="container">
        <Link className="brand" href="/" aria-label="Azevedo Academy, página inicial">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/assets/images/azevedo-logo-original.svg" alt="" width={34} height={36} />
          <span>Azevedo <strong>Academy</strong></span>
        </Link>

        <HeaderNav links={links} />

        <div className="header-actions">
          {user ? (
            <>
              {isAdmin && <Link className="btn btn-ghost btn-sm hide-mobile" href="/admin">Admin</Link>}
              <Link className="btn btn-primary btn-sm hide-mobile" href="/painel">Meu painel</Link>
              <Link className="avatar" href="/painel" aria-label="Meu painel">
                {profile?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.avatar_url} alt="" referrerPolicy="no-referrer" />
                ) : initial}
              </Link>
            </>
          ) : (
            <>
              <Link className="btn btn-ghost btn-sm hide-mobile" href="/entrar">Entrar</Link>
              <Link className="btn btn-primary btn-sm hide-mobile" href="/cadastro">Criar conta</Link>
            </>
          )}
          <MobileMenu links={mobileLinks} />
        </div>
      </div>
    </header>
  );
}
