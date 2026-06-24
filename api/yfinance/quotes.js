import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ 
  suppressNotices: ['yahooSurvey'],
  validation: { logErrors: false }
});

export default async function handler(req, res) {
  // CORS headers for local testing
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Parse symbols from query
  const { symbols } = req.query;

  if (!symbols) {
    return res.status(400).json({ error: 'symbols required' });
  }

  try {
    const symList = symbols.split(',');

    const results = await Promise.allSettled(
      // validateResult:false lets tickers like CT=F (ICE futures) return
      // their data even when yahoo-finance2 schema validation would reject them.
      symList.map(sym => yahooFinance.quote(sym, {}, { validateResult: false }))
    );

    const dataArray = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => (Array.isArray(r.value) ? r.value[0] : r.value))
      .filter(Boolean);

    res.status(200).json(dataArray);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
