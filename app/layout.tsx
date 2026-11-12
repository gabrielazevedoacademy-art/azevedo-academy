import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/league-spartan';
import '@fontsource-variable/montserrat';
import './globals.css';
import SmoothWheel from '@/components/SmoothWheel';

export const metadata: Metadata = {
  metadataBase: new URL('https://www.azevedoacademy.com.br'),
  title: 'Azevedo Academy | Aprenda a usar IA sem complicação',
  description: 'Cursos e ferramentas gratuitas para você aprender a usar inteligência artificial no dia a dia, sem complicação.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' }
    ],
    apple: '/apple-touch-icon.png'
  },
  openGraph: {
    title: 'Azevedo Academy',
    description: 'Aprenda a usar IA sem complicação.',
    url: 'https://www.azevedoacademy.com.br',
    siteName: 'Azevedo Academy',
    locale: 'pt_BR',
    type: 'website'
  }
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <a className="skip-link" href="#conteudo">Pular para o conteúdo</a>
        {children}
        <SmoothWheel />
      </body>
    </html>
  );
}
