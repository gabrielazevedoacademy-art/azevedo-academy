'use strict';
const { catalog } = require('../lib/higgsfield/catalog');

const ids = Object.keys(catalog);
if (ids.length < 10) throw new Error('Catálogo Higgsfield incompleto.');

for (const [id, model] of Object.entries(catalog)) {
  if (model.id !== id || typeof model.modelPath !== 'string' || !model.modelPath.includes('/')) throw new Error('Catálogo inválido: ' + id);
  if (model.media !== 'video' || !model.family || !model.workflow || !model.variant || !model.prompt || !model.fields || !Array.isArray(model.references)) {
    throw new Error('Contrato incompleto: ' + id);
  }
}

console.log('Contratos verificados: ' + ids.length + ' modelos/workflows.');
