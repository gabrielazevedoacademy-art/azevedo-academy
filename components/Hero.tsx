import DotField from './DotField';
import HeroTitle from './HeroTitle';

const lines = [
  { text: 'O futuro já chegou.', className: 'hero-line-1', tone: 'ink' as const },
  { text: 'Aprenda a usar IA sem complicação.', className: 'hero-line-2', tone: 'gray' as const }
];

export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <DotField />
      <div className="hero-content">
        <HeroTitle lines={lines} />
        <div className="hero-cta">
          <a className="button button-dark" href="#cursos">Começar agora</a>
        </div>
      </div>
    </section>
  );
}
