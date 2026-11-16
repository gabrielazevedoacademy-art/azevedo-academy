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
  },
  {
    href: '/admin/comentarios',
    label: 'Comentários',
    match: (p: string) => p.startsWith('/admin/comentarios'),
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" /><path d="M8 9.5h8M8 12.5h5" /></svg>
  },
  {
    href: '/admin/novidades',
    label: 'Novidades',
    match: (p: string) => p.startsWith('/admin/novidades'),
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10v4h3l6 4V6L7 10z" /><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11" /></svg>
  },
  {
    href: '/admin/metricas',
    label: 'Métricas',
    match: (p: string) => p.startsWith('/admin/metricas'),
    icon: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></svg>
  }
];

export default function AdminNav({ badges = {} }: { badges?: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav className="adm-nav" aria-label="Painel">
      {links.map((l) => (
        <a key={l.href} href={l.href} aria-current={l.match(path) ? 'page' : undefined}>
          {l.icon}
          {l.label}
          {badges[l.href] > 0 && (
            <span className="adm-nav-badge" aria-label={`${badges[l.href]} esperando resposta`}>
              {badges[l.href] > 99 ? '99+' : badges[l.href]}
            </span>
          )}
        </a>
      ))}
    </nav>
  );
}
