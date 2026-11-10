import Link from 'next/link';
import SiteHeader from '@/components/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="auth">
        <div style={{ textAlign: 'center' }} className="reveal">
          <span className="eyebrow">Erro 404</span>
          <h1 className="page-title">Página não encontrada.</h1>
          <p className="page-lead" style={{ margin: '16px auto 28px' }}>O endereço pode ter mudado ou não existe mais.</p>
          <Link className="btn btn-primary" href="/">Voltar para a Home</Link>
        </div>
      </main>
    </>
  );
}
