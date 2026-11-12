'use client';

import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';
import { toViewUser, type ViewUser } from '@/lib/user';
import GlassNav from './GlassNav';
import Avatar from './Avatar';
import UserMenu from './UserMenu';

const links = [
  { href: '#inicio', label: 'Início' },
  { href: '#cursos', label: 'Cursos' },
  { href: '#ferramentas', label: 'Ferramentas' },
  { href: '#quem-somos', label: 'Quem somos' }
];

const mobileLinks = links.slice(1);

export default function Header() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);
  // undefined = ainda verificando; null = visitante; objeto = logado
  const [user, setUser] = useState<ViewUser | null | undefined>(undefined);
  const [admin, setAdmin] = useState(false);

  // Mostra "Entrar" ou a foto do usuário conforme a sessão
  useEffect(() => {
    const supabase = createClient();
    const apply = (session: Session | null) => {
      setUser(session ? toViewUser(session.user) : null);
      // O banco confirma se a conta é de administrador
      if (session) supabase.rpc('is_admin').then(({ data }) => setAdmin(data === true));
      else setAdmin(false);
    };
    supabase.auth.getSession().then(({ data }) => apply(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, session) => apply(session));
    return () => data.subscription.unsubscribe();
  }, []);

  // No celular: header claro sobre o hero branco e escuro sobre as seções pretas
  useEffect(() => {
    const hero = document.getElementById('inicio');
    if (!hero) return;
    const headerH = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 68;
    // O hero fica preso ao topo; o header escurece quando o conteúdo preto chega embaixo dele
    const update = () => setDark(window.scrollY >= hero.offsetHeight - headerH());
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    const onResize = () => window.innerWidth > 900 && setOpen(false);
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
      <header className="header" data-theme={dark ? 'dark' : 'light'} data-menu={open ? 'open' : 'closed'}>
        <div className="header-bar">
          <a className="brand" href="#inicio" aria-label="Azevedo Academy, voltar ao início" onClick={() => setOpen(false)}>
            <img src="/logo.svg" alt="" width={28} height={29} />
            <span>Azevedo Academy</span>
          </a>
          <div className="header-actions">
            <GlassNav links={links} />
            <span className="header-divider" aria-hidden="true" />
            {user === undefined ? (
              <span className="header-account-placeholder" aria-hidden="true" />
            ) : user ? (
              <UserMenu user={user} admin={admin} />
            ) : (
              <a className="header-login" href="/entrar">
                <span className="header-login-label">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 20c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" /></svg>
                  Entrar
                </span>
              </a>
            )}
          </div>
          <button
            className="menu-button"
            type="button"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <span />
          </button>
        </div>
      </header>
      <nav id="menu-mobile" className="mobile-menu" data-open={open} aria-label="Menu" aria-hidden={!open} inert={!open}>
        {mobileLinks.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <div className="mobile-account">
          {user ? (
            <>
              <div className="mobile-account-user">
                <Avatar user={user} size={40} />
                <div>
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
              </div>
              {admin && <a href="/admin">Painel de cursos</a>}
              <a href="/perfil">Meu perfil</a>
              <a href="/configuracoes">Configurações</a>
              <form action="/auth/sair" method="post">
                <button type="submit">Sair</button>
              </form>
            </>
          ) : user === null ? (
            <a className="button mobile-login" href="/entrar">Entrar</a>
          ) : null}
        </div>
      </nav>
    </>
  );
}
