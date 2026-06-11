import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Searching for page labels...');

const labels = [
  'Inicio',
  'Reservas',
  'Promociones',
  'Galería',
  'Contacto',
  'Equipos',
  'Admin',
  'Canchas',
  'Torneo',
  'Dashboard'
];

for (const label of labels) {
  let idx = 0;
  let matches = [];
  while (true) {
    idx = code.indexOf(label, idx);
    if (idx === -1) break;
    matches.push(idx);
    idx += label.length;
  }
  console.log(`Label "${label}": found ${matches.length} times`);
  if (matches.length > 0) {
    console.log(`First snippet:`, code.substring(Math.max(0, matches[0] - 80), Math.min(code.length, matches[0] + 120)));
    console.log('----');
  }
}
