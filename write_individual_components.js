import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

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
  if (idx !== -1) {
    // extract 30,000 characters (enough to capture the whole component body)
    const part = code.substring(idx, idx + 30000);
    // write to file
    fs.writeFileSync(`extracted_${t.name}.js`, part, 'utf8');
    console.log(`Wrote extracted_${t.name}.js (Index: ${idx}, Length: ${part.length})`);
  } else {
    console.log(`Could not find pattern for ${t.name}`);
  }
});
