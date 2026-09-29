'use strict';

const crypto = require('node:crypto');
const COOKIE = 'hf_studio_session';
const MAX_AGE = 8 * 60 * 60;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) { const error = new Error(`Configuração ausente: ${name}`); error.code = 'CONFIG'; throw error; }
  return value;
}
function equal(a, b) {
  const left = Buffer.from(String(a)); const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function signature(value) { return crypto.createHmac('sha256', requiredEnv('HIGGSFIELD_STUDIO_SESSION_SECRET')).update(value).digest('base64url'); }
function issueSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + MAX_AGE })).toString('base64url');
  return `${payload}.${signature(payload)}`;
}
function cookieValue(req) {
  const cookies = Object.fromEntries(String(req.headers.cookie || '').split(';').map((part) => part.trim().split(/=(.*)/s).slice(0, 2)));
  return cookies[COOKIE];
}
function isAuthenticated(req) {
  try {
    const [payload, sig] = String(cookieValue(req) || '').split('.');
    if (!payload || !sig || !equal(signature(payload), sig)) return false;
    return JSON.parse(Buffer.from(payload, 'base64url')).exp > Date.now() / 1000;
  } catch { return false; }
}
function setSession(res) { res.setHeader('Set-Cookie', `${COOKIE}=${issueSession()}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${MAX_AGE}`); }
function clearSession(res) { res.setHeader('Set-Cookie', `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`); }
function requireAuth(req, res) { if (isAuthenticated(req)) return true; res.statusCode = 401; res.json({ error: 'Acesso não autorizado.' }); return false; }
function validPassword(password) { return equal(password || '', requiredEnv('HIGGSFIELD_STUDIO_PASSWORD')); }
function parseHttpUrl(value) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error('URL inválida.');
  return url;
}
function configuredOrigin() {
  const value = process.env.HIGGSFIELD_STUDIO_ORIGIN;
  if (!value) return null;

  try {
    const normalized = value.trim();
    const url = parseHttpUrl(normalized);
    if (url.pathname !== '/' || url.search || url.hash) throw new Error('Origem inválida.');
    return url.origin;
  } catch {
    const error = new Error('Configuração inválida: HIGGSFIELD_STUDIO_ORIGIN deve conter somente uma origem HTTP/HTTPS.');
    error.code = 'CONFIG';
    throw error;
  }
}
function requestOrigin(req) {
  const origin = req.headers.origin;
  const source = origin || req.headers.referer;
  if (!source || Array.isArray(source)) return null;
  try { return parseHttpUrl(source).origin; } catch { return null; }
}
function validOrigin(req) {
  const received = requestOrigin(req);
  if (!received) return false;
  const expected = configuredOrigin();
  if (expected) return received === expected;

  try { return received === parseHttpUrl(`https://${req.headers.host}`).origin; } catch { return false; }
}

module.exports = { clearSession, isAuthenticated, requireAuth, setSession, validOrigin, validPassword };
