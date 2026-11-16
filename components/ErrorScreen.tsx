// Tela de aviso usada na página 404 e quando algo falha no servidor
export default function ErrorScreen({
  code,
  title,
  text,
  children
}: {
  code?: string;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <main className="auth-page error-page">
      <a className="brand auth-brand" href="/" aria-label="Azevedo Academy, voltar ao site">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" width={28} height={29} />
        <span>Azevedo Academy</span>
      </a>
      <div className="error-card">
        {code && (
          <p className="error-code" aria-hidden="true">
            {code}
          </p>
        )}
        <h1>{title}</h1>
        <p className="error-text">{text}</p>
        <div className="error-actions">{children}</div>
      </div>
    </main>
  );
}
