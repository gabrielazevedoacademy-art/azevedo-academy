# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-09-30  
**Branch:** `main`  
**Estado geral:** Home funcional em produção; jornada criativa e seção de cards refinadas.

## Último estado visual

Commit visual mais recente:

`dd2b8d27adc49cea80f593741ddfa5e33fbcef61`

PR #19 foi integrada na `main`.

## O que está funcionando

- Header/nav existente preservado.
- Hero existente preservado.
- `/biblioteca-de-prompts/` preservada.
- Jornada criativa usa preto, branco e laranja.
- Pontos IDEA, PROMPT, CRIAÇÃO e IMPACTO estão alinhados ao percurso atual.
- Linha laranja com glow e fluxo luminoso continuam animados.
- Título da seção de cards: **Explore o ecossistema.**
- Copy de apoio: “Prompts, ferramentas, recursos e caminhos para transformar ideias em resultado.”
- Os quatro cards de imagem continuam com layout 4 / 2×2 / 1 por linha conforme a largura.
- A entrada da seção de cards agora é disparada quando a própria seção entra na viewport.
- O título entra primeiro e os cards aparecem em stagger progressivo.
- O fallback antigo que podia revelar os cards antes do usuário chegar à seção foi removido.
- Hover, glow individual e foco dos cards foram preservados.
- A rolagem com wheel em desktop/mouse recebe amortecimento leve para sensação mais premium.
- Touch/mobile, teclado e `prefers-reduced-motion` mantêm comportamento nativo/acessível.

## Validação

- Alterações estão na `main`.
- JavaScript da Home passou por validação sintática.
- `vercel.json` continua com `outputDirectory: "."`.
- `biblioteca-de-prompts/index.html` continua existente e não foi alterado.
- O diff da PR #19 ficou restrito a `index.html`, `assets/css/home.css`, `assets/js/home.js` e `PROJECT_CONTEXT.md`.
- O deploy da Vercel deve ser considerado concluído somente após status **success** do commit visual.

## Pendente

- Inspeção visual pelo proprietário da nova seção de cards em desktop e mobile.
- Ajustar apenas intensidade/ritmo da rolagem ou do stagger se o resultado visual pedir refinamento.

## Área protegida

- `biblioteca-de-prompts/index.html`

## Próximo passo provável

Abrir a Home publicada e avaliar:
- hierarquia do título dos cards;
- timing do reveal;
- sensação da rolagem em desktop;
- leitura e espaçamento no mobile.
