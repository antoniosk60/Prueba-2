import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

const stringsToSearch = [
  'Estadísticas',
  'Verificar Reservas',
  'Cargar Fotos',
  'Administrar Promos',
  'Configurar Tarifas',
  'Moderar Opiniones'
];

stringsToSearch.forEach(str => {
  let idx = 0;
  console.log(`\n================== String Match: "${str}" ==================`);
  while (true) {
    idx = code.indexOf(str, idx);
    if (idx === -1) break;
    console.log(`Matched "${str}" at index ${idx}`);
    // print 2000 chars after the match
    console.log(code.substring(idx - 200, idx + 1800));
    console.log('--- END OF MATCH ---');
    idx += str.length;
  }
});
