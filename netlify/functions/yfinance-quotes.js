import YahooFinance from 'yahoo-finance2';
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey'], validation: { logErrors: false } });

export const handler = async (event) => {
  try {
    const symbols = event.queryStringParameters?.symbols;
    if (!symbols) {
      return { statusCode: 400, body: JSON.stringify({ error: 'symbols required' }) };
    }
    
    const symList = symbols.split(',');
    
    // Fetch each quote individually, ignoring failures
    const results = await Promise.allSettled(
      symList.map(sym => yahooFinance.quote(sym))
    );
    
    const dataArray = results
      .filter(result => result.status === 'fulfilled' && result.value)
      .map(result => Array.isArray(result.value) ? result.value[0] : result.value)
      .filter(Boolean);
      
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataArray)
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: e.message })
    };
  }
};
