'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { requireAuth, validOrigin } = require('../../lib/higgsfield/auth');
const { rateLimit } = require('../../lib/higgsfield/rate-limit');
const { validateGeneration } = require('../../lib/higgsfield/validation');
const { generate } = require('../../lib/higgsfield/client');
module.exports = handler(async (req, res) => {
  if (!method(req, res, ['POST']) || !requireAuth(req, res) || !rateLimit(req, res, { limit: 10, windowMs: 60000 })) return;
  if (!validOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });
  const { model, payload, safe } = validateGeneration(req.body);
  const result = await generate(model, payload);
  json(res, 200, { ...result, generation: { ...safe, createdAt: new Date().toISOString() } });
});
module.exports.config = { maxDuration: 300 };
