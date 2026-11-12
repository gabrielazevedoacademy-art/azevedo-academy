export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="legal-page">
      <a className="brand legal-brand" href="/" aria-label="Azevedo Academy, voltar ao site">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="" width={28} height={29} />
        <span>Azevedo Academy</span>
      </a>
      <article className="legal">{children}</article>
    </main>
  );
}
