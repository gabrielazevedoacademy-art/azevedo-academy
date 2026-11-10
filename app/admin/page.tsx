import Link from 'next/link';
import { ArrowRight } from '@/components/icons';
import { requireAdmin } from '@/lib/auth';

export default async function AdminHome() {
  const { supabase } = await requireAdmin();
  const count = async (table: string, filter?: (q: any) => any) => {
    let q = supabase.from(table).select('*', { count: 'exact', head: true });
    if (filter) q = filter(q);
    const { count } = await q;
    return count ?? 0;
  };
  const [students, courses, published, enrollments, purchases] = await Promise.all([
    count('profiles'),
    count('courses'),
    count('courses', (q) => q.eq('status', 'published')),
    count('enrollments'),
    count('purchases', (q) => q.eq('status', 'paid'))
  ]);
  const { data: recent } = await supabase.from('profiles').select('full_name, email, created_at').order('created_at', { ascending: false }).limit(6);

  const stats = [
    { label: 'Contas', value: students },
    { label: 'Cursos publicados', value: `${published}/${courses}` },
    { label: 'Matrículas', value: enrollments },
    { label: 'Vendas aprovadas', value: purchases }
  ];

  return (
    <>
      <div className="admin-top">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 style={{ marginTop: 12 }}>Visão geral</h1>
        </div>
        <Link className="btn btn-cta" href="/admin/cursos"><span>Gerenciar cursos</span><span className="btn-arrow"><ArrowRight /></span></Link>
      </div>

      <div className="stat-row" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', marginTop: 0 }}>
        {stats.map((s, i) => (
          <div key={s.label} className="stat" style={{ '--i': i } as React.CSSProperties}><span>{s.label}</span><strong>{s.value}</strong></div>
        ))}
      </div>

      <section className="panel" style={{ marginTop: 24 }}>
        <div className="panel-head"><h2>Cadastros recentes</h2><Link className="link" href="/admin/alunos">Ver todos</Link></div>
        {recent?.length ? (
          <div className="table-wrap">
            <table className="table">
              <tbody>
                {recent.map((r) => (
                  <tr key={r.email}>
                    <td>{r.full_name || '—'}</td>
                    <td className="muted">{r.email}</td>
                    <td className="muted" style={{ textAlign: 'right' }}>{new Date(r.created_at).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="hint">Nenhum cadastro ainda.</p>}
      </section>
    </>
  );
}
