import axios from 'axios';

async function test() {
  const symbolsToTest = [
    'BZ=F',
    'BZM26.NYM', 'BZN26.NYM', 'BZQ26.NYM', 'BZU26.NYM', 'BZV26.NYM', 'BZZ26.NYM',
    'BZM26.CME', 'BZN26.CME', 'BZQ26.CME', 'BZU26.CME', 'BZV26.CME', 'BZZ26.CME',
    'BZN26.ICE', 'BZQ26.ICE'
  ];

  try {
    const res = await axios.get(`http://localhost:5173/api/yfinance/quotes?symbols=${symbolsToTest.join(',')}`);
    if (res.data) {
      res.data.forEach(q => {
        if (q.regularMarketPrice) {
          console.log(`Valid: ${q.symbol} - ${q.shortName || q.longName} @ ${q.regularMarketPrice}`);
        }
      });
    }
  } catch (err) {
    console.error(err.message);
  }
}
test();
