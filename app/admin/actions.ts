'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getAdmin, isUuid } from '@/lib/admin/guard';
import { IMAGE_BUCKET, MATERIAL_BUCKET } from '@/lib/admin/storage';
import { parseYouTubeId } from '@/lib/admin/youtube';

export type Result = { error?: string; ok?: string } | undefined;

const DENIED: Result = { error: 'Sua conta não tem permissão para editar o painel.' };
const FAILED: Result = { error: 'Não foi possível salvar agora. Tente de novo em instantes.' };

async function db() {
  const ctx = await getAdmin();
  return ctx.isAdmin ? ctx.supabase : null;
}
type Db = NonNullable<Awaited<ReturnType<typeof db>>>;

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const checked = (f: FormData, k: string) => f.get(k) === 'on';
const refresh = () => revalidatePath('/admin', 'layout');

function slugify(value: string) {
  return (
    value
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'curso'
  );
}

async function nextPosition(supabase: Db, table: string, column: string, value: string) {
  const { data } = await supabase.from(table).select('position').eq(column, value).order('position', { ascending: false }).limit(1);
  return data?.[0] ? (data[0].position as number) + 1 : 0;
}

async function removeFiles(supabase: Db, images: (string | null)[], materials: (string | null)[]) {
  const img = images.filter(Boolean) as string[];
  const mat = materials.filter(Boolean) as string[];
  if (img.length) await supabase.storage.from(IMAGE_BUCKET).remove(img);
  if (mat.length) await supabase.storage.from(MATERIAL_BUCKET).remove(mat);
}

// Arquivos de várias aulas (thumbnails e materiais), para limpar o storage ao excluir
async function lessonFiles(supabase: Db, lessonIds: string[]) {
  if (!lessonIds.length) return { images: [], materials: [] };
  const [{ data: lessons }, { data: mats }] = await Promise.all([
    supabase.from('lessons').select('thumbnail_path').in('id', lessonIds),
    supabase.from('lesson_materials').select('file_path').in('lesson_id', lessonIds)
  ]);
  return {
    images: (lessons ?? []).map((l) => l.thumbnail_path as string | null),
    materials: (mats ?? []).map((m) => m.file_path as string | null)
  };
}

async function reorder(supabase: Db, table: string, scope: [string, string], ids: string[]) {
  if (!ids.every(isUuid)) return FAILED;
  const results = await Promise.all(
    ids.map((id, position) => supabase.from(table).update({ position }).eq('id', id).eq(scope[0], scope[1]))
  );
  if (results.some((r) => r.error)) return FAILED;
  refresh();
  return { ok: 'Ordem salva.' };
}

/* ---------- Cursos ---------- */

export async function createCourse(_: Result, form: FormData): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  const title = text(form, 'title');
  if (!title) return { error: 'Dê um nome ao curso.' };

  const { data: last } = await supabase.from('courses').select('position').order('position', { ascending: false }).limit(1);
  const position = ((last?.[0]?.position as number | undefined) ?? 0) + 1;
  const base = slugify(title);
  let id: string | null = null;
  for (let i = 0; i < 6 && !id; i++) {
    const slug = i ? `${base}-${i + 1}` : base;
    const { data, error } = await supabase.from('courses').insert({ title, slug, position }).select('id').single();
    if (data) id = data.id;
    else if (error?.code !== '23505') return FAILED;
  }
  if (!id) return { error: 'Já existe um curso com esse nome. Use outro.' };
  refresh();
  redirect(`/admin/cursos/${id}`);
}

export async function updateCourse(_: Result, form: FormData): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  const id = text(form, 'id');
  const title = text(form, 'title');
  const slug = slugify(text(form, 'slug') || title);
  if (!isUuid(id)) return FAILED;
  if (!title) return { error: 'O curso precisa de um nome.' };

  const { error } = await supabase
    .from('courses')
    .update({
      title,
      slug,
      description: text(form, 'description'),
      is_free: checked(form, 'is_free'),
      status: checked(form, 'published') ? 'published' : 'draft'
    })
    .eq('id', id);
  if (error?.code === '23505') return { error: 'Esse endereço já é usado por outro curso.' };
  if (error) return FAILED;
  refresh();
  return { ok: 'Curso salvo.' };
}

export async function setCourseCover(id: string, path: string | null): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id) || (path && !path.startsWith(`cursos/${id}/`))) return FAILED;
  const { data: old } = await supabase.from('courses').select('cover_path').eq('id', id).single();
  const { error } = await supabase.from('courses').update({ cover_path: path }).eq('id', id);
  if (error) return FAILED;
  if (old?.cover_path && old.cover_path !== path) await removeFiles(supabase, [old.cover_path], []);
  refresh();
  return { ok: path ? 'Capa atualizada.' : 'Capa removida.' };
}

