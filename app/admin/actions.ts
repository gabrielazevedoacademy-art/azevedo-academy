'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth';
import { parseYouTubeId, slugify } from '@/lib/format';

export type ActionState = { error?: string; success?: string } | undefined;

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const opt = (f: FormData, k: string) => str(f, k) || null;
const int = (f: FormData, k: string) => {
  const v = str(f, k);
  if (!v) return null;
  const n = Number(v.replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n) : null;
};
const money = (f: FormData, k: string) => {
  const v = str(f, k).replace(/[^\d,.]/g, '');
  if (!v) return null;
  const n = Number(v.includes(',') ? v.replace(/\./g, '').replace(',', '.') : v);
  return Number.isFinite(n) ? Math.round(n * 100) : null;
};

// ---------- Cursos ----------
export async function createCourse(_: ActionState, f: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const title = str(f, 'title');
  if (!title) return { error: 'Dê um nome ao curso.' };
  let slug = slugify(title) || 'curso';
  const { data: clash } = await supabase.from('courses').select('id').eq('slug', slug).maybeSingle();
  if (clash) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;

  const { data, error } = await supabase
    .from('courses')
    .insert({ title, slug, is_free: f.get('is_free') === 'on' })
    .select('id')
    .single();
  if (error) return { error: 'Não foi possível criar o curso.' };
  redirect(`/admin/cursos/${data.id}`);
}

export async function updateCourse(_: ActionState, f: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(f, 'id');
  const slug = slugify(str(f, 'slug'));
  const isFree = f.get('is_free') === 'on';
  if (!str(f, 'title')) return { error: 'O curso precisa de um nome.' };
  if (!slug) return { error: 'Informe o endereço (slug) do curso.' };

  const { error } = await supabase
    .from('courses')
    .update({
      title: str(f, 'title'),
      slug,
      subtitle: opt(f, 'subtitle'),
      description: opt(f, 'description'),
      is_free: isFree,
      price_cents: isFree ? null : money(f, 'price'),
      checkout_url: isFree ? null : opt(f, 'checkout_url'),
      kiwify_product_id: isFree ? null : opt(f, 'kiwify_product_id'),
      status: f.get('status') === 'published' ? 'published' : 'draft',
      position: int(f, 'position') ?? 0
    })
    .eq('id', id);
  if (error) {
    if (error.code === '23505') return { error: 'Já existe um curso com esse endereço ou com esse ID de produto da Kiwify.' };
    return { error: 'Não foi possível salvar. Confira os campos.' };
  }
  revalidatePath('/admin/cursos');
  revalidatePath(`/admin/cursos/${id}`);
  revalidatePath('/cursos');
  return { success: 'Curso salvo.' };
}

export async function setCourseCover(id: string, url: string | null) {
  const { supabase } = await requireAdmin();
  await supabase.from('courses').update({ cover_url: url }).eq('id', id);
  revalidatePath(`/admin/cursos/${id}`);
  revalidatePath('/cursos');
}

export async function deleteCourse(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('courses').delete().eq('id', str(f, 'id'));
  revalidatePath('/admin/cursos');
  redirect('/admin/cursos');
}

