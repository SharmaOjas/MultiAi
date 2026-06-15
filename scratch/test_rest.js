import axios from 'axios';

async function test() {
  const bases = ['NG', 'SI', 'HRC', 'HG', 'ALI', 'LIT', 'ZNC'];
  const months = ['N26', 'Q26', 'U26', 'V26', 'Z26'];
  const exchanges = ['.NYM', '.CMX', '.CME'];
  
  const symbolsToTest = [];
  bases.forEach(b => {
    symbolsToTest.push(`${b}=F`);
    months.forEach(m => {
      exchanges.forEach(e => {
        symbolsToTest.push(`${b}${m}${e}`);
      });
    });
  });

  // chunk into 50 symbol queries
  const chunks = [];
  for (let i = 0; i < symbolsToTest.length; i += 50) {
    chunks.push(symbolsToTest.slice(i, i + 50));
  }

  for (const chunk of chunks) {
    try {
      const res = await axios.get(`http://localhost:5173/api/yfinance/quotes?symbols=${chunk.join(',')}`);
      if (res.data) {
        res.data.forEach(q => {
          if (q.regularMarketPrice) {
            console.log(`Valid: ${q.symbol} - ${q.shortName || q.longName} @ ${q.regularMarketPrice}`);
          }
        });
      }
    } catch (err) {
      // ignore
    }
  }
}
test();
