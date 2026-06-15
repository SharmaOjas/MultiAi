import axios from 'axios';

async function test() {
  const symbols = [
    'GCN24.CMX', 'GCQ24.CMX', 'GCN26.CMX', 'GCQ26.CMX',
    'CLN24.NYM', 'CLQ24.NYM', 'CLN26.NYM', 'CLQ26.NYM', 
    'GC=F', 'GCM26.CMX'
  ];
  
  try {
    const res = await axios.get(`http://localhost:5173/api/yfinance/quotes?symbols=${symbols.join(',')}`);
    console.log(res.data);
  } catch (err) {
    console.error(err.message);
  }
}
test();
