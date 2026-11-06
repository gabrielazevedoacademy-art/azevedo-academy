import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { noticiasOrdenadas, SITE } from '../../lib/util';

export async function GET(context: APIContext) {
  const noticias = await noticiasOrdenadas();
  return rss({
    title: 'Notícias de IA | Azevedo Academy',
    description: SITE.descricao,
    site: context.site!,
    items: noticias.slice(0, 50).map((n) => ({
      title: n.data.titulo,
      description: n.data.resumo,
      pubDate: n.data.data,
      link: `/noticias/${n.id}`,
      categories: [n.data.categoria, ...n.data.tags],
      author: SITE.autor,
    })),
    customData: '<language>pt-BR</language>',
    trailingSlash: false,
  });
}
