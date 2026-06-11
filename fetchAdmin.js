import fetch from 'node-fetch';
import fs from 'fs';

async function main() {
  const url = 'https://gestion-futbol-three.vercel.app/assets/index-BCVeQJcw.js';
  console.log('Fetching', url);
  const res = await fetch(url);
  const text = await res.text();
  console.log('Length:', text.length);
  fs.writeFileSync('vercel_bundle.js', text);
  console.log('Saved to vercel_bundle.js');
}

main().catch(console.error);
