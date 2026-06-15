import axios from 'axios';

async function test() {
  const symbols = [
    'GC=F', 'GCU26.CMX', 'GCV26.CMX', 'GCZ26.CMX', 'GCG27.CMX',
    'CL=F', 'CLQ26.NYM', 'CLU26.NYM', 'CLV26.NYM'
  ];
  
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
