import CourseCard from '@/components/CourseCard';
import { getSessionProfile } from '@/lib/auth';
import { getEnrollments } from '@/lib/courses';
import type { Course } from '@/lib/types';

export const metadata = { title: 'Cursos', description: 'Cursos de inteligência artificial aplicada à criação de conteúdo, design, vídeo e marketing.' };

export default async function CursosPage() {
  const { supabase, user } = await getSessionProfile();
  const { data } = await supabase.from('courses').select('*').eq('status', 'published').order('position').order('created_at', { ascending: false });
  const courses = (data ?? []) as Course[];
  const owned = new Set(user ? (await getEnrollments(supabase, user.id)).map((e) => e.course_id) : []);

  const free = courses.filter((c) => c.is_free);
  const paid = courses.filter((c) => !c.is_free);

  return (
    <main className="page">
      <div className="container">
        <span className="eyebrow reveal">Cursos</span>
        <h1 className="page-title reveal" style={{ '--d': 80 } as React.CSSProperties}>Aprenda a criar com IA.</h1>
        <p className="page-lead reveal" style={{ '--d': 160 } as React.CSSProperties}>
          Do primeiro prompt ao projeto publicado. Comece pelos cursos gratuitos ou vá direto ao método completo.
        </p>

        {!courses.length && (
          <div className="empty section">
            <h3>Novos cursos em breve</h3>
            <p>Estamos preparando os primeiros conteúdos. Crie sua conta para ser avisado.</p>
          </div>
        )}

        {paid.length > 0 && (
          <section className="section">
            <div className="section-head"><h2>Cursos completos</h2></div>
            <div className="course-grid">
              {paid.map((c, i) => <CourseCard key={c.id} course={c} index={i} owned={owned.has(c.id)} />)}
            </div>
          </section>
        )}

        {free.length > 0 && (
          <section className="section">
            <div className="section-head"><h2>Gratuitos</h2></div>
            <div className="course-grid">
              {free.map((c, i) => <CourseCard key={c.id} course={c} index={i} owned={owned.has(c.id)} />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
