import Link from 'next/link';
import { formatPrice } from '@/lib/format';
import type { Course } from '@/lib/types';
import { ArrowRight } from './icons';

export function CourseCover({ course, badge }: { course: Pick<Course, 'title' | 'cover_url'>; badge?: React.ReactNode }) {
  return (
    <div className="course-cover">
      {course.cover_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={course.cover_url} alt="" loading="lazy" />
      ) : (
        <div className="course-cover-fallback" aria-hidden>{course.title}</div>
      )}
      {badge}
    </div>
  );
}

export default function CourseCard({ course, index = 0, progress, owned }: { course: Course; index?: number; progress?: number; owned?: boolean }) {
  const badge = course.is_free
    ? <span className="badge badge-white">Gratuito</span>
    : owned ? <span className="badge badge-orange">Liberado</span> : null;

  return (
    <Link href={`/cursos/${course.slug}`} className="course-card" style={{ '--i': index } as React.CSSProperties}>
      <CourseCover course={course} badge={badge} />
      <div className="course-body">
        <h3>{course.title}</h3>
        {course.subtitle && <p>{course.subtitle}</p>}
        {typeof progress === 'number' && (
          <div style={{ marginTop: 8 }}>
            <div className="progress" aria-label={`${progress}% concluído`}><span style={{ width: `${progress}%` }} /></div>
            <p style={{ fontSize: 12, marginTop: 6 }}>{progress}% concluído</p>
          </div>
        )}
        <div className="course-meta">
          <span className="price">{course.is_free ? 'Grátis' : owned ? 'Continuar' : formatPrice(course.price_cents)}</span>
          <ArrowRight width={18} height={18} />
        </div>
      </div>
    </Link>
  );
}
