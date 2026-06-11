import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Searching for subcomponent contents...');

const keywords = [
  'Ocupación',
  'Ingresos por Cancha',
  'Aprobado (Público)', 
  'Estatus de pago',
  'Pasto Sintético',
  'Cupón',
  'Categoría',
  'Tarifa',
  'Precio Base'
];

keywords.forEach(kw => {
  let idx = 0;
  console.log(`\n================== KW Match: "${kw}" ==================`);
  while (true) {
    idx = code.indexOf(kw, idx);
    if (idx === -1) {
      // try lowercase
      idx = code.indexOf(kw.toLowerCase(), idx);
      if (idx === -1) break;
    }
    console.log(`Matched at index ${idx}`);
    // Print a wider area, say 2500 characters
    console.log(code.substring(Math.max(0, idx - 1000), Math.min(code.length, idx + 1500)));
    console.log('--- END OF MATCH ---');
    idx += kw.length;
    break; // only print first match for brevity
  }
});
