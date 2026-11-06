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

## Nova notícia

```md
---
titulo: "Título"
resumo: "Uma ou duas frases."
data: 2026-11-06
categoria: "Lançamento"   # Lançamento | Ferramentas | Mercado | Pesquisa | Dica | Azevedo Academy
capa: "/imagens/noticias/capa.webp"   # opcional
fonte: { nome: "Site", url: "https://..." }   # opcional
destaque: false   # true = aparece grande na Home
rascunho: false   # true = não publica
---
Texto em markdown.
```

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
