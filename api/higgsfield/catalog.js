'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { requireAuth } = require('../../lib/higgsfield/auth');
const { publicCatalog } = require('../../lib/higgsfield/catalog');
module.exports = handler(async (req, res) => { if (!method(req, res, ['GET']) || !requireAuth(req, res)) return; json(res, 200, { models: publicCatalog() }); });
