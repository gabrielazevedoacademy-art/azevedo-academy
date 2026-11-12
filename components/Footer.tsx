import { site } from '@/lib/catalog';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <a className="brand" href="#inicio">
              <img src="/logo.svg" alt="" width={28} height={29} />
              <span>Azevedo Academy</span>
            </a>
            <p>Inteligência artificial explicada de um jeito simples, para você usar no dia a dia.</p>
          </div>
          <div className="footer-links">
            <div>
              <h2>Plataforma</h2>
              <ul>
                <li><a href="#cursos">Cursos</a></li>
                <li><a href="#ferramentas">Ferramentas</a></li>
                <li><a href="#quem-somos">Quem somos</a></li>
              </ul>
            </div>
            <div>
              <h2>Conteúdo</h2>
              <ul>
                <li><a href={site.youtube} target="_blank" rel="noopener noreferrer">YouTube</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {year} Azevedo Academy. Todos os direitos reservados.</p>
          <p className="footer-legal">
            <a href="/privacidade">Privacidade</a>
            <a href="/termos">Termos de Uso</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
