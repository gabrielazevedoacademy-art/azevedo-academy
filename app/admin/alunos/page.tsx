import { revokeAccess, setRole } from '@/app/admin/actions';
import { ConfirmSubmit, GrantForm } from '@/components/admin/Forms';
import { Search } from '@/components/icons';
import { requireAdmin } from '@/lib/auth';
import type { Profile } from '@/lib/types';

export const metadata = { title: 'Alunos' };

const sourceLabel: Record<string, string> = { free: 'gratuito', kiwify: 'Kiwify', admin: 'manual' };

export default async function AdminStudents({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q = '' } = await searchParams;
  const { supabase, user } = await requireAdmin();

  let query = supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(200);
  const term = q.trim().replace(/[%,()]/g, '');
  if (term) query = query.or(`email.ilike.%${term}%,full_name.ilike.%${term}%`);
  const [{ data: profilesData }, { data: courses }, { data: enrollments }] = await Promise.all([
    query,
    supabase.from('courses').select('id, title').order('position'),
    supabase.from('enrollments').select('user_id, course_id, source')
  ]);
  const profiles = (profilesData ?? []) as Profile[];
  const courseTitle = new Map((courses ?? []).map((c) => [c.id, c.title]));

  return (
    <>
      <div className="admin-top">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 style={{ marginTop: 12 }}>Alunos</h1>
          <p>{profiles.length} {profiles.length === 1 ? 'conta' : 'contas'}{term ? ` encontradas para “${term}”` : ''}.</p>
        </div>
      </div>

      <GrantForm courses={courses ?? []} />

      <form className="toolbar" style={{ marginTop: 24 }}>
        <div className="search" style={{ flex: 1, maxWidth: 420 }}>
          <Search />
          <input className="input" name="q" defaultValue={q} placeholder="Buscar por nome ou e-mail" aria-label="Buscar alunos" />
        </div>
        <button className="btn btn-ghost btn-sm" type="submit">Buscar</button>
      </form>

      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>Aluno</th><th>Cursos</th><th>Desde</th><th>Papel</th></tr></thead>
          <tbody>
            {profiles.map((p) => {
              const mine = (enrollments ?? []).filter((e) => e.user_id === p.id);
              return (
                <tr key={p.id}>
                  <td>
                    <strong>{p.full_name || '—'}</strong>
                    <div className="muted" style={{ fontSize: 12 }}>{p.email}{p.whatsapp ? ` · ${p.whatsapp}` : ''}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {mine.length ? mine.map((e) => (
                        <form key={e.course_id} action={revokeAccess} style={{ display: 'inline-flex' }}>
                          <input type="hidden" name="user_id" value={p.id} />
                          <input type="hidden" name="course_id" value={e.course_id} />
                          <span className="badge" title={`Origem: ${sourceLabel[e.source] ?? e.source}`}>
                            {courseTitle.get(e.course_id) ?? 'Curso'}
                            <ConfirmSubmit className="" message={`Remover o acesso de ${p.email} a "${courseTitle.get(e.course_id)}"?`}>
                              <span aria-label="Remover acesso" style={{ marginLeft: 4, color: 'var(--danger)' }}>×</span>
                            </ConfirmSubmit>
                          </span>
                        </form>
                      )) : <span className="muted">—</span>}
                    </div>
                  </td>
                  <td className="muted">{new Date(p.created_at).toLocaleDateString('pt-BR')}</td>
                  <td>
                    {p.id === user.id ? <span className="badge badge-orange">Admin (você)</span> : (
                      <form action={setRole}>
                        <input type="hidden" name="user_id" value={p.id} />
                        <input type="hidden" name="role" value={p.role === 'admin' ? 'user' : 'admin'} />
                        <ConfirmSubmit className="btn btn-ghost btn-sm" message={p.role === 'admin' ? `Remover ${p.email} da equipe de admins?` : `Tornar ${p.email} admin? Ele poderá editar tudo na plataforma.`}>
                          {p.role === 'admin' ? 'Admin · remover' : 'Aluno'}
                        </ConfirmSubmit>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
