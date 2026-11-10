'use strict';

// Garante que as páginas estáticas aprovadas continuam presentes antes do build.
const fs = require('node:fs');

const required = [
  'public/index.html',
  'public/favicon.ico',
  'public/favicon.svg',
  'public/apple-touch-icon.png',
  'public/ferramentas/index.html',
  'public/assets/css/ferramentas.css',
  'public/assets/js/ferramentas.js',
  'public/influencer-com-ia/index.html',
  'public/assets/css/influencer-com-ia.css',
  'public/assets/js/influencer-com-ia.js',
  'public/assets/images/influencer-com-ia/hero-influencer.webp',
  'public/assets/images/azevedo-logo-branco.svg',
  'public/biblioteca-de-prompts/index.html'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Arquivo ausente: ' + file);
}

console.log('Páginas estáticas verificadas.');
