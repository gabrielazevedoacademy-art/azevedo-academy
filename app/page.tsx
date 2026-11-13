import About from '@/components/About';
import CatalogSection from '@/components/CatalogSection';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ScrollController from '@/components/ScrollController';
import { courses, site, tools } from '@/lib/catalog';
import { orderCourses } from '@/lib/course-order';

// Atualiza a ordem dos cursos a cada minuto (e na hora, quando muda no painel)
export const revalidate = 60;

export default async function Home() {
  const orderedCourses = await orderCourses(courses);
  return (
    <>
      {/* Só existe na página inicial: monta com o hero e desmonta ao sair dela */}
      <ScrollController />
      <Header />
      <main>
        <Hero />
        <div id="conteudo">
          <CatalogSection
            id="cursos"
            title="Cursos"
            items={orderedCourses}
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
            ratio="4 / 5"
            empty="As primeiras ferramentas gratuitas chegam em breve."
          />
          <About />
        </div>
      </main>
      <Footer />
    </>
  );
}
