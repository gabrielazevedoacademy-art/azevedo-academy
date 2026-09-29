'use strict';

const ratiosSeedance = ['16:9', '4:3', '1:1', '3:4', '9:16', '21:9'];
const ratiosKling = ['16:9', '9:16', '1:1'];
const imageAccept = ['image/jpeg', 'image/png', 'image/webp'];
const videoAccept = ['video/mp4', 'video/quicktime', 'video/webm'];
const audioAccept = ['audio/mpeg', 'audio/wav', 'audio/x-wav', 'audio/mp4', 'audio/aac', 'audio/ogg'];

function integer(label, min, max, defaultValue) {
  return { label, type: 'integer', min, max, default: defaultValue };
}
function number(label, min, max, step, defaultValue) {
  return { label, type: 'number', min, max, step, default: defaultValue };
}
function choice(label, values, defaultValue) {
  return { label, type: 'enum', values, default: defaultValue };
}
function toggle(label, defaultValue) {
  return { label, type: 'boolean', default: defaultValue };
}
function ref(name, label, kind, options = {}) {
  const { required = false, multiple = false, max = 1, maxBytes } = options;
  const accept = kind === 'image' ? imageAccept : kind === 'video' ? videoAccept : audioAccept;
  return { name, label, kind, required, multiple, max, maxBytes, accept };
}
function entry(config) {
  return Object.freeze({ media: 'video', ...config });
}

const seedance25Fields = {
  duration: integer('Duração', 4, 30, 5),
  resolution: choice('Resolução', ['480p', '720p'], '720p'),
  aspect_ratio: choice('Proporção', ratiosSeedance, '16:9'),
  output_format: choice('Formato', ['mp4', 'mov'], 'mp4'),
  generate_audio: toggle('Gerar áudio', true)
};

const seedance20Fields = {
  duration: integer('Duração', 4, 15, 5),
  resolution: choice('Resolução', ['480p', '720p', '1080p', '4k'], '720p'),
  aspect_ratio: choice('Proporção', ratiosSeedance, '16:9'),
  generate_audio: toggle('Gerar áudio', true)
};

const klingAdvancedFields = {
  sound: choice('Áudio', ['on', 'off'], 'on'),
  duration: integer('Duração', 3, 15, 5),
  cfg_scale: number('CFG Scale', 0, 1, 0.1, 0.5),
  multi_shots: toggle('Multi-shot', false),
  aspect_ratio: choice('Proporção', ratiosKling, '16:9')
};

const klingTurboFields = {
  duration: integer('Duração', 3, 15, 5),
  resolution: choice('Resolução', ['720p', '1080p'], '720p'),
  aspect_ratio: choice('Proporção', ratiosKling, '16:9')
};

