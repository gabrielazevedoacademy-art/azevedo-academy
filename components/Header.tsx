'use client';

import { useEffect, useState } from 'react';

const links = [
  { href: '#cursos', label: 'Cursos' },
  { href: '#ferramentas', label: 'Ferramentas' },
  { href: '#quem-somos', label: 'Quem somos' }
];

export default function Header() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  // Header claro sobre o hero branco; escuro quando o conteúdo preto passa por baixo dele
  useEffect(() => {
    const hero = document.getElementById('inicio');
    if (!hero) return;
    const headerH = () => parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 68;
    const update = () => setDark(hero.getBoundingClientRect().bottom <= headerH());
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
    const onResize = () => window.innerWidth > 760 && setOpen(false);
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
        <div className="container header-inner">
          <a className="brand" href="#inicio" aria-label="Azevedo Academy, voltar ao início" onClick={() => setOpen(false)}>
            <img src="/logo.svg" alt="" width={28} height={29} />
            <span>Azevedo Academy</span>
          </a>
          <nav className="nav" aria-label="Navegação principal">
            {links.map((l) => (
              <a key={l.href} href={l.href}>{l.label}</a>
            ))}
          </nav>
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
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
      </nav>
    </>
  );
}
