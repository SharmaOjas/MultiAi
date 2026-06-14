import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'], validation: { logErrors: false } });

(async () => {
  const symbols = ['IND10Y=RR', 'IND2Y=RR', '^IN10YT', '^IN2YT', 'IN10YT=RR.BO', 'IN2YT=RR.BO', '10YIN.B', 'IN10Y.NS'];
  for (const s of symbols) {
    try {
      const q = await yahooFinance.quote(s);
      if (q) console.log(s, "WORKS", q.regularMarketPrice);
    } catch (e) {}
  }
})();