const catalog = Object.freeze({
  'seedance-2.5-text': entry({
    id: 'seedance-2.5-text',
    order: 10,
    family: 'seedance-2.5',
    familyLabel: 'Seedance 2.5',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    variant: 'default',
    variantLabel: 'Padrão',
    modelPath: 'bytedance/seedance-2.5/text-to-video',
    description: 'Texto para vídeo com áudio opcional, até 30 segundos.',
    prompt: { required: true, placeholder: 'Descreva a cena, ação, câmera, luz e atmosfera…' },
    fields: seedance25Fields,
    references: []
  }),
  'seedance-2.5-reference': entry({
    id: 'seedance-2.5-reference',
    order: 20,
    family: 'seedance-2.5',
    familyLabel: 'Seedance 2.5',
    workflow: 'reference-to-video',
    workflowLabel: 'Reference to Video',
    variant: 'default',
    variantLabel: 'Padrão',
    modelPath: 'bytedance/seedance-2.5/reference-to-video',
    description: 'Geração orientada por imagens, vídeos ou áudio de referência.',
    prompt: { required: false, placeholder: 'Opcional: descreva o que deve acontecer no vídeo…' },
    fields: seedance25Fields,
    references: [
      ref('image_urls', 'Imagens de referência', 'image', { multiple: true, max: 9, maxBytes: 25 * 1024 * 1024 }),
      ref('video_urls', 'Vídeos de referência', 'video', { multiple: true, max: 9, maxBytes: 250 * 1024 * 1024 }),
      ref('audio_urls', 'Áudios de referência', 'audio', { multiple: true, max: 4, maxBytes: 50 * 1024 * 1024 })
    ]
  }),
  'seedance-2.0-text': entry({
    id: 'seedance-2.0-text',
    order: 30,
    family: 'seedance-2.0',
    familyLabel: 'Seedance 2.0',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    variant: 'default',
    variantLabel: 'Padrão',
    modelPath: 'bytedance/seedance-2.0/text-to-video',
    description: 'Texto para vídeo de 480p até 4K, com duração de até 15 segundos.',
    prompt: { required: true, placeholder: 'Descreva a cena, ação, câmera, luz e atmosfera…' },
    fields: seedance20Fields,
    references: []
  }),
  'seedance-2.0-reference': entry({
    id: 'seedance-2.0-reference',
    order: 40,
    family: 'seedance-2.0',
    familyLabel: 'Seedance 2.0',
    workflow: 'reference-to-video',
    workflowLabel: 'Reference to Video',
    variant: 'default',
    variantLabel: 'Padrão',
    modelPath: 'bytedance/seedance-2.0/reference-to-video',
    description: 'Referências de imagem, vídeo ou áudio com saídas de 480p até 4K.',
    prompt: { required: false, placeholder: 'Opcional: descreva o resultado desejado…' },
    fields: seedance20Fields,
    references: [
      ref('image_urls', 'Imagens de referência', 'image', { multiple: true, max: 9, maxBytes: 25 * 1024 * 1024 }),
      ref('video_urls', 'Vídeos de referência', 'video', { multiple: true, max: 9, maxBytes: 250 * 1024 * 1024 }),
      ref('audio_urls', 'Áudios de referência', 'audio', { multiple: true, max: 4, maxBytes: 50 * 1024 * 1024 })
    ]
  }),

  'kling-3-std-text': entry({
    id: 'kling-3-std-text',
    order: 100,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    variant: 'std',
    variantLabel: 'Standard',
    modelPath: 'kling-video/v3.0/std/text-to-video',
    description: 'Kling 3.0 Standard com áudio, CFG e multi-shot.',
    prompt: { required: false, placeholder: 'Descreva a cena e o movimento desejado…' },
    fields: klingAdvancedFields,
    references: []
  }),
  'kling-3-pro-text': entry({
    id: 'kling-3-pro-text',
    order: 110,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    variant: 'pro',
    variantLabel: 'Pro',
    modelPath: 'kling-video/v3.0/pro/text-to-video',
    description: 'Kling 3.0 Pro para texto em vídeo.',
    prompt: { required: false, placeholder: 'Descreva a cena e o movimento desejado…' },
    fields: klingAdvancedFields,
    references: []
  }),
  'kling-3-turbo-text': entry({
    id: 'kling-3-turbo-text',
    order: 120,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    variant: 'turbo',
    variantLabel: 'Turbo',
    modelPath: 'kling-video/v3.0-turbo/text-to-video',
    description: 'Kling 3.0 Turbo com seleção de 720p ou 1080p.',
    prompt: { required: true, placeholder: 'Descreva a cena e o movimento desejado…' },
    fields: klingTurboFields,
    references: []
  }),
  'kling-3-4k-text': entry({
    id: 'kling-3-4k-text',
    order: 130,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'text-to-video',
    workflowLabel: 'Texto para vídeo',
    variant: '4k',
    variantLabel: '4K',
    modelPath: 'kling-video/v3.0/4k/text-to-video',
    description: 'Endpoint dedicado do Kling 3.0 para saída 4K.',
    prompt: { required: false, placeholder: 'Descreva a cena e o movimento desejado…' },
    fields: klingAdvancedFields,
    references: []
  }),
  'kling-3-std-image': entry({
    id: 'kling-3-std-image',
    order: 140,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'image-to-video',
    workflowLabel: 'Imagem para vídeo',
    variant: 'std',
    variantLabel: 'Standard',
    modelPath: 'kling-video/v3.0/std/image-to-video',
    description: 'Anima uma imagem com Kling 3.0 Standard.',
    prompt: { required: false, placeholder: 'Opcional: descreva a animação desejada…' },
    fields: klingAdvancedFields,
    references: [
      ref('image_url', 'Imagem inicial', 'image', { required: true, maxBytes: 25 * 1024 * 1024 }),
      ref('last_image_url', 'Imagem final', 'image', { maxBytes: 25 * 1024 * 1024 })
    ]
  }),
  'kling-3-pro-image': entry({
    id: 'kling-3-pro-image',
    order: 150,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'image-to-video',
    workflowLabel: 'Imagem para vídeo',
    variant: 'pro',
    variantLabel: 'Pro',
    modelPath: 'kling-video/v3.0/pro/image-to-video',
    description: 'Anima uma imagem com Kling 3.0 Pro.',
    prompt: { required: false, placeholder: 'Opcional: descreva a animação desejada…' },
    fields: klingAdvancedFields,
    references: [
      ref('image_url', 'Imagem inicial', 'image', { required: true, maxBytes: 25 * 1024 * 1024 }),
      ref('last_image_url', 'Imagem final', 'image', { maxBytes: 25 * 1024 * 1024 })
    ]
  }),
  'kling-3-turbo-image': entry({
    id: 'kling-3-turbo-image',
    order: 160,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'image-to-video',
    workflowLabel: 'Imagem para vídeo',
    variant: 'turbo',
    variantLabel: 'Turbo',
    modelPath: 'kling-video/v3.0-turbo/image-to-video',
    description: 'Kling 3.0 Turbo para imagem em vídeo em 720p ou 1080p.',
    prompt: { required: true, placeholder: 'Descreva a animação desejada…' },
    fields: {
      duration: integer('Duração', 3, 15, 5),
      resolution: choice('Resolução', ['720p', '1080p'], '720p')
    },
    references: [ref('image_url', 'Imagem inicial', 'image', { required: true, maxBytes: 25 * 1024 * 1024 })]
  }),
  'kling-3-4k-image': entry({
    id: 'kling-3-4k-image',
    order: 170,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'image-to-video',
    workflowLabel: 'Imagem para vídeo',
    variant: '4k',
    variantLabel: '4K',
    modelPath: 'kling-video/v3.0/4k/image-to-video',
    description: 'Endpoint dedicado do Kling 3.0 para imagem em vídeo em 4K.',
    prompt: { required: false, placeholder: 'Opcional: descreva a animação desejada…' },
    fields: klingAdvancedFields,
    references: [
      ref('image_url', 'Imagem inicial', 'image', { required: true, maxBytes: 25 * 1024 * 1024 }),
      ref('last_image_url', 'Imagem final', 'image', { maxBytes: 25 * 1024 * 1024 })
    ]
  }),
  'kling-3-motion-std': entry({
    id: 'kling-3-motion-std',
    order: 180,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'motion-control',
    workflowLabel: 'Motion Control',
    variant: 'std',
    variantLabel: 'Standard',
    modelPath: 'kling-video/v3/motion-control/std',
    description: 'Transfere o movimento de um vídeo para um personagem em imagem.',
    prompt: { required: false, placeholder: 'Opcional: acrescente instruções para a animação…' },
    fields: {
      keep_original_sound: choice('Som original', ['yes', 'no'], 'yes'),
      character_orientation: choice('Orientação do personagem', ['video', 'image'], 'video')
    },
    references: [
      ref('image_url', 'Imagem do personagem', 'image', { required: true, maxBytes: 25 * 1024 * 1024 }),
      ref('video_url', 'Vídeo de movimento', 'video', { required: true, maxBytes: 250 * 1024 * 1024 })
    ]
  }),
  'kling-3-motion-pro': entry({
    id: 'kling-3-motion-pro',
    order: 190,
    family: 'kling-3',
    familyLabel: 'Kling 3.0',
    workflow: 'motion-control',
    workflowLabel: 'Motion Control',
    variant: 'pro',
    variantLabel: 'Pro',
    modelPath: 'kling-video/v3/motion-control/pro',
    description: 'Motion Control Pro com imagem do personagem e vídeo de movimento.',
    prompt: { required: false, placeholder: 'Opcional: acrescente instruções para a animação…' },
    fields: {
      keep_original_sound: choice('Som original', ['yes', 'no'], 'yes'),
      character_orientation: choice('Orientação do personagem', ['video', 'image'], 'video')
    },
    references: [
      ref('image_url', 'Imagem do personagem', 'image', { required: true, maxBytes: 25 * 1024 * 1024 }),
      ref('video_url', 'Vídeo de movimento', 'video', { required: true, maxBytes: 250 * 1024 * 1024 })
    ]
  })
});

function publicCatalog() {
  return Object.values(catalog)
    .sort((a, b) => a.order - b.order)
    .map(({ modelPath, ...item }) => item);
}

module.exports = { catalog, publicCatalog };
