'use strict';
const crypto = require('node:crypto');
const BASE = 'https://platform.higgsfield.ai';
function secret() { const value = process.env.HIGGSFIELD_STUDIO_SESSION_SECRET; if (!value) throw Object.assign(new Error('Configuração ausente: HIGGSFIELD_STUDIO_SESSION_SECRET'), { code: 'CONFIG' }); return value; }
function sign(value) { return crypto.createHmac('sha256', secret()).update(value).digest('base64url'); }
function createJobToken(url, action) {
  const parsed = new URL(url); if (parsed.origin !== BASE) throw Object.assign(new Error('URL de job inválida.'), { statusCode: 502 });
  const payload = Buffer.from(JSON.stringify({ url, action, exp: Math.floor(Date.now() / 1000) + 86400 })).toString('base64url');
  return `${payload}.${sign(payload)}`;
}
function readJobToken(token, action) {
  try {
    const [payload, provided] = String(token || '').split('.'); const expected = sign(payload);
    const a = Buffer.from(provided || ''); const b = Buffer.from(expected);
    if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) throw new Error();
    const value = JSON.parse(Buffer.from(payload, 'base64url'));
    if (value.action !== action || value.exp < Date.now() / 1000 || new URL(value.url).origin !== BASE) throw new Error();
    return value.url;
  } catch { throw Object.assign(new Error('Referência de job inválida ou expirada.'), { statusCode: 400 }); }
}
module.exports = { createJobToken, readJobToken };
