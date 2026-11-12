import type { Metadata } from 'next';
import Avatar from '@/components/Avatar';
import AdminNav from '@/components/admin/AdminNav';
import { Toaster } from '@/components/admin/ui';
import { requireAdminPage } from '@/lib/admin/guard';
import { toViewUser } from '@/lib/user';
import './admin.css';

export const metadata: Metadata = { title: 'Painel | Azevedo Academy', robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireAdminPage();
  const view = toViewUser(user);

  return (
    <div className="adm">
      <aside className="adm-side">
        <a className="adm-brand" href="/admin">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={26} height={27} />
          <span>Painel</span>
        </a>
        <AdminNav />
        <div className="adm-side-foot">
          <a href="/" className="adm-side-link">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9" /><path d="M18 14v6H4V6h6" /></svg>
            Ver site
          </a>
          <a href="/perfil" className="adm-user">
            <Avatar user={view} size={30} />
            <span>{view.name || view.email}</span>
          </a>
        </div>
      </aside>
      <main className="adm-main">{children}</main>
      <Toaster />
    </div>
  );
}
