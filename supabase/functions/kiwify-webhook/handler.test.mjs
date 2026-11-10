// node --experimental-strip-types supabase/functions/kiwify-webhook/handler.test.mjs
import assert from 'node:assert/strict';
import { handle, hmacSha1Hex } from './handler.ts';

// Vetor oficial da documentação da Kiwify
const body = '{"order_id":"9b1c2d3e-0000-4000-8000-000000000001","order_status":"paid","webhook_event_type":"order_approved"}';
assert.equal(await hmacSha1Hex('kiwify-token-de-teste', body), 'bf18f352a4f981b91dfa3f6d8742a81080ab8c86');

const calls = [];
const db = {
  findCourseByProduct: async (p) => (p === 'PROD1' ? { id: 'course-1' } : null),
  upsertPurchase: async (r) => calls.push(['purchase', r.status, r.email, r.course_id]),
  findProfileByEmail: async (e) => (e === 'aluno@x.com' ? { id: 'user-1' } : null),
  grant: async (u, c) => calls.push(['grant', u, c]),
  revokeIfNoOtherPaid: async (u, c) => calls.push(['revoke', u, c])
};
const token = 'tok';
const send = async (payload, sig) => {
  const b = JSON.stringify(payload);
  return handle({ body: b, signature: sig ?? (await hmacSha1Hex(token, b)), token }, db);
};
const order = (status, email = 'Aluno@X.com') => ({ order_id: 'O1', order_status: status, webhook_event_type: 'x', Product: { product_id: 'PROD1' }, Customer: { email, full_name: 'Aluno' } });

assert.equal((await send(order('paid'), 'deadbeef')).status, 401, 'assinatura errada é recusada');
assert.equal((await handle({ body: '{}', signature: null, token }, db)).status, 401, 'sem assinatura é recusada');
assert.equal((await send(order('paid'))).body, 'granted');
assert.deepEqual(calls.at(-1), ['grant', 'user-1', 'course-1']);
assert.deepEqual(calls.at(-2), ['purchase', 'paid', 'aluno@x.com', 'course-1'], 'e-mail normalizado');
assert.equal((await send(order('refunded'))).body, 'revoked');
assert.equal((await send(order('chargedback'))).body, 'revoked');
assert.equal((await send(order('paid', 'novo@x.com'))).body, 'recorded; access on signup');
assert.equal((await send(order('waiting_payment'))).body, 'recorded');
assert.equal((await send({ ...order('paid'), Product: { product_id: 'OUTRO' } })).body, 'recorded');
assert.equal((await send({ checkout_link: 'abc' })).body, 'ignored', 'carrinho abandonado');
console.log('webhook: todos os testes passaram');
