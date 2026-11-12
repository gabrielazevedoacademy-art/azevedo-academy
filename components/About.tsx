export default function About() {
  return (
    <section id="quem-somos" className="section about" aria-labelledby="quem-somos-titulo">
      <div className="about-inner">
        <div className="about-text">
          <h2 id="quem-somos-titulo" className="section-title about-title">Quem somos</h2>
          <p className="about-lead">
            Meu nome é Gabriel Azevedo. Tenho 26 anos e crio conteúdo para a internet há mais de 10.
          </p>
          <p>
            Comecei aos 13, quando criei meu primeiro canal no YouTube. De lá para cá, não parei de aprender
            sobre esse universo.
          </p>
          <p>
            Hoje, com mais de 24 mil alunos no YouTube, ensino de forma descomplicada como usar inteligência
            artificial para monetizar perfis e gerar renda produzindo conteúdo, além de outras habilidades para
            o seu desenvolvimento pessoal e profissional.
          </p>
          <p>
            Minha proposta é simples: ir direto ao ponto, sem enrolação. O oposto dos gurus tradicionais da
            internet.
          </p>
          <p className="about-welcome">Seja bem-vindo à plataforma e aproveite o conteúdo.</p>
        </div>

        <div className="about-visual">
          <div className="about-panel" aria-hidden="true" />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="about-photo"
            src="/sobre/gabriel-azevedo.webp"
            alt="Gabriel Azevedo, criador da Azevedo Academy, sorrindo e fazendo sinal de positivo"
            width={1066}
            height={1392}
            loading="lazy"
          />
        </div>
      </div>
    </section>
  );
}
