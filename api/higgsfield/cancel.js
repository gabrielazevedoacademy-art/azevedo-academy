'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { requireAuth, validOrigin } = require('../../lib/higgsfield/auth');
const { cancel } = require('../../lib/higgsfield/client');
const { readJobToken } = require('../../lib/higgsfield/job-token');
module.exports = handler(async (req, res) => { if (!method(req, res, ['POST']) || !requireAuth(req, res)) return; if (!validOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' }); if (!req.body?.token) return json(res, 400, { error: 'Referência de cancelamento ausente.' }); const result = await cancel(readJobToken(req.body.token, 'cancel')); const { statusUrl, cancelUrl, ...safe } = result; json(res, 200, safe); });
