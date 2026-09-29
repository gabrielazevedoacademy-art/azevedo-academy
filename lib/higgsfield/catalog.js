'use strict';

/**
 * Catálogo único da integração. Endpoints e parâmetros são resolvidos apenas
 * aqui no servidor; o navegador nunca pode escolher uma URL arbitrária.
 */
const catalog = Object.freeze({
  'soul-standard': {
    id: 'soul-standard',
    name: 'Soul — Standard',
    media: 'image',
    endpoint: '/higgsfield-ai/soul/standard',
    workflow: 'text-to-image',
    workflowLabel: 'Texto para imagem',
    prompt: { required: true },
    fields: {
      aspect_ratio: { label: 'Proporção', type: 'enum', values: ['1:1', '2:3', '3:2', '9:16', '16:9'], default: '1:1' },
      resolution: { label: 'Resolução', type: 'enum', values: ['1K', '2K'], default: '1K' },
      output_format: { label: 'Formato', type: 'enum', values: ['jpeg', 'png'], default: 'jpeg' }
    },
    uploads: []
  },
  'dop-standard': {
    id: 'dop-standard',
    name: 'DoP — Standard',
    media: 'video',
    endpoint: '/higgsfield-ai/dop/standard',
    workflow: 'image-to-video',
    workflowLabel: 'Imagem para vídeo',
    prompt: { required: true },
    fields: {
      aspect_ratio: { label: 'Proporção', type: 'enum', values: ['1:1', '2:3', '3:2', '9:16', '16:9'], default: '16:9' },
      duration: { label: 'Duração', type: 'enum', values: [3, 5], default: 5 },
      seed: { label: 'Seed', type: 'integer', min: 0, max: 2147483647, optional: true }
    },
    uploads: [{ name: 'input_image', payloadName: 'input_images', label: 'Imagem inicial', accept: ['image/jpeg', 'image/png', 'image/webp'], maxBytes: 10 * 1024 * 1024, min: 1, max: 1 }]
  }
});

function publicCatalog() {
  return Object.values(catalog).map(({ endpoint, ...entry }) => entry);
}

module.exports = { catalog, publicCatalog };
