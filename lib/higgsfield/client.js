'use strict';
const BASE = 'https://platform.higgsfield.ai';

function credentials() {
  const key = process.env.HIGGSFIELD_API_KEY; const secret = process.env.HIGGSFIELD_API_SECRET;
  if (!key || !secret) { const error = new Error('A integração Higgsfield ainda não foi configurada.'); error.code = 'CONFIG'; throw error; }
  return { 'hf-api-key': key, 'hf-secret': secret };
}
async function request(url, init = {}) {
  const response = await fetch(url.startsWith('https://') ? url : `${BASE}${url}`, { ...init, headers: { ...credentials(), ...(init.headers || {}) }, signal: AbortSignal.timeout(30000) });
  const text = await response.text(); let data = {}; try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text.slice(0, 300) }; }
  if (!response.ok) { const error = new Error(safeError(response.status, data)); error.statusCode = response.status >= 500 ? 502 : response.status; throw error; }
  return data;
}
function safeError(status, data) {
  if (status === 401 || status === 403) return 'A Higgsfield recusou as credenciais configuradas.';
  if (status === 402) return 'Créditos Higgsfield insuficientes.';
  if (status === 429) return 'Limite de requisições da Higgsfield excedido.';
  const message = typeof data?.message === 'string' ? data.message : typeof data?.detail === 'string' ? data.detail : '';
  return message ? `A Higgsfield recusou a solicitação: ${message.slice(0, 240)}` : status >= 500 ? 'A Higgsfield está temporariamente indisponível.' : 'A Higgsfield recusou a solicitação.';
}
function sanitizeJob(data) {
  const results = Array.isArray(data?.results) ? data.results : Array.isArray(data?.output) ? data.output : [];
  return {
    requestId: data?.request_id || data?.id,
    status: data?.status,
    statusUrl: data?.status_url,
    cancelUrl: data?.cancel_url,
    results: results.map((item) => typeof item === 'string' ? { url: item } : { url: item.url, type: item.type }).filter((item) => typeof item.url === 'string' && item.url.startsWith('https://')),
    error: typeof data?.error === 'string' ? data.error.slice(0, 300) : undefined
  };
}
async function generate(model, payload) { return sanitizeJob(await request(model.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })); }
async function job(url) { ensurePlatformUrl(url); return sanitizeJob(await request(url)); }
async function cancel(url) { ensurePlatformUrl(url); return sanitizeJob(await request(url, { method: 'POST' })); }
function ensurePlatformUrl(value) { const url = new URL(value); if (url.origin !== BASE) throw Object.assign(new Error('URL de job inválida.'), { statusCode: 400 }); }
async function upload(file) {
  const form = new FormData(); form.append('file', file, file.name);
  const data = await request('/files/upload', { method: 'POST', body: form });
  const url = data.url || data.file_url;
  if (typeof url !== 'string' || !url.startsWith('https://')) throw Object.assign(new Error('Resposta de upload inválida.'), { statusCode: 502 });
  return { url };
}
module.exports = { cancel, generate, job, upload };
