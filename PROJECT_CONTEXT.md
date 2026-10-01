# PROJECT_CONTEXT.md — Azevedo Academy

## Projeto

**Nome:** Azevedo Academy  
**Tipo:** site institucional estático  
**Status:** produção e evolução contínua  
**Branch principal:** `main`  
**Deploy:** Vercel, acionado por push na `main`

O site apresenta a Azevedo Academy e direciona visitantes para conteúdos, ferramentas, produtos e contato.

A marca trabalha com inteligência artificial aplicada à criação de conteúdo, design, edição de vídeo, marketing e tecnologia.

## Objetivo atual

Construir uma Home visualmente forte, profissional, responsiva e com sensação premium, funcionando como porta de entrada para o ecossistema da Azevedo Academy.

O proprietário não é desenvolvedor. O agente deve implementar e validar tecnicamente as alterações sem depender dele para revisar código.

## Stack

- HTML
- CSS
- JavaScript
- sem framework na Home
- assets versionados no repositório
- Vercel em produção

Arquivos principais:

```text
index.html
assets/
  css/
    tokens.css
    global.css
    home.css
  images/
  js/
    home.js
biblioteca-de-prompts/
  index.html
scripts/
  build.js
package.json
vercel.json
```

## Validação disponível

`package.json` possui:

- `npm run lint`: valida a sintaxe de `assets/js/home.js`
- `npm run build`: valida a estrutura estática necessária para o deploy

O build não gera bundle. O site é servido diretamente da raiz do repositório.

## Home

A Home atual possui:

- header/nav;
- hero cinematográfico;
- transição narrativa animada entre hero e cards;
- quatro cards de acesso feitos com imagens;
- footer.

Comportamento do header no desktop:
- anima na entrada inicial da página;
- ao sair da região superior durante o scroll, sobe e desaparece suavemente;
- ao voltar ao topo, reaparece com transição equivalente;
- a animação inicial deve terminar antes de o estado de scroll assumir, evitando conflito entre animação e transição.

### Direção visual

- fundo predominantemente escuro;
- preto, branco e laranja como identidade principal;
- verde não é cor de destaque padrão; usar somente quando houver necessidade funcional ou pedido explícito;
- League Spartan em títulos;
- Montserrat no corpo;
- movimento elegante e controlado;
- evitar animação gratuita ou excesso de elementos;
- respeitar `prefers-reduced-motion`.

### Transição narrativa

A seção entre hero e cards representa um fluxo criativo com IA.

Conceito atual:

**IDEIA → PROMPT → CRIAÇÃO → IMPACTO**

A direção aprovada é:

- fundo escuro e atmosférico;
- caminho mais elaborado ocupando bem a área;
- linha laranja com glow percorrendo o trajeto;
- conexão direta entre o caminho e cada texto;
- o trajeto deve preservar uma área de respiro clara ao redor do título e da copy introdutória, sem atravessar texto;
- textos surgindo em sequência conforme o caminho avança;
- acabamento de motion graphics;
- título atual: **O CAMINHO DA CRIAÇÃO.**

## Cards da Home

Quatro acessos:

1. Biblioteca de Prompts → `/biblioteca-de-prompts`
2. Ferramentas recomendadas → `/ferramentas`
3. Super Pack de Edição & Design → `/produtos#super-pack`
4. Entre em contato → `/contato`

Layout desejado:

- desktop amplo: 4 cards;
- intermediário: 2 × 2;
- mobile: 1 por linha.

Direção atual da seção:
- título: **Explore o ecossistema.**
- linha de apoio curta explicando prompts, ferramentas, recursos e caminhos;
- título e cards entram quando a seção realmente chega à viewport;
- cards usam stagger progressivo, preservando hover e glow individual;
- a Home usa rolagem nativa do navegador; não interceptar nem customizar eventos de `wheel`;
- touch/mobile, desktop, teclado e `prefers-reduced-motion` preservam o comportamento nativo/acessível.

Preservar animação de entrada, hover, glow individual e acessibilidade.

## Área protegida

### `/biblioteca-de-prompts/`

Não modificar sem pedido explícito.

`biblioteca-de-prompts/index.html` é um export grande gerado externamente. Não reformatar, refatorar ou alterar incidentalmente durante tarefas da Home.

## Design system

`assets/css/tokens.css` contém tokens da marca.

`global.css` concentra estilos compartilhados e acessibilidade base.

Mudanças específicas da Home devem preferencialmente ficar em `home.css` e `home.js`.

## Vídeos recentes do YouTube

A Home possui uma seção de vídeos recentes antes do footer.

- Fonte: canal público `@Azevedo.Academy`, ID `UCal4KF4mgJCUrFXu4Qw5aog`.
- A integração usa uma Vercel Function em `/api/youtube` para consultar o feed público do YouTube no servidor; não usa chave de API no frontend.
- Preferência: feed de long-form; fallback para o feed geral do canal caso necessário.
- A Home mostra os 3 vídeos recentes, com thumbnail, título e data, além de link para a aba de vídeos do canal.
- A resposta da função pode ser cacheada por curto período para reduzir latência e dependência direta do YouTube em cada visita.
- Se o feed falhar, a Home deve continuar funcional e manter o link direto para o canal.
- Preservar responsividade, acessibilidade e `prefers-reduced-motion`.

## Deploy

Push na `main` dispara deploy de produção na Vercel.

`vercel.json` deve manter `outputDirectory: "."`.

Não alterar domínio, infraestrutura ou pipeline sem pedido explícito.

## Regras de escopo

- Não alterar áreas não solicitadas.
- Não reescrever a Home inteira para uma mudança localizada.
- Não tocar na Biblioteca durante mudanças da Home.
- Não adicionar dependência pesada para efeitos que CSS/SVG/JS nativo resolvem.
- O código atual é a fonte de verdade técnica.
