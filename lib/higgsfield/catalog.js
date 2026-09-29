'use strict';

/**
 * Catálogo único da integração. Endpoints e parâmetros são resolvidos apenas
 * aqui no servidor; o navegador nunca pode escolher uma URL arbitrária.
 */
const catalog = Object.freeze({
  'seedance-2.5-text-to-video': {
    id: 'seedance-2.5-text-to-video',
    name: 'Seedance 2.5',
    media: 'video',
    modelPath: 'bytedance/seedance-2.5/text-to-video',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    prompt: { required: true },
    fields: {},
    uploads: []
  }
});

function publicCatalog() { return Object.values(catalog).map(({ modelPath, ...entry }) => entry); }

module.exports = { catalog, publicCatalog };
