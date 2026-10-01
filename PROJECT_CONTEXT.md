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
    ferramentas.css
  images/
  js/
    home.js
    ferramentas.js
ferramentas/
  index.html
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

Comportamento mobile/tablet:
- em até 860px, a navegação usa botão hambúrguer e menu lateral off-canvas pela direita;
- o menu possui backdrop, animação escalonada dos links, fechamento por backdrop/Escape/link e bloqueio do scroll do fundo;
- o desktop acima de 860px deve permanecer visual e funcionalmente inalterado durante refinamentos mobile;
- em telas estreitas, a jornada criativa vira uma timeline vertical para evitar sobreposição e overflow horizontal;
- cards passam de 2 colunas no tablet para 1 coluna no celular; vídeos passam para 1 coluna em telas estreitas.

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

## Página de Ferramentas

A rota `/ferramentas` é um catálogo curado de ferramentas de IA.

Direção atual:
- mesma identidade premium da Home: preto, branco e laranja;
- hero próprio, com grid/orbitas/glows animados;
- cards compactos por ferramenta, sem numeração, com logo + nome + descrição curta centralizados;
- as categorias ficam em `data-tags` invisíveis nos cards e alimentam filtros visíveis;
- filtros atuais: Todas, LLMs, Criação de conteúdo, Imagem, Vídeo, Narração e Música;
- a mesma ferramenta pode pertencer a várias categorias sem duplicar o card;
- cards não possuem links externos por enquanto; links serão adicionados quando os afiliados forem definidos;
- hover é simples: o card flutua para cima e cresce levemente, sem contorno; o logo acompanha com crescimento sutil, cursor em formato de mão e sombra discreta; entrada usa stagger;
- em mobile, filtros viram uma faixa horizontal rolável, grid vira uma coluna e a navegação usa menu lateral off-canvas;
- logos usam fontes públicas externas com fallback visual por iniciais caso a imagem falhe; Claude usa o ícone próprio da marca, não o símbolo corporativo da Anthropic;
- a seção do catálogo usa um fundo quente/escuro distinto do fundo geral da página para criar separação visual;
- respeitar `prefers-reduced-motion` e evitar overflow horizontal.

Ferramentas atuais:
- ChatGPT;
- Claude;
- Gemini;
- Magnific;
- Higgsfield;
- HeyGen;
- ElevenLabs;
- Google Flow;
- Musicful;
- Suno;
- Flow Music.

## Área protegida

### `/biblioteca-de-prompts/`

Não modificar sem pedido explícito.

`biblioteca-de-prompts/index.html` é um export grande gerado externamente. Não reformatar, refatorar ou alterar incidentalmente durante tarefas da Home.

## Design system

`assets/css/tokens.css` contém tokens da marca.

`global.css` concentra estilos compartilhados e acessibilidade base.

Mudanças específicas da Home devem preferencialmente ficar em `home.css` e `home.js`.

## Vídeos em destaque do YouTube

A Home possui uma seção fixa de vídeos em destaque antes do footer.

- A seção usa 4 embeds oficiais do YouTube em grade 2 × 2 no desktop e 1 coluna no mobile.
- Os vídeos são escolhidos manualmente para priorizar conteúdos relevantes e de bom desempenho; não há carregamento automático nem dependência de feed/API.
- Os embeds usam o modo com privacidade aprimorada do YouTube (`youtube-nocookie.com`).
- A seção mantém animação de entrada discreta, responsividade e `prefers-reduced-motion`.
- O CTA para o canal fica centralizado abaixo da grade e segue a linguagem visual do CTA do hero.
- Trocar um vídeo exige somente substituir o ID do embed em `index.html`.

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
