---
titulo: "Microsoft libera o Mage-VL-Cowork, modelo aberto e pequeno que usa o computador"
seoTitulo: "Mage-VL-Cowork: modelo aberto da Microsoft para usar o PC"
resumo: "Com cerca de 4 bilhões de parâmetros e licença Apache 2.0, o Mage-VL-Cowork clica, digita e roda comandos no terminal. Os autores pedem uso em ambiente isolado."
data: 2026-11-06T09:25:00-03:00
categoria: "Agentes"
tags: ["Microsoft", "Agentes de IA", "Modelos abertos", "Hugging Face"]
fonte: { nome: "Hugging Face", url: "https://huggingface.co/microsoft/Mage-VL-Cowork" }
---

A Microsoft publicou o **Mage-VL-Cowork**, um modelo que enxerga a tela e opera o computador. A diferença para outros agentes é o tamanho: são cerca de **4 bilhões de parâmetros**, pequeno o bastante para pensar em rodar localmente com o hardware certo.

## O que ele faz

O modelo trabalha por dois caminhos e decide qual usar a cada passo: a **interface gráfica**, com cliques, arraste, digitação, rolagem e capturas de tela, e o **terminal**, onde roda comandos e scripts em Python. Tudo num modelo só, sem um orquestrador externo.

Os autores informam 66% no OSWorld-Verified, um teste de tarefas reais de computador, o melhor resultado entre modelos desse porte segundo eles. Modelos maiores ainda vão melhor, e o número vem do próprio time, então vale como referência, não como garantia.

## Licença e cuidados

O projeto está no Hugging Face sob licença **Apache 2.0**, que permite uso comercial. Os próprios autores recomendam rodar o agente só em ambientes isolados e descartáveis, pedir confirmação humana antes de qualquer ação que não dê pra desfazer, não expor senhas e limitar o acesso à internet, já que páginas da web podem tentar enganar o agente.

## O que muda pra quem cria

É mais um sinal de que agentes que usam o computador vão ficar comuns e baratos. Para a maioria dos criadores, o caminho mais simples continua sendo usar esse tipo de recurso dentro de ferramentas prontas, como o [GPT-6.1 Terra](/noticias/openai-gpt-6-1-terra). Para quem gosta de montar automações próprias, um modelo aberto e pequeno abre espaço para testar sem depender de serviço pago.
