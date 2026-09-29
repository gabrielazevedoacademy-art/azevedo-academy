'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const { validateGeneration, ValidationError } = require('../lib/higgsfield/validation');
const { publicCatalog } = require('../lib/higgsfield/catalog');
const { sanitizeResult, MODEL_PATH } = require('../lib/higgsfield/client');
const auth = require('../lib/higgsfield/auth');
const generateHandler = require('../api/higgsfield/generate');

function response() {
  let payload;
  return { res: { statusCode: 200, headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value) { payload = JSON.parse(value); } }, payload: () => payload };
}
function signedCookie() {
  let cookie;
  auth.setSession({ setHeader(name, value) { if (name === 'Set-Cookie') cookie = value.split(';')[0]; } });
  return cookie;
}
function environment(fn) {
  const previous = { ...process.env };
  process.env.HIGGSFIELD_STUDIO_SESSION_SECRET = 'test-secret-that-is-long-enough';
  process.env.HIGGSFIELD_STUDIO_ORIGIN = 'https://www.azevedoacademy.com.br';
  return Promise.resolve().then(fn).finally(() => { process.env = previous; });
}

test('expõe somente Seedance 2.5 sem revelar o caminho interno', () => {
  const models = publicCatalog();
  assert.equal(models.length, 1); assert.equal(models[0].workflow, 'text-to-video');
  assert.equal(MODEL_PATH, 'bytedance/seedance-2.5/text-to-video'); assert.equal('modelPath' in models[0], false);
});
test('aceita somente os quatro campos confirmados e aplica defaults', () => {
  const result = validateGeneration({ modelId: 'seedance-2.5-text-to-video', workflow: 'text-to-video', prompt: ' cena cinematográfica ', parameters: {} });
  assert.deepEqual(result.payload, { prompt: 'cena cinematográfica', duration: 5, resolution: '720p', aspect_ratio: '16:9' });
  assert.throws(() => validateGeneration({ modelId: 'seedance-2.5-text-to-video', workflow: 'text-to-video', prompt: 'x', parameters: { seed: 1 } }), /não permitido/);
});
test('navegador não pode alterar modelo ou workflow', () => {
  assert.throws(() => validateGeneration({ modelId: MODEL_PATH, workflow: 'text-to-video', prompt: 'x' }), ValidationError);
  assert.throws(() => validateGeneration({ modelId: 'seedance-2.5-text-to-video', workflow: 'image-to-video', prompt: 'x' }), /Workflow incompatível/);
});
test('sessão assinada autentica e adulteração é rejeitada', () => environment(() => {
  const cookie = signedCookie(); assert.equal(auth.isAuthenticated({ headers: { cookie } }), true);
  assert.equal(auth.isAuthenticated({ headers: { cookie: `${cookie}x` } }), false);
}));
test('normalização preservada aceita origem legítima e rejeita origem maliciosa', () => environment(() => {
  process.env.HIGGSFIELD_STUDIO_ORIGIN = ' https://www.azevedoacademy.com.br/ ';
  assert.equal(auth.validOrigin({ headers: { origin: 'https://www.azevedoacademy.com.br' } }), true);
  assert.equal(auth.validOrigin({ headers: { referer: 'https://www.azevedoacademy.com.br/higgsfield-studio/' } }), true);
  assert.equal(auth.validOrigin({ headers: { origin: 'https://www.azevedoacademy.com.br.evil.test' } }), false);
  assert.equal(auth.validOrigin({ headers: {} }), false);
}));
test('endpoint de geração exige autenticação', async () => environment(async () => {
  const { res, payload } = response();
  await generateHandler({ method: 'POST', headers: { origin: 'https://www.azevedoacademy.com.br' }, body: {}, socket: { remoteAddress: 'unauth' } }, res);
  assert.equal(res.statusCode, 401); assert.equal(payload().error, 'Acesso não autorizado.');
}));
test('endpoint aceita origem legítima e rejeita a maliciosa antes do SDK', async () => environment(async () => {
  const cookie = signedCookie();
  let reply = response();
  await generateHandler({ method: 'POST', headers: { cookie, origin: 'https://www.azevedoacademy.com.br' }, body: {}, socket: { remoteAddress: 'good-origin' } }, reply.res);
  assert.equal(reply.res.statusCode, 400);
  reply = response();
  await generateHandler({ method: 'POST', headers: { cookie, origin: 'https://evil.test' }, body: {}, socket: { remoteAddress: 'bad-origin' } }, reply.res);
  assert.equal(reply.res.statusCode, 403);
}));
test('normaliza estados de cancelamento e moderação retornados pelo SDK', () => {
  assert.equal(sanitizeResult({ data: { status: 'cancelled' } }).status, 'canceled');
  assert.equal(sanitizeResult({ data: { status: 'content_policy_violation' } }).status, 'moderated');
});
test('frontend não contém credenciais e backend usa o cliente V2 oficial com polling', () => {
  const client = fs.readFileSync('lib/higgsfield/client.js', 'utf8');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  for (const file of ['higgsfield-studio/index.html', 'assets/js/higgsfield-studio.js', 'assets/css/higgsfield-studio.css']) assert.doesNotMatch(fs.readFileSync(file, 'utf8'), /HF_CREDENTIALS/);
  assert.match(client, /require\('@higgsfield\/client\/v2'\)/);
  assert.match(client, /createHiggsfieldClient\(\{ credentials: credentials\(\) \}\)/);
  assert.match(client, /\.subscribe\(MODEL_PATH, \{ input, withPolling: true \}\)/);
  assert.doesNotMatch(client, /require\('@higgsfield\/client'\)|\{\s*hf\s*\}|hf\.config/);
  assert.equal(pkg.dependencies['@higgsfield/client'], '0.2.6');
  assert.doesNotMatch(client, /HIGGSFIELD_API_(KEY|SECRET)|hf-api-key|hf-secret/);
});
test('/biblioteca-de-prompts/ permanece idêntica ao início da alteração', () => {
  const result = require('node:child_process').spawnSync('git', ['diff', '--quiet', 'HEAD', '--', 'biblioteca-de-prompts/']);
  assert.equal(result.status, 0);
});
