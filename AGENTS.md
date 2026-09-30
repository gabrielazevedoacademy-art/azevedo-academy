# AGENTS.md — Regras de Desenvolvimento com IA

Este arquivo contém as regras permanentes para agentes que trabalham neste repositório.
O proprietário do projeto não é desenvolvedor; portanto, o agente é responsável pela validação técnica das próprias alterações.

## 1. Princípios

- Entenda antes de alterar.
- Faça a menor mudança segura capaz de cumprir o pedido.
- Preserve o que já funciona.
- Não altere áreas fora do escopo.
- Não reescreva partes grandes do projeto sem necessidade técnica real.
- Não invente estado, resultado de teste, deploy ou comportamento.
- Prefira soluções simples, reversíveis e compatíveis com os padrões existentes.

## 2. Contexto

Use os arquivos conforme a tarefa exigir:

- `PROJECT_CONTEXT.md`: visão estável do produto, arquitetura, regras e áreas protegidas.
- `CURRENT_STATE.md`: estado operacional atual, pendências, bugs e último ponto seguro.

Para mudanças de funcionalidade, UI, arquitetura, integrações ou regras de negócio, consulte `PROJECT_CONTEXT.md`.
Para desenvolvimento, continuação de tarefa, correção de bug ou deploy, consulte `CURRENT_STATE.md`.

Não releia arquivos grandes ou partes do repositório sem necessidade. Busque primeiro e abra somente o que for relevante.

## 3. Escopo

- Altere somente o necessário para o pedido atual.
- Não aproveite uma tarefa para refatorar áreas não relacionadas.
- Não remova funcionalidades silenciosamente.
- Não mude tecnologia, arquitetura ou dependências por preferência pessoal.
- Se uma mudança grande for necessária, divida em etapas pequenas e testáveis.

## 4. Antes de editar

1. Localize a implementação real.
2. Entenda dependências e padrões existentes.
3. Verifique áreas protegidas no `PROJECT_CONTEXT.md`.
4. Identifique o menor conjunto de arquivos que precisa mudar.
5. Considere risco de regressão antes de alterar.

## 5. Implementação

- Siga os padrões existentes do projeto.
- Reutilize componentes, tokens, funções e estruturas existentes quando apropriado.
- Não introduza uma segunda forma de fazer a mesma coisa sem necessidade.
- Evite dependências novas quando uma solução simples já existir.
- Não faça mudanças cosméticas fora do escopo.

## 6. Bugs

Ao corrigir um bug:

1. identifique evidência concreta;
2. localize a causa;
3. corrija a causa, não apenas o sintoma;
4. valide o cenário original;
5. verifique regressões relacionadas.

Não mascarar erros removendo validações, testes ou funcionalidades.

## 7. Segurança

Nunca:

- commitar senhas, tokens ou chaves;
- expor segredos no frontend;
- colocar credenciais em logs;
- desativar autenticação ou autorização para fazer algo funcionar;
- contornar proteções ou permissões;
- executar ação destrutiva sem necessidade e autorização.

Use o mecanismo de variáveis de ambiente já existente quando necessário.

## 8. Validação

Código escrito não significa tarefa concluída.

Execute os comandos relevantes que já existirem no projeto, como:

- lint;
- build;
- testes;
- validações específicas da área alterada.

Para UI, verificar quando aplicável:

- desktop;
- tablet;
- mobile;
- overflow;
- hover/foco;
- acessibilidade;
- `prefers-reduced-motion`.

Se algo falhar, corrija o que foi causado pela tarefa. Não esconda falhas preexistentes.

## 9. Git

Antes de finalizar:

- revise o diff;
- confirme que não entrou arquivo acidental;
- mantenha mudanças relacionadas juntas;
- use mensagem de commit curta e objetiva.

Nunca usar force push destrutivo sem autorização explícita.

## 10. Merge e deploy

Neste projeto, a regra padrão é entregar alterações concluídas e validadas já publicadas.

Ao finalizar uma tarefa que altere o projeto:

1. execute as validações relevantes;
2. revise o diff;
3. corrija erros causados pela alteração;
4. faça commit das mudanças necessárias;
5. integre a alteração na branch `main`;
6. faça push da `main` para o repositório remoto;
7. deixe o fluxo de deploy existente da Vercel executar.

O proprietário deve conseguir abrir o site publicado e avaliar o resultado sem precisar realizar etapas técnicas manualmente.

### Exceção

Não faça merge, push ou deploy somente quando:

- o proprietário pedir explicitamente para não publicar;
- existir bloqueio de permissão ou proteção do repositório;
- a validação indicar risco relevante de quebrar produção.

Se houver bloqueio, não tente contorná-lo. Informe de forma simples o que ficou pendente.

Nunca:

- usar force push destrutivo;
- remover proteção de branch;
- alterar infraestrutura, domínio ou pipeline para facilitar uma tarefa comum;
- publicar uma alteração que falhou nas validações relevantes apenas para mostrar o resultado.

## 11. Documentação de contexto

Atualize `PROJECT_CONTEXT.md` apenas quando mudar algo duradouro, como:

- arquitetura;
- regra de negócio;
- integração estrutural;
- área protegida;
- decisão permanente de produto ou design.

Atualize `CURRENT_STATE.md` ao final de tarefas relevantes:

- remova informação obsoleta;
- registre o estado real;
- mantenha apenas pendências atuais;
- atualize validações e último ponto seguro;
- mantenha o arquivo curto.

Não transforme esses arquivos em logs ou diários.

## 12. Comunicação com o proprietário

Use linguagem simples.

Ao finalizar, informe apenas:

- o que foi feito;
- o que foi validado;
- resultado atual;
- pendências reais, se houver.

Não use o proprietário como depurador técnico.

## 13. Quando pedir decisão humana

Peça decisão somente quando houver escolha real de produto ou risco relevante, por exemplo:

- excluir dados;
- mudar comportamento de negócio;
- trocar tecnologia central;
- gerar custo;
- alterar autenticação;
- mudar domínio;
- remover funcionalidade;
- executar ação irreversível.

Decisões técnicas rotineiras e seguras devem ser resolvidas pelo agente.

## 14. Regra final

Fluxo padrão:

**ENTENDER → LOCALIZAR → ALTERAR O MÍNIMO → VALIDAR → REVISAR → ATUALIZAR CONTEXTO → ENTREGAR**

A meta não é produzir mais código. É deixar o projeto mais correto, estável e próximo do objetivo do proprietário.
