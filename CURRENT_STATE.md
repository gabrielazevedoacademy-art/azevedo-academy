# CURRENT_STATE.md — Estado Atual do Projeto

> Este arquivo representa somente o estado atual do projeto.
> Ele deve ser curto, objetivo e atualizado pelo agente ao final de tarefas relevantes.
> Não acumular histórico antigo.
> Quando algo deixar de ser verdade, substituir ou remover.

---

## 1. STATUS GERAL

**Estado atual:**  
[estável / em desenvolvimento / com bug / aguardando validação / bloqueado]

**Última atualização:**  
[AAAA-MM-DD]

**Último estado seguro conhecido:**  
[commit, branch, deploy ou descrição curta]

---

## 2. O QUE ESTÁ FUNCIONANDO

- [funcionalidade 1]
- [funcionalidade 2]
- [funcionalidade 3]

Registrar somente funcionalidades relevantes para continuidade do trabalho.

---

## 3. O QUE ESTÁ EM DESENVOLVIMENTO

### [Tarefa ou funcionalidade]

**Objetivo:**  
[preencher]

**Estado:**  
[não iniciada / em andamento / implementada aguardando validação]

**Arquivos/áreas principais:**  
- [arquivo ou área]

**Observação:**  
[preencher somente se realmente ajudar o próximo agente]

Se não houver tarefa em andamento:

> Nenhuma implementação parcialmente concluída no momento.

---

## 4. BUGS CONHECIDOS

### [Bug]

**Sintoma:**  
[o que acontece]

**Impacto:**  
[baixo / médio / alto / crítico]

**Status:**  
[identificado / investigando / corrigido aguardando validação]

**Evidência conhecida:**  
[erro, tela, comportamento ou teste relacionado]

Não registrar hipótese como causa confirmada.

Se não houver bugs conhecidos:

> Nenhum bug conhecido relevante no momento.

---

## 5. PENDÊNCIAS

- [pendência 1]
- [pendência 2]

Manter somente itens realmente pendentes.

Remover o item assim que for concluído ou deixar de ser necessário.

---

## 6. BLOQUEIOS

- [bloqueio atual]

Exemplos:

- falta de credencial;
- permissão ausente;
- decisão do proprietário;
- API externa indisponível.

Se não houver:

> Nenhum bloqueio atual.

---

## 7. ÚLTIMAS ALTERAÇÕES RELEVANTES

Registrar no máximo algumas mudanças recentes que alterem o entendimento atual.

- [alteração relevante 1]
- [alteração relevante 2]
- [alteração relevante 3]

Não transformar esta seção em changelog permanente.

---

## 8. VALIDAÇÃO MAIS RECENTE

**Build:**  
[passou / falhou / não disponível / não executado]

**Lint:**  
[passou / falhou / não disponível / não executado]

**Typecheck:**  
[passou / falhou / não disponível / não executado]

**Testes:**  
[passaram / falharam / não existem / não executados]

**Validação visual:**  
[desktop / tablet / mobile / não aplicável / não realizada]

**Deploy:**  
[produção atualizada / aguardando / falhou / não aplicável]

Nunca marcar uma verificação como concluída se ela não foi realmente executada.

---

## 9. PROBLEMAS PREEXISTENTES

Problemas encontrados que não foram causados pela tarefa atual:

- [problema preexistente]

Não corrigir automaticamente problemas fora do escopo, a menos que impeçam diretamente a tarefa.

Se não houver:

> Nenhum problema preexistente relevante identificado.

---

## 10. PRÓXIMOS PASSOS PROVÁVEIS

1. [próximo passo]
2. [próximo passo]
3. [próximo passo]

Esta lista é orientação, não autorização automática para executar tudo.

---

## 11. DECISÕES RECENTES AINDA RELEVANTES

### [Decisão]

**Decidido:**  
[preencher]

**Impacto atual:**  
[preencher]

Mover decisões duradouras para `PROJECT_CONTEXT.md`.
Remover daqui quando deixarem de ser recentes ou operacionais.

---

## 12. ARQUIVOS / ÁREAS SENSÍVEIS NO MOMENTO

- [arquivo, rota, componente ou serviço]

Use esta seção somente quando houver risco real durante o trabalho atual.

---

## 13. RESUMO PARA O PRÓXIMO AGENTE

[Escreva de 3 a 8 linhas dizendo apenas o que outra IA precisa saber para continuar imediatamente.]

Exemplo:

> A Home está estável em produção. A tarefa atual é substituir quatro cards codificados por quatro imagens PNG mantendo os links existentes. O header não deve ser alterado. A área `/biblioteca-de-prompts/` continua protegida. Depois da alteração, validar responsividade em 4/2/1 colunas, build e deploy.

---

## REGRA DE MANUTENÇÃO

Ao finalizar uma tarefa relevante:

1. remova informações obsoletas;
2. atualize o estado real;
3. registre somente pendências que continuam existindo;
4. atualize a validação;
5. mantenha o resumo curto;
6. não acumule histórico.

O objetivo deste arquivo é permitir que um novo agente entenda o ponto atual do projeto rapidamente, usando poucos tokens.
