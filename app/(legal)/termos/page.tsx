import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Termos de Uso | Azevedo Academy' };

const CONTATO = 'gabriel.azevedo.academy@gmail.com';

export default function TermosPage() {
  return (
    <>
      <h1>Termos de Uso</h1>
      <p className="legal-date">Última atualização: 12 de novembro de 2026</p>

      <p>
        Ao criar uma conta ou usar a Azevedo Academy (azevedoacademy.com.br), você concorda com estes termos. Se não
        concordar, não use a plataforma.
      </p>

      <h2>Sua conta</h2>
      <ul>
        <li>Use um e-mail verdadeiro e mantenha sua senha em segurança.</li>
        <li>A conta é pessoal: não compartilhe seu acesso com outras pessoas.</li>
        <li>Você é responsável pelo que for feito com a sua conta.</li>
      </ul>

      <h2>Cursos e conteúdos</h2>
      <ul>
        <li>
          Os cursos, vídeos, materiais e ferramentas são da Azevedo Academy e protegidos por direitos autorais. Você pode
          usá-los para aprender, mas não pode copiar, revender, redistribuir ou publicar esse conteúdo.
        </li>
        <li>Conteúdos gratuitos podem ser alterados ou retirados a qualquer momento.</li>
        <li>
          Em cursos pagos, o acesso, o prazo e as condições de reembolso são os informados na página de venda de cada
          curso, respeitando o Código de Defesa do Consumidor.
        </li>
      </ul>

      <h2>Uso adequado</h2>
      <p>
        Não é permitido usar a plataforma para atividades ilegais, tentar acessar áreas sem permissão, criar contas
        falsas ou prejudicar o funcionamento do site. Contas que descumprirem estes termos podem ser suspensas.
      </p>

      <h2>Limites de responsabilidade</h2>
      <p>
        Os conteúdos têm fins educativos. Ferramentas de inteligência artificial mudam com frequência, e os resultados
        que você obtiver dependem do seu uso. Trabalhamos para manter a plataforma no ar, mas podem acontecer
        interrupções para manutenção ou por falhas de serviços de terceiros.
      </p>

      <h2>Privacidade</h2>
      <p>
        O uso dos seus dados está descrito na <a href="/privacidade">Política de Privacidade</a>.
      </p>

      <h2>Mudanças e contato</h2>
      <p>
        Estes termos podem ser atualizados; a data no topo indica a versão atual. Dúvidas? Escreva para{' '}
        <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>

      <p className="legal-back">
        <a href="/">Voltar ao site</a> <span aria-hidden="true">/</span> <a href="/privacidade">Política de Privacidade</a>
      </p>
    </>
  );
}
