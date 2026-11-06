import { getCollection } from 'astro:content';

export const SITE = {
  nome: 'Azevedo Academy',
  descricao: 'Prompts, arquivos e links de cada tutorial de inteligência artificial do canal Azevedo Academy no YouTube.',
  youtube: 'https://www.youtube.com/@Azevedo.Academy/videos',
  autor: 'Gabriel Azevedo',
  logo: '/apple-touch-icon.png',
  email: '' as string, // e-mail público de contato (preencher)
};

export const ADSENSE = import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined; // ex.: ca-pub-1234567890123456

export function slug(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function formatarData(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export function dataCurta(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(d).replace('.', '');
}

// Rascunhos aparecem só no ambiente local (npm run dev)
const visivel = (e: { data: { rascunho: boolean } }) => import.meta.env.DEV || !e.data.rascunho;

export async function materiaisOrdenados() {
  return (await getCollection('materiais', visivel)).sort((a, b) => b.data.data.valueOf() - a.data.data.valueOf());
}

export function thumbYoutube(id?: string) {
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}
