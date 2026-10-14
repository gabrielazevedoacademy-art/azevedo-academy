'use strict';

const fs = require('node:fs');

const required = [
  'index.html',
  'ferramentas/index.html',
  'assets/css/ferramentas.css',
  'assets/js/ferramentas.js',
  'influencer-com-ia/index.html',
  'assets/css/influencer-com-ia.css',
  'assets/images/influencer-com-ia/hero-influencer.webp',
  'assets/images/azevedo-logo-branco.svg',
  'biblioteca-de-prompts/index.html'
];

for (const file of required) {
  if (!fs.existsSync(file)) throw new Error('Arquivo ausente: ' + file);
}

const vercel = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
if (vercel.outputDirectory !== '.') throw new Error('A saída da Vercel deve permanecer na raiz do site estático.');

console.log('Build estático verificado. Artefato de deploy: raiz do repositório (outputDirectory: ".").');
