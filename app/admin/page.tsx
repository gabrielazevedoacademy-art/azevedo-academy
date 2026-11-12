import NewCourse from '@/components/admin/NewCourse';
import { requireAdminPage } from '@/lib/admin/guard';
import { plural, publicImage } from '@/lib/admin/storage';

type Row = {
  id: string;
  title: string;
  slug: string;
  status: 'draft' | 'published';
  is_free: boolean;
  cover_path: string | null;
  modules: { lessons: { is_published: boolean }[] }[];
};

export default async function AdminHome() {
  const { supabase } = await requireAdminPage();
  const { data } = await supabase
    .from('courses')
    .select('id, title, slug, status, is_free, cover_path, modules(lessons(is_published))')
    .order('position');
  const courses = (data ?? []) as Row[];

  return (
    <div className="adm-page">
      <header className="adm-head">
        <div>
          <h1>Cursos</h1>
          <p>Monte cada curso com módulos e aulas. O aluno só vê o que estiver publicado.</p>
        </div>
        <NewCourse />
      </header>

      {courses.length === 0 ? (
        <div className="adm-empty">
          <p>Nenhum curso ainda. Crie o primeiro para começar a montar as aulas.</p>
        </div>
      ) : (
        <ul className="adm-courses">
          {courses.map((c) => {
            const lessons = c.modules.flatMap((m) => m.lessons);
            const cover = publicImage(c.cover_path);
            return (
              <li key={c.id}>
                <a className="adm-course" href={`/admin/cursos/${c.id}`}>
                  <span className="adm-course-cover">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {cover ? <img src={cover} alt="" /> : <img src="/logo.svg" alt="" className="is-logo" />}
                  </span>
                  <span className="adm-course-text">
                    <strong>{c.title}</strong>
                    <span>
                      {plural(c.modules.length, 'módulo', 'módulos')}, {plural(lessons.length, 'aula', 'aulas')}
                      {lessons.length > 0 && ` (${lessons.filter((l) => l.is_published).length} publicadas)`}
                    </span>
                  </span>
                  <span className="adm-course-tags">
                    {c.is_free && <span className="adm-tag adm-tag-free">Grátis</span>}
                    <span className="adm-status" data-on={c.status === 'published'}>
                      {c.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </span>
                  <svg className="adm-course-go" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
