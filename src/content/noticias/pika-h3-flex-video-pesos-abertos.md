---
titulo: "Pika H3 Flex: vídeo com IA mais rápido, com até 12 referências e pesos abertos"
seoTitulo: "Pika H3 Flex: vídeo com IA com 12 referências e pesos abertos"
resumo: "O Pika H3 Flex aceita até 12 imagens, vídeos e áudios de referência, gera som sincronizado e teve os adaptadores liberados para rodar no ComfyUI."
data: 2026-11-06T09:40:00-03:00
categoria: "Vídeo e imagem"
tags: ["Pika", "MiniMax H3", "ComfyUI", "Vídeo com IA", "Modelos abertos"]
fonte: { nome: "Blog da Pika", url: "https://pika.art/blog/pika-h3-flex" }
---

A Pika lançou em 29 de outubro o **H3 Flex**, uma versão própria do modelo de vídeo MiniMax H3 treinada para ser mais rápida e dar mais controle sobre o resultado. A empresa reduziu o processo de geração de 50 para 6 etapas e depois ajustou o modelo para recuperar qualidade.

## Referências e áudio

O destaque para quem produz vídeo é o número de referências: até **12 arquivos** combinando imagens, vídeos e áudio numa mesma geração. Dá pra usar folha de personagem, foto de produto, moodboard, amostra de voz e um vídeo de movimento para guiar a cena.

O Flex também gera **áudio estéreo sincronizado**. Pela API da Pika, é possível exportar o som separado em diálogo, trilha, efeitos, foley e ambiente, o que facilita muito a edição depois.

## Pesos abertos e ComfyUI

A Pika liberou os adaptadores do Flex e o código de execução, com os pesos no Hugging Face. O ComfyUI já tem um guia com três fluxos prontos: texto para vídeo, referência para vídeo e primeiro e último quadro. No mesmo período, o ComfyUI ganhou suporte a janelas de contexto para o MiniMax H3, que ajuda a gerar sequências mais longas.

Dois avisos importantes. A versão aberta gera em 480p e 768p; o upscale para 1080p, 2K e 4K e a separação de áudio funcionam só nos servidores da Pika. E "pesos abertos" não quer dizer que roda em qualquer computador: você precisa de uma boa placa de vídeo e deve ler a licença do MiniMax H3 antes de usar comercialmente.

## O que muda pra quem cria

Mais referências significam personagens e produtos mais consistentes entre um clipe e outro, um dos maiores problemas do vídeo com IA hoje. Para quem já usa ComfyUI, vale testar o fluxo de referência. Para quem prefere não mexer com instalação, o Flex chega à plataforma da Pika a partir de 2 de novembro.

O mercado de vídeo com IA também movimentou dinheiro grande nesta semana: veja a [captação da Kling AI](/noticias/kling-ai-capta-quase-3-bilhoes).
