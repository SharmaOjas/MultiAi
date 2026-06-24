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

  const { symbol } = req.query;

  if (!symbol) {
    return res.status(400).json({ error: 'symbol required' });
  }

  try {
    const result = await yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // last 10 calendar days
      period2: new Date(),
      interval: '1d'
    });
    
    res.status(200).json({ quotes: result.quotes || [] });
  } catch (e) {
    res.status(200).json({ quotes: [] });
  }
}
