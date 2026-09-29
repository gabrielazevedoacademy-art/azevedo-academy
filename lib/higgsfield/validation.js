'use strict';

const { catalog } = require('./catalog');

class ValidationError extends Error {
  constructor(message) { super(message); this.name = 'ValidationError'; this.statusCode = 400; }
}

function validateGeneration(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError('Corpo da requisição inválido.');
  const model = catalog[value.modelId];
  if (!model) throw new ValidationError('Modelo não permitido.');
  if (value.workflow !== model.workflow) throw new ValidationError('Workflow incompatível com o modelo.');
  const prompt = typeof value.prompt === 'string' ? value.prompt.trim() : '';
  if (model.prompt.required && !prompt) throw new ValidationError('Informe um prompt.');

  const supplied = value.parameters && typeof value.parameters === 'object' && !Array.isArray(value.parameters) ? value.parameters : {};
  const parameters = {};
  for (const key of Object.keys(supplied)) if (!model.fields[key]) throw new ValidationError(`Parâmetro não permitido: ${key}.`);
  for (const [key, rule] of Object.entries(model.fields)) {
    let item = supplied[key];
    if ((item === undefined || item === '') && rule.default !== undefined) item = rule.default;
    if ((item === undefined || item === '') && rule.optional) continue;
    if (rule.type === 'enum' && !rule.values.includes(item)) throw new ValidationError(`Valor inválido para ${rule.label}.`);
    if (rule.type === 'integer') {
      item = Number(item);
      if (!Number.isInteger(item) || item < rule.min || item > rule.max) throw new ValidationError(`${rule.label} deve estar entre ${rule.min} e ${rule.max}.`);
    }
    parameters[key] = item;
  }

  const uploads = value.uploads && typeof value.uploads === 'object' ? value.uploads : {};
  for (const key of Object.keys(uploads)) if (!model.uploads.some((u) => u.name === key)) throw new ValidationError(`Upload não permitido: ${key}.`);
  const payload = { prompt, ...parameters };
  for (const upload of model.uploads) {
    const urls = Array.isArray(uploads[upload.name]) ? uploads[upload.name] : [];
    if (urls.length < upload.min || urls.length > upload.max) throw new ValidationError(`${upload.label}: envie ${upload.min === upload.max ? upload.min : `${upload.min}–${upload.max}`} arquivo(s).`);
    if (!urls.every(isSafeRemoteUrl)) throw new ValidationError(`${upload.label}: referência de arquivo inválida.`);
    payload[upload.payloadName] = urls;
  }
  return { model, payload, safe: { modelId: model.id, workflow: model.workflow, prompt, parameters } };
}

function isSafeRemoteUrl(value) {
  if (typeof value !== 'string' || value.length > 2048) return false;
  try { return new URL(value).protocol === 'https:'; } catch { return false; }
}

module.exports = { ValidationError, validateGeneration };
