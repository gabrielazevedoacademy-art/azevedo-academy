# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-10-01  
**Branch:** `main` após integração da tarefa atual  
**Estado geral:** Home funcional em produção e nova página de ferramentas pronta para publicação.

## Estado atual

- Home preservada, incluindo desktop e responsividade mobile/tablet já aprovados.
- `/ferramentas` possui hero próprio alinhado à identidade preta, branca e laranja; o microtítulo atual é **Ferramentas recomendadas** e o espaçamento do título foi ajustado para evitar colisão entre linhas.
- Catálogo contém 11 ferramentas: ChatGPT, Claude, Gemini, Magnific, Higgsfield, HeyGen, ElevenLabs, Google Flow, Musicful, Suno e Flow Music.
- Cada ferramenta aparece uma única vez e usa tags internas para múltiplas categorias.
- Filtros: Todas, LLMs, Criação de conteúdo, Imagem, Vídeo, Narração e Música.
- Cards exibem logo, nome e descrição curta, com reveal em stagger e hover simples por crescimento; o spotlight que seguia o mouse foi removido.
- Não existem links externos/afiliados nos cards ainda.
- Página responsiva: 4 colunas desktop amplo, 3 em telas intermediárias, 2 no tablet e 1 no celular.
- Mobile possui menu hambúrguer com painel lateral, backdrop e fechamento acessível.
- Filtros mobile usam rolagem horizontal própria sem causar overflow da página.
- `prefers-reduced-motion` é respeitado.
- `/biblioteca-de-prompts/` permanece protegida e não foi modificada.

## Validação esperada

- `npm run lint`
- `npm run build`
- revisão de sintaxe do CSS
- revisão de overflow/responsividade
- preview Vercel
- merge na `main` após validação

## Pendente

- Inspeção visual do proprietário no site publicado e refinamentos, se necessários.

## Área protegida

- `biblioteca-de-prompts/index.html`
