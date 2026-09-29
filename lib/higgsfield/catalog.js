'use strict';

const { MODEL_PATH } = require('./client');

const catalog = Object.freeze({
  'seedance-2.5-text-to-video': {
    id: 'seedance-2.5-text-to-video',
    name: 'Seedance 2.5',
    modelPath: MODEL_PATH,
    media: 'video',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    prompt: { required: true },
    fields: {
      duration: { label: 'Duração (segundos)', type: 'enum', values: [5], default: 5 },
      resolution: { label: 'Resolução', type: 'enum', values: ['720p'], default: '720p' },
      aspect_ratio: { label: 'Proporção', type: 'enum', values: ['16:9'], default: '16:9' }
    }
  }
});

function publicCatalog() {
  return Object.values(catalog).map(({ modelPath, ...entry }) => entry);
}

module.exports = { catalog, publicCatalog };
