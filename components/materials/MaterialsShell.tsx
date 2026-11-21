import type { User } from '@supabase/supabase-js';
import NotificationBell from '@/components/NotificationBell';
import UserMenu from '@/components/UserMenu';
import { toViewUser } from '@/lib/user';

// Topo das páginas de materiais: marca, caminho e conta
export default function MaterialsShell({
  user,
  admin,
  crumb,
  children
}: {
  user: User | null;
  admin?: boolean;
  crumb?: { label: string; href: string };
  children: React.ReactNode;
}) {
  return (
    <div className="mt-page">
      <header className="mt-top">
        <a className="brand" href="/" aria-label="Azevedo Academy, voltar ao site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={29} />
          <span>Azevedo Academy</span>
        </a>
        <nav className="mt-crumbs" aria-label="Você está em">
          <a href="/materiais">Materiais</a>
          {crumb && (
            <>
              <span aria-hidden="true">›</span>
              <span aria-current="page">{crumb.label}</span>
            </>
          )}
        </nav>
        <div className="mt-account">
          {user ? (
            <>
              <NotificationBell />
              <UserMenu user={toViewUser(user)} admin={admin} />
            </>
          ) : (
            <>
              <a className="mt-link" href="/entrar?next=/materiais">
                Entrar
              </a>
              <a className="button button-dark mt-signup" href="/cadastro?next=/materiais">
                Criar conta grátis
              </a>
            </>
          )}
        </div>
      </header>
      {children}
    </div>
  );
}
