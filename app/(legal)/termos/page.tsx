import type { Metadata } from 'next';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = { title: 'Termos de Uso | Azevedo Academy' };

export default function TermosPage() {
  const mail = <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>;
  return (
    <>
      <h1>Termos de Uso</h1>
      <p className="legal-date">Última atualização: {LEGAL.updated}</p>

      <p>
        Estes termos regulam o uso da Azevedo Academy ({LEGAL.site}), plataforma de cursos e ferramentas sobre
        inteligência artificial mantida por <strong>{LEGAL.controller}</strong>. Ao criar uma conta ou usar a
        plataforma, você declara que leu e concorda com estes termos e com a{' '}
        <a href="/privacidade">Política de Privacidade</a>. Se não concordar, não use a plataforma.
      </p>

      <h2>1. Quem pode usar</h2>
      <p>
        A plataforma é destinada a maiores de 18 anos. Adolescentes podem usá-la com autorização e acompanhamento dos
        pais ou responsáveis, que respondem pelo uso.
      </p>

      <h2>2. Sua conta</h2>
      <ul>
        <li>Use um e-mail verdadeiro, que só você acessa. E-mails temporários não são aceitos.</li>
        <li>A conta é pessoal e intransferível: não compartilhe seu login nem sua senha.</li>
        <li>Você é responsável pelo que for feito com a sua conta. Se perceber um acesso estranho, troque a senha e avise pelo e-mail de contato.</li>
        <li>Você pode excluir sua conta quando quiser, em Configurações.</li>
      </ul>

      <h2>3. Cursos e conteúdos</h2>
      <ul>
        <li>
          Os conteúdos gratuitos podem ser acessados por quem tiver conta e podem ser alterados ou retirados a qualquer
          momento.
        </li>
        <li>
          Nos cursos pagos, o preço, o prazo de acesso e o que está incluído são os informados na página de venda de
          cada curso no momento da compra.
        </li>
        <li>
          Compras feitas pela internet podem ser canceladas em até 7 dias a partir da compra ou do acesso ao curso, com
          devolução integral do valor, conforme o art. 49 do Código de Defesa do Consumidor. Prazos maiores de garantia,
          quando oferecidos, aparecem na página de venda.
        </li>
        <li>
          Podemos atualizar aulas e materiais para manter o conteúdo correto, sem reduzir o que foi prometido na
          compra.
        </li>
      </ul>

      <h2>4. Propriedade intelectual</h2>
      <p>
        Aulas, vídeos, textos, materiais, prompts, marca e identidade visual da Azevedo Academy são protegidos pela Lei
        de Direitos Autorais (Lei 9.610/1998). Você recebe uma licença pessoal e não exclusiva para estudar o conteúdo.
        Não é permitido copiar, gravar, revender, redistribuir, publicar ou compartilhar o acesso aos conteúdos sem
        autorização por escrito.
      </p>

      <h2>5. Uso adequado</h2>
      <p>Não é permitido:</p>
      <ul>
        <li>Usar a plataforma para atividades ilegais ou que violem direitos de outras pessoas.</li>
        <li>Tentar acessar áreas, contas ou dados sem permissão, ou testar falhas de segurança sem autorização.</li>
        <li>Criar contas falsas, automatizar cadastros ou sobrecarregar o site de propósito.</li>
      </ul>
      <p>
        Em caso de descumprimento, a conta pode ser suspensa ou encerrada, e os fatos podem ser comunicados às
        autoridades.
      </p>

      <h2>6. Limites de responsabilidade</h2>
      <p>
        Os conteúdos têm finalidade educativa. Ferramentas de inteligência artificial mudam com frequência e os
        resultados que você obtiver dependem do seu uso, então não garantimos resultados específicos. Trabalhamos para
        manter a plataforma disponível e segura, mas podem ocorrer interrupções para manutenção ou por falhas de
        serviços de terceiros. Nada nestes termos limita os direitos garantidos pelo Código de Defesa do Consumidor.
      </p>

      <h2>7. Privacidade</h2>
      <p>
        O tratamento dos seus dados pessoais segue a <a href="/privacidade">Política de Privacidade</a> e a LGPD.
      </p>

      <h2>8. Mudanças nestes termos</h2>
      <p>
        Estes termos podem ser atualizados. A data no topo indica a versão em vigor, e mudanças importantes serão
        avisadas por e-mail ou no site antes de valerem.
      </p>

      <h2>9. Lei aplicável e foro</h2>
      <p>
        Estes termos seguem as leis brasileiras. Fica eleito o foro da cidade de {LEGAL.forum} para resolver eventuais
        conflitos, sem prejuízo do seu direito, como consumidor, de propor ação no foro do seu domicílio.
      </p>

      <h2>10. Contato</h2>
      <p>Dúvidas, pedidos ou reclamações: {mail}.</p>

      <p className="legal-back">
        <a href="/">Voltar ao site</a> <span aria-hidden="true">/</span> <a href="/privacidade">Política de Privacidade</a>
      </p>
    </>
  );
}
