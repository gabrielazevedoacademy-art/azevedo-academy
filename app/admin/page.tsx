import CourseList from '@/components/admin/CourseList';
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
        <CourseList
          courses={courses.map((c) => {
            const lessons = c.modules.flatMap((m) => m.lessons);
            const published = lessons.filter((l) => l.is_published).length;
            return {
              id: c.id,
              title: c.title,
              cover: publicImage(c.cover_path),
              published: c.status === 'published',
              free: c.is_free,
              summary: `${plural(c.modules.length, 'módulo', 'módulos')}, ${plural(lessons.length, 'aula', 'aulas')}${
                lessons.length ? ` (${published} publicadas)` : ''
              }`
            };
          })}
        />
      )}
    </div>
  );
}
