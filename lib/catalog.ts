// Itens exibidos nas seções da página principal.
// Para publicar um curso ou uma ferramenta, adicione um objeto na lista correspondente.

export type CatalogItem = {
  title: string;
  /** Destino do card. Sem link, o card aparece sem levar a lugar nenhum. */
  href?: string;
  description?: string;
  /** Imagem de capa (caminho em /public ou URL completa). */
  image?: string;
  /** Rótulo curto exibido sobre a capa, por exemplo "Gratuito". */
  badge?: string;
  /** Esconde título e descrição abaixo da capa (quando a imagem já traz o nome). */
  hideCaption?: boolean;
};

export const courses: CatalogItem[] = [
  {
    title: 'Aulas no YouTube',
    image: '/cursos/aulas-youtube.webp',
    hideCaption: true
    // href: definir quando a página das aulas estiver pronta
  }
];

export const tools: CatalogItem[] = [];

export const site = {
  name: 'Azevedo Academy',
  youtube: 'https://www.youtube.com/@Azevedo.Academy/videos'
};
