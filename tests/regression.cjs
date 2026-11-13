/*
  Testes de regressão: cada bug corrigido ganha um teste aqui para não voltar.
  Uso: npm run build && npm run test:regression
  Requer o pacote "playwright" (global ou instalado) com o Chromium.
*/
const { spawn } = require('node:child_process');
const { chromium } = require('playwright');

const PORT = 3210;
const BASE = `http://localhost:${PORT}`;

// Turnstile falso: entrega um código depois de `__captchaDelay` ms (padrão 300).
// Com `__captchaFail` = n, as n primeiras tentativas dão erro (simula Cloudflare falhando).
const FAKE_TURNSTILE = `window.turnstile = {
  render(el, o) {
    this._go = () => setTimeout(() => {
      if ((window.__captchaFail || 0) > 0) { window.__captchaFail--; o['error-callback'] && o['error-callback'](); }
      else o.callback('teste-' + 'x'.repeat(40));
    }, window.__captchaDelay ?? 300);
    this._go(); return 'w1';
  },
  reset() { this._go && this._go(); },
  remove() {}
};`;

const tests = [];
const test = (name, fn) => tests.push({ name, fn });

async function newPage(browser, delay, fail = 0) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  await page.route('**/turnstile/v0/api.js*', (r) => r.fulfill({ contentType: 'text/javascript', body: FAKE_TURNSTILE }));
  await page.addInitScript(([d, f]) => { if (d !== null) window.__captchaDelay = d; window.__captchaFail = f; }, [delay ?? null, fail]);
  return page;
}

/* ---------- Testes ---------- */

test('Páginas principais abrem (200)', async (browser) => {
  const page = await newPage(browser);
  for (const path of ['/', '/entrar', '/cadastro', '/recuperar-senha', '/privacidade', '/termos']) {
    const res = await page.goto(BASE + path);
    if (res.status() !== 200) throw new Error(`${path} respondeu ${res.status()}`);
  }
});

// Bug 12/11/2026: depois do login (navegação sem recarregar), o hero aparecia encolhido e escuro
test('Hero inteiro ao chegar na página inicial vindo do login', async (browser) => {
  const page = await newPage(browser);
  await page.goto(BASE + '/entrar', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.next.router.push('/'));
  await page.waitForURL(BASE + '/');
  await page.waitForTimeout(1500);
  const cover = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--cover').trim());
  if (cover && Number(cover) !== 0) throw new Error(`--cover = ${cover} (esperado 0)`);
});

// Bug 12/11/2026: botão ficava travado em "Verificando segurança…" enquanto o Turnstile demorava
test('Botão de entrar não trava esperando a verificação anti-robô', async (browser) => {
  const page = await newPage(browser, 2500);
  await page.goto(BASE + '/entrar');
  const btn = page.locator('form.auth-form button[type="submit"]');
  if (await btn.isDisabled()) throw new Error('botão começou travado');
  await page.fill('#email', 'teste@exemplo.com');
  await page.fill('#password', 'senha12345');
  const posted = page.waitForRequest((r) => r.method() === 'POST' && r.url().includes('/entrar'), { timeout: 8000 });
  await btn.click();
  await page.waitForFunction(() => document.querySelector('form.auth-form button[type="submit"]').textContent.includes('Verificando'), null, { timeout: 2000 });
  await posted; // enviou sozinho quando o código chegou
});

// Bug 12/11/2026: a verificação da Cloudflare falhava/expirava em silêncio e o login ficava preso para sempre
test('Login continua sozinho quando a verificação falha na primeira tentativa', async (browser) => {
  const page = await newPage(browser, 400, 2);
  await page.goto(BASE + '/entrar');
  await page.fill('#email', 'teste@exemplo.com');
  await page.fill('#password', 'senha12345');
  const posted = page.waitForRequest((r) => r.method() === 'POST' && r.url().includes('/entrar'), { timeout: 10000 });
  await page.locator('form.auth-form button[type="submit"]').click();
  await posted;
});

// Bug 12/11/2026: no painel, o título "Conteúdo" usava id="conteudo" e herdava o bloco preto da página inicial
test('id="conteudo" só existe na página inicial', async () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const hits = [];
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.tsx$/.test(f.name) && /id=["']conteudo["']/.test(fs.readFileSync(p, 'utf8'))) hits.push(p);
    }
  };
  ['app', 'components'].forEach((d) => walk(path.join(__dirname, '..', d)));
  const extra = hits.filter((p) => !p.endsWith(path.join('app', 'page.tsx')));
  if (extra.length) throw new Error('também em: ' + extra.join(', '));
});

test('Página do curso pede login antes de mostrar as aulas', async (browser) => {
  const page = await newPage(browser);
  await page.goto(BASE + '/cursos/aulas-no-youtube');
  if (!page.url().includes('/entrar?next=%2Fcursos%2Faulas-no-youtube')) throw new Error('não levou ao login: ' + page.url());
});

/* ---------- Execução ---------- */

async function waitServer() {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE + '/termos')).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error('servidor não subiu (rodou npm run build?)');
}

(async () => {
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], { stdio: 'ignore', detached: true });
  let failed = 0;
  try {
    await waitServer();
    const browser = await chromium.launch();
    for (const t of tests) {
      try { await t.fn(browser); console.log(`✓ ${t.name}`); }
      catch (e) { failed++; console.log(`✗ ${t.name}\n    ${e.message.split('\n')[0]}`); }
    }
    await browser.close();
  } finally {
    try { process.kill(-server.pid); } catch {}
  }
  console.log(failed ? `\n${failed} teste(s) falharam` : `\nTodos os ${tests.length} testes passaram`);
  process.exit(failed ? 1 : 0);
})();
