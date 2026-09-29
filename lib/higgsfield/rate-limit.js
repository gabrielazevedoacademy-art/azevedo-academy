'use strict';
const buckets = new Map();
function rateLimit(req, res, { limit = 20, windowMs = 60000 } = {}) {
  const key = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  const now = Date.now(); const current = buckets.get(key);
  const bucket = !current || current.reset < now ? { count: 1, reset: now + windowMs } : { ...current, count: current.count + 1 };
  buckets.set(key, bucket);
  if (buckets.size > 1000) for (const [id, item] of buckets) if (item.reset < now) buckets.delete(id);
  res.setHeader('X-RateLimit-Remaining', String(Math.max(0, limit - bucket.count)));
  if (bucket.count <= limit) return true;
  res.statusCode = 429; res.setHeader('Retry-After', String(Math.ceil((bucket.reset - now) / 1000))); res.json({ error: 'Muitas tentativas. Aguarde antes de tentar novamente.' }); return false;
}
module.exports = { rateLimit };
