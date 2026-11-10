import Link from 'next/link';
import { notFound } from 'next/navigation';
import { addLesson, addModule, deleteCourse, deleteLesson, deleteModule, moveLesson, moveModule, renameModule } from '@/app/admin/actions';
import { ConfirmSubmit, CourseForm } from '@/components/admin/Forms';
import MaterialTable from '@/components/admin/MaterialTable';
import { CoverUploader, MaterialCreator } from '@/components/admin/Uploaders';
import { ChevronDown, ChevronUp, Edit, Eye, Play, Plus, Trash } from '@/components/icons';
import { requireAdmin } from '@/lib/auth';
import { getCurriculum, getMaterials } from '@/lib/courses';
import type { Course } from '@/lib/types';

function MoveButtons({ action, fields }: { action: (f: FormData) => Promise<void>; fields: Record<string, string> }) {
  return (
    <div className="order-btns">
      {(['up', 'down'] as const).map((dir) => (
        <form key={dir} action={action}>
          {Object.entries(fields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
          <input type="hidden" name="dir" value={dir} />
          <button type="submit" aria-label={dir === 'up' ? 'Mover para cima' : 'Mover para baixo'}>{dir === 'up' ? <ChevronUp /> : <ChevronDown />}</button>
        </form>
      ))}
    </div>
  );
}

export default async function AdminCourse({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
  if (!data) notFound();
  const course = data as Course;
  const [curriculum, materials, { data: videos }] = await Promise.all([
    getCurriculum(supabase, id),
    getMaterials(supabase, { courseLevelOf: id }),
    supabase.from('lesson_contents').select('lesson_id, youtube_id').not('youtube_id', 'is', null)
  ]);
  const withVideo = new Set((videos ?? []).map((v) => v.lesson_id));
  const path = `/admin/cursos/${id}`;

  return (
    <>
      <div className="admin-top">
        <div>
          <Link className="eyebrow" href="/admin/cursos">Cursos</Link>
          <h1 style={{ marginTop: 12 }}>{course.title}</h1>
          <p>{course.status === 'published' ? 'Publicado' : 'Rascunho — só você vê'} · {course.is_free ? 'Gratuito' : 'Pago'}</p>
        </div>
        <Link className="btn btn-ghost" href={`/cursos/${course.slug}`} target="_blank"><Eye width={16} height={16} /> Ver como aluno</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(280px, 360px)', gap: 20, alignItems: 'start' }} className="course-edit-grid">
        <CourseForm course={course} />
        <CoverUploader courseId={course.id} current={course.cover_url} />
      </div>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head"><h2>Módulos e aulas</h2></div>
        <div className="tree">
          {curriculum.map((m) => (
            <div key={m.id} className="tree-module">
              <div className="tree-module-head">
                <MoveButtons action={moveModule} fields={{ id: m.id, course_id: id }} />
                <form action={renameModule} style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="course_id" value={id} />
                  <input className="input" name="title" defaultValue={m.title} aria-label="Nome do módulo" />
                  <button className="btn btn-ghost btn-sm" type="submit">Renomear</button>
                </form>
                <form action={deleteModule}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="course_id" value={id} />
                  <ConfirmSubmit message={`Excluir o módulo "${m.title}" e todas as aulas dele?`}><Trash width={14} height={14} /></ConfirmSubmit>
                </form>
              </div>
              <div className="tree-lessons">
                {m.lessons.map((l) => (
                  <div key={l.id} className="tree-lesson">
                    <MoveButtons action={moveLesson} fields={{ id: l.id, module_id: m.id, course_id: id }} />
                    <span className="lesson-icon" style={withVideo.has(l.id) ? { color: 'var(--orange)', borderColor: 'rgba(255,90,31,.4)' } : undefined}><Play /></span>
                    <span className="lesson-title">{l.title}</span>
                    {l.is_preview && <span className="badge badge-orange">Prévia</span>}
                    {!withVideo.has(l.id) && <span className="badge">Sem vídeo</span>}
                    <Link className="btn btn-ghost btn-sm" href={`/admin/aulas/${l.id}`}><Edit width={14} height={14} /> Editar</Link>
                    <form action={deleteLesson}>
                      <input type="hidden" name="id" value={l.id} />
                      <input type="hidden" name="course_id" value={id} />
                      <ConfirmSubmit message={`Excluir a aula "${l.title}"?`}><Trash width={14} height={14} /></ConfirmSubmit>
                    </form>
                  </div>
                ))}
              </div>
              <form action={addLesson} className="tree-add">
                <input type="hidden" name="module_id" value={m.id} />
                <input type="hidden" name="course_id" value={id} />
                <input className="input" name="title" placeholder="Título da nova aula" required aria-label="Título da nova aula" />
                <input className="input" name="youtube" placeholder="Link do YouTube (opcional)" aria-label="Link do YouTube" />
                <button className="btn btn-primary btn-sm" type="submit"><Plus width={14} height={14} /> Aula</button>
              </form>
            </div>
          ))}
        </div>
        <form action={addModule} className="tree-add" style={{ border: '1px dashed var(--line-strong)', borderRadius: 16, marginTop: 14 }}>
          <input type="hidden" name="course_id" value={id} />
          <input className="input" name="title" placeholder={`Módulo ${curriculum.length + 1}`} aria-label="Nome do novo módulo" />
          <button className="btn btn-orange btn-sm" type="submit"><Plus width={14} height={14} /> Módulo</button>
        </form>
      </section>

      <section className="panel" style={{ marginTop: 20 }}>
        <div className="panel-head"><h2>Materiais do curso</h2></div>
        <p className="hint" style={{ marginBottom: 16 }}>Ficam na página do curso para quem tem acesso. Materiais de uma aula específica são adicionados na edição da aula.</p>
        <MaterialTable materials={materials} revalidate={path} />
      </section>
      <MaterialCreator scope={{ courseId: id, revalidate: path }} />

      <section className="panel" style={{ marginTop: 20, borderColor: 'rgba(255,77,77,.2)' }}>
        <div className="panel-head"><h2>Excluir curso</h2></div>
        <p className="hint">Apaga o curso, módulos, aulas, materiais e matrículas. Não dá para desfazer.</p>
        <form action={deleteCourse} className="panel-actions">
          <input type="hidden" name="id" value={id} />
          <ConfirmSubmit className="btn btn-danger" message={`Excluir definitivamente o curso "${course.title}"?`}>Excluir curso</ConfirmSubmit>
        </form>
      </section>
    </>
  );
}
