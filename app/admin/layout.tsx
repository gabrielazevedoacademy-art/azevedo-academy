import AdminNav from '@/components/admin/AdminNav';
import SiteHeader from '@/components/SiteHeader';
import { requireAdmin } from '@/lib/auth';

export const metadata = { title: { default: 'Admin', template: '%s · Admin | Azevedo Academy' }, robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <>
      <SiteHeader />
      <div className="admin">
        <AdminNav />
        <main className="admin-main">{children}</main>
      </div>
    </>
  );
}
