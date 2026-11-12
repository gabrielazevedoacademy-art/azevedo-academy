import DotField from './DotField';

function Words({ text, offset = 0 }: { text: string; offset?: number }) {
  const words = text.split(' ');
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span className="word" aria-hidden="true">
            <span className="word-inner" style={{ '--i': offset + i } as React.CSSProperties}>{word}</span>
          </span>
          {i < words.length - 1 ? ' ' : null}
        </span>
      ))}
    </>
  );
}

const line1 = 'O futuro já chegou.';
const line2 = 'Aprenda a usar IA sem complicação.';

export default function Hero() {
  return (
    <section id="inicio" className="hero">
      <DotField />
      <div className="hero-content">
        <h1 className="hero-title" aria-label={`${line1} ${line2}`}>
          <span className="hero-line hero-line-1"><Words text={line1} /></span>{' '}
          <span className="hero-line hero-line-2"><Words text={line2} offset={line1.split(' ').length + 1} /></span>
        </h1>
        <div className="hero-cta">
          <a className="button button-dark" href="#cursos">Começar agora</a>
        </div>
      </div>
    </section>
  );
}
