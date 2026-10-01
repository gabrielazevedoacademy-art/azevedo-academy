# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-09-30  
**Branch:** `main` após integração da tarefa atual  
**Estado geral:** Home funcional em produção, com hero, jornada criativa, ecossistema, header animado e seção automática de vídeos.

## Estado atual

- Header/nav preservado; anima na entrada, saída durante scroll e retorno ao topo.
- Hero cinematográfico preservado.
- Jornada criativa preservada em preto, branco e laranja.
- Seção **Explore o ecossistema.** preservada com os quatro cards e reveal em stagger.
- Scroll continua 100% nativo; não há interceptação de `wheel`.
- A seção **Últimos vídeos** fica antes do footer.
- Ela usa 4 embeds fixos do YouTube em grade 2 × 2 no desktop e 1 coluna no mobile.
- Não há mais tentativa de carregar feed, playlist ou endpoint automaticamente.
- Os vídeos atuais são: Influenciadora de Dança com IA, Vídeos com IA sem Limite de Duração, ASMR com IA e Ferramenta para Criar Conteúdo no YouTube.
- O botão para acessar o canal fica centralizado abaixo da grade e usa animação inspirada no CTA do hero.
- A seção mantém responsividade e respeito a `prefers-reduced-motion`.
- `/biblioteca-de-prompts/` permanece protegida e não foi modificada.

## Validação esperada

- `npm run lint`
- `npm run build`
- sintaxe de `api/youtube.js`
- revisão do diff
- status do deploy Vercel após merge na `main`

## Pendente

- Inspeção visual do proprietário no site publicado e refinamento apenas se necessário.

## Área protegida

- `biblioteca-de-prompts/index.html`
