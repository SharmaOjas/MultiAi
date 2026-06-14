import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'], validation: { logErrors: false } });

(async () => {
  try {
    const results10 = await yahooFinance.search('India 10 Year');
    console.log("10Y Search Results:", results10.quotes.map(q => ({ symbol: q.symbol, shortname: q.shortname })));

    const results2 = await yahooFinance.search('India 2 Year');
    console.log("2Y Search Results:", results2.quotes.map(q => ({ symbol: q.symbol, shortname: q.shortname })));
    
    const resultsInd = await yahooFinance.search('India bond');
    console.log("Bond Search Results:", resultsInd.quotes.map(q => ({ symbol: q.symbol, shortname: q.shortname })));
  } catch (e) {
    console.error(e);
  }
})();
