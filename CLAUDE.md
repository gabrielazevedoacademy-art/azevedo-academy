# CLAUDE.md

Guia de referência para trabalhar neste repositório. Leia antes de fazer ajustes.

## O que é

Site institucional da **Azevedo Academy** — marca de IA, criação de conteúdo,
design, edição de vídeo, marketing e tecnologia.

Site **estático**, hospedado na **Vercel** com deploy automático a cada push na
branch `main`. Não há passo de build — os arquivos são servidos como estão.

Duas naturezas de página convivem no repo:

1. **Páginas escritas à mão** (ex.: `index.html` raiz) — HTML + CSS puro, **sem
   framework**, usando o design system em `assets/css/`.
2. **Páginas de vendas geradas por construtor** (ex.: `biblioteca-de-prompts/`)
   — exports "bundled" auto-contidos (React via CDN), que **não** usam o design
   system e **não** devem ser editados à mão. Ver seção específica abaixo.

## Estrutura do projeto

```
.
├── index.html                     # Página inicial escrita à mão (placeholder "em construção")
├── robots.txt                     # Allow: / geral (ver nota sobre noindex abaixo)
├── vercel.json                    # Headers de segurança (X-Content-Type-Options, X-Frame-Options, Referrer-Policy)
├── CLAUDE.md                      # Este arquivo
├── README.md                      # Documentação para humanos (estrutura, deploy, como rodar)
├── assets/
│   └── css/
│       ├── tokens.css             # Design tokens (variáveis de marca) — carregar SEMPRE primeiro
│       └── global.css             # Reset + estilos compartilhados — carregar depois de tokens.css
└── biblioteca-de-prompts/
    └── index.html                 # Página de vendas GERADA (export React/Babel, ~4.5 MB) — não editar à mão
```

Cada página de vendas mora em sua própria pasta na raiz, com um `index.html`
próprio → URLs limpas (`/biblioteca-de-prompts/`) sem router.

### Como rodar localmente

Sem build. Servir os arquivos estáticos: `python3 -m http.server 8000`, ou
`npx serve .`, ou `vercel dev` (replica produção). Ver README.md.

## Convenções de marca (páginas escritas à mão)

Valem para páginas HTML autorais como o `index.html`. **Não** se aplicam aos
exports de construtor (que trazem o próprio CSS).

Toda a marca vive em `assets/css/tokens.css` como variáveis CSS em `:root`.
**Nunca hardcode cores, fontes ou espaçamentos** — sempre use o token. Faltou
valor? Adicione um token novo em vez de literal.

### Cores

| Token | Valor | Papel |
|-------|-------|-------|
| `--color-black` | `#0E0E0E` | fundo padrão (`--color-bg`) |
| `--color-white` | `#FAFAFA` | texto padrão (`--color-text`) |
| `--color-orange` | `#FF5A1F` | **acento principal** (`--color-accent`) |
| `--color-green` | `#1FAE64` | **acento secundário — usar com moderação** (`--color-accent-secondary`) |

Prefira os **papéis semânticos** (`--color-bg`, `--color-text`,
`--color-text-muted`, `--color-accent`, `--color-border`, `--color-focus`) aos
nomes crus. Há variações de apoio (`--color-orange-light/dark`, etc.) e escala
de cinzas (`--color-gray-100…900`).

### Tipografia

- `--font-display` → **League Spartan** (títulos, impacto). `global.css` já
  aplica em `h1`–`h6` e botões.
- `--font-body` → **Montserrat** (texto corrido). Aplicada no `body`.
- Escalas `--text-xs`…`--text-4xl`; pesos `--weight-*`; line-heights
  `--leading-*`. Fontes via Google Fonts no `<head>` (com `preconnect`):
  League Spartan `500;700;900` + Montserrat `400;500;600`.

### Espaçamento e outros

Escala `--space-1` (4px)…`--space-16` (128px). Também `--radius-*`,
`--container-max` (1120px), `--transition-fast/base`.

### Regras para página autoral nova

1. `<head>` na ordem: preconnect + Google Fonts → `tokens.css` → `global.css` →
   `<style>` inline específico.
2. Só tokens; reuse os componentes de `global.css` (`.container`,
   `.btn`/`.btn-primary`, `.sr-only`).
3. Acessibilidade vem de `global.css`: foco visível via `:focus-visible`,
   `prefers-reduced-motion` respeitado. Não quebre.
4. **Página de vendas** → `<meta name="robots" content="noindex, nofollow">` no
   `<head>`, **sem link** apontando pra ela a partir do site público, e **sem
   listar o caminho no `robots.txt`** (listar exporia o caminho — a proteção é
   só a meta tag).

## Página `biblioteca-de-prompts/` — referência

> **Natureza:** NÃO é HTML autoral. É um **export "bundled" gerado por um
> construtor** (blocos `<script type="__bundler/*">`, `<title>Bundled Page</title>`,
> um bundle JSON escapado de ~4.6 MB numa única linha). **Não edite à mão** —
> reexporte no construtor de origem e substitua o arquivo inteiro.

**Stack em runtime:** app **React 18.3.1** (`react` + `react-dom` production da
CDN **unpkg**) + **Babel Standalone**, renderizado no cliente. Não usa
`tokens.css` nem `global.css` — traz o próprio estilo e fontes (Google Fonts com
`preconnect`). `<html>` sem `lang`.

**Conversão / lógica:**
- **Checkout Hotmart** — `https://pay.hotmart.com/K106469917K` (CTA principal,
  aparece ~4×, `target="_blank"`). É o mecanismo de venda; **não há `<form>`**.
- **Contato WhatsApp** — `https://wa.me/5554991938200`.
- Um `data:image/svg` inline; demais interações vivem dentro do bundle React.

**⚠️ Pendências a verificar nesta página** (o upload atual divergiu do padrão do
projeto — confirmar com o dono antes de "corrigir"):
1. **Falta `<meta name="robots" content="noindex, nofollow">`.** Sendo página de
   vendas que só deve ser acessada por link direto, hoje ela está **indexável**.
   Reintroduzir o `noindex` (no export ou pós-processando o arquivo).
2. **Dependências externas em runtime** (unpkg: react, react-dom, babel).
   Quebram se a CDN cair e destoam do site estático sem dependências; avaliar
   auto-hospedar ou pré-compilar.
3. Título genérico `Bundled Page` e ausência de `meta description`/`lang` —
   ajustar SEO/acessibilidade básicos se a página for mantida assim.

## Deploy

Push em `main` → deploy de produção automático na Vercel. Push em outra
branch/PR → deploy de preview isolado. Sem comando de build. Headers de
segurança em `vercel.json`.

> Nota operacional: a versão real desta página chega ao repo via upload no
> GitHub ("Add files via upload"), não por edição local. Ao mexer no repo,
> rode `git fetch` antes de commitar para não divergir desses uploads.
