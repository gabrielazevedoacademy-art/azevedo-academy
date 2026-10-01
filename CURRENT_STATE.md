# CURRENT_STATE.md — Estado Atual do Projeto

## STATUS GERAL

**Estado atual:** estável; transição criativa animada implementada  
**Última atualização:** 2026-09-30  
**Último estado seguro conhecido:** commit desta tarefa na `main`

## FUNCIONANDO

- Cabeçalho transparente com logo + “Azevedo Academy”.
- No desktop, o header aparece no topo e desaparece suavemente após o início do scroll; no mobile o comportamento anterior foi preservado.
- Hero sem kicker; título, texto principal e CTA aprovado preservados.
- Faixa branca mantém a mensagem “NÃO É SOBRE ACOMPANHAR O FUTURO. É SOBRE CRIAR COM ELE.”
- Frase pequena superior, círculo abstrato e assinatura com bolinha foram removidos.
- A faixa branca agora contém um caminho curvo animado que é desenhado quando entra na viewport.
- Etapas do caminho: IDEIA → PROMPT → CRIAÇÃO → IMPACTO, surgindo em sequência.
- A animação usa SVG/CSS/IntersectionObserver, sem biblioteca externa e sem peso adicional relevante.
- Cards, glows e hover uniformizado permanecem intactos.
- `prefers-reduced-motion` mantém uma versão estática acessível.
- `/biblioteca-de-prompts/` não foi alterada.

## PENDÊNCIAS

- Validar visualmente o caminho animado e as posições das quatro etapas em desktop e mobile.
- Ajustar somente proporções/ritmo caso o proprietário peça.

## BLOQUEIOS

> Nenhum bloqueio atual.

## VALIDAÇÃO MAIS RECENTE

**Build:** estrutura estática e configuração Vercel preservadas  
**Lint:** sintaxe do JavaScript alterado validada  
**Typecheck:** não disponível  
**Testes:** não existem testes automatizados adicionais  
**Validação visual:** aguardando inspeção do site publicado  
**Deploy:** push para `main` aciona a Vercel

## ÁREA SENSÍVEL

- `biblioteca-de-prompts/index.html` — preservado e não alterado.

## RESUMO PARA O PRÓXIMO AGENTE

> A faixa branca usa um SVG curvo animado como narrativa de processo: IDEIA → PROMPT → CRIAÇÃO → IMPACTO. O caminho é desenhado ao entrar na tela e os nós surgem em sequência; reduced motion mostra tudo estático. No desktop, o header agora é visível apenas no topo e some após 64px de scroll. O CTA aprovado e os cards não foram alterados.
