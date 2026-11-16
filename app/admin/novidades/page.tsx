import Announcements, { type AnnouncementRow } from '@/components/admin/Announcements';
import ManualNotifications, { type NotificationRow } from '@/components/admin/ManualNotifications';
import { requireAdminPage } from '@/lib/admin/guard';

export const metadata = { title: 'Novidades | Painel Azevedo Academy' };

export default async function NovidadesPage() {
  const { supabase } = await requireAdminPage('/admin/novidades');
  const [{ data: banners }, { data: notes }, { data: dismissals }] = await Promise.all([
    supabase.from('announcements').select('*').order('starts_at', { ascending: false }).limit(50),
    supabase.from('notifications').select('id, kind, title, body, url, created_at').order('created_at', { ascending: false }).limit(30),
    supabase.rpc('admin_announcement_stats')
  ]);
  const hidden = new Map(((dismissals ?? []) as { announcement_id: string; total: number }[]).map((d) => [d.announcement_id, d.total]));

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Novidades</h1>
          <p>Banners que aparecem quando os alunos entram no site e avisos que vão para o sino de notificações.</p>
        </div>
      </header>
      <Announcements
        rows={((banners ?? []) as AnnouncementRow[]).map((b) => ({ ...b, dismissed: hidden.get(b.id) ?? 0 }))}
      />
      <ManualNotifications rows={(notes ?? []) as NotificationRow[]} />
    </div>
  );
}
