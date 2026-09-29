'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { requireAuth, validOrigin } = require('../../lib/higgsfield/auth');
const { rateLimit } = require('../../lib/higgsfield/rate-limit');
const { validateGeneration } = require('../../lib/higgsfield/validation');
const { generate } = require('../../lib/higgsfield/client');
const { createJobToken } = require('../../lib/higgsfield/job-token');
module.exports = handler(async (req, res) => {
  if (!method(req, res, ['POST']) || !requireAuth(req, res) || !rateLimit(req, res, { limit: 10, windowMs: 60000 })) return;
  if (!validOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });
  const { model, payload, safe } = validateGeneration(req.body);
  const result = await generate(model, payload);
  const { statusUrl, cancelUrl, ...publicResult } = result;
  json(res, 202, { ...publicResult, statusToken: statusUrl ? createJobToken(statusUrl, 'status') : undefined, cancelToken: cancelUrl ? createJobToken(cancelUrl, 'cancel') : undefined, generation: { ...safe, createdAt: new Date().toISOString() } });
});
