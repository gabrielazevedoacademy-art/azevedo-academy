'use strict';
const fs = require('node:fs');
const required = ['index.html', 'biblioteca-de-prompts/index.html', 'higgsfield-studio/index.html', 'assets/css/higgsfield-studio.css', 'assets/js/higgsfield-studio.js'];
for (const file of required) if (!fs.existsSync(file)) throw new Error(`Arquivo ausente: ${file}`);
JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
const clientFiles = ['higgsfield-studio/index.html', 'assets/js/higgsfield-studio.js', 'assets/css/higgsfield-studio.css'];
const forbidden = [/HIGGSFIELD_API_KEY/, /HIGGSFIELD_API_SECRET/, /hf-api-key/i, /hf-secret/i];
for (const file of clientFiles) for (const pattern of forbidden) if (pattern.test(fs.readFileSync(file, 'utf8'))) throw new Error(`Referência server-side vazou no cliente: ${file}`);
console.log('Build estático e separação de secrets verificados.');
