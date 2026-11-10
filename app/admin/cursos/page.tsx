import Link from 'next/link';
import { NewCourseForm } from '@/components/admin/Forms';
import { Edit, Eye } from '@/components/icons';
import { requireAdmin } from '@/lib/auth';
import { formatPrice } from '@/lib/format';
import type { Course } from '@/lib/types';

export const metadata = { title: 'Cursos' };

export default async function AdminCourses() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from('courses').select('*').order('position').order('created_at', { ascending: false });
  const courses = (data ?? []) as Course[];
  const { data: lessonRows } = await supabase.from('lessons').select('course_id');
  const lessonCount = (id: string) => (lessonRows ?? []).filter((l) => l.course_id === id).length;

  return (
    <>
      <div className="admin-top">
        <div>
          <span className="eyebrow">Admin</span>
          <h1 style={{ marginTop: 12 }}>Cursos</h1>
          <p>Crie cursos, organize módulos e aulas e publique quando estiver pronto.</p>
        </div>
      </div>

      {courses.length > 0 && (
        <div className="table-wrap" style={{ marginBottom: 24 }}>
          <table className="table">
            <thead><tr><th>Curso</th><th>Tipo</th><th>Aulas</th><th>Situação</th><th /></tr></thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id}>
                  <td><Link href={`/admin/cursos/${c.id}`} style={{ fontWeight: 600 }}>{c.title}</Link><div className="muted" style={{ fontSize: 12 }}>/cursos/{c.slug}</div></td>
                  <td className="muted">{c.is_free ? 'Gratuito' : formatPrice(c.price_cents) || 'Pago'}</td>
                  <td className="muted">{lessonCount(c.id)}</td>
                  <td>{c.status === 'published' ? <span className="badge badge-orange">Publicado</span> : <span className="badge">Rascunho</span>}</td>
                  <td>
                    <div className="row-actions">
                      <Link className="btn btn-ghost btn-sm" href={`/cursos/${c.slug}`} target="_blank"><Eye width={14} height={14} /> Ver</Link>
                      <Link className="btn btn-primary btn-sm" href={`/admin/cursos/${c.id}`}><Edit width={14} height={14} /> Editar</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewCourseForm />
    </>
  );
}
