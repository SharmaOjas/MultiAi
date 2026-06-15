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
      // Endpoint: EOD quotes (previous close) for multiple symbols
      server.middlewares.use('/api/yfinance/quotes', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const symbols = url.searchParams.get('symbols');
        if (!symbols) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'symbols required' }));
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

          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(dataArray));
        } catch (e) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: e.message }));
        }
      });

      // Endpoint: 5-day daily OHLC history for a single symbol
      server.middlewares.use('/api/yfinance/history', async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        const symbol = url.searchParams.get('symbol');
        if (!symbol) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'symbol required' }));
        }
        try {
          const result = await yahooFinance.chart(symbol, {
            period1: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // last 10 calendar days
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
      // Proxy Frankfurter exchange-rate API to avoid browser CORS issues
      '/api/frankfurter': {
        target: 'https://api.frankfurter.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/frankfurter/, '')
      }
    }
  }
});
