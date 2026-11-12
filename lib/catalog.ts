// Itens exibidos nas seções da página principal.
// Para publicar um curso ou uma ferramenta, adicione um objeto na lista correspondente.

export type CatalogItem = {
  title: string;
  href: string;
  description?: string;
  /** Imagem de capa (caminho em /public ou URL completa). */
  image?: string;
  /** Rótulo curto exibido sobre a capa, por exemplo "Gratuito". */
  badge?: string;
};

export const courses: CatalogItem[] = [];

export const tools: CatalogItem[] = [];

export const site = {
  name: 'Azevedo Academy',
  youtube: 'https://www.youtube.com/@Azevedo.Academy/videos'
};