export async function deleteCourse(id: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { data: course } = await supabase.from('courses').select('cover_path, modules(lessons(id))').eq('id', id).single();
  const lessonIds = ((course?.modules ?? []) as { lessons: { id: string }[] }[]).flatMap((m) => m.lessons.map((l) => l.id));
  const files = await lessonFiles(supabase, lessonIds);
  const { error } = await supabase.from('courses').delete().eq('id', id);
  if (error) return FAILED;
  await removeFiles(supabase, [course?.cover_path ?? null, ...files.images], files.materials);
  refresh();
  redirect('/admin');
}

/* ---------- Módulos ---------- */

export async function createModule(courseId: string, title: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  const name = title.trim();
  if (!isUuid(courseId)) return FAILED;
  if (!name) return { error: 'Dê um nome ao módulo.' };
  const position = await nextPosition(supabase, 'modules', 'course_id', courseId);
  const { error } = await supabase.from('modules').insert({ course_id: courseId, title: name, position });
  if (error) return FAILED;
  refresh();
  return { ok: 'Módulo criado.' };
}

export async function updateModule(id: string, values: { title?: string; is_published?: boolean }): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const patch: Record<string, unknown> = {};
  if (values.title !== undefined) {
    if (!values.title.trim()) return { error: 'O módulo precisa de um nome.' };
    patch.title = values.title.trim();
  }
  if (values.is_published !== undefined) patch.is_published = values.is_published;
  const { error } = await supabase.from('modules').update(patch).eq('id', id);
  if (error) return FAILED;
  refresh();
  return { ok: 'Módulo salvo.' };
}

export async function deleteModule(id: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { data: lessons } = await supabase.from('lessons').select('id').eq('module_id', id);
  const files = await lessonFiles(supabase, (lessons ?? []).map((l) => l.id));
  const { error } = await supabase.from('modules').delete().eq('id', id);
  if (error) return FAILED;
  await removeFiles(supabase, files.images, files.materials);
  refresh();
  return { ok: 'Módulo excluído.' };
}

export async function reorderModules(courseId: string, ids: string[]): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  return reorder(supabase, 'modules', ['course_id', courseId], ids);
}

/* ---------- Aulas ---------- */

export async function createLesson(moduleId: string, title: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  const name = title.trim();
  if (!isUuid(moduleId)) return FAILED;
  if (!name) return { error: 'Dê um nome à aula.' };
  const position = await nextPosition(supabase, 'lessons', 'module_id', moduleId);
  const { data, error } = await supabase.from('lessons').insert({ module_id: moduleId, title: name, position }).select('id').single();
  if (error || !data) return FAILED;
  refresh();
  redirect(`/admin/aulas/${data.id}`);
}

export async function updateLesson(_: Result, form: FormData): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  const id = text(form, 'id');
  const title = text(form, 'title');
  const video = text(form, 'video');
  const moduleId = text(form, 'module_id');
  const durationRaw = text(form, 'duration');
  if (!isUuid(id) || !isUuid(moduleId)) return FAILED;
  if (!title) return { error: 'A aula precisa de um título.' };

  const youtubeId = video ? parseYouTubeId(video) : null;
  if (video && !youtubeId) return { error: 'Não reconhecemos esse link. Cole o endereço do vídeo no YouTube.' };
  const duration = durationRaw ? Number(durationRaw) : null;
  if (duration !== null && (!Number.isInteger(duration) || duration < 0 || duration > 1440))
    return { error: 'Informe a duração em minutos, só com números.' };

  const { data: current } = await supabase.from('lessons').select('module_id').eq('id', id).single();
  const patch: Record<string, unknown> = {
    title,
    youtube_id: youtubeId,
    description: text(form, 'description'),
    duration_minutes: duration,
    is_published: checked(form, 'is_published'),
    is_free_preview: checked(form, 'is_free_preview')
  };
  // Trocou de módulo: vai para o fim da lista do novo módulo
  if (current && current.module_id !== moduleId) {
    patch.module_id = moduleId;
    patch.position = await nextPosition(supabase, 'lessons', 'module_id', moduleId);
  }
  const { error } = await supabase.from('lessons').update(patch).eq('id', id);
  if (error) return FAILED;
  refresh();
  return { ok: 'Aula salva.' };
}

