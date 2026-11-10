import Link from 'next/link';

export default function SiteFooter() {
  return (
    <footer className="app-footer">
      <div className="container">
        <span>© {new Date().getFullYear()} Azevedo Academy · Ideias que movem o futuro.</span>
        <nav aria-label="Rodapé">
          <Link href="/">Home</Link>
          <Link href="/cursos">Cursos</Link>
          <Link href="/materiais">Materiais</Link>
          <Link href="/ferramentas">Ferramentas</Link>
        </nav>
      </div>
    </footer>
  );
}
