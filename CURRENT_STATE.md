# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-10-14  
**Branch:** `main` após integração da tarefa atual  
**Estado geral:** Home e Ferramentas em produção; página de vendas `/influencer-com-ia` em construção.

## Estado atual

- Home preservada, incluindo desktop e responsividade mobile/tablet já aprovados. O CTA do hero parte de fundo branco e texto preto; o círculo laranja da seta ocupa o botão no hover e revela o texto branco na mesma área. A segunda linha do título recebe um glitch digital intermitente logo depois da entrada, com repetição mais frequente, com cortes horizontais e pequenos deslocamentos.
- `/ferramentas` possui hero próprio alinhado à identidade preta, branca e laranja; os círculos decorativos do fundo foram removidos. O título recebe um glitch digital intermitente logo depois da entrada, com repetição mais frequente, com cortes horizontais e pequenos deslocamentos. O CTA segue o mesmo tratamento branco e laranja da Home. Os textos editoriais permanecem em linguagem natural.
- Catálogo contém 11 ferramentas: ChatGPT, Claude, Gemini, Magnific, Higgsfield, HeyGen, ElevenLabs, Google Flow, Musicful, Suno e Flow Music.
- Cada ferramenta aparece uma única vez e usa tags internas para múltiplas categorias.
- Filtros: Todas, Texto e ideias, Criação de conteúdo, Imagem, Vídeo, Narração e Música.
- Cards estão compactos e centralizados, sem numeração; exibem logo, nome e descrição curta. No desktop, o hover move e aumenta o card inteiro de forma mais lenta e visível. No mobile, esse crescimento fica desativado.
- Claude usa o ícone próprio da marca. O catálogo sobrepõe suavemente o final do hero para eliminar a linha entre as seções.
- Não existem links externos/afiliados nos cards ainda.
- Página responsiva: 4 colunas desktop amplo, 3 em telas intermediárias e 2 colunas no tablet e no celular.
- Mobile possui menu hambúrguer com painel lateral, backdrop e fechamento acessível. Na Home e em Ferramentas, o header mobile usa fundo desfocado ao rolar, sem borda inferior. Em Ferramentas, o bloco de conteúdo do hero permanece mais alto.
- Filtros mobile usam rolagem horizontal própria sem causar overflow da página.
- `prefers-reduced-motion` é respeitado.
- `/biblioteca-de-prompts/` permanece protegida e não foi modificada.
- `/influencer-com-ia` (página de vendas do curso), nesta ordem: hero, looks (carrossel com 7 looks), galeria em mosaico (5 fotos; mais fotos serão enviadas), autoridade do Gabriel, prova social (9 prints do YouTube em duas faixas opostas), garantia de 7 dias e oferta (`#oferta`, De R$ 497 por R$ 197, preço fixo em verde). Os dois CTAs (hero e cartão de preço) levam ao checkout da Kiwify (https://pay.kiwify.com.br/UfYXlPl). Copy do hero provisória, header só com a marca, rodapé provisório e `noindex` enquanto estiver em construção. Sem link no menu do site; acesso pelo link direto (em minúsculas). Primeira revisão do mobile feita (topo, botões e seção do Gabriel); aguardando avaliação do proprietário.

## Validação esperada

- `npm run lint`
- `npm run build`
- revisão de sintaxe do CSS
- revisão de overflow/responsividade
- preview Vercel
- merge na `main` após validação

## Pendente

- Inspeção visual do proprietário no site publicado e refinamentos, se necessários.
- `/influencer-com-ia`: avaliação do mobile pelo proprietário, mais fotos para a galeria, próximas seções e remover o `noindex` no lançamento.

## Área protegida

- `biblioteca-de-prompts/index.html`
