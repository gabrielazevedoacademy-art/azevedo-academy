'use strict';

const { handler, json, method } = require('../../lib/higgsfield/http');
const { requireAuth, validOrigin } = require('../../lib/higgsfield/auth');
const { rateLimit } = require('../../lib/higgsfield/rate-limit');

const ALLOWED_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'video/mp4', 'video/quicktime', 'video/webm',
  'audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/ogg'
]);

const LIMITS = {
  image: 25 * 1024 * 1024,
  video: 250 * 1024 * 1024,
  audio: 50 * 1024 * 1024
};

function credentials() {
  const value = process.env.HF_CREDENTIALS;
  if (!value) {
    const error = new Error('A integração Higgsfield ainda não foi configurada.');
    error.code = 'CONFIG';
    throw error;
  }
  return value;
}

function kindFromType(type) {
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  if (type.startsWith('audio/')) return 'audio';
  return null;
}

function safeHttps(value) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

module.exports = handler(async (req, res) => {
  if (!method(req, res, ['POST']) || !requireAuth(req, res) || !rateLimit(req, res, { limit: 30, windowMs: 60000 })) return;
  if (!validOrigin(req)) return json(res, 403, { error: 'Origem não permitida.' });

  const contentType = String(req.body?.contentType || '').toLowerCase();
  const size = Number(req.body?.size || 0);
  const kind = kindFromType(contentType);

  if (!ALLOWED_TYPES.has(contentType) || !kind) return json(res, 415, { error: 'Tipo de arquivo não permitido.' });
  if (!Number.isFinite(size) || size <= 0 || size > LIMITS[kind]) return json(res, 413, { error: 'Arquivo excede o limite permitido.' });

  const response = await fetch('https://api.higgsfield.ai/files/generate-upload-url', {
    method: 'POST',
    headers: {
      Authorization: 'Key ' + credentials(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content_type: contentType })
  });

  if (!response.ok) {
    const error = new Error('Não foi possível preparar o upload.');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const uploadUrl = safeHttps(data.upload_url);
  const publicUrl = safeHttps(data.public_url);
  if (!uploadUrl || !publicUrl) {
    const error = new Error('Resposta de upload inválida.');
    error.statusCode = 502;
    throw error;
  }

  const uploadHeaders = {};
  const sourceHeaders = data.upload_headers && typeof data.upload_headers === 'object' ? data.upload_headers : {};
  for (const [name, value] of Object.entries(sourceHeaders)) {
    if (/^(content-type|content-md5|x-amz-[a-z0-9-]+)$/i.test(name) && typeof value === 'string') uploadHeaders[name] = value;
  }
  if (!Object.keys(uploadHeaders).some((name) => name.toLowerCase() === 'content-type')) uploadHeaders['Content-Type'] = contentType;

  json(res, 200, { uploadUrl, publicUrl, headers: uploadHeaders });
});
