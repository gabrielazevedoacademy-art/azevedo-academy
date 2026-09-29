'use strict';

const MODEL_PATH = 'bytedance/seedance-2.5/text-to-video';

function credentials() {
  const value = process.env.HF_CREDENTIALS;
  if (!value) {
    const error = new Error('A integração Higgsfield ainda não foi configurada.');
    error.code = 'CONFIG';
    throw error;
  }
  return value;
}

function sdk() {
  // O cliente V2 é carregado apenas no backend. A credencial completa é
  // entregue diretamente ao SDK e nunca integra uma resposta ao navegador.
  const { createHiggsfieldClient } = require('@higgsfield/client/v2');
  return createHiggsfieldClient({ credentials: credentials() });
}

function safeUrl(value) {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.href : null;
  } catch { return null; }
}

function sanitizeResult(result) {
  const data = result?.data || result || {};
  const candidates = [data.video, data.video_url, data.url, ...(Array.isArray(data.videos) ? data.videos : []), ...(Array.isArray(data.output) ? data.output : []), ...(Array.isArray(data.results) ? data.results : [])];
  const results = candidates.map((item) => safeUrl(typeof item === 'string' ? item : item?.url || item?.video_url)).filter(Boolean).map((url) => ({ url, type: 'video' }));
  const rawStatus = String(data.status || result?.status || (results.length ? 'completed' : 'failed')).toLowerCase();
  const status = ['cancelled', 'canceled'].includes(rawStatus) ? 'canceled' : ['nsfw', 'moderated', 'blocked', 'content_policy_violation'].includes(rawStatus) ? 'moderated' : rawStatus;
  return {
    requestId: result?.requestId || result?.request_id || data.requestId || data.request_id,
    status,
    results,
    error: typeof data.error === 'string' ? data.error.slice(0, 300) : undefined
  };
}

async function generate(input) {
  const result = await sdk().subscribe(MODEL_PATH, { input, withPolling: true });
  return sanitizeResult(result);
}

module.exports = { generate, MODEL_PATH, sanitizeResult };
