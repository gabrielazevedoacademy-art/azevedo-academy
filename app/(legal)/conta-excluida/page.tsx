export const metadata = { title: 'Conta excluída | Azevedo Academy', robots: { index: false } };

export default function ContaExcluidaPage() {
  return (
    <>
      <h1>Sua conta foi excluída</h1>
      <p className="legal-date">Seus dados de cadastro foram apagados da Azevedo Academy.</p>
      <p>
        Obrigado por ter passado por aqui. Se mudar de ideia, é só criar uma conta nova quando quiser.
      </p>
      <p className="legal-back">
        <a href="/">Voltar ao site</a>
      </p>
    </>
  );
}
