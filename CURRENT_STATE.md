# CURRENT_STATE.md — Azevedo Academy

**Atualizado em:** 2026-10-01  
**Branch:** `main` após integração da tarefa atual  
**Estado geral:** Home funcional em produção e nova página de ferramentas pronta para publicação.

## Estado atual

- Home preservada, incluindo desktop e responsividade mobile/tablet já aprovados. O CTA do hero parte de fundo branco e texto preto; o círculo laranja da seta ocupa o botão no hover e revela o texto branco na mesma área. A segunda linha do título recebe um pulso visual lento em looping depois da entrada.
- `/ferramentas` possui hero próprio alinhado à identidade preta, branca e laranja; os círculos decorativos do fundo foram removidos. O título recebe um pulso visual lento em looping depois da entrada. O CTA segue o mesmo tratamento branco e laranja da Home. Os textos editoriais permanecem em linguagem natural.
- Catálogo contém 11 ferramentas: ChatGPT, Claude, Gemini, Magnific, Higgsfield, HeyGen, ElevenLabs, Google Flow, Musicful, Suno e Flow Music.
- Cada ferramenta aparece uma única vez e usa tags internas para múltiplas categorias.
- Filtros: Todas, Texto e ideias, Criação de conteúdo, Imagem, Vídeo, Narração e Música.
- Cards estão compactos e centralizados, sem numeração; exibem logo, nome e descrição curta. No desktop, o hover move e aumenta o card inteiro de forma mais lenta e visível. No mobile, esse crescimento fica desativado.
- Claude usa o ícone próprio da marca. O catálogo sobrepõe suavemente o final do hero para eliminar a linha entre as seções.
- Não existem links externos/afiliados nos cards ainda.
- Página responsiva: 4 colunas desktop amplo, 3 em telas intermediárias, 2 no tablet e 1 no celular.
- Mobile possui menu hambúrguer com painel lateral, backdrop e fechamento acessível.
- Filtros mobile usam rolagem horizontal própria sem causar overflow da página.
- `prefers-reduced-motion` é respeitado.
- `/biblioteca-de-prompts/` permanece protegida e não foi modificada.

## Validação esperada

- `npm run lint`
- `npm run build`
- revisão de sintaxe do CSS
- revisão de overflow/responsividade
- preview Vercel
- merge na `main` após validação

## Pendente

- Inspeção visual do proprietário no site publicado e refinamentos, se necessários.

## Área protegida

- `biblioteca-de-prompts/index.html`
