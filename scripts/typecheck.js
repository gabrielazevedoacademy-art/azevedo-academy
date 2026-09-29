'use strict';
const { catalog } = require('../lib/higgsfield/catalog');
for (const [id, model] of Object.entries(catalog)) {
  if (model.id !== id || model.modelPath !== 'bytedance/seedance-2.5/text-to-video' || model.media !== 'video') throw new Error(`Catálogo inválido: ${id}`);
  if (!model.workflow || !model.prompt || !model.fields) throw new Error(`Contrato incompleto: ${id}`);
}
console.log(`Contratos verificados: ${Object.keys(catalog).length} modelos.`);
