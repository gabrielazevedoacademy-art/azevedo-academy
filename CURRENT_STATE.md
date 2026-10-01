# CURRENT_STATE.md — Estado Atual do Projeto

## STATUS GERAL

**Estado atual:** estável; correção de glow e novo conceito de CTA implementados  
**Última atualização:** 2026-09-30  
**Último estado seguro conhecido:** commit desta tarefa na `main`

## FUNCIONANDO

- Cabeçalho transparente com logo + “Azevedo Academy”.
- Hero sem o kicker antigo; título e texto principal preservados.
- CTA “Explorar ferramentas” usa conceito de ação expansiva: o círculo da seta se abre e preenche o botão no hover.
- Quatro cards continuam usando as artes PNG e os links existentes.
- Estilos antigos vermelhos dos cards foram neutralizados para não aparecerem antes do glow correto.
- Glows fixos por card: azul, roxo, amarelo e ciano.
- Layout 4/2/1, foco visível e `prefers-reduced-motion` permanecem tratados.
- `/biblioteca-de-prompts/` não foi alterada.

## EM DESENVOLVIMENTO

> Nenhuma implementação parcialmente concluída.

## BUGS CONHECIDOS

> Nenhum bug novo conhecido introduzido por esta tarefa.

## PENDÊNCIAS

- Validar visualmente o comportamento dos glows e o novo CTA no deploy.
- Continuar os próximos refinamentos do hero após feedback.

## BLOQUEIOS

> Nenhum bloqueio atual.

## VALIDAÇÃO MAIS RECENTE

**Build:** estrutura do site estático e configuração Vercel preservadas  
**Lint:** JavaScript não foi alterado nesta tarefa  
**Typecheck:** não disponível neste projeto estático  
**Testes:** não existem testes automatizados adicionais  
**Validação visual:** aguardando inspeção do site publicado  
**Deploy:** push para `main` aciona a Vercel

## ÁREA SENSÍVEL

- `biblioteca-de-prompts/index.html` — preservado e não alterado.

## RESUMO PARA O PRÓXIMO AGENTE

> O bug de flash vermelho nos cards vinha de estilos antigos com maior especificidade. Eles foram neutralizados e os glows agora permanecem azul, roxo, amarelo e ciano desde o primeiro frame. O CTA do hero foi redesenhado sem biblioteca externa: a esfera da seta expande para preencher o botão no hover. A Biblioteca de Prompts permaneceu intacta.
