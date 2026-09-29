'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { validateGeneration, ValidationError } = require('../lib/higgsfield/validation');
const { publicCatalog } = require('../lib/higgsfield/catalog');
const auth = require('../lib/higgsfield/auth');
const { createJobToken, readJobToken } = require('../lib/higgsfield/job-token');
const catalogHandler = require('../api/higgsfield/catalog');
const loginHandler = require('../api/higgsfield/login');

function response() {
  let payload;
  return {
    res: {
      statusCode: 200,
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      end(value) { payload = JSON.parse(value); }
    },
    payload: () => payload
  };
}

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
test('normaliza a origem configurada antes de validar a requisição', () => {
  const previous = process.env.HIGGSFIELD_STUDIO_ORIGIN;
  try {
    for (const configured of ['https://azevedoacademy.com.br', 'https://azevedoacademy.com.br/', 'https://azevedoacademy.com.br/ ']) {
      process.env.HIGGSFIELD_STUDIO_ORIGIN = configured;
      assert.equal(auth.validOrigin({ headers: { origin: 'https://azevedoacademy.com.br', host: 'interno.vercel.app' } }), true);
    }
  } finally {
    if (previous === undefined) delete process.env.HIGGSFIELD_STUDIO_ORIGIN;
    else process.env.HIGGSFIELD_STUDIO_ORIGIN = previous;
  }
});
test('bloqueia origens diferentes e operação sem Origin nem Referer', () => {
  const previous = process.env.HIGGSFIELD_STUDIO_ORIGIN;
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://azevedoacademy.com.br';
  try {
    assert.equal(auth.validOrigin({ headers: { origin: 'https://www.azevedoacademy.com.br' } }), false);
    assert.equal(auth.validOrigin({ headers: { origin: 'https://dominio-malicioso.com' } }), false);
    assert.equal(auth.validOrigin({ headers: {} }), false);
    assert.equal(auth.validOrigin({ headers: { referer: 'https://azevedoacademy.com.br/higgsfield-studio/' } }), true);
  } finally {
    if (previous === undefined) delete process.env.HIGGSFIELD_STUDIO_ORIGIN;
    else process.env.HIGGSFIELD_STUDIO_ORIGIN = previous;
  }
});
test('rejeita configuração que não seja somente uma origem HTTP/HTTPS válida', () => {
  const previous = process.env.HIGGSFIELD_STUDIO_ORIGIN;
  try {
    for (const configured of [
      'not-a-url',
      'ftp://azevedoacademy.com.br',
      'https://user:password@azevedoacademy.com.br',
      'https://azevedoacademy.com.br/higgsfield-studio',
      'https://azevedoacademy.com.br/?preview=true',
      'https://azevedoacademy.com.br/#studio'
    ]) {
      process.env.HIGGSFIELD_STUDIO_ORIGIN = configured;
      assert.throws(() => auth.validOrigin({ headers: { origin: 'https://azevedoacademy.com.br' } }), { code: 'CONFIG' });
    }
  } finally {
    if (previous === undefined) delete process.env.HIGGSFIELD_STUDIO_ORIGIN;
    else process.env.HIGGSFIELD_STUDIO_ORIGIN = previous;
  }
});
test('endpoint real de login aceita a origem legítima e chega à validação da senha', async () => {
  const previousOrigin = process.env.HIGGSFIELD_STUDIO_ORIGIN;
  const previousPassword = process.env.HIGGSFIELD_STUDIO_PASSWORD;
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://azevedoacademy.com.br/';
  process.env.HIGGSFIELD_STUDIO_PASSWORD = 'correct-password';
  try {
    const req = { method: 'POST', headers: { origin: 'https://azevedoacademy.com.br' }, body: { password: 'wrong-password' }, socket: { remoteAddress: 'login-origin-test' } };
    const { res, payload } = response();
    await loginHandler(req, res);
    assert.equal(res.statusCode, 401);
    assert.equal(payload().error, 'Senha inválida.');
  } finally {
    if (previousOrigin === undefined) delete process.env.HIGGSFIELD_STUDIO_ORIGIN;
    else process.env.HIGGSFIELD_STUDIO_ORIGIN = previousOrigin;
    if (previousPassword === undefined) delete process.env.HIGGSFIELD_STUDIO_PASSWORD;
    else process.env.HIGGSFIELD_STUDIO_PASSWORD = previousPassword;
  }
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
