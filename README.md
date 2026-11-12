# Azevedo Academy

Site e plataforma da Azevedo Academy (azevedoacademy.com.br), feito em Next.js e publicado pela Vercel a cada envio para a branch `main`.

## Rodar localmente

```bash
npm install
npm run dev
```

## Adicionar cursos e ferramentas

Edite `lib/catalog.ts` e inclua um item em `courses` ou `tools`:

```ts
{ title: 'Nome do curso', href: '/cursos/nome', description: 'Uma frase curta.', image: '/capas/nome.webp', badge: 'Gratuito' }
```

O grid mostra até 3 linhas (12 itens no computador, 9 no tablet, 6 no celular) e exibe o botão "Ver mais" quando há mais itens.
