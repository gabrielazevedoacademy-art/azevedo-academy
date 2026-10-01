# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-09-30  
**Branch:** `main`  
**Estado geral:** Home funcional em produção; jornada criativa refinada para a paleta laranja da marca.

## Último estado publicado

Commit visual mais recente:

`2c7e6bc302e831581ca7651f268151a780e09804`

PR #17 foi integrada na `main` e a Vercel reportou **success** para esse commit.

## O que está funcionando

- Header/nav existente preservado.
- Hero existente preservado.
- Cards de imagem preservados.
- `/biblioteca-de-prompts/` preservada.
- Transição entre hero e cards usa fundo escuro cinematográfico.
- Título da seção: **O CAMINHO DA CRIAÇÃO.**
- Copy de apoio: “Da ideia ao impacto, cada etapa transforma intenção em algo que merece ser visto.”
- Paleta da jornada agora segue preto, branco e laranja.
- Linha laranja com glow é desenhada ao entrar na viewport.
- Depois do desenho principal, um fluxo luminoso percorre o trajeto continuamente.
- Etapas continuam: IDEIA → PROMPT → CRIAÇÃO → IMPACTO.
- O trecho da curva próximo de PROMPT foi rebaixado para preservar respiro da copy introdutória e evitar sobreposição.
- Cada etapa continua conectada diretamente ao caminho e revela o texto em sequência.
- Fundo mantém movimento sutil de grade e luzes difusas, agora em tons laranja.
- `prefers-reduced-motion` mantém versão estática acessível.

## Validação

- Alterações estão na `main`.
- Status Vercel do commit visual: **success**.
- `vercel.json` continua com `outputDirectory: "."`.
- `biblioteca-de-prompts/index.html` continua existente e não foi alterado.
- `home.js` não foi alterado; o IntersectionObserver existente continua acionando a animação.
- O diff visual ficou restrito a `index.html` e `assets/css/home.css`; `PROJECT_CONTEXT.md` foi atualizado para registrar a nova direção.
- A estrutura exigida por `npm run build` foi conferida diretamente no repositório. O clone externo não estava disponível neste ambiente, então os comandos locais não foram executados.

## Pendente

- Inspeção visual do resultado publicado pelo proprietário em desktop e mobile.
- Ajustar apenas proporções ou posicionamento se o resultado visual ainda pedir refinamento.

## Área protegida

- `biblioteca-de-prompts/index.html`

## Próximo passo provável

Abrir o site publicado e avaliar:
- separação entre a copy e a curva;
- percurso da linha laranja;
- posição dos textos;
- leitura em desktop e mobile.
