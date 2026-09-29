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

function normalizeOrigin(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value.trim());
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) return null;
    // Uma origem não possui caminho, query ou fragmento. Aceitamos somente a
    // barra final implícita de URL para não transformar uma URL ampla em origem.
    if (url.pathname !== '/' || url.search || url.hash) return null;
    return url.origin;
  } catch { return null; }
}

function forwardedOrigin(req) {
  const first = (value) => String(value || '').split(',')[0].trim();
  const protocol = first(req.headers['x-forwarded-proto']) || 'https';
  const host = first(req.headers['x-forwarded-host']) || first(req.headers.host);
  return host ? normalizeOrigin(`${protocol}://${host}`) : null;
}

function validOrigin(req) {
  const configured = process.env.HIGGSFIELD_STUDIO_ORIGIN;
  const allowed = configured ? normalizeOrigin(configured) : forwardedOrigin(req);
  if (!allowed) return false;

  // Na Vercel, Host/X-Forwarded-Host podem representar camadas internas ou o
  // domínio do deployment. Quando o browser envia Origin, ele é a fonte certa.
  let origin = null;
  if (req.headers.origin) origin = normalizeOrigin(req.headers.origin);
  else if (req.headers.referer) {
    try { origin = normalizeOrigin(new URL(req.headers.referer.trim()).origin); } catch { origin = null; }
  }
  return origin === allowed;
}

module.exports = { clearSession, isAuthenticated, normalizeOrigin, requireAuth, setSession, validOrigin, validPassword };
