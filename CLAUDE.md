# Azevedo Academy

Plataforma de cursos (Next.js 16 App Router + Supabase `kygnexqmkbjrmzywvcvd` + Vercel). Push em `main` publica em azevedoacademy.com.br.
Textos do site em português do Brasil. Nunca colocar chaves secretas no código.

## Regra de regressão (obrigatória)

1. Ao corrigir um bug, adicione um teste em `tests/regression.cjs` que falharia sem a correção (comente data e sintoma).
2. Antes de todo push: `npm run build && npm run test:regression`. Só publique com todos passando.
3. Nunca apague ou afrouxe um teste existente para fazê-lo passar; corrija o código.

## Pontos sensíveis

- Admin: `is_admin()` no banco exige sessão com 2 etapas (aal2); `is_admin_account()` só identifica a conta.
- Turnstile: formulários de login/cadastro/senha usam `useCaptchaGate` (botão nunca trava).
- `ScrollController` só existe na página inicial (`app/page.tsx`).
