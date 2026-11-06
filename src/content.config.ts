import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const link = z.object({ nome: z.string(), url: z.string() });

// Notícias sobre o mundo da IA — um arquivo .md por notícia em src/content/noticias/
const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    titulo: z.string(),
    resumo: z.string(),
    data: z.coerce.date(),
    categoria: z.enum(['Lançamento', 'Ferramentas', 'Mercado', 'Pesquisa', 'Dica', 'Azevedo Academy']),
    capa: z.string().optional(),
    fonte: link.optional(),
    destaque: z.boolean().default(false),
    rascunho: z.boolean().default(false),
  }),
});

// Materiais dos tutoriais do YouTube — um arquivo .md por tutorial em src/content/materiais/
const materiais = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/materiais' }),
  schema: z.object({
    titulo: z.string(),
    resumo: z.string(),
    data: z.coerce.date(),
    youtube: z.string().optional(), // ID do vídeo (o trecho depois de v= na URL)
    capa: z.string().optional(),
    ferramentas: z.array(z.string()).default([]),
    prompts: z.array(z.object({ titulo: z.string(), texto: z.string() })).default([]),
    arquivos: z.array(link).default([]),
    links: z.array(link).default([]),
    rascunho: z.boolean().default(false),
  }),
});

export const collections = { noticias, materiais };
