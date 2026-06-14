import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ 
  suppressNotices: ['yahooSurvey'],
  validation: { logErrors: false }
});

function yahooFinancePlugin() {
  return {
    name: 'yahoo-finance-api',
    configureServer(server) {
      // Endpoint for multiple live quotes
      server.middlewares.use('/api/yfinance/quotes', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const symbols = url.searchParams.get('symbols');
        if (!symbols) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'symbols required' }));
        }
        try {
          const symList = symbols.split(',');
          
          // Fetch each quote individually, ignoring failures
          const results = await Promise.allSettled(
            symList.map(sym => yahooFinance.quote(sym))
          );
          
          const dataArray = results
            .filter(result => result.status === 'fulfilled' && result.value)
            .map(result => Array.isArray(result.value) ? result.value[0] : result.value)
            .filter(Boolean);
          
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(dataArray));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });

      // Endpoint for historical charts
      server.middlewares.use('/api/yfinance/history', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const symbol = url.searchParams.get('symbol');
        if (!symbol) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'symbol required' }));
        }
        try {
          const result = await yahooFinance.chart(symbol, {
            period1: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // last 10 days
            period2: new Date(),
            interval: '1d'
          });
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ quotes: result.quotes || [] }));
        } catch (e) {
          res.statusCode = 200;
          res.end(JSON.stringify({ quotes: [] }));
        }
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), yahooFinancePlugin()],
  server: {
    proxy: {
      '/api/upstox': {
        target: 'https://api.upstox.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/upstox/, '')
      }
    }
  }
});
