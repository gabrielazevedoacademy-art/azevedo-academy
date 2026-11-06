import { getCollection } from 'astro:content';

export const SITE = {
  nome: 'Azevedo Academy',
  descricao: 'Notícias de inteligência artificial e os materiais dos tutoriais do canal Azevedo Academy.',
  youtube: 'https://www.youtube.com/@Azevedo.Academy/videos',
};

export function formatarData(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(d);
}

export function dataCurta(d: Date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(d).replace('.', '');
}

// Rascunhos aparecem só no ambiente local (npm run dev)
const visivel = (e: { data: { rascunho: boolean } }) => import.meta.env.DEV || !e.data.rascunho;

export async function noticiasOrdenadas() {
  return (await getCollection('noticias', visivel)).sort((a, b) => b.data.data.valueOf() - a.data.data.valueOf());
}

export async function materiaisOrdenados() {
  return (await getCollection('materiais', visivel)).sort((a, b) => b.data.data.valueOf() - a.data.data.valueOf());
}

export function thumbYoutube(id?: string) {
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : undefined;
}
