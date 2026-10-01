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
- Nova seção **Últimos vídeos** foi adicionada antes do footer.
- A seção usa a YouTube IFrame Player API no navegador para ler a playlist oficial de uploads do canal.
- Canal: `@Azevedo.Academy`; ID: `UCal4KF4mgJCUrFXu4Qw5aog`; playlist de uploads: `UUal4KF4mgJCUrFXu4Qw5aog`.
- São exibidas 3 thumbnails recentes, cada uma com link direto para o respectivo vídeo, mais o link para ver todos os vídeos.
- A integração não depende de chave da YouTube Data API nem de uma função serverless própria.
- Se a API oficial do player não carregar, a Home continua funcional e mantém o link para o canal.
- A seção de vídeos tem animação de entrada sutil, hover, responsividade e respeito a `prefers-reduced-motion`.
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
