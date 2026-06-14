import yahooFinance from 'yahoo-finance2';

yahooFinance.suppressNotices(['yahooSurvey']);

export const handler = async (event) => {
  try {
    const symbol = event.queryStringParameters?.symbol;
    if (!symbol) {
      return { statusCode: 400, body: JSON.stringify({ error: 'symbol required' }) };
    }
    
    const result = await yahooFinance.chart(symbol, {
      period1: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // last 10 days
      period2: new Date(),
      interval: '1d'
    });
    
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotes: result.quotes || [] })
    };
  } catch (e) {
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ quotes: [] })
    };
  }
};
