'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateGeneration, ValidationError } = require('../lib/higgsfield/validation');
const { publicCatalog } = require('../lib/higgsfield/catalog');
const auth = require('../lib/higgsfield/auth');
const { createJobToken, readJobToken } = require('../lib/higgsfield/job-token');
const catalogHandler = require('../api/higgsfield/catalog');

test('catálogo público não expõe endpoints internos', () => {
  assert.equal(publicCatalog().length, 2);
  assert.ok(publicCatalog().every((model) => !('endpoint' in model)));
});
test('valida e normaliza geração de imagem', () => {
  const result = validateGeneration({ modelId: 'soul-standard', workflow: 'text-to-image', prompt: '  retrato editorial  ', parameters: {} });
  assert.equal(result.payload.prompt, 'retrato editorial'); assert.equal(result.payload.aspect_ratio, '1:1');
});
test('bloqueia endpoint/modelo e parâmetros arbitrários', () => {
  assert.throws(() => validateGeneration({ modelId: 'https://evil.test', workflow: 'x', prompt: 'x' }), ValidationError);
  assert.throws(() => validateGeneration({ modelId: 'soul-standard', workflow: 'text-to-image', prompt: 'x', parameters: { endpoint: 'evil' } }), /não permitido/);
});
test('exige upload no workflow de vídeo', () => {
  assert.throws(() => validateGeneration({ modelId: 'dop-standard', workflow: 'image-to-video', prompt: 'x', parameters: {}, uploads: {} }), /Imagem inicial/);
});
test('sessão assinada autentica e adulteração é rejeitada', () => {
  process.env.HIGGSFIELD_STUDIO_SESSION_SECRET = 'test-secret-that-is-long-enough';
  let cookie = ''; const res = { setHeader(name, value) { if (name === 'Set-Cookie') cookie = value; } };
  auth.setSession(res); const token = cookie.match(/hf_studio_session=([^;]+)/)[1];
  assert.equal(auth.isAuthenticated({ headers: { cookie: `hf_studio_session=${token}` } }), true);
  assert.equal(auth.isAuthenticated({ headers: { cookie: `hf_studio_session=${token}x` } }), false);
});
test('referência assinada limita polling e cancelamento à URL emitida', () => {
  process.env.HIGGSFIELD_STUDIO_SESSION_SECRET = 'test-secret-that-is-long-enough';
  const token = createJobToken('https://platform.higgsfield.ai/requests/abc/status', 'status');
  assert.equal(readJobToken(token, 'status'), 'https://platform.higgsfield.ai/requests/abc/status');
  assert.throws(() => readJobToken(token, 'cancel'), /inválida/);
  assert.throws(() => createJobToken('https://evil.test/job', 'status'), /inválida/);
});
test('endpoint interno recusa visitante sem sessão', async () => {
  const req = { method: 'GET', headers: {}, socket: {} }; let payload;
  const res = { statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { payload = JSON.parse(value); } };
  await catalogHandler(req, res);
  assert.equal(res.statusCode, 401); assert.equal(payload.error, 'Acesso não autorizado.');
});
