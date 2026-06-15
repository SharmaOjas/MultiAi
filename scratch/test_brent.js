import axios from 'axios';

async function test() {
  const symbols = ['BZ=F', 'BZN26.NYM', 'BZQ26.NYM', 'BZU26.NYM', 'BZV26.NYM'];
  try {
    const res = await axios.get(`http://localhost:5173/api/yfinance/quotes?symbols=${symbols.join(',')}`);
    res.data.forEach(q => {
      console.log(`Valid: ${q.symbol} - ${q.shortName || q.longName} @ ${q.regularMarketPrice}`);
    });
  } catch (err) {
    console.error(err.message);
  }
}
test();
