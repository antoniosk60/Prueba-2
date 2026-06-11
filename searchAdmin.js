import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

// Find occurrences of common strings or component patterns
console.log('Searching in bundle...');

// Let's find some strings
const keywords = [
  'AdminPanel',
  'Moderación',
  'Total de Reservas',
  'Gestión de',
  'Torneo',
  'Canchas'
];

for (const kw of keywords) {
  const idx = code.indexOf(kw);
  console.log(`Keyword: "${kw}" -> found at index: ${idx}`);
  if (idx !== -1) {
    console.log('Snippet:', code.substring(Math.max(0, idx - 100), Math.min(code.length, idx + 200)));
  }
}
