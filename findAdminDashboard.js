import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Searching for admin component routing...');

let idx = 0;
while (true) {
  idx = code.indexOf('admin', idx);
  if (idx === -1) break;
  console.log(`Matched "admin" at index: ${idx}`);
  console.log('Context:', code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + 450)));
  console.log('==================');
  idx += 'admin'.length;
}
