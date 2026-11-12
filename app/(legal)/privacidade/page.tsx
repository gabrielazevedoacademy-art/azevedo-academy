import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Política de Privacidade | Azevedo Academy' };

const CONTATO = 'gabriel.azevedo.academy@gmail.com';

export default function PrivacidadePage() {
  return (
    <>
      <h1>Política de Privacidade</h1>
      <p className="legal-date">Última atualização: 12 de novembro de 2026</p>

      <p>
        Esta política explica quais dados a Azevedo Academy (azevedoacademy.com.br) coleta, por que coleta e o que você
        pode fazer com eles, de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018).
      </p>

      <h2>Quais dados coletamos</h2>
      <ul>
        <li><strong>Dados da conta:</strong> nome, e-mail e senha (guardada de forma criptografada, nunca em texto).</li>
        <li>
          <strong>Login com Google:</strong> se você entrar com o Google, recebemos apenas seu nome, e-mail e foto de
          perfil. Não temos acesso à sua senha do Google, aos seus e-mails, arquivos ou contatos.
        </li>
        <li><strong>Uso da plataforma:</strong> cursos que você acessa e informações técnicas básicas, como data de acesso.</li>
      </ul>

      <h2>Para que usamos</h2>
      <ul>
        <li>Criar e manter sua conta e permitir que você entre na plataforma.</li>
        <li>Liberar os cursos e materiais aos quais você tem acesso.</li>
        <li>Enviar e-mails necessários, como confirmação de cadastro e recuperação de senha.</li>
        <li>Manter a segurança da plataforma e evitar contas falsas.</li>
      </ul>
      <p>Não vendemos nem alugamos seus dados para ninguém.</p>

      <h2>Com quem compartilhamos</h2>
      <p>Usamos serviços de terceiros que processam dados apenas para fazer a plataforma funcionar:</p>
      <ul>
        <li><strong>Supabase:</strong> banco de dados e sistema de login.</li>
        <li><strong>Vercel:</strong> hospedagem do site.</li>
        <li><strong>Brevo:</strong> envio dos e-mails da plataforma.</li>
        <li><strong>Google:</strong> login com Google, quando você escolhe essa opção.</li>
        <li><strong>YouTube:</strong> exibição dos vídeos das aulas.</li>
      </ul>
      <p>
        Quando houver venda de cursos, os pagamentos serão processados por plataformas de pagamento parceiras. A Azevedo
        Academy não armazena dados de cartão.
      </p>

      <h2>Cookies</h2>
      <p>
        Usamos cookies essenciais para manter você conectado. Eles não são usados para publicidade.
      </p>

      <h2>Por quanto tempo guardamos</h2>
      <p>
        Mantemos seus dados enquanto sua conta existir. Se você pedir a exclusão da conta, apagamos seus dados, exceto o
        que a lei exigir que seja mantido.
      </p>

      <h2>Seus direitos</h2>
      <p>
        Você pode pedir a qualquer momento para acessar, corrigir, exportar ou excluir seus dados, ou retirar o
        consentimento. Seu nome pode ser alterado direto em Meu perfil. Para os demais pedidos, escreva para{' '}
        <a href={`mailto:${CONTATO}`}>{CONTATO}</a>.
      </p>

      <h2>Mudanças nesta política</h2>
      <p>
        Se esta política mudar, atualizamos a data no topo da página. Mudanças importantes também serão avisadas por
        e-mail.
      </p>

      <p className="legal-back">
        <a href="/">Voltar ao site</a> <span aria-hidden="true">/</span> <a href="/termos">Termos de Uso</a>
      </p>
    </>
  );
}
