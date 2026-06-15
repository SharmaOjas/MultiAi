import yahooFinance from 'yahoo-finance2';

async function test() {
  const symbols = [
    'GCN24.CMX', 'GCQ24.CMX', 'GCN26.CMX', 'GCQ26.CMX',
    'CLN24.NYM', 'CLQ24.NYM', 'CLN26.NYM', 'CLQ26.NYM', 
    'GC=F', 'GCM26.CMX'
  ];
  
  for (const s of symbols) {
    try {
      const q = await yahooFinance.quote(s);
      if (q && q.regularMarketPrice) {
        console.log(`Valid: ${s} - ${q.shortName || q.longName} @ ${q.regularMarketPrice}`);
      } else {
        console.log(`No price: ${s}`);
      }
    } catch (err) {
      console.log(`Error for ${s}: ${err.message}`);
    }
  }
}
test();
