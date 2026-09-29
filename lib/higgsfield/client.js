'use strict';

function createClient() {
  if (!process.env.HF_CREDENTIALS) {
    const error = new Error('A integração Higgsfield ainda não foi configurada.');
    error.code = 'CONFIG';
    throw error;
  }

  // O valor é entregue inteiro ao SDK oficial. Ele nunca é separado, logado ou
  // incluído em uma resposta da aplicação.
  const sdk = require('@higgsfield/client');
  const configured = sdk.higgsfield || sdk.hf || sdk.client;
  if (configured && typeof configured.subscribe === 'function') return configured;
  const Client = sdk.HiggsfieldClient || sdk.Client || sdk.default;
  if (typeof Client !== 'function') {
    throw Object.assign(new Error('SDK Higgsfield incompatível.'), { code: 'SDK_CONFIG' });
  }
  return new Client({ credentials: process.env.HF_CREDENTIALS });
}

function collectResults(value, output = [], seen = new Set()) {
  if (!value || seen.has(value)) return output;
  if (typeof value === 'string') {
    if (value.startsWith('https://')) output.push({ url: value });
    return output;
  }
  if (typeof value !== 'object') return output;
  seen.add(value);
  if (typeof value.url === 'string' && value.url.startsWith('https://')) {
    output.push({ url: value.url, type: typeof value.type === 'string' ? value.type : undefined });
    return output;
  }
  for (const child of Array.isArray(value) ? value : Object.values(value)) collectResults(child, output, seen);
  return output;
}

async function generate(model, payload, client = createClient()) {
  // subscribe é o fluxo recomendado pelo SDK: envia e acompanha o job até o
  // resultado terminal, sem expor URLs internas de polling ao navegador.
  const result = await client.subscribe(model.modelPath, { input: payload });
  return {
    requestId: result?.requestId || result?.request_id || result?.id,
    status: 'completed',
    results: collectResults(result?.data || result?.output || result)
  };
}

module.exports = { collectResults, generate };
