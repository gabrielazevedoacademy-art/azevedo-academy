import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

// Áreas privadas não precisam aparecer em buscadores
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/auth/', '/meus-dados', '/meus-cursos', '/perfil', '/configuracoes', '/seguranca', '/verificar', '/nova-senha']
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
}
