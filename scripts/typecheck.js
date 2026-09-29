'use strict';
const { catalog } = require('../lib/higgsfield/catalog');
for (const [id, model] of Object.entries(catalog)) {
  if (model.id !== id || !model.endpoint.startsWith('/') || !['image', 'video'].includes(model.media)) throw new Error(`Catálogo inválido: ${id}`);
  if (!model.workflow || !model.prompt || !model.fields || !Array.isArray(model.uploads)) throw new Error(`Contrato incompleto: ${id}`);
}
console.log(`Contratos verificados: ${Object.keys(catalog).length} modelos.`);
