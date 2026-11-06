# Azevedo Academy — site

Site em [Astro](https://astro.build), publicado na Vercel (azevedoacademy.com.br). Push na `main` = produção.

## Onde fica cada coisa

| Conteúdo | Pasta | Endereço |
|---|---|---|
| Materiais dos tutoriais | `src/content/materiais/*.md` | `/materiais/<nome-do-arquivo>` |
| Página de vendas (intocada) | `public/influencer-com-ia/` | `/influencer-com-ia` |
| Biblioteca de prompts protegida (intocada) | `public/biblioteca-de-prompts/` | `/biblioteca-de-prompts/` |
| Imagens e arquivos para download | `public/arquivos/`, `public/imagens/` | `/arquivos/...`, `/imagens/...` |
| Sobre / Privacidade | `src/pages/sobre.astro`, `src/pages/privacidade.astro` | `/sobre`, `/privacidade` |

## SEO e anúncios

Já incluso: título/descrição por página, link canônico, Open Graph/Twitter, dados estruturados
(WebSite, Organization), sitemap e fonte servida pelo próprio site.

Variáveis de ambiente na Vercel (Settings → Environment Variables):

| Variável | Para quê |
|---|---|
| `PUBLIC_GOOGLE_SITE_VERIFICATION` | Verificação do Google Search Console |
| `PUBLIC_ADSENSE_CLIENT` | ID do AdSense (`ca-pub-...`) — liga os anúncios automáticos |
| `PUBLIC_ADSENSE_SLOT_ARTIGO` / `_LISTA` / `_MATERIAL` | IDs dos blocos manuais (listas e materiais) |
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
