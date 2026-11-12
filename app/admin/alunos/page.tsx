import Students, { type StudentRow } from '@/components/admin/Students';
import { requireAdminPage } from '@/lib/admin/guard';

export const metadata = { title: 'Alunos | Painel Azevedo Academy' };

const DAY = 24 * 60 * 60 * 1000;

// Data no fuso de Brasília (aaaa-mm-dd), para agrupar os cadastros por dia
const dayKey = (d: Date) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(d);

export default async function AlunosPage() {
  const { supabase } = await requireAdminPage('/admin/alunos');
  const { data, error } = await supabase.rpc('admin_list_users');
  const users = (data ?? []) as StudentRow[];

  const now = Date.now();
  const since = (days: number) => users.filter((u) => now - new Date(u.created_at).getTime() <= days * DAY).length;
  const confirmed = users.filter((u) => u.email_confirmed).length;
  const google = users.filter((u) => u.providers.includes('google')).length;

  // Cadastros dos últimos 30 dias, dia a dia
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now - (29 - i) * DAY);
    return { key: dayKey(d), label: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(d), count: 0 };
  });
  const index = new Map(days.map((d, i) => [d.key, i]));
  users.forEach((u) => {
    const i = index.get(dayKey(new Date(u.created_at)));
    if (i !== undefined) days[i].count++;
  });
  const max = Math.max(1, ...days.map((d) => d.count));

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Alunos</h1>
          <p>Todas as contas criadas no site. Senhas nunca ficam visíveis, nem para o administrador.</p>
        </div>
      </header>

      {error ? (
        <div className="adm-empty">
          <p>Não foi possível carregar as contas agora. Recarregue a página.</p>
        </div>
      ) : (
        <>
          <section className="adm-stats" aria-label="Resumo dos cadastros">
            <div className="adm-stat">
              <strong>{users.length}</strong>
              <span>contas no total</span>
            </div>
            <div className="adm-stat">
              <strong>{since(7)}</strong>
              <span>novas nos últimos 7 dias</span>
            </div>
            <div className="adm-stat">
              <strong>{since(30)}</strong>
              <span>novas nos últimos 30 dias</span>
            </div>
            <div className="adm-stat">
              <strong>{confirmed}</strong>
              <span>com e-mail confirmado{users.length ? ` (${Math.round((confirmed / users.length) * 100)}%)` : ''}</span>
            </div>
            <div className="adm-stat">
              <strong>{google}</strong>
              <span>entram com Google</span>
            </div>
          </section>

          <section className="adm-panel adm-chart-panel" aria-labelledby="cadastros-dia">
            <h2 id="cadastros-dia" className="adm-section-title">Cadastros por dia</h2>
            <div className="adm-chart" role="img" aria-label={`Cadastros nos últimos 30 dias: ${since(30)} no total`}>
              {days.map((d) => (
                <div key={d.key} className="adm-bar" title={`${d.label}: ${d.count} cadastro${d.count === 1 ? '' : 's'}`}>
                  <span style={{ height: `${(d.count / max) * 100}%` }} data-zero={d.count === 0} />
                </div>
              ))}
            </div>
            <div className="adm-chart-axis" aria-hidden="true">
              <span>{days[0].label}</span>
              <span>Hoje</span>
            </div>
          </section>

          <Students users={users} />
        </>
      )}
    </div>
  );
}
