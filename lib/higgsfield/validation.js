'use strict';

const { catalog } = require('./catalog');

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

function remoteUrl(value) {
  if (typeof value !== 'string' || value.length > 4096) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch {
    return false;
  }
}

function parseField(rule, item) {
  if ((item === undefined || item === '') && rule.default !== undefined) item = rule.default;
  if ((item === undefined || item === '') && rule.optional) return undefined;

  if (rule.type === 'enum') {
    if (!rule.values.includes(item)) throw new ValidationError('Valor inválido para ' + rule.label + '.');
    return item;
  }

  if (rule.type === 'integer') {
    const value = Number(item);
    if (!Number.isInteger(value) || value < rule.min || value > rule.max) {
      throw new ValidationError(rule.label + ' deve estar entre ' + rule.min + ' e ' + rule.max + '.');
    }
    return value;
  }

  if (rule.type === 'number') {
    const value = Number(item);
    if (!Number.isFinite(value) || value < rule.min || value > rule.max) {
      throw new ValidationError(rule.label + ' deve estar entre ' + rule.min + ' e ' + rule.max + '.');
    }
    return value;
  }

  if (rule.type === 'boolean') {
    if (item === true || item === false) return item;
    if (item === 'true') return true;
    if (item === 'false') return false;
    throw new ValidationError('Valor inválido para ' + rule.label + '.');
  }

  throw new ValidationError('Tipo de parâmetro não suportado: ' + rule.label + '.');
}

function validateReferences(model, supplied) {
  const rules = model.references || [];
  const references = supplied && typeof supplied === 'object' && !Array.isArray(supplied) ? supplied : {};

  for (const key of Object.keys(references)) {
    if (!rules.some((rule) => rule.name === key)) throw new ValidationError('Referência não permitida: ' + key + '.');
  }

  const payload = {};
  const safe = {};

  for (const rule of rules) {
    const item = references[rule.name];

    if (rule.multiple) {
      const values = item === undefined ? [] : Array.isArray(item) ? item : [];
      if (rule.required && !values.length) throw new ValidationError('Envie: ' + rule.label + '.');
      if (values.length > rule.max) throw new ValidationError(rule.label + ': limite de ' + rule.max + ' arquivo(s).');
      if (!values.every(remoteUrl)) throw new ValidationError(rule.label + ': URL inválida.');
      if (values.length) {
        payload[rule.name] = values;
        safe[rule.name] = values.length + ' arquivo(s)';
      }
      continue;
    }

    const value = typeof item === 'string' ? item.trim() : '';
    if (rule.required && !value) throw new ValidationError('Envie: ' + rule.label + '.');
    if (value && !remoteUrl(value)) throw new ValidationError(rule.label + ': URL inválida.');
    if (value) {
      payload[rule.name] = value;
      safe[rule.name] = '1 arquivo';
    }
  }

  return { payload, safe };
}

function validateGeneration(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ValidationError('Corpo da requisição inválido.');

  const model = catalog[value.modelId];
  if (!model) throw new ValidationError('Modelo não permitido.');
  if (value.workflow !== model.workflow) throw new ValidationError('Workflow incompatível com o modelo.');

  const prompt = typeof value.prompt === 'string' ? value.prompt.trim() : '';
  if (model.prompt.required && !prompt) throw new ValidationError('Informe um prompt.');

  const supplied = value.parameters && typeof value.parameters === 'object' && !Array.isArray(value.parameters) ? value.parameters : {};
  for (const key of Object.keys(supplied)) {
    if (!model.fields[key]) throw new ValidationError('Parâmetro não permitido: ' + key + '.');
  }

  const parameters = {};
  for (const [key, rule] of Object.entries(model.fields)) {
    const parsed = parseField(rule, supplied[key]);
    if (parsed !== undefined) parameters[key] = parsed;
  }

  const refs = validateReferences(model, value.references);
  const payload = { ...parameters, ...refs.payload };
  if (prompt) payload.prompt = prompt;

  return {
    model,
    payload,
    safe: {
      modelId: model.id,
      modelName: model.familyLabel,
      workflow: model.workflow,
      workflowLabel: model.workflowLabel,
      variant: model.variantLabel,
      prompt,
      parameters,
      references: refs.safe
    }
  };
}

module.exports = { ValidationError, validateGeneration };
