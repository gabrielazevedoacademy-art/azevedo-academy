import Link from 'next/link';
import CourseCard from '@/components/CourseCard';
import SubmitButton from '@/components/SubmitButton';
import { ArrowRight, LogOut } from '@/components/icons';
import { requireUser } from '@/lib/auth';
import { getEnrollments, getProgress } from '@/lib/courses';
import type { Course } from '@/lib/types';
import { updateProfile } from '../actions';

export const metadata = { title: 'Meu painel', robots: { index: false } };

export default async function PainelPage() {
  const { supabase, user, profile } = await requireUser('/painel');

  const enrollments = await getEnrollments(supabase, user.id);
  const ids = enrollments.map((e) => e.course_id);
  const [{ data: coursesData }, { data: lessonsData }, done] = await Promise.all([
    ids.length ? supabase.from('courses').select('*').in('id', ids) : Promise.resolve({ data: [] }),
    ids.length ? supabase.from('lessons').select('id, course_id').in('course_id', ids) : Promise.resolve({ data: [] }),
    getProgress(supabase, user.id)
  ]);
  const courses = (coursesData ?? []) as Course[];
  const lessons = (lessonsData ?? []) as { id: string; course_id: string }[];

  const progressOf = (courseId: string) => {
    const ls = lessons.filter((l) => l.course_id === courseId);
    return ls.length ? Math.round((ls.filter((l) => done.has(l.id)).length / ls.length) * 100) : 0;
  };
  const completedCourses = courses.filter((c) => progressOf(c.id) === 100).length;
  const firstName = (profile?.full_name || user.email || '').split(' ')[0];

  return (
    <main className="page">
      <div className="container">
        <span className="eyebrow reveal">Meu painel</span>
        <h1 className="page-title reveal" style={{ '--d': 80 } as React.CSSProperties}>Olá, {firstName}.</h1>

        <div className="stat-row">
          <div className="stat" style={{ '--i': 0 } as React.CSSProperties}><span>Cursos</span><strong>{courses.length}</strong></div>
          <div className="stat" style={{ '--i': 1 } as React.CSSProperties}><span>Aulas concluídas</span><strong>{done.size}</strong></div>
          <div className="stat" style={{ '--i': 2 } as React.CSSProperties}><span>Cursos finalizados</span><strong>{completedCourses}</strong></div>
        </div>

        <section className="section">
          <div className="section-head">
            <h2>Meus cursos</h2>
            <Link className="link" href="/cursos">Ver catálogo</Link>
          </div>
          {courses.length ? (
            <div className="course-grid">
              {courses.map((c, i) => <CourseCard key={c.id} course={c} index={i} progress={progressOf(c.id)} owned />)}
            </div>
          ) : (
            <div className="empty">
              <h3>Você ainda não tem cursos</h3>
              <p>Comece por um curso gratuito ou conheça os cursos completos.</p>
              <Link className="btn btn-cta" href="/cursos"><span>Explorar cursos</span><span className="btn-arrow"><ArrowRight /></span></Link>
            </div>
          )}
        </section>

        <section className="section" style={{ maxWidth: 640 }}>
          <div className="section-head"><h2>Minha conta</h2></div>
          <form action={updateProfile} className="panel">
            <div className="form-grid">
              <div className="field">
                <label className="label" htmlFor="full_name">Nome</label>
                <input className="input" id="full_name" name="full_name" defaultValue={profile?.full_name ?? ''} />
              </div>
              <div className="field">
                <label className="label" htmlFor="whatsapp">WhatsApp</label>
                <input className="input" id="whatsapp" name="whatsapp" inputMode="tel" defaultValue={profile?.whatsapp ?? ''} placeholder="(00) 00000-0000" />
              </div>
              <div className="field span-2">
                <label className="label" htmlFor="email">E-mail</label>
                <input className="input" id="email" value={user.email ?? ''} disabled />
              </div>
            </div>
            <div className="panel-actions" style={{ justifyContent: 'space-between' }}>
              <Link className="link" href="/nova-senha" style={{ alignSelf: 'center', fontSize: 14 }}>Alterar senha</Link>
              <SubmitButton pendingLabel="Salvando…">Salvar</SubmitButton>
            </div>
          </form>
          <form action="/auth/sair" method="post" style={{ marginTop: 16 }}>
            <button className="btn btn-ghost btn-sm" type="submit"><LogOut width={16} height={16} /> Sair da conta</button>
          </form>
        </section>
      </div>
    </main>
  );
}
