'use strict';
const { handler, json, method } = require('../../lib/higgsfield/http');
const { requireAuth, validOrigin } = require('../../lib/higgsfield/auth');
const { rateLimit } = require('../../lib/higgsfield/rate-limit');
const { catalog } = require('../../lib/higgsfield/catalog');
const { upload } = require('../../lib/higgsfield/client');

async function read(req, max) { if (Buffer.isBuffer(req.body)) { if (req.body.length > max) throw Object.assign(new Error('Arquivo excede o limite permitido.'), { statusCode: 413 }); return req.body; } const chunks = []; let size = 0; for await (const chunk of req) { size += chunk.length; if (size > max) throw Object.assign(new Error('Arquivo excede o limite permitido.'), { statusCode: 413 }); chunks.push(chunk); } return Buffer.concat(chunks); }
module.exports = handler(async (req, res) => {
  if (!method(req, res, ['POST']) || !requireAuth(req, res) || !rateLimit(req, res, { limit: 10, windowMs: 60000 })) return;
  if (!validOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });
  const model = catalog[req.query?.modelId]; const rule = model?.uploads.find((item) => item.name === req.query?.field);
  if (!rule) return json(res, 400, { error: 'Upload não permitido.' });
  const type = String(req.headers['content-type'] || '').split(';')[0];
  if (!rule.accept.includes(type)) return json(res, 415, { error: 'Tipo de arquivo incompatível.' });
  const buffer = await read(req, rule.maxBytes);
  if (!buffer.length) return json(res, 400, { error: 'Arquivo vazio.' });
  const name = String(req.headers['x-file-name'] || 'upload').replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 100);
  const result = await upload(new File([buffer], name, { type }));
  json(res, 201, result);
});