export async function setLessonPublished(id: string, published: boolean): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { error } = await supabase.from('lessons').update({ is_published: published }).eq('id', id);
  if (error) return FAILED;
  refresh();
  return { ok: published ? 'Aula publicada.' : 'Aula oculta.' };
}

export async function setLessonThumbnail(id: string, path: string | null): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id) || (path && !path.startsWith(`aulas/${id}/`))) return FAILED;
  const { data: old } = await supabase.from('lessons').select('thumbnail_path').eq('id', id).single();
  const { error } = await supabase.from('lessons').update({ thumbnail_path: path }).eq('id', id);
  if (error) return FAILED;
  if (old?.thumbnail_path && old.thumbnail_path !== path) await removeFiles(supabase, [old.thumbnail_path], []);
  refresh();
  return { ok: path ? 'Thumbnail atualizada.' : 'Thumbnail removida.' };
}

export async function deleteLesson(id: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { data: lesson } = await supabase.from('lessons').select('modules(course_id)').eq('id', id).single();
  const files = await lessonFiles(supabase, [id]);
  const { error } = await supabase.from('lessons').delete().eq('id', id);
  if (error) return FAILED;
  await removeFiles(supabase, files.images, files.materials);
  refresh();
  const courseId = (lesson?.modules as unknown as { course_id: string } | null)?.course_id;
  redirect(courseId ? `/admin/cursos/${courseId}` : '/admin');
}

export async function reorderCourses(ids: string[]): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!ids.every(isUuid)) return FAILED;
  const results = await Promise.all(ids.map((id, i) => supabase.from('courses').update({ position: i + 1 }).eq('id', id)));
  if (results.some((r) => r.error)) return FAILED;
  refresh();
  revalidatePath('/'); // ordem dos cards na página inicial
  return { ok: 'Ordem dos cursos salva.' };
}

export async function reorderLessons(moduleId: string, ids: string[]): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  return reorder(supabase, 'lessons', ['module_id', moduleId], ids);
}

/* ---------- Materiais ---------- */

export async function addMaterialFile(
  lessonId: string,
  file: { title: string; path: string; size: number; mime: string }
): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(lessonId) || !file.path.startsWith(`${lessonId}/`)) return FAILED;
  const position = await nextPosition(supabase, 'lesson_materials', 'lesson_id', lessonId);
  const { error } = await supabase.from('lesson_materials').insert({
    lesson_id: lessonId,
    kind: 'file',
    title: file.title.trim().slice(0, 160) || 'Material',
    file_path: file.path,
    file_size: file.size,
    mime_type: file.mime || null,
    position
  });
  if (error) {
    await removeFiles(supabase, [], [file.path]);
    return FAILED;
  }
  refresh();
  return { ok: 'Material adicionado.' };
}

export async function addMaterialLink(lessonId: string, title: string, url: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(lessonId)) return FAILED;
  if (!url.trim()) return { error: 'Cole o link do material.' };
  const href = /^https?:\/\//i.test(url.trim()) ? url.trim() : `https://${url.trim()}`;
  try {
    new URL(href);
  } catch {
    return { error: 'Confira o link: ele precisa ser um endereço da web.' };
  }
  const name = title.trim() || new URL(href).hostname.replace(/^www\./, '');
  const position = await nextPosition(supabase, 'lesson_materials', 'lesson_id', lessonId);
  const { error } = await supabase
    .from('lesson_materials')
    .insert({ lesson_id: lessonId, kind: 'link', title: name.slice(0, 160), url: href, position });
  if (error) return FAILED;
  refresh();
  return { ok: 'Link adicionado.' };
}

export async function renameMaterial(id: string, title: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  if (!title.trim()) return { error: 'O material precisa de um nome.' };
  const { error } = await supabase.from('lesson_materials').update({ title: title.trim().slice(0, 160) }).eq('id', id);
  if (error) return FAILED;
  refresh();
  return { ok: 'Nome salvo.' };
}

export async function deleteMaterial(id: string): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  if (!isUuid(id)) return FAILED;
  const { data } = await supabase.from('lesson_materials').select('file_path').eq('id', id).single();
  const { error } = await supabase.from('lesson_materials').delete().eq('id', id);
  if (error) return FAILED;
  await removeFiles(supabase, [], [data?.file_path ?? null]);
  refresh();
  return { ok: 'Material removido.' };
}

export async function reorderMaterials(lessonId: string, ids: string[]): Promise<Result> {
  const supabase = await db();
  if (!supabase) return DENIED;
  return reorder(supabase, 'lesson_materials', ['lesson_id', lessonId], ids);
}
