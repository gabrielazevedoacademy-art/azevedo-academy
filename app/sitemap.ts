import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site-url';

// Páginas públicas que o Google deve encontrar. Conta, painel e aulas ficam de fora (exigem login).
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/influencer-com-ia`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/cadastro`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${SITE_URL}/privacidade`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${SITE_URL}/termos`, lastModified: now, changeFrequency: 'yearly', priority: 0.2 }
  ];
}
