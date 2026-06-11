import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Searching for tab-switch rendering in the bundle...');

// Let's search for "kpi" (lowercase) or "bookings" (lowercase) inside array map or option rendering
// For instance: "bookings", "reviews", "gallery", "teams" (or "kpi")
const words = ['"bookings"', '"gallery"', '"promos"', '"reviews"'];
for (const word of words) {
  let idx = 0;
  while (true) {
    idx = code.indexOf(word, idx);
    if (idx === -1) break;
    console.log(`Matched ${word} at index: ${idx}`);
    console.log('Context:', code.substring(Math.max(0, idx - 150), Math.min(code.length, idx + 450)));
    console.log('==================');
    idx += word.length;
  }
}
