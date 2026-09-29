'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { requireAuth } = require('../../lib/higgsfield/auth');
const { rateLimit } = require('../../lib/higgsfield/rate-limit');
const { job } = require('../../lib/higgsfield/client');
const { readJobToken } = require('../../lib/higgsfield/job-token');
module.exports = handler(async (req, res) => { if (!method(req, res, ['GET']) || !requireAuth(req, res) || !rateLimit(req, res, { limit: 40, windowMs: 60000 })) return; if (!req.query?.token) return json(res, 400, { error: 'Referência de status ausente.' }); const result = await job(readJobToken(req.query.token, 'status')); const { statusUrl, cancelUrl, ...safe } = result; json(res, 200, safe); });
