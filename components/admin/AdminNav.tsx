'use client';

import { usePathname } from 'next/navigation';

const links = [
  {
    href: '/admin',
    label: 'Cursos',
    match: (p: string) => p === '/admin' || p.startsWith('/admin/cursos') || p.startsWith('/admin/aulas'),
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="14" rx="2" /><path d="M10 9l5 2.5-5 2.5z" /><path d="M8 21h8" /></svg>
  },
  {
    href: '/admin/alunos',
    label: 'Alunos',
    match: (p: string) => p.startsWith('/admin/alunos'),
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c1-3.5 3.5-5.5 6.5-5.5s5.5 2 6.5 5.5" /><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14.8c1.8.7 3 2.4 3.6 5.2" /></svg>
  }
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Painel">
      {links.map((l) => (
        <a key={l.href} href={l.href} aria-current={l.match(path) ? 'page' : undefined}>
          {l.icon}
          {l.label}
        </a>
      ))}
    </nav>
  );
}
