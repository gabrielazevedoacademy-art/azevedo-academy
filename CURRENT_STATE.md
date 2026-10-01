# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-09-30  
**Branch:** `main` após integração da tarefa atual  
**Estado geral:** Home funcional em produção, com hero, jornada criativa, ecossistema, header animado e seção estática de vídeos.

## Estado atual

- Header/nav preservado; anima na entrada, saída durante scroll e retorno ao topo.
- Hero cinematográfico preservado.
- Jornada criativa preservada em preto, branco e laranja.
- Seção **Explore o ecossistema.** preservada com os quatro cards e reveal em stagger.
- Scroll continua 100% nativo; não há interceptação de `wheel`.
- Seção **Últimos vídeos** usa 4 embeds oficiais fixos do YouTube, em grade 2 × 2 no desktop e 1 coluna no mobile.
- A palavra/kicker **YouTube** foi removida do cabeçalho da seção.
- Vídeos atuais: `mpFFYBQrjSY`, `jSPHCd3gOu8`, `QRWMKPGCvKc`, `4DSP5saNJhU`.
- O botão **Explorar o canal** está centralizado abaixo da grade e usa animação visual inspirada no CTA do hero.
- A integração automática por playlist/IFrame API foi removida.
- A seção mantém reveal sutil, hover, responsividade e respeito a `prefers-reduced-motion`.
- `/biblioteca-de-prompts/` permanece protegida e não foi modificada.

## Validação esperada

- `npm run lint`
- `npm run build`
- revisão do diff
- status do deploy Vercel após merge na `main`

## Pendente

- Inspeção visual do proprietário no site publicado e refinamento apenas se necessário.

## Área protegida

- `biblioteca-de-prompts/index.html`
