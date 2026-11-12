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
  /** Ainda não lançado: capa em preto e branco com a faixa "Em breve". */
  comingSoon?: boolean;
};

export const courses: CatalogItem[] = [
  {
    title: 'Influencer com IA',
    href: '/influencer-com-ia',
    image: '/cursos/influencer-com-ia.webp',
    hideCaption: true
  },
  {
    title: 'Aulas no YouTube',
    image: '/cursos/aulas-youtube.webp',
    hideCaption: true
    // href: definir quando a página das aulas estiver pronta
  },
  {
    title: 'Filmes com IA',
    image: '/cursos/filmes-com-ia.webp',
    hideCaption: true,
    comingSoon: true
  },
  {
    title: 'Seja Criador de Conteúdo: YouTube',
    image: '/cursos/seja-criador-de-conteudo-youtube.webp',
    hideCaption: true,
    comingSoon: true
  }
];

export const tools: CatalogItem[] = [
  {
    title: 'Biblioteca de prompts',
    image: '/ferramentas/biblioteca-de-prompts.webp',
    hideCaption: true
    // href: definir quando a página da biblioteca estiver pronta
  }
];

export const site = {
  name: 'Azevedo Academy',
  youtube: 'https://www.youtube.com/@Azevedo.Academy/videos'
};
