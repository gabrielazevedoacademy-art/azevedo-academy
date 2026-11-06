---
titulo: "Mistral libera os pesos do Large 4, modelo aberto de 1 trilhão de parâmetros"
seoTitulo: "Mistral Large 4: pesos abertos de modelo com 1 trilhão de parâmetros"
resumo: "O Mistral Large 4, apelidado de Le Chonk, teve os pesos publicados no Hugging Face. É multimodal, forte em código e pode ser usado comercialmente, com exceções."
data: 2026-11-06T09:30:00-03:00
categoria: "Modelos"
tags: ["Mistral", "Mistral Large 4", "Modelos abertos", "Programação"]
fonte: { nome: "Mistral AI", url: "https://mistral.ai/it/news/mistral-large-4-oss/" }
---

A francesa Mistral publicou os pesos de uma versão melhorada do **Mistral Large 4**, apelidado de **Le Chonk**. É um modelo multimodal com cerca de **1 trilhão de parâmetros** que já estava em prévia pública e agora pode ser baixado e rodado em infraestrutura própria.

## O que melhorou

Em relação à prévia, a Mistral destaca ganhos em programação e uso de terminal, com o modelo liderando entre os abertos no Terminal-Bench e no FrontierCode, além de gastar menos tokens para resolver as mesmas tarefas. A empresa também reforçou a segurança: segundo ela, o modelo recusa a grande maioria dos pedidos maliciosos ligados a ataques digitais. Ele tem três modos de raciocínio: baixo, médio e alto.

## Licença e onde usar

Os pesos estão no Hugging Face sob a licença Mistral Ecosystem Open-Weight, uma variação da MIT. Pode usar, modificar, ajustar e vender produtos com ele. A exceção: empresas que oferecem o modelo como serviço para terceiros precisam de uma licença comercial separada.

Quem não quer instalar nada pode usar pela API da Mistral, pelo Mistral Studio, OpenRouter, NVIDIA e Microsoft Foundry. Na API, sai por US$ 0,70 por milhão de tokens de entrada e US$ 2,10 por milhão de saída.

## O que muda pra quem cria

Na prática, rodar um modelo desse tamanho em casa está fora de questão: ele exige servidores com várias placas de vídeo. O ganho real é para empresas e desenvolvedores que querem um modelo de ponta sob controle próprio, sem depender de uma plataforma fechada. Para o criador, isso tende a aparecer depois, em ferramentas e apps construídos em cima dele, muitas vezes mais baratos.
