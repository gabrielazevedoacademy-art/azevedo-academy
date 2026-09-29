# Azevedo Academy

Site institucional da Azevedo Academy — marca de IA, criação de conteúdo, design,
edição de vídeo, marketing e tecnologia.

Site estático (HTML/CSS puro, sem framework e sem build step), hospedado na Vercel.

## Estrutura de pastas

```
.
├── index.html                     # Página inicial
├── robots.txt                     # Regras de indexação para buscadores
├── vercel.json                    # Configuração de deploy e headers de segurança
├── assets/
│   └── css/
│       ├── tokens.css             # Variáveis de marca (cores, fontes, espaçamento)
│       └── global.css             # Reset + estilos compartilhados
└── biblioteca-de-prompts/
    └── index.html                 # Página de vendas (não indexada, só por link direto)
```

Cada página de vendas vive em sua própria pasta na raiz do projeto, com um
`index.html` próprio. Isso mantém URLs limpas (`/biblioteca-de-prompts/`) sem
precisar de nenhum framework de rotas.

## Tokens de marca

Definidos em `assets/css/tokens.css` como variáveis CSS (`:root`):

- **Cores**: `--color-black`, `--color-white`, `--color-orange` (acento
  principal) e `--color-green` (acento secundário — usar com moderação).
- **Fontes**: `--font-display` (League Spartan, para títulos e impacto) e
  `--font-body` (Montserrat, para texto corrido).
- **Escalas**: tipografia (`--text-*`) e espaçamento (`--space-*`).

Toda página nova deve carregar `tokens.css` antes de `global.css`, e carregar
as fontes via Google Fonts (ver `<head>` do `index.html` como referência).

## Como adicionar uma nova página de vendas

1. Crie uma pasta nova na raiz do projeto com um nome curto e descritivo em
   kebab-case (ex.: `curso-de-edicao/`).
2. Dentro dela, crie um `index.html`. Copie a estrutura de
   `biblioteca-de-prompts/index.html` como ponto de partida (head, fontes,
   tokens).
3. Garanta que o `<head>` contenha:
   ```html
   <meta name="robots" content="noindex, nofollow" />
   ```
   Páginas de vendas **não devem ser indexadas** por buscadores — o acesso é
   sempre por link direto (campanha, bio, e-mail, etc).
4. **Não adicione nenhum link** para essa página a partir do site principal
   (`index.html` ou outras páginas públicas). A página só deve ser alcançável
   por quem recebe o link diretamente.
5. **Não liste o caminho da pasta em `robots.txt`.** A proteção contra
   indexação é feita só pela meta tag `noindex`; listar o caminho no
   `robots.txt` (mesmo como `Disallow`) tornaria o caminho público, já que
   `robots.txt` é um arquivo aberto que qualquer um pode ler.

## Como rodar localmente

Não há build step. Basta servir os arquivos estáticos. Exemplos:

```bash
# Com Python
python3 -m http.server 8000

# Com Node (npx)
npx serve .

# Com a CLI da Vercel (recomendado, replica o ambiente de produção)
vercel dev
```

Depois acesse `http://localhost:8000` (ou a porta indicada pela ferramenta escolhida).

## Higgsfield Studio privado

A rota `/higgsfield-studio/` é uma ferramenta privada, deliberadamente ausente
da navegação pública. Ela usa funções serverless em `/api/higgsfield/*`; por
isso, deve ser executada com `vercel dev` (um servidor apenas estático não
executa a integração).

Configure no ambiente da Vercel, sem prefixo público:

- `HF_CREDENTIALS`: a única **Higgsfield API Key** completa fornecida pelo
  painel (`key-id:key-secret`), usada somente no servidor pelo SDK oficial;
- `HIGGSFIELD_STUDIO_PASSWORD`: senha de acesso à ferramenta;
- `HIGGSFIELD_STUDIO_SESSION_SECRET`: segredo longo e aleatório para assinar
  cookies e referências de jobs;
- `HIGGSFIELD_STUDIO_ORIGIN`: origem exata do site (recomendado em produção).

O histórico recente (até 20 itens, sem credenciais) fica somente no
`localStorage` do navegador autenticado. Essa escolha evita acrescentar banco
de dados ao site estático; limpar os dados do navegador remove o histórico.

A geração disponível é **Seedance 2.5 — texto para vídeo**
(`bytedance/seedance-2.5/text-to-video`). O backend usa `subscribe` do pacote
oficial `@higgsfield/client`, que acompanha a solicitação até a resposta final.
Soul Standard e DoP Standard foram removidos porque seus contratos não puderam
ser reconfirmados na documentação oficial durante esta atualização.

## Deploy

O deploy é automático via Vercel:

- Cada push para a branch principal (`main`) gera um deploy de produção.
- Cada push para outras branches ou Pull Request gera um deploy de preview
  com uma URL própria, sem afetar produção.
- Configurações de headers de segurança e roteamento ficam em `vercel.json`.

Como os arquivos HTML públicos já vivem na raiz, `vercel.json` declara
`outputDirectory: "."`. O comando de build apenas valida os arquivos estáticos;
ele não gera uma pasta `public`. No painel da Vercel, o preset deve permanecer
em **Other** e a configuração de Output Directory não deve forçar `public`
(a configuração versionada aponta explicitamente para a raiz).

Não há compilação ou geração de bundles: o comando de build valida o projeto e
a Vercel serve os arquivos estáticos diretamente da raiz.
