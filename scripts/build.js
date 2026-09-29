'use strict';

const fs = require('node:fs');

const required = [
  'index.html',
  'biblioteca-de-prompts/index.html',
  'higgsfield-studio/index.html',
  'assets/css/higgsfield-studio.css',
  'assets/js/higgsfield-studio.js',
  'api/higgsfield/generate.js',
  'api/higgsfield/upload-url.js',
  'lib/higgsfield/catalog.js',
  'lib/higgsfield/client.js'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Arquivo ausente: ' + file);
}

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (vercel.outputDirectory !== '.') throw new Error('A saída da Vercel deve permanecer na raiz do site estático.');

const clientFiles = [
  'higgsfield-studio/index.html',
  'assets/js/higgsfield-studio.js',
  'assets/css/higgsfield-studio.css'
];

const forbidden = [/HF_CREDENTIALS/, /HIGGSFIELD_API_KEY/, /HIGGSFIELD_API_SECRET/, /hf-api-key/i, /hf-secret/i];
for (const file of clientFiles) {
  const source = fs.readFileSync(file, 'utf8');
  for (const pattern of forbidden) {
    if (pattern.test(source)) throw new Error('Referência server-side vazou no cliente: ' + file);
  }
}

console.log('Build estático verificado. Artefato de deploy: raiz do repositório (outputDirectory: ".").');
console.log('Separação de secrets verificada.');
