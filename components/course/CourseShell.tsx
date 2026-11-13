// Moldura das telas do aluno: barra do topo, caminho (curso › módulo › aula) e aviso de rascunho

export type Crumb = { label: string; href?: string };

export const CheckIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);

export const LockIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

export default function CourseShell({
  crumbs,
  draft,
  children
}: {
  crumbs: Crumb[];
  draft?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="course-page">
      <header className="course-top">
        <a className="brand" href="/" aria-label="Azevedo Academy, voltar ao site">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" width={28} height={29} />
          <span>Azevedo Academy</span>
        </a>
        <nav className="course-crumbs" aria-label="Você está em">
          {crumbs.map((c, i) => (
            <span key={i}>
              {i > 0 && <span aria-hidden="true">›</span>}
              {c.href ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
            </span>
          ))}
        </nav>
        <a className="course-top-back" href="/#cursos">
          Todos os cursos
        </a>
      </header>
      {draft && (
        <p className="course-draft">Prévia do administrador: este curso ainda está como rascunho e os alunos não o veem.</p>
      )}
      {children}
    </div>
  );
}

export function CourseUnavailable() {
  return (
    <div className="course-page">
      <div className="course-locked course-missing">
        <h1>Este curso ainda não está disponível</h1>
        <p>Ele aparece aqui assim que for publicado.</p>
        <a className="course-nav-btn" href="/#cursos">
          Ver os cursos
        </a>
      </div>
    </div>
  );
}
