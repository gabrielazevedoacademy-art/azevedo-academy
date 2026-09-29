'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { setSession, validOrigin, validPassword } = require('../../lib/higgsfield/auth');
const { rateLimit } = require('../../lib/higgsfield/rate-limit');
module.exports = handler(async (req, res) => {
  if (!method(req, res, ['POST']) || !rateLimit(req, res, { limit: 5, windowMs: 15 * 60 * 1000 })) return;
  if (!validOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });
  if (!validPassword(req.body?.password)) return json(res, 401, { error: 'Senha inválida.' });
  setSession(res); json(res, 200, { authenticated: true });
});
