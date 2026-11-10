'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Book, Folder, Grid, Receipt, Users } from '../icons';

const items = [
  { href: '/admin', label: 'Visão geral', Icon: Grid },
  { href: '/admin/cursos', label: 'Cursos', Icon: Book },
  { href: '/admin/materiais', label: 'Materiais', Icon: Folder },
  { href: '/admin/alunos', label: 'Alunos', Icon: Users },
  { href: '/admin/compras', label: 'Compras', Icon: Receipt }
];

export default function AdminNav() {
  const path = usePathname();
  return (
    <aside className="admin-side" aria-label="Menu do admin">
      <span className="label">Admin</span>
      {items.map(({ href, label, Icon }) => {
        const active = href === '/admin' ? path === href : path.startsWith(href) || (href === '/admin/cursos' && path.startsWith('/admin/aulas'));
        return (
          <Link key={href} href={href} aria-current={active ? 'page' : undefined}><Icon /> {label}</Link>
        );
      })}
    </aside>
  );
}
