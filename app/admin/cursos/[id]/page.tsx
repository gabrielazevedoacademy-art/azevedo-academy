import { notFound } from 'next/navigation';
import { deleteCourse, setCourseCover } from '@/app/admin/actions';
import CourseContent, { type ModuleItem } from '@/components/admin/CourseContent';
import CourseDetails from '@/components/admin/CourseDetails';
import ImageUpload from '@/components/admin/ImageUpload';
import { ConfirmButton } from '@/components/admin/ui';
import { isUuid, requireAdminPage } from '@/lib/admin/guard';

type Raw = {
  id: string;
  title: string;
  slug: string;
  description: string;
  is_free: boolean;
  status: 'draft' | 'published';
  cover_path: string | null;
  modules: (Omit<ModuleItem, 'lessons'> & {
    lessons: (Omit<ModuleItem['lessons'][number], 'materials'> & { lesson_materials: { count: number }[] })[];
  })[];
};

export default async function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireAdminPage(`/admin/cursos/${id}`);

  const { data } = await supabase
    .from('courses')
    .select(
      `id, title, slug, description, is_free, status, cover_path,
       modules(id, title, is_published, position,
         lessons(id, title, is_published, is_free_preview, thumbnail_path, youtube_id, duration_minutes, position, lesson_materials(count)))`
    )
    .eq('id', id)
    .order('position', { referencedTable: 'modules' })
    .order('position', { referencedTable: 'modules.lessons' })
    .maybeSingle();
  if (!data) notFound();
  const course = data as Raw;

  const modules: ModuleItem[] = course.modules.map((m) => ({
    id: m.id,
    title: m.title,
    is_published: m.is_published,
    lessons: m.lessons.map(({ lesson_materials, ...l }) => ({ ...l, materials: lesson_materials[0]?.count ?? 0 }))
  }));

  return (
    <div className="adm-page">
      <nav className="adm-crumbs" aria-label="Você está em">
        <a href="/admin">Cursos</a>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{course.title}</span>
      </nav>

      <header className="adm-head">
        <div>
          <h1>{course.title}</h1>
          <p>
            <span className="adm-status" data-on={course.status === 'published'}>
              {course.status === 'published' ? 'Publicado' : 'Rascunho'}
            </span>
            {course.is_free && <span className="adm-tag adm-tag-free">Grátis</span>}
          </p>
        </div>
      </header>

      <div className="adm-split">
        <section className="adm-split-main" aria-labelledby="conteudo">
          <h2 id="conteudo" className="adm-section-title">Conteúdo</h2>
          <CourseContent courseId={course.id} modules={modules} />
        </section>

        <aside className="adm-split-side">
          <section className="adm-panel" aria-labelledby="detalhes">
            <h2 id="detalhes" className="adm-section-title">Detalhes do curso</h2>
            <CourseDetails course={course} />
          </section>
          <section className="adm-panel" aria-labelledby="capa">
            <h2 id="capa" className="adm-section-title">Capa</h2>
            <ImageUpload
              path={course.cover_path}
              folder={`cursos/${course.id}`}
              ratio="4 / 5"
              width={1080}
              height={1350}
              label="Enviar capa"
              hint="Proporção 4:5, como os cards do site. Recortamos o centro se a imagem tiver outro formato."
              onSave={setCourseCover.bind(null, course.id)}
            />
          </section>
          <section className="adm-panel adm-panel-danger" aria-labelledby="excluir">
            <h2 id="excluir" className="adm-section-title">Excluir curso</h2>
            <p className="adm-hint">Apaga o curso com todos os módulos, aulas, thumbnails e materiais. Não dá para desfazer.</p>
            <ConfirmButton label="Excluir curso" onConfirm={deleteCourse.bind(null, course.id)} />
          </section>
        </aside>
      </div>
    </div>
  );
}
