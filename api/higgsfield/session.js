'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { isAuthenticated } = require('../../lib/higgsfield/auth');
module.exports = handler(async (req, res) => { if (!method(req, res, ['GET'])) return; json(res, 200, { authenticated: isAuthenticated(req) }); });
