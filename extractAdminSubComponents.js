import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Extracting Admin subcomponents...');

const targets = [
  { name: 'Dashboard', kw: 'Análisis de Rendimiento & Gráficos' },
  { name: 'Reservations', kw: 'Verificar Reservas' },
  { name: 'Gallery', kw: 'Cargar Fotos' },
  { name: 'Promos', kw: 'Administrar Promos' },
  { name: 'Prices/Tarifas', kw: 'Configurar Tarifas' },
  { name: 'Reviews', kw: 'Moderar Opiniones' }
];

targets.forEach(t => {
  let idx = code.indexOf(t.kw);
  console.log(`\n================ ${t.name} (Keyword: "${t.kw}", Found at index: ${idx}) ================`);
  if (idx !== -1) {
    // print 3000 chars before and 3000 chars after
    const part = code.substring(Math.max(0, idx - 1500), Math.min(code.length, idx + 2500));
    console.log(part);
  } else {
    // Try substring search for part of it
    const parts = t.kw.split(' ');
    let fallbackIdx = code.indexOf(parts[0]);
    console.log(`Fallback for "${parts[0]}": ${fallbackIdx}`);
    if (fallbackIdx !== -1) {
      console.log(code.substring(Math.max(0, fallbackIdx - 500), Math.min(code.length, fallbackIdx + 1500)));
    }
  }
});
