'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { clearSession, validOrigin } = require('../../lib/higgsfield/auth');
module.exports = handler(async (req, res) => { if (!method(req, res, ['POST'])) return; if (!validOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' }); clearSession(res); json(res, 200, { authenticated: false }); });
