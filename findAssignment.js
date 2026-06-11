import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

const names = ['cp', 'up', 'rp', 'op', 'dp', 'fp'];

names.forEach(name => {
  console.log(`\n================== Assignments for ${name} ==================`);
  let idx = 0;
  while (true) {
    idx = code.indexOf(`${name}=`, idx);
    if (idx === -1) break;
    // Check if it's a declaring structure, e.g. "const cp=" or ",cp=" or "function cp"
    const prefix = code.substring(Math.max(0, idx - 10), idx);
    console.log(`Matched prefix: "${prefix}" at index ${idx}`);
    console.log('Snippet:', code.substring(idx, idx + 1000));
    console.log('---');
    idx += name.length + 1;
  }
});
