'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateGeneration, ValidationError } = require('../lib/higgsfield/validation');
const { publicCatalog } = require('../lib/higgsfield/catalog');
const auth = require('../lib/higgsfield/auth');
const { generate } = require('../lib/higgsfield/client');
const catalogHandler = require('../api/higgsfield/catalog');

test('catálogo público não expõe endpoints internos', () => {
  assert.equal(publicCatalog().length, 1);
  assert.ok(publicCatalog().every((model) => !('modelPath' in model)));
});
test('valida e normaliza Seedance 2.5 texto para vídeo', () => {
  const result = validateGeneration({ modelId: 'seedance-2.5-text-to-video', workflow: 'text-to-video', prompt: '  cena cinematográfica  ', parameters: {} });
  assert.deepEqual(result.payload, { prompt: 'cena cinematográfica' });
});
test('bloqueia endpoint/modelo e parâmetros arbitrários', () => {
  assert.throws(() => validateGeneration({ modelId: 'https://evil.test', workflow: 'x', prompt: 'x' }), ValidationError);
  assert.throws(() => validateGeneration({ modelId: 'seedance-2.5-text-to-video', workflow: 'text-to-video', prompt: 'x', parameters: { endpoint: 'evil' } }), /não permitido/);
});
test('usa subscribe do SDK oficial sem transformar a credencial', async () => {
  let call;
  const sdk = { async subscribe(path, options) { call = { path, options }; return { requestId: 'req-1', data: { video: { url: 'https://cdn.example/video.mp4' } } }; } };
  const model = require('../lib/higgsfield/catalog').catalog['seedance-2.5-text-to-video'];
  const result = await generate(model, { prompt: 'teste' }, sdk);
  assert.deepEqual(call, { path: 'bytedance/seedance-2.5/text-to-video', options: { input: { prompt: 'teste' } } });
  assert.equal(result.status, 'completed'); assert.equal(result.results[0].url, 'https://cdn.example/video.mp4');
});
test('sessão assinada autentica e adulteração é rejeitada', () => {
  process.env.HIGGSFIELD_STUDIO_SESSION_SECRET = 'test-secret-that-is-long-enough';
  let cookie = ''; const res = { setHeader(name, value) { if (name === 'Set-Cookie') cookie = value; } };
  auth.setSession(res); const token = cookie.match(/hf_studio_session=([^;]+)/)[1];
  assert.equal(auth.isAuthenticated({ headers: { cookie: `hf_studio_session=${token}` } }), true);
  assert.equal(auth.isAuthenticated({ headers: { cookie: `hf_studio_session=${token}x` } }), false);
});
test('endpoint interno recusa visitante sem sessão', async () => {
  const req = { method: 'GET', headers: {}, socket: {} }; let payload;
  const res = { statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { payload = JSON.parse(value); } };
  await catalogHandler(req, res);
  assert.equal(res.statusCode, 401); assert.equal(payload.error, 'Acesso não autorizado.');
});
