import type { Metadata } from 'next';

export const metadata: Metadata = { robots: { index: false } };

export default function ContaLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="auth-page">
      <a className="brand auth-brand" href="/" aria-label="Azevedo Academy, voltar ao site">
        <img src="/logo.svg" alt="" width={28} height={29} />
        <span>Azevedo Academy</span>
      </a>
      <div className="auth-card account-card">{children}</div>
    </main>
  );
}
