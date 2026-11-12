import type { Metadata } from 'next';
import { LEGAL } from '@/lib/legal';

export const metadata: Metadata = { title: 'Política de Privacidade | Azevedo Academy' };

export default function PrivacidadePage() {
  const mail = <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>;
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p className="legal-date">Última atualização: {LEGAL.updated}</p>

      <p>
        Esta política explica, de forma direta, quais dados pessoais a Azevedo Academy ({LEGAL.site}) trata, por que
        trata, com quem compartilha, como protege e quais são os seus direitos, conforme a Lei Geral de Proteção de
        Dados Pessoais (LGPD, Lei 13.709/2018).
      </p>

      <h2>1. Quem é o responsável pelos seus dados</h2>
      <p>
        O controlador dos dados é <strong>{LEGAL.controller}</strong>, pessoa física responsável pela Azevedo Academy.
        O encarregado pelo tratamento de dados pessoais (canal de comunicação com você e com a Autoridade Nacional de
        Proteção de Dados) pode ser contatado pelo e-mail {mail}.
      </p>

      <h2>2. Quais dados coletamos</h2>
      <ul>
        <li>
          <strong>Dados de cadastro:</strong> nome, e-mail e senha. A senha é guardada apenas em forma criptografada
          (hash), e ninguém, nem o administrador, consegue vê-la.
        </li>
        <li>
          <strong>Login com Google:</strong> se você escolher entrar com o Google, recebemos somente nome, e-mail e foto
          de perfil. Não temos acesso à sua senha do Google, aos seus e-mails, arquivos ou contatos.
        </li>
        <li>
          <strong>Dados de uso:</strong> data de criação da conta, data do último acesso, forma de entrar (e-mail ou
          Google) e os cursos aos quais você tem acesso.
        </li>
        <li>
          <strong>Dados técnicos:</strong> endereço IP, tipo de navegador e registros de acesso gerados
          automaticamente pelos nossos fornecedores de infraestrutura, usados para segurança e para o funcionamento do
          site.
        </li>
      </ul>
      <p>Não coletamos dados sensíveis (como origem racial, saúde, religião ou biometria) nem dados de cartão.</p>

      <h2>3. Para que usamos e com qual base legal</h2>
      <ul>
        <li>
          <strong>Criar e manter sua conta, liberar cursos e materiais e enviar e-mails necessários</strong> (confirmação
          de cadastro, nova senha, avisos sobre a conta): execução de contrato, art. 7º, V.
        </li>
        <li>
          <strong>Proteger a plataforma</strong>, impedir contas falsas e e-mails temporários, investigar acessos
          indevidos e manter registros de segurança: legítimo interesse, art. 7º, IX, e cumprimento de obrigação legal,
          art. 7º, II.
        </li>
        <li>
          <strong>Entender quantas pessoas usam a plataforma</strong> (números agregados, como total de cadastros por
          dia): legítimo interesse, art. 7º, IX.
        </li>
        <li>
          <strong>Enviar novidades e conteúdos por e-mail</strong>, se um dia isso existir: somente com o seu
          consentimento, art. 7º, I, que poderá ser retirado a qualquer momento.
        </li>
      </ul>
      <p>Não vendemos, alugamos nem cedemos seus dados para fins de publicidade de terceiros.</p>

      <h2>4. Quem tem acesso aos seus dados</h2>
      <p>
        Dentro da Azevedo Academy, apenas o administrador da plataforma acessa nome, e-mail, datas de cadastro e de
        acesso, para dar suporte (por exemplo, enviar um link de nova senha quando você pedir). As ações do
        administrador sobre contas de alunos ficam registradas.
      </p>
      <p>Também usamos fornecedores (operadores) que tratam dados em nosso nome, só para fazer a plataforma funcionar:</p>
      <ul>
        <li>
          <strong>Supabase:</strong> banco de dados e sistema de login. Os dados de conta ficam armazenados em
          servidores em São Paulo, Brasil.
        </li>
        <li><strong>Vercel:</strong> hospedagem e entrega do site.</li>
        <li><strong>Brevo:</strong> envio dos e-mails da plataforma.</li>
        <li><strong>Google:</strong> login com Google, quando você escolhe essa opção.</li>
        <li><strong>YouTube:</strong> exibição dos vídeos das aulas.</li>
        <li>
          <strong>Plataformas de pagamento</strong>, quando houver venda de cursos: processam o pagamento diretamente,
          sem que a Azevedo Academy tenha acesso aos dados do seu cartão.
        </li>
      </ul>
      <p>
        Podemos ainda compartilhar dados quando a lei exigir ou por ordem de autoridade competente.
      </p>

      <h2>5. Transferência internacional</h2>
      <p>
        Alguns desses fornecedores (como Vercel, Brevo e Google) podem processar dados fora do Brasil. Nesses casos, a
        transferência acontece para a execução do serviço que você contratou e com fornecedores que adotam cláusulas
        contratuais e medidas de segurança compatíveis com a LGPD (art. 33).
      </p>

      <h2>6. Como protegemos seus dados</h2>
      <ul>
        <li>Conexão sempre criptografada (HTTPS) entre o seu navegador e o site.</li>
        <li>Senhas guardadas apenas com criptografia irreversível (hash), com regras mínimas de segurança.</li>
        <li>Confirmação de e-mail obrigatória e bloqueio de e-mails temporários no cadastro.</li>
        <li>
          Regras de acesso no próprio banco de dados: cada aluno só acessa os próprios dados, e as informações de
          contas só aparecem para o administrador.
        </li>
        <li>Painel administrativo restrito, com registro das ações realizadas sobre contas de alunos.</li>
        <li>Fornecedores reconhecidos de mercado, com proteções próprias contra ataques.</li>
      </ul>
      <p>
        Nenhum sistema é totalmente imune a falhas. Se acontecer um incidente de segurança que possa causar risco ou
        dano relevante a você, avisaremos você e a Autoridade Nacional de Proteção de Dados (ANPD), como determina o
        art. 48 da LGPD.
      </p>

      <h2>7. Cookies</h2>
      <p>
        Usamos apenas cookies essenciais, que mantêm você conectado à sua conta com segurança. Não usamos cookies de
        publicidade nem de rastreamento. Os vídeos do YouTube são exibidos no modo de privacidade aprimorada do
        próprio YouTube.
      </p>

      <h2>8. Por quanto tempo guardamos</h2>
      <ul>
        <li>Dados de conta: enquanto a conta existir.</li>
        <li>
          Ao excluir a conta, os dados de cadastro e de acesso a cursos são apagados na hora. Podemos manter por mais
          tempo apenas o que a lei exigir (por exemplo, registros de compras para fins fiscais e de defesa do
          consumidor) ou o necessário para exercer direitos em processos.
        </li>
        <li>Registros técnicos de segurança: pelo prazo necessário à segurança e aos prazos legais aplicáveis.</li>
      </ul>

      <h2>9. Seus direitos</h2>
      <p>Pelo art. 18 da LGPD, você pode, a qualquer momento e de graça:</p>
      <ul>
        <li>Confirmar se tratamos seus dados e acessá-los.</li>
        <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
        <li>Pedir anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei.</li>
        <li>Receber seus dados em formato portável.</li>
        <li>Pedir a eliminação dos dados tratados com base no consentimento e retirar o consentimento.</li>
        <li>Saber com quem compartilhamos seus dados.</li>
        <li>Saber que pode não consentir, e quais as consequências disso.</li>
        <li>Pedir revisão de decisões tomadas apenas de forma automatizada (hoje não tomamos decisões assim).</li>
      </ul>
      <p>Como exercer:</p>
      <ul>
        <li>
          <strong>Baixar uma cópia dos seus dados</strong> e <strong>excluir sua conta</strong>: em{' '}
          <a href="/configuracoes">Configurações</a>, depois de entrar.
        </li>
        <li>
          <strong>Corrigir seu nome</strong>: em <a href="/perfil">Meu perfil</a>.
        </li>
        <li>
          <strong>Qualquer outro pedido</strong>: escreva para {mail}. Respondemos em até 15 dias. Podemos pedir
          informações para confirmar que o pedido é seu.
        </li>
      </ul>
      <p>
        Se achar que seus direitos não foram respeitados, você também pode reclamar na Autoridade Nacional de Proteção
        de Dados (ANPD), em gov.br/anpd.
      </p>

      <h2>10. Crianças e adolescentes</h2>
      <p>
        A Azevedo Academy é destinada a maiores de 18 anos. Adolescentes podem usar a plataforma com autorização e
        acompanhamento dos pais ou responsáveis. Não coletamos de forma intencional dados de crianças menores de 12
        anos; se isso acontecer sem o consentimento de um responsável, os dados serão apagados ao tomarmos
        conhecimento.
      </p>

      <h2>11. Mudanças nesta política</h2>
      <p>
        Quando esta política mudar, atualizamos a data no topo. Mudanças importantes serão avisadas por e-mail ou por
        aviso no site antes de valerem.
      </p>

      <p className="legal-back">
        <a href="/">Voltar ao site</a> <span aria-hidden="true">/</span> <a href="/termos">Termos de Uso</a>
      </p>
    </>
  );
}
