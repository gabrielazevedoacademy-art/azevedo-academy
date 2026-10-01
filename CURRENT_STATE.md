# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-09-30  
**Branch:** `main` após integração da tarefa atual  
**Estado geral:** Home funcional em produção, com desktop preservado e responsividade mobile/tablet refinada.

## Estado atual

- Desktop acima de 860px foi preservado.
- Header/nav desktop mantém entrada, saída no scroll e retorno ao topo.
- Em até 860px, a navegação usa botão hambúrguer com menu lateral off-canvas pela direita.
- Menu mobile possui backdrop com blur, animação dos links em sequência, fechamento por backdrop/Escape/link e bloqueio do scroll de fundo.
- Hero mobile usa espaçamento fluido, tipografia responsiva e parallax de scroll desativado para evitar jitter/posicionamento instável.
- A jornada criativa preserva o layout cinematográfico no desktop; em telas estreitas vira timeline vertical animada para impedir sobreposição.
- Seção **Explore o ecossistema.** usa 2 colunas no tablet e 1 coluna no celular, mantendo proporção 4:5 dos cards.
- Seção **Últimos vídeos** mantém embeds fixos; em telas estreitas passa para 1 coluna e CTA centralizado.
- Footer reorganizado para tablet/celular sem overflow lateral.
- A Home mantém scroll nativo, foco acessível e suporte a `prefers-reduced-motion`.
- `/biblioteca-de-prompts/` permanece protegida e não foi modificada.

## Validação

- Sintaxe do JavaScript verificada.
- Estrutura de blocos CSS verificada.
- Condições equivalentes do build estático verificadas: `index.html`, Biblioteca e `vercel.json` permanecem válidos.
- Preview da Vercel na branch: **success**.
- Diff restrito a `index.html`, `assets/js/home.js`, `assets/css/home.css` e arquivos de contexto.

## Pendente

- Inspeção visual final no site publicado em aparelhos/tamanhos reais.

## Área protegida

- `biblioteca-de-prompts/index.html`
