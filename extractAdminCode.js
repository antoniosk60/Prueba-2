import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Searching for "Panel Admin"...');

let idx = 0;
while (true) {
  idx = code.indexOf('Panel Admin', idx);
  if (idx === -1) break;
  console.log(`Found "Panel Admin" at index: ${idx}`);
  console.log('Snippet:', code.substring(Math.max(0, idx - 400), Math.min(code.length, idx + 400)));
  console.log('------------------');
  idx += 'Panel Admin'.length;
}
