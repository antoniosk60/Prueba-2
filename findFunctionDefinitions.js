import fs from 'fs';

const code = fs.readFileSync('vercel_bundle.js', 'utf8');

console.log('Locating components cp, up, rp, op, dp, fp definitions...');

// Let's search inside the code for unique strings:
const componentKeywords = [
  { name: 'cp (Dashboard)', kw: 'totalRevenue' }, // or "Ventas Totales"
  { name: 'up (Reservations)', kw: 'handleUpdateReservation' }, // or something inside up
  { name: 'rp (Gallery)', kw: 'categories' }, // or gallery upload
  { name: 'op (Promotions)', kw: 'promoTitle' }, // or promo design
  { name: 'dp (Prices / config)', kw: 'basePricePerHour' }, // or pricing field config
  { name: 'fp (Reviews moderation)', kw: 'moderateReview' } // or reviews moderations
];

// Let's do substrings and find where they are defined
componentKeywords.forEach(c => {
  let idx = 0;
  console.log(`\n================== ${c.name} ==================`);
  while (true) {
    idx = code.indexOf(c.kw, idx);
    if (idx === -1) {
      // search for lowercase
      idx = code.indexOf(c.kw.toLowerCase(), idx);
      if (idx === -1) break;
    }
    console.log(`Found keyword "${c.kw}" at index ${idx}`);
    // print 2000 chars near it
    console.log(code.substring(Math.max(0, idx - 1000), Math.min(code.length, idx + 2000)));
    console.log('------------------');
    idx += c.kw.length;
    break; // only print first match
  }
});
