import AdminComment, { type AdminCommentRow } from '@/components/admin/AdminComment';
import { requireAdminPage } from '@/lib/admin/guard';
import { lessonUrl } from '@/lib/course-data';

export const metadata = { title: 'Comentários | Painel Azevedo Academy' };

type Raw = {
  id: string;
  parent_id: string | null;
  body: string;
  author_name: string;
  is_staff: boolean;
  is_hidden: boolean;
  created_at: string;
  lesson_id: string;
  lessons: { title: string; modules: { courses: { title: string; slug: string } | null } | null } | null;
};

// Moderação: dúvidas sem resposta da equipe primeiro, depois todos os comentários
export default async function ComentariosPage({ searchParams }: { searchParams: Promise<{ ver?: string }> }) {
  const { supabase } = await requireAdminPage('/admin/comentarios');
  const all = (await searchParams).ver === 'todos';

  const { data, error } = await supabase
    .from('lesson_comments')
    .select('id, parent_id, body, author_name, is_staff, is_hidden, created_at, lesson_id, lessons(title, modules(courses(title, slug)))')
    .order('created_at', { ascending: false })
    .limit(500);
  const rows = (data ?? []) as unknown as Raw[];

  const replies = new Map<string, Raw[]>();
  rows.forEach((r) => r.parent_id && replies.set(r.parent_id, [...(replies.get(r.parent_id) ?? []), r]));
  const answered = (r: Raw) => (replies.get(r.id) ?? []).some((x) => x.is_staff);
  const threads = rows.filter((r) => !r.parent_id);
  const pending = threads.filter((r) => !r.is_staff && !r.is_hidden && !answered(r));
  const list = all ? threads : pending;

  const toRow = (r: Raw): AdminCommentRow => {
    const course = r.lessons?.modules?.courses;
    return {
      id: r.id,
      lessonId: r.lesson_id,
      body: r.body,
      author: r.author_name,
      staff: r.is_staff,
      hidden: r.is_hidden,
      createdAt: r.created_at,
      where: [course?.title, r.lessons?.title].filter(Boolean).join(' › '),
      href: course ? `${lessonUrl(course.slug, r.lesson_id)}#comentarios` : null,
      replies: (replies.get(r.id) ?? [])
        .slice()
        .reverse()
        .map((x) => ({ id: x.id, body: x.body, author: x.author_name, staff: x.is_staff, hidden: x.is_hidden, createdAt: x.created_at }))
    };
  };

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Comentários</h1>
          <p>Dúvidas e comentários dos alunos nas aulas. Responda por aqui ou oculte o que não deve aparecer.</p>
        </div>
      </header>

      <nav className="adm-tabs" aria-label="Filtrar comentários">
        <a href="/admin/comentarios" aria-current={!all ? 'page' : undefined}>
          Sem resposta <span>{pending.length}</span>
        </a>
        <a href="/admin/comentarios?ver=todos" aria-current={all ? 'page' : undefined}>
          Todos <span>{threads.length}</span>
        </a>
      </nav>

      {error ? (
        <div className="adm-empty">
          <p>Não foi possível carregar os comentários agora. Recarregue a página.</p>
        </div>
      ) : list.length === 0 ? (
        <div className="adm-empty">
          <p>{all ? 'Nenhum comentário ainda.' : 'Tudo respondido. Nenhuma dúvida esperando por você.'}</p>
        </div>
      ) : (
        <ul className="adm-comments">
          {list.map((r) => (
            <li key={r.id}>
              <AdminComment row={toRow(r)} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