// ---------- Módulos ----------
export async function addModule(f: FormData) {
  const { supabase } = await requireAdmin();
  const courseId = str(f, 'course_id');
  const title = str(f, 'title') || 'Novo módulo';
  const { count } = await supabase.from('modules').select('id', { count: 'exact', head: true }).eq('course_id', courseId);
  await supabase.from('modules').insert({ course_id: courseId, title, position: count ?? 0 });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function renameModule(f: FormData) {
  const { supabase } = await requireAdmin();
  const title = str(f, 'title');
  if (!title) return;
  await supabase.from('modules').update({ title }).eq('id', str(f, 'id'));
  revalidatePath(`/admin/cursos/${str(f, 'course_id')}`);
}

export async function deleteModule(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('modules').delete().eq('id', str(f, 'id'));
  revalidatePath(`/admin/cursos/${str(f, 'course_id')}`);
}

async function reorder(table: 'modules' | 'lessons', scopeCol: string, scopeId: string, id: string, dir: 'up' | 'down') {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from(table).select('id').eq(scopeCol, scopeId).order('position').order('created_at');
  const ids = (data ?? []).map((r) => r.id as string);
  const i = ids.indexOf(id);
  const j = dir === 'up' ? i - 1 : i + 1;
  if (i < 0 || j < 0 || j >= ids.length) return;
  [ids[i], ids[j]] = [ids[j], ids[i]];
  await Promise.all(ids.map((rowId, position) => supabase.from(table).update({ position }).eq('id', rowId)));
}

export async function moveModule(f: FormData) {
  await reorder('modules', 'course_id', str(f, 'course_id'), str(f, 'id'), str(f, 'dir') as 'up' | 'down');
  revalidatePath(`/admin/cursos/${str(f, 'course_id')}`);
}

// ---------- Aulas ----------
export async function addLesson(f: FormData) {
  const { supabase } = await requireAdmin();
  const moduleId = str(f, 'module_id');
  const courseId = str(f, 'course_id');
  const title = str(f, 'title');
  if (!title) return;
  const { count } = await supabase.from('lessons').select('id', { count: 'exact', head: true }).eq('module_id', moduleId);
  const { data } = await supabase
    .from('lessons')
    .insert({ module_id: moduleId, course_id: courseId, title, position: count ?? 0 })
    .select('id')
    .single();
  const youtube = parseYouTubeId(str(f, 'youtube'));
  if (data && youtube) await supabase.from('lesson_contents').upsert({ lesson_id: data.id, youtube_id: youtube });
  revalidatePath(`/admin/cursos/${courseId}`);
}

export async function moveLesson(f: FormData) {
  await reorder('lessons', 'module_id', str(f, 'module_id'), str(f, 'id'), str(f, 'dir') as 'up' | 'down');
  revalidatePath(`/admin/cursos/${str(f, 'course_id')}`);
}

export async function updateLesson(_: ActionState, f: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const id = str(f, 'id');
  const youtubeRaw = str(f, 'youtube');
  const youtube = parseYouTubeId(youtubeRaw);
  if (youtubeRaw && !youtube) return { error: 'Não reconheci esse link do YouTube. Cole o endereço completo do vídeo.' };
  if (!str(f, 'title')) return { error: 'A aula precisa de um título.' };

  const { error } = await supabase
    .from('lessons')
    .update({
      title: str(f, 'title'),
      summary: opt(f, 'summary'),
      duration_minutes: int(f, 'duration'),
      is_preview: f.get('is_preview') === 'on',
      module_id: str(f, 'module_id')
    })
    .eq('id', id);
  if (error) return { error: 'Não foi possível salvar a aula.' };

  const { error: cErr } = await supabase.from('lesson_contents').upsert({ lesson_id: id, youtube_id: youtube, body: opt(f, 'body') });
  if (cErr) return { error: 'A aula foi salva, mas o vídeo não. Tente de novo.' };

  revalidatePath(`/admin/aulas/${id}`);
  revalidatePath(`/admin/cursos/${str(f, 'course_id')}`);
  return { success: 'Aula salva.' };
}

export async function deleteLesson(f: FormData) {
  const { supabase } = await requireAdmin();
  const courseId = str(f, 'course_id');
  await supabase.from('lessons').delete().eq('id', str(f, 'id'));
  revalidatePath(`/admin/cursos/${courseId}`);
  if (f.get('redirect') === '1') redirect(`/admin/cursos/${courseId}`);
}

// ---------- Materiais ----------
export async function createMaterial(input: {
  title: string;
  description?: string | null;
  kind: 'file' | 'link';
  url?: string | null;
  storage_path?: string | null;
  course_id?: string | null;
  lesson_id?: string | null;
  revalidate: string;
}) {
  const { supabase } = await requireAdmin();
  if (!input.title.trim()) return { error: 'Dê um nome ao material.' };
  if (input.kind === 'link' && !/^https?:\/\//i.test(input.url ?? '')) return { error: 'O link precisa começar com https://' };
  const { error } = await supabase.from('materials').insert({
    title: input.title.trim(),
    description: input.description?.trim() || null,
    kind: input.kind,
    url: input.kind === 'link' ? input.url : null,
    storage_path: input.kind === 'file' ? input.storage_path : null,
    course_id: input.course_id ?? null,
    lesson_id: input.lesson_id ?? null
  });
  if (error) return { error: 'Não foi possível salvar o material.' };
  revalidatePath(input.revalidate);
  return { success: 'Material adicionado.' };
}

export async function deleteMaterial(f: FormData) {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('materials').select('storage_path').eq('id', str(f, 'id')).maybeSingle();
  await supabase.from('materials').delete().eq('id', str(f, 'id'));
  if (data?.storage_path) await supabase.storage.from('materiais').remove([data.storage_path]);
  revalidatePath(str(f, 'revalidate') || '/admin/materiais');
}

export async function toggleMaterial(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('materials').update({ is_published: f.get('published') !== '1' }).eq('id', str(f, 'id'));
  revalidatePath(str(f, 'revalidate') || '/admin/materiais');
}

// ---------- Alunos e acesso ----------
export async function grantAccess(_: ActionState, f: FormData): Promise<ActionState> {
  const { supabase } = await requireAdmin();
  const email = str(f, 'email').toLowerCase();
  const courseId = str(f, 'course_id');
  if (!email || !courseId) return { error: 'Informe o e-mail e o curso.' };

  const { data: profile } = await supabase.from('profiles').select('id').ilike('email', email).maybeSingle();
  if (!profile) return { error: 'Nenhum aluno cadastrado com esse e-mail. Peça para ele criar a conta primeiro.' };

  const { error } = await supabase
    .from('enrollments')
    .upsert({ user_id: profile.id, course_id: courseId, source: 'admin' }, { onConflict: 'user_id,course_id' });
  if (error) return { error: 'Não foi possível liberar o acesso.' };
  revalidatePath('/admin/alunos');
  return { success: `Acesso liberado para ${email}.` };
}

export async function revokeAccess(f: FormData) {
  const { supabase } = await requireAdmin();
  await supabase.from('enrollments').delete().eq('user_id', str(f, 'user_id')).eq('course_id', str(f, 'course_id'));
  revalidatePath('/admin/alunos');
}

export async function setRole(f: FormData) {
  const { supabase, user } = await requireAdmin();
  const id = str(f, 'user_id');
  if (id === user.id) return; // não remove o próprio acesso de admin por engano
  await supabase.from('profiles').update({ role: f.get('role') === 'admin' ? 'admin' : 'user' }).eq('id', id);
  revalidatePath('/admin/alunos');
}
