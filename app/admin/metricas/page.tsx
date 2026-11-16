import { requireAdminPage } from '@/lib/admin/guard';

export const metadata = { title: 'Métricas | Painel Azevedo Academy' };

type LessonStat = {
  course: string;
  module: string;
  lesson: string;
  lesson_id: string;
  module_position: number;
  started: number;
  completed: number;
  avg_watched: number;
};
type Metrics = {
  students: number;
  active7: number;
  active30: number;
  started: number;
  completed: number;
  comments: number;
  unanswered: number;
  daily: { day: string; users: number }[];
  lessons: LessonStat[];
};

const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);

export default async function MetricasPage() {
  const { supabase } = await requireAdminPage('/admin/metricas');
  const { data, error } = await supabase.rpc('admin_metrics');
  const m = data as Metrics | null;

  if (error || !m) {
    return (
      <div className="adm-page">
        <header className="adm-head">
          <div>
            <h1>Métricas</h1>
          </div>
        </header>
        <div className="adm-empty">
          <p>Não foi possível carregar as métricas agora. Recarregue a página.</p>
        </div>
      </div>
    );
  }

  const max = Math.max(1, ...m.daily.map((d) => d.users));
  const label = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  // Aulas agrupadas por curso, na ordem em que o aluno assiste
  const courses = new Map<string, LessonStat[]>();
  m.lessons.forEach((l) => courses.set(l.course, [...(courses.get(l.course) ?? []), l]));

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Métricas</h1>
          <p>Como os alunos estão usando os cursos: quem assiste, o que conclui e onde para.</p>
        </div>
      </header>

      <section className="adm-stats" aria-label="Resumo">
        <div className="adm-stat">
          <strong>{m.students}</strong>
          <span>contas no total</span>
        </div>
        <div className="adm-stat">
          <strong>{m.active7}</strong>
          <span>assistiram aulas nos últimos 7 dias</span>
        </div>
        <div className="adm-stat">
          <strong>{m.active30}</strong>
          <span>assistiram aulas nos últimos 30 dias</span>
        </div>
        <div className="adm-stat">
          <strong>{m.completed}</strong>
          <span>
            aulas concluídas de {m.started} iniciadas{m.started ? ` (${pct(m.completed, m.started)}%)` : ''}
          </span>
        </div>
        <a className="adm-stat adm-stat-link" href="/admin/comentarios">
          <strong>{m.unanswered}</strong>
          <span>{m.unanswered === 1 ? 'dúvida esperando resposta' : 'dúvidas esperando resposta'}</span>
        </a>
      </section>

      <section className="adm-panel adm-chart-panel" aria-labelledby="ativos-dia">
        <h2 id="ativos-dia" className="adm-section-title">Alunos assistindo por dia</h2>
        <div className="adm-chart" role="img" aria-label={`Alunos que assistiram aulas por dia nos últimos 30 dias. Maior dia: ${max === 1 && !m.daily.some((d) => d.users) ? 0 : max}`}>
          {m.daily.map((d) => (
            <div key={d.day} className="adm-bar" title={`${label(d.day)}: ${d.users} ${d.users === 1 ? 'aluno' : 'alunos'}`}>
              <span style={{ height: `${(d.users / max) * 100}%` }} data-zero={d.users === 0} />
            </div>
          ))}
        </div>
        <div className="adm-chart-axis" aria-hidden="true">
          <span>{m.daily[0] ? label(m.daily[0].day) : ''}</span>
          <span>Hoje</span>
        </div>
      </section>

      {courses.size === 0 ? (
        <div className="adm-empty">
          <p>As métricas por aula aparecem quando houver um curso publicado com aulas.</p>
        </div>
      ) : (
        [...courses.entries()].map(([course, lessons]) => {
          const top = Math.max(1, ...lessons.map((l) => l.started));
          // Maior queda: de uma aula para a seguinte, quantos alunos deixaram de começar
          let drop: { from: LessonStat; to: LessonStat; lost: number } | null = null;
          for (let i = 1; i < lessons.length; i++) {
            const lost = lessons[i - 1].started - lessons[i].started;
            if (lost > 0 && (!drop || lost > drop.lost)) drop = { from: lessons[i - 1], to: lessons[i], lost };
          }
          return (
            <section key={course} className="adm-panel adm-funnel" aria-label={`Aulas do curso ${course}`}>
              <h2 className="adm-section-title">{course}</h2>
              {drop && (
                <p className="adm-funnel-note">
                  Maior queda: {drop.lost} {drop.lost === 1 ? 'aluno começou' : 'alunos começaram'} “{drop.from.lesson}” e não seguiram para “
                  {drop.to.lesson}”.
                </p>
              )}
              <div className="adm-table-wrap">
                <table className="adm-table">
                  <thead>
                    <tr>
                      <th scope="col">Aula</th>
                      <th scope="col">Começaram</th>
                      <th scope="col">Concluíram</th>
                      <th scope="col">Assistido em média</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lessons.map((l, i) => (
                      <tr key={l.lesson_id}>
                        <td>
                          <span className="adm-funnel-name">
                            <small>
                              Módulo {l.module_position + 1}, aula {i + 1 - lessons.findIndex((x) => x.module === l.module && x.module_position === l.module_position)}
                            </small>
                            {l.lesson}
                          </span>
                          <span className="adm-funnel-bar" aria-hidden="true">
                            <span style={{ width: `${(l.started / top) * 100}%` }} />
                          </span>
                        </td>
                        <td>{l.started}</td>
                        <td>
                          {l.completed}
                          {l.started > 0 && <small> ({pct(l.completed, l.started)}%)</small>}
                        </td>
                        <td>{l.started ? `${l.avg_watched}%` : '–'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
