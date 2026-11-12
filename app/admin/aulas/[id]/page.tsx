import { notFound } from 'next/navigation';
import { deleteLesson, setLessonThumbnail } from '@/app/admin/actions';
import ImageUpload from '@/components/admin/ImageUpload';
import LessonForm from '@/components/admin/LessonForm';
import Materials, { type MaterialItem } from '@/components/admin/Materials';
import { ConfirmButton } from '@/components/admin/ui';
import { isUuid, requireAdminPage } from '@/lib/admin/guard';
import { MATERIAL_BUCKET } from '@/lib/admin/storage';
import { youtubeThumb } from '@/lib/admin/youtube';

type Raw = {
  id: string;
  title: string;
  description: string;
  youtube_id: string | null;
  duration_minutes: number | null;
  thumbnail_path: string | null;
  is_published: boolean;
  is_free_preview: boolean;
  module_id: string;
  modules: { id: string; title: string; course_id: string; courses: { id: string; title: string } };
  lesson_materials: {
    id: string;
    title: string;
    kind: 'file' | 'link';
    url: string | null;
    file_path: string | null;
    file_size: number | null;
    mime_type: string | null;
    position: number;
  }[];
};

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  const { supabase } = await requireAdminPage(`/admin/aulas/${id}`);

  const { data } = await supabase
    .from('lessons')
    .select(
      `id, title, description, youtube_id, duration_minutes, thumbnail_path, is_published, is_free_preview, module_id,
       modules(id, title, course_id, courses(id, title)),
       lesson_materials(id, title, kind, url, file_path, file_size, mime_type, position)`
    )
    .eq('id', id)
    .order('position', { referencedTable: 'lesson_materials' })
    .maybeSingle();
  if (!data) notFound();
  const lesson = data as unknown as Raw;
  const course = lesson.modules.courses;

  const [{ data: siblings }, signed] = await Promise.all([
    supabase.from('modules').select('id, title').eq('course_id', lesson.modules.course_id).order('position'),
    (async () => {
      const paths = lesson.lesson_materials.filter((m) => m.file_path).map((m) => m.file_path!);
      if (!paths.length) return new Map<string, string>();
      const { data: urls } = await supabase.storage.from(MATERIAL_BUCKET).createSignedUrls(paths, 60 * 60);
      return new Map((urls ?? []).filter((u) => u.signedUrl).map((u) => [u.path!, u.signedUrl]));
    })()
  ]);

  const materials: MaterialItem[] = lesson.lesson_materials.map((m) => ({
    id: m.id,
    title: m.title,
    kind: m.kind,
    url: m.url,
    file_size: m.file_size,
    mime_type: m.mime_type,
    href: m.kind === 'link' ? m.url : (signed.get(m.file_path!) ?? null),
    ext: m.file_path?.match(/\.([A-Za-z0-9]{1,6})$/)?.[1]?.toLowerCase() ?? ''
  }));

  return (
    <div className="adm-page">
      <nav className="adm-crumbs" aria-label="Você está em">
        <a href="/admin">Cursos</a>
        <span aria-hidden="true">/</span>
        <a href={`/admin/cursos/${course.id}`}>{course.title}</a>
        <span aria-hidden="true">/</span>
        <span>{lesson.modules.title}</span>
      </nav>

      <header className="adm-head">
        <div>
          <h1>{lesson.title}</h1>
          <p>
            <span className="adm-status" data-on={lesson.is_published}>
              {lesson.is_published ? 'Publicada' : 'Rascunho'}
            </span>
            {lesson.is_free_preview && <span className="adm-tag adm-tag-free">Amostra grátis</span>}
          </p>
        </div>
        <a className="adm-btn adm-btn-ghost" href={`/admin/cursos/${course.id}`}>
          Voltar ao curso
        </a>
      </header>

      <div className="adm-split">
        <div className="adm-split-main">
          <LessonForm
            key={`${lesson.id}-${lesson.module_id}`}
            lesson={lesson}
            modules={(siblings ?? []) as { id: string; title: string }[]}
          />
        </div>

        <aside className="adm-split-side">
          <section className="adm-panel" aria-labelledby="thumb">
            <h2 id="thumb" className="adm-section-title">Thumbnail</h2>
            <ImageUpload
              path={lesson.thumbnail_path}
              folder={`aulas/${lesson.id}`}
              ratio="16 / 9"
              width={1280}
              height={720}
              label="Enviar thumbnail"
              hint="Proporção 16:9 (1280 x 720). Sem thumbnail, usamos a capa do vídeo no YouTube."
              fallback={lesson.youtube_id ? youtubeThumb(lesson.youtube_id) : null}
              onSave={setLessonThumbnail.bind(null, lesson.id)}
            />
          </section>

          <section className="adm-panel" aria-labelledby="materiais">
            <h2 id="materiais" className="adm-section-title">Materiais complementares</h2>
            <Materials lessonId={lesson.id} items={materials} />
          </section>

          <section className="adm-panel adm-panel-danger" aria-labelledby="excluir">
            <h2 id="excluir" className="adm-section-title">Excluir aula</h2>
            <p className="adm-hint">Apaga a aula, a thumbnail e os materiais enviados. Não dá para desfazer.</p>
            <ConfirmButton label="Excluir aula" onConfirm={deleteLesson.bind(null, lesson.id)} />
          </section>
        </aside>
      </div>
    </div>
  );
}
