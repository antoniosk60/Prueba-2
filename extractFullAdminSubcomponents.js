import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Searching for function definitions in range 290000 - 335000...');

const targets = [
  { name: 'cp', pattern: 'function cp(' },
  { name: 'up', pattern: 'function up(' },
  { name: 'rp', pattern: 'function rp(' },
  { name: 'op', pattern: 'function op(' },
  { name: 'dp', pattern: 'function dp(' },
  { name: 'fp', pattern: 'function fp(' }
];

targets.forEach(t => {
  const idx = code.indexOf(t.pattern);
  console.log(`\n================== ${t.name} (Pattern: "${t.pattern}", Index: ${idx}) ==================`);
  if (idx !== -1) {
    // extract until next function or matching braces
    // Let's print the first 8000 characters from the index
    console.log(code.substring(idx, idx + 8000));
  } else {
    // try index of component usage or without "function" prefix
    const altPattern = `const ${t.name}=`;
    const altIdx = code.indexOf(altPattern);
    console.log(`Alternative pattern "${altPattern}" index: ${altIdx}`);
    if (altIdx !== -1) {
      console.log(code.substring(altIdx, altIdx + 8000));
    } else {
      // try scanning for "b=()=>{..." or just search for general identifiers inside each component
    }
  }
});
