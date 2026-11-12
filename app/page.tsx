import CatalogSection from '@/components/CatalogSection';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import { courses, site, tools } from '@/lib/catalog';

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <div id="conteudo">
          <CatalogSection
            id="cursos"
            title="Cursos"
            items={courses}
            ratio="4 / 5"
            empty={
              <>
                Os primeiros cursos chegam em breve. Enquanto isso, assista às aulas gratuitas no{' '}
                <a href={site.youtube} target="_blank" rel="noopener noreferrer">canal do YouTube</a>.
              </>
            }
          />
          <CatalogSection
            id="ferramentas"
            title="Ferramentas"
            items={tools}
            ratio="1 / 1"
            empty="As primeiras ferramentas gratuitas chegam em breve."
          />
          <section id="quem-somos" className="section" aria-labelledby="quem-somos-titulo">
            <div className="container">
              <h2 id="quem-somos-titulo" className="section-title">Quem somos</h2>
              <p className="about-placeholder">Em breve, a história por trás da Azevedo Academy.</p>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
