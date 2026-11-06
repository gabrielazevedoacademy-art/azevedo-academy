# Azevedo Academy — site

Site em [Astro](https://astro.build), publicado na Vercel (azevedoacademy.com.br). Push na `main` = produção.

## Onde fica cada coisa

| Conteúdo | Pasta | Endereço |
|---|---|---|
| Notícias de IA | `src/content/noticias/*.md` | `/noticias/<nome-do-arquivo>` |
| Materiais dos tutoriais | `src/content/materiais/*.md` | `/materiais/<nome-do-arquivo>` |
| Página de vendas (intocada) | `public/influencer-com-ia/` | `/influencer-com-ia` |
| Biblioteca de prompts protegida (intocada) | `public/biblioteca-de-prompts/` | `/biblioteca-de-prompts/` |
| Imagens e arquivos para download | `public/arquivos/`, `public/imagens/` | `/arquivos/...`, `/imagens/...` |
| Sobre / Privacidade | `src/pages/sobre.astro`, `src/pages/privacidade.astro` | `/sobre`, `/privacidade` |

## Nova notícia

Fluxo semanal: o Gabriel manda o resumo da semana (do sistema no GPT) no chat; cada notícia vira um arquivo
próprio em `src/content/noticias/`, com texto original, foco no que muda na prática e link para a fonte.
Um push na `main` publica. As páginas ficam guardadas para sempre (arquivo no Git + página no site).

Nome do arquivo = endereço da página: `openai-lanca-gpt-6.md` → `/noticias/openai-lanca-gpt-6`.
Curto, sem data, sem acentos, com a palavra-chave principal.

```md
---
titulo: "Título da notícia (até ~70 caracteres)"
resumo: "Uma ou duas frases, 120–160 caracteres. Vira a descrição no Google."
data: 2026-11-06T09:00:00-03:00
categoria: "Lançamento"   # Lançamento | Ferramentas | Mercado | Pesquisa | Dica | Azevedo Academy
tags: ["OpenAI", "ChatGPT"]
seoTitulo: "Título alternativo para o Google"   # opcional
capa: "/imagens/noticias/openai-gpt-6.webp"      # opcional; sem capa usa a imagem padrão
capaAlt: "Descrição da imagem"                    # obrigatório se tiver capa
fonte: { nome: "Blog da OpenAI", url: "https://..." }
atualizado: 2026-11-07T10:00:00-03:00             # só quando corrigir/atualizar
destaque: false   # true = notícia grande na Home
rascunho: false
---
Texto em markdown, com subtítulos (##) e links internos para outras notícias e materiais.
```

## SEO e anúncios

Já incluso: título/descrição por página, link canônico, Open Graph/Twitter, dados estruturados
(NewsArticle, BreadcrumbList, WebSite, Organization), sitemap, feed RSS (`/noticias/rss.xml`),
páginas de categoria, "Leia também" por relevância, fonte servida pelo próprio site.

Variáveis de ambiente na Vercel (Settings → Environment Variables):

| Variável | Para quê |
|---|---|
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Verificação do Google Search Console |
| `PUBLIC_ADSENSE_CLIENT` | ID do AdSense (`ca-pub-...`) — liga os anúncios automáticos |
| `PUBLIC_ADSENSE_SLOT_ARTIGO` / `_LISTA` / `_MATERIAL` | IDs dos blocos manuais (fim da notícia, listas, materiais) |
| `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY` | Login de usuários |

Depois de ativar o AdSense, criar `public/ads.txt` com a linha que o AdSense indicar.

## Novo material de tutorial

```md
---
titulo: "Nome do vídeo"
resumo: "Do que se trata."
data: 2026-11-06
youtube: "ID_DO_VIDEO"          # trecho depois de v= na URL; gera a capa e o player
ferramentas: ["ChatGPT", "Higgsfield"]
prompts:
  - titulo: "Prompt 1"
    texto: |
      texto do prompt
arquivos:
  - { nome: "Pack de imagens.zip", url: "/arquivos/pack.zip" }
links:
  - { nome: "Higgsfield", url: "https://..." }
---
Passo a passo escrito (opcional).
```

## Comandos

- `npm run dev` — servidor local (mostra rascunhos)
- `npm run build` — gera o site em `dist/`
