'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type NavLink = { href: string; label: string };

function isActive(path: string, href: string) {
  return href === '/' ? path === '/' : path === href || path.startsWith(href + '/');
}

export function HeaderNav({ links }: { links: NavLink[] }) {
  const path = usePathname();
  return (
    <nav className="nav" aria-label="Navegação principal">
      {links.map((l) => (
        <Link key={l.href} href={l.href} aria-current={isActive(path, l.href) ? 'page' : undefined}>{l.label}</Link>
      ))}
    </nav>
  );
}

export function MobileMenu({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button className="menu-btn" type="button" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
        <span />
        <i className="sr-only">{open ? 'Fechar menu' : 'Abrir menu'}</i>
      </button>
      <nav id="mobile-nav" className="mobile-nav" data-open={open} aria-label="Menu" aria-hidden={!open}>
        {links.map((l, i) => (
          <Link key={l.href} href={l.href} tabIndex={open ? 0 : -1} style={{ transitionDelay: `${i * 30}ms` }}>{l.label}</Link>
        ))}
      </nav>
    </>
  );
}
