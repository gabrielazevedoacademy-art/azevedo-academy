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
- CTAs principais dos heros usam fundo branco em repouso, texto preto e um círculo laranja na seta que se expande pelo botão; a troca de preto para branco acompanha exatamente a área laranja;
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
- os títulos dos heros da Home e de Ferramentas recebem um glitch digital intermitente logo depois da animação de entrada, com cortes horizontais e pequenos deslocamentos de cópia; as rajadas se repetem em intervalos mais curtos para o efeito ser percebido sem demora;
- hero próprio, com grid e luz ambiente animados, sem círculos ou órbitas decorativas;
- cards compactos por ferramenta, sem numeração, com logo + nome + descrição curta centralizados;
- as categorias ficam em `data-tags` invisíveis nos cards e alimentam filtros visíveis;
- filtros atuais: Todas, Texto e ideias, Criação de conteúdo, Imagem, Vídeo, Narração e Música;
- a mesma ferramenta pode pertencer a várias categorias sem duplicar o card;
- cards não possuem links externos por enquanto; links serão adicionados quando os afiliados forem definidos;
- no desktop, o hover move o card inteiro para cima e aumenta o card de forma perceptível e fluida; o logo não recebe uma animação separada; no mobile o hover de crescimento fica desativado; entrada usa stagger;
- em mobile, filtros viram uma faixa horizontal rolável, o catálogo usa duas colunas de cards por linha e a navegação usa menu lateral off-canvas; os headers da Home e de Ferramentas usam fundo desfocado ao rolar, sem borda inferior; o conteúdo do hero de Ferramentas permanece mais alto para ganhar respiro vertical;
- logos usam fontes públicas externas com fallback visual por iniciais caso a imagem falhe; Claude usa o ícone próprio da marca, não o símbolo corporativo da Anthropic;
- a seção do catálogo usa um fundo quente/escuro distinto do fundo geral e sobrepõe suavemente o final do hero para eliminar qualquer linha de corte entre as duas áreas;
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

## Página de vendas Influencer com IA

A rota `/influencer-com-ia` é a página de vendas do curso Influencer com IA.

- não aparece no menu do site; acesso pelo link direto;
- identidade própria: preto, azul e branco (não usa o laranja da Home nos elementos da página);
- página única com rolagem, sem menu de navegação; header apenas com a marca, usando o logo branco (`assets/images/azevedo-logo-branco.svg`) e o nome todo em branco;
- evitar etiquetas/selos decorativos acima do título (aparência de "página feita por IA");
- tipografia: Instrument Serif (serifada) combinada com League Spartan (títulos sem serifa) e Montserrat (texto);
- hero com a influenciadora à direita (imagem com fundo transparente), degradê preto → azul com manchas de luz animadas de forma fluida e um degradê de divisão na base que faz a transição para a próxima seção;
- CTA segue o padrão dos heros (pílula branca com círculo da seta que se expande), aqui em azul;
- seção "O mesmo rosto em INFINITOS LOOKS": título centralizado (serifada + sans) e carrossel infinito de looks da influenciadora, lento e contínuo, pausando no hover; o JS duplica os itens para cobrir qualquer largura. Para adicionar um look, colocar a imagem em `assets/images/influencer-com-ia/looks/` e copiar um `<li>` em `influencer-com-ia/index.html`. Com movimento reduzido, vira uma faixa rolável;
- seção de galeria "Do clique natural ao ENSAIO PROFISSIONAL" (antes da autoridade): mosaico estilo Pinterest (3 colunas no desktop, 2 no celular), sem carrossel; cada foto se revela de baixo para cima com um flash de câmera ao entrar na tela, tem etiqueta Natural/Profissional e legenda; inclui um bloco de texto "Uma influencer, MIL CENÁRIOS". Fotos em `assets/images/influencer-com-ia/galeria/`;
- seção de autoridade "Muito prazer, eu sou o GABRIEL AZEVEDO": mesma distribuição do hero (texto à esquerda, foto do Gabriel com fundo transparente à direita, entrada animada ao rolar e degradê de divisão cobrindo a base da foto); números de autoridade (+10 anos, +22 mil alunos no YouTube) e lista de formas de monetização;
- seção de prova social "Palavra de quem JÁ APRENDE COMIGO": prints reais dos comentários do YouTube (decisão do proprietário: prints passam mais credibilidade que cartões recriados), recortados sem o espaço vazio e exibidos no tamanho original (menores no celular), em duas faixas infinitas; a de cima anda para a direita (`data-direction="right"`) e a de baixo para a esquerda. Prints ficam em `assets/images/influencer-com-ia/comentarios/`;
- seção de garantia "Risco zero com a GARANTIA DE 7 DIAS": selo dourado à esquerda (único elemento fora da paleta azul, com halo azul atrás e flutuação suave) e texto à direita; no celular o selo fica acima do texto, centralizado;
- seção de oferta (`#oferta`); os CTAs do hero e do cartão de preço levam ao checkout da Kiwify: cartão de preço com luz azul girando pela borda; ao entrar na tela, um risco é desenhado sobre "De R$ 497" e o preço desce contando de 497 até R$ 197 (valores em `data-price-from`/`data-price-to`). Com movimento reduzido ou sem JS, mostra direto o estado final;
- celular (até 600px): marca centralizada no topo, botões em largura total com texto centralizado, números da seção do Gabriel centralizados, formas de monetização como etiquetas centralizadas e textos um pouco maiores; o desktop não é afetado por esses ajustes;
- arquivos: `influencer-com-ia/index.html`, `assets/css/influencer-com-ia.css`, `assets/js/influencer-com-ia.js`, `assets/images/influencer-com-ia/`;
- respeitar `prefers-reduced-motion` e evitar overflow horizontal.

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

## Favicon

- O favicon do site inteiro é o logo laranja original: `favicon.ico`, `favicon.svg` e `apple-touch-icon.png` na raiz.
- Home, Ferramentas e Influencer com IA declaram os ícones no `<head>`; a Biblioteca de Prompts (área protegida) não foi alterada e usa o `/favicon.ico` da raiz, que os navegadores buscam automaticamente.

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
