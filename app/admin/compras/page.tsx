import { requireAdmin } from '@/lib/auth';

export const metadata = { title: 'Compras' };

const statusLabel: Record<string, [string, string]> = {
  paid: ['Aprovada', 'badge badge-orange'],
  refunded: ['Reembolsada', 'badge'],
  chargedback: ['Chargeback', 'badge'],
  waiting_payment: ['Aguardando', 'badge'],
  refused: ['Recusada', 'badge']
};

export default async function AdminPurchases() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('purchases').select('id, order_id, status, email, customer_name, product_id, course_id, created_at, courses(title)').order('created_at', { ascending: false }).limit(200);
  const rows = (data ?? []) as unknown as { id: string; order_id: string; status: string; email: string; customer_name: string | null; product_id: string | null; created_at: string; courses: { title: string } | null }[];

  return (
    <>
      <div className="admin-top">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 style={{ marginTop: 12 }}>Compras</h1>
          <p>Eventos recebidos da Kiwify. Compras aprovadas liberam o curso automaticamente pelo e-mail do comprador.</p>
        </div>
      </div>
      {rows.length ? (
        <div className="table-wrap">
          <table className="table">
            <thead><tr><th>Comprador</th><th>Curso</th><th>Situação</th><th>Data</th></tr></thead>
            <tbody>
              {rows.map((r) => {
                const [label, cls] = statusLabel[r.status] ?? [r.status, 'badge'];
                return (
                  <tr key={r.id}>
                    <td><strong>{r.customer_name || '—'}</strong><div className="muted" style={{ fontSize: 12 }}>{r.email}</div></td>
                    <td className="muted">{r.courses?.title ?? `Produto ${r.product_id ?? '?'} (sem curso vinculado)`}</td>
                    <td><span className={cls}>{label}</span></td>
                    <td className="muted">{new Date(r.created_at).toLocaleString('pt-BR')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty"><h3>Nenhuma compra recebida ainda</h3><p>Assim que o webhook da Kiwify estiver ligado, as vendas aparecem aqui.</p></div>
      )}
    </>
  );
}
