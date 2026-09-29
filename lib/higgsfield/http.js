'use strict';
function json(res, status, body) { res.statusCode = status; res.setHeader('Content-Type', 'application/json; charset=utf-8'); res.setHeader('Cache-Control', 'no-store'); res.end(JSON.stringify(body)); }
function method(req, res, allowed) { if (allowed.includes(req.method)) return true; res.setHeader('Allow', allowed.join(', ')); json(res, 405, { error: 'Método não permitido.' }); return false; }
function handler(fn) {
  return async (req, res) => {
    res.json = (body) => json(res, res.statusCode || 200, body);
    try { await fn(req, res); }
    catch (error) { const status = Number(error.statusCode) || (error.code === 'CONFIG' ? 503 : 500); if (status >= 500) console.error('[higgsfield]', error.code || error.name, error.message); json(res, status, { error: status >= 500 && error.code !== 'CONFIG' ? 'Não foi possível concluir a operação.' : error.message }); }
  };
}
module.exports = { handler, json, method };
