import type { Metadata, Viewport } from 'next';
import '@fontsource-variable/league-spartan';
import '@fontsource-variable/montserrat';
import './globals.css';
import { SITE_URL } from '@/lib/site-url';
import AnnouncementGate from '@/components/AnnouncementGate';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
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
    title: 'Azevedo Academy | O futuro já chegou',
    description: 'Aprenda a usar IA sem complicação.',
    url: 'https://www.azevedoacademy.com.br',
    siteName: 'Azevedo Academy',
    locale: 'pt_BR',
    type: 'website',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Azevedo Academy: o futuro já chegou. Aprenda a usar IA sem complicação.' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Azevedo Academy',
    description: 'Aprenda a usar IA sem complicação.',
    images: ['/og.jpg']
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
        <AnnouncementGate />
      </body>
    </html>
  );
}
