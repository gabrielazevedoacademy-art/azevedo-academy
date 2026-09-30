# PROJECT_CONTEXT.md — Contexto do Projeto

> Este arquivo descreve o projeto de forma relativamente estável.
> Ele não é um diário de desenvolvimento.
> Atualize somente quando houver mudança relevante de objetivo, estrutura, regra de negócio, arquitetura, identidade, integração ou restrição.

---

## 1. IDENTIFICAÇÃO

**Nome do projeto:**  
[preencher]

**Tipo de projeto:**  
[site / sistema web / aplicativo / API / ferramenta interna / outro]

**Status atual:**  
[ideia / protótipo / desenvolvimento / produção / manutenção]

**Responsável pelo produto:**  
[preencher]

---

## 2. RESUMO EM UMA FRASE

[Explique em uma frase simples o que este projeto faz.]

Exemplo:

> Plataforma web para organizar e disponibilizar uma biblioteca de prompts de inteligência artificial para assinantes.

---

## 3. OBJETIVO PRINCIPAL

[Explique qual problema este projeto resolve e qual resultado deve entregar.]

Perguntas que este bloco deve responder:

- Por que este projeto existe?
- Quem ele ajuda?
- Qual é o principal resultado esperado?
- O que precisa funcionar bem para o projeto cumprir sua função?

---

## 4. PÚBLICO / USUÁRIOS

**Usuário principal:**  
[preencher]

**Usuários secundários:**  
[preencher, se houver]

**Nível técnico esperado do usuário:**  
[iniciante / intermediário / avançado / misto]

**Necessidades principais:**  
- [necessidade 1]
- [necessidade 2]
- [necessidade 3]

---

## 5. ESCOPO PRINCIPAL

O projeto deve possuir:

- [funcionalidade principal 1]
- [funcionalidade principal 2]
- [funcionalidade principal 3]
- [funcionalidade principal 4]

### Fora de escopo neste momento

- [item 1]
- [item 2]

Não implementar itens fora de escopo sem solicitação explícita.

---

## 6. REGRAS DE NEGÓCIO IMPORTANTES

- [regra 1]
- [regra 2]
- [regra 3]

Exemplos:

- apenas usuários autenticados podem acessar determinada área;
- determinada página é pública e outra é privada;
- pagamentos confirmados liberam determinado recurso;
- determinado dado nunca pode ser apagado automaticamente.

---

## 7. ÁREAS PROTEGIDAS / NÃO ALTERAR

Estas áreas não devem ser modificadas sem pedido explícito:

- [rota, página, componente, integração ou recurso protegido]
- [outro item]

Se uma tarefa parecer exigir alteração em uma área protegida, interromper essa parte da implementação e sinalizar.

---

## 8. STACK ATUAL

Preencher somente com tecnologias realmente usadas no projeto.

**Frontend:**  
[ex.: Next.js, React, Vue, HTML/CSS/JS]

**Backend:**  
[preencher]

**Banco de dados:**  
[preencher]

**Autenticação:**  
[preencher]

**Hospedagem / deploy:**  
[preencher]

**Storage / arquivos:**  
[preencher]

**APIs / serviços externos:**  
- [serviço 1]
- [serviço 2]

---

## 9. ESTRUTURA RELEVANTE DO PROJETO

Registrar apenas a estrutura que ajuda outro agente a se localizar.

Exemplo:

```text
/app
/components
/lib
/public
/api
```

Explicação curta:

- `/app`: páginas e rotas;
- `/components`: componentes reutilizáveis;
- `/lib`: serviços e funções compartilhadas;
- `/public`: arquivos estáticos.

Não transformar esta seção em listagem completa do repositório.

---

## 10. ARQUITETURA E PADRÕES

- [padrão importante 1]
- [padrão importante 2]
- [padrão importante 3]

Exemplos:

- componentes de UI devem ser reutilizáveis;
- chamadas externas passam por uma camada de serviço;
- não duplicar lógica de autenticação;
- preferir Server Components onde já for padrão do projeto;
- validação de entrada ocorre antes de salvar dados.

---

## 11. IDENTIDADE VISUAL / INTERFACE

**Estilo geral:**  
[preencher]

**Cores principais:**  
[preencher]

**Tipografia:**  
[preencher]

**Características importantes:**  
- [ex.: minimalista]
- [ex.: dark mode]
- [ex.: cards com bordas suaves]
- [ex.: animações discretas]

**Evitar:**  
- [item 1]
- [item 2]

Se já existir um sistema visual separado, referenciar o arquivo em vez de duplicar regras extensas aqui.

---

## 12. RESPONSIVIDADE

Regras gerais:

- desktop: [preencher]
- tablet: [preencher]
- mobile: [preencher]

Registrar apenas comportamentos importantes que não podem ser perdidos.

---

## 13. INTEGRAÇÕES

### [Nome da integração]

**Função:**  
[para que serve]

**Área do projeto:**  
[onde é usada]

**Observações importantes:**  
[limites, dependências, comportamento relevante]

Repetir este bloco apenas para integrações importantes.

---

## 14. DADOS IMPORTANTES

Principais entidades do sistema:

- [entidade 1]
- [entidade 2]
- [entidade 3]

Relações importantes:

- [ex.: usuário possui projetos]
- [ex.: projeto possui arquivos]

Não colocar dados reais de usuários, senhas, tokens ou segredos neste arquivo.

---

## 15. AMBIENTES

**Desenvolvimento:**  
[preencher]

**Produção:**  
[preencher]

**Branch principal:**  
[ex.: main]

**Fluxo de deploy:**  
[ex.: push na main dispara deploy automático]

Nunca registrar valores secretos.

---

## 16. DECISÕES IMPORTANTES JÁ TOMADAS

Registrar decisões duradouras e o motivo, de forma curta.

### [Decisão]

**Escolha:**  
[preencher]

**Motivo:**  
[preencher]

**Data aproximada:**  
[opcional]

Exemplo:

### Hero da Home

**Escolha:** imagem estática com movimento via CSS/JS.

**Motivo:** abordagem anterior com vídeo/scroll foi descartada por complexidade e resultado visual inferior.

---

## 17. RESTRIÇÕES

- [restrição técnica]
- [restrição de negócio]
- [restrição de custo]
- [restrição de segurança]

Exemplos:

- não adicionar serviços pagos sem autorização;
- não alterar domínio;
- não remover autenticação;
- não modificar área privada ao trabalhar na Home.

---

## 18. CRITÉRIOS DE QUALIDADE

O projeto deve priorizar:

- estabilidade;
- clareza;
- responsividade;
- acessibilidade;
- segurança;
- performance adequada;
- manutenção simples;
- mudanças pequenas e reversíveis.

Adicionar critérios específicos do projeto quando necessário.

---

## 19. DEFINIÇÃO DE SUCESSO

O projeto estará cumprindo seu objetivo quando:

- [critério 1]
- [critério 2]
- [critério 3]

---

## 20. NOTAS PARA O AGENTE

- Consulte também `AGENTS.md`.
- Consulte `CURRENT_STATE.md` para saber o estado operacional atual.
- Não presuma que este arquivo está 100% atualizado se o código mostrar algo diferente.
- Se encontrar divergência relevante, valide o estado real e atualize este arquivo somente quando a mudança for estrutural e duradoura.
