'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateGeneration, ValidationError } = require('../lib/higgsfield/validation');
const { publicCatalog } = require('../lib/higgsfield/catalog');
const auth = require('../lib/higgsfield/auth');
const { generate } = require('../lib/higgsfield/client');
const catalogHandler = require('../api/higgsfield/catalog');
const loginHandler = require('../api/higgsfield/login');

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
test('aceita a origem de produção configurada', () => {
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://azevedoacademy.com.br';
  assert.equal(auth.validOrigin({ headers: { origin: 'https://azevedoacademy.com.br', host: 'deployment.vercel.app', 'x-forwarded-host': 'internal.vercel.app', 'x-forwarded-proto': 'https' } }), true);
});
test('login de produção passa pela origem e chega à validação de senha', async () => {
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://azevedoacademy.com.br';
  process.env.HIGGSFIELD_STUDIO_PASSWORD = 'correct-password';
  const req = { method: 'POST', headers: { origin: 'https://azevedoacademy.com.br' }, body: { password: 'wrong-password' }, socket: { remoteAddress: 'test-origin' } };
  let payload; const res = { statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { payload = JSON.parse(value); } };
  await loginHandler(req, res);
  assert.equal(res.statusCode, 401); assert.equal(payload.error, 'Senha inválida.');
});
test('normaliza whitespace e barra final apenas na origem configurada', () => {
  process.env.HIGGSFIELD_STUDIO_ORIGIN = '  https://azevedoacademy.com.br/  ';
  assert.equal(auth.validOrigin({ headers: { origin: 'https://azevedoacademy.com.br' } }), true);
});
test('bloqueia www não configurado e domínios maliciosos', () => {
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://azevedoacademy.com.br';
  assert.equal(auth.validOrigin({ headers: { origin: 'https://www.azevedoacademy.com.br' } }), false);
  assert.equal(auth.validOrigin({ headers: { origin: 'https://dominio-malicioso.com' } }), false);
});
test('bloqueia origem ausente ou configuração com pathname', () => {
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://azevedoacademy.com.br';
  assert.equal(auth.validOrigin({ headers: {} }), false);
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://azevedoacademy.com.br/higgsfield-studio/';
  assert.equal(auth.validOrigin({ headers: { origin: 'https://azevedoacademy.com.br' } }), false);
});
test('endpoint interno recusa visitante sem sessão', async () => {
  const req = { method: 'GET', headers: {}, socket: {} }; let payload;
  const res = { statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { payload = JSON.parse(value); } };
  await catalogHandler(req, res);
  assert.equal(res.statusCode, 401); assert.equal(payload.error, 'Acesso não autorizado.');
});
