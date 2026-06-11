import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

// Find all matches of state or common admin panel identifiers
console.log('Searching for useState patterns...');

// Standard compiled pattern for useState('kpi') is like useState("kpi") or similar
// Let's search inside the code for "kpi" which is a unique key
let index = 0;
while (true) {
  index = code.indexOf('kpi', index);
  if (index === -1) break;
  console.log(`Found "kpi" at index: ${index}`);
  // print context around it
  console.log('Snippet:', code.substring(Math.max(0, index - 150), Math.min(code.length, index + 350)));
  console.log('--------------------------------------------------');
  index += 3;
}
