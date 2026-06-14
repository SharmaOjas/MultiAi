import axios from "axios";

// ==========================================
// ASSET ORIGINAL CURRENCIES (Base Currencies)
// ==========================================
export const ASSET_CURRENCIES = {
  // Commodities
  "GC=F": "USD",
  "BZ=F": "USD",
  "CL=F": "USD",
  "NG=F": "USD",
  "SI=F": "USD",
  "CT=F": "USD",
  "KE=F": "USD",
  "HRC=F": "USD",
  "ALI=F": "USD",
  "HG=F": "USD",
  "LIT=F": "USD",
  "ZNC=F": "USD",

  // Equity Indices (all INR via Upstox)
  "^NSEI": "INR",
  "^NSEBANK": "INR",
  "^BSESN": "INR",
  "^NSEI_IT": "INR",
  "^NSEI_AUTO": "INR",
  "^NSEI_PHARMA": "INR",
  "^NSEI_FMCG": "INR",
  "^NSEI_METAL": "INR",
  "^NSEI_REALTY": "INR",
  "^NSEI_ENERGY": "INR",
  "^NSEI_INFRA": "INR",
  "^NSEI_PSE": "INR",
  "^NSEI_NEXT50": "INR"
};

// ==========================================
// FALLBACK BASELINE EXCHANGE RATES RELATIVE TO INR
// ==========================================
export const BASE_INR_EXCHANGE_RATES = {
  INR: 1.0,
  USD: 83.52,  // 1 USD = 83.52 INR
  EUR: 90.45,  // 1 EUR = 90.45 INR
  GBP: 105.00, // 1 GBP = 105.00 INR
  JPY: 0.5340, // 1 JPY = 0.5340 INR
  CNY: 11.50,  // 1 CNY = 11.50 INR
  HKD: 10.70,  // 1 HKD = 10.70 INR
  BRL: 16.00,  // 1 BRL = 16.00 INR
  RUB: 0.95    // 1 RUB = 0.95 INR
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// ==========================================
// CURRENCY CONVERSION HELPERS
// ==========================================

/**
 * Safe parser to convert numeric strings with symbols/commas to floats
 */
export const parseStringToNumber = (val) => {
  if (val === undefined || val === null || val === "--") return NaN;
  if (typeof val === "number") return val;
  const clean = val.toString().replace(/[$,₹,€,£,¥,₽,\s,%,]/g, "");
  const parsed = parseFloat(clean);
  return isNaN(parsed) ? NaN : parsed;
};

/**
 * Converts a numeric value from one currency to another using the exchange rates
 */
export const convertValue = (val, fromCurrency, toCurrency, rates = BASE_INR_EXCHANGE_RATES) => {
  if (!fromCurrency || !toCurrency || fromCurrency === toCurrency) return val;
  
  const rateFrom = rates[fromCurrency] || BASE_INR_EXCHANGE_RATES[fromCurrency] || 1.0;
  const valInINR = val * rateFrom;
  
  const rateTo = rates[toCurrency] || BASE_INR_EXCHANGE_RATES[toCurrency] || 1.0;
  return valInINR / rateTo;
};

/**
 * Formats a currency value with its appropriate prefix symbol
 */
export const formatCurrencyValue = (val, currency) => {
  if (val === undefined || val === null || isNaN(val)) return "--";
  const symbolMap = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
    JPY: "¥",
    CNY: "¥",
    HKD: "HK$",
    BRL: "R$",
    RUB: "₽"
  };
  const prefix = symbolMap[currency] || "";

  if (val >= 1000) {
    return `${prefix}${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `${prefix}${val.toFixed(2)}`;
};

// ==========================================
// DYNAMIC EXCHANGE RATES LOADER (Frankfurter API)
// ==========================================
export const fetchDynamicExchangeRates = async () => {
  try {
    const response = await axios.get("https://api.frankfurter.app/latest?from=INR");
    const rates = response.data?.rates || {};
    
    // Initialize rates map with base currency INR = 1.0
    const processedRates = { INR: 1.0 };
    
    // Frankfurter API returns 1 INR = X Foreign Currency (e.g. USD: 0.0119)
    // We process it to get 1 Unit of Foreign Currency = Y INR (1 / X)
    Object.keys(rates).forEach((currency) => {
      processedRates[currency] = 1 / rates[currency];
    });

    return processedRates;
  } catch (error) {
    console.warn("Failed fetching daily dynamic exchange rates from Frankfurter API, using fallback:", error);
    return BASE_INR_EXCHANGE_RATES;
  }
};

// ==========================================
// UPSTOX TICKER MAP
// Maps our internal ticker IDs to Upstox instrument_key format
// Response keys from Upstox use ":" (colon), request keys use "|" (pipe)
// ==========================================
const UPSTOX_TICKER_MAP = {
  // Equity Indices (these work reliably with Upstox free API)
  "^NSEI": "NSE_INDEX|Nifty 50",
  "^NSEBANK": "NSE_INDEX|Nifty Bank",
  "^BSESN": "BSE_INDEX|SENSEX",
  "^NSEI_IT": "NSE_INDEX|Nifty IT",
  "^NSEI_AUTO": "NSE_INDEX|Nifty Auto",
  "^NSEI_PHARMA": "NSE_INDEX|Nifty Pharma",
  "^NSEI_FMCG": "NSE_INDEX|Nifty FMCG",
  "^NSEI_METAL": "NSE_INDEX|Nifty Metal",
  "^NSEI_REALTY": "NSE_INDEX|Nifty Realty",
  "^NSEI_ENERGY": "NSE_INDEX|Nifty Energy",
  "^NSEI_INFRA": "NSE_INDEX|Nifty Infrastructure",
  "^NSEI_PSE": "NSE_INDEX|Nifty PSE",
  "^NSEI_NEXT50": "NSE_INDEX|Nifty Next 50"
};

/**
 * Convert Upstox instrument_key (pipe) to response key format (colon)
 * e.g., "NSE_INDEX|Nifty 50" → "NSE_INDEX:Nifty 50"
 */
const toResponseKey = (instrumentKey) => instrumentKey.replace("|", ":");

/**
 * Fetches real-time quotes using Upstox API
 */
const fetchUpstoxQuotes = async (symbols, upstoxToken) => {
  const upstoxKeys = symbols
    .map(sym => UPSTOX_TICKER_MAP[sym])
    .filter(Boolean);

  if (upstoxKeys.length === 0) return {};

  // Create a reverse map from Upstox instrument key to original ticker
  const upstoxToTicker = {};
  symbols.forEach(sym => {
    if (UPSTOX_TICKER_MAP[sym]) {
      upstoxToTicker[UPSTOX_TICKER_MAP[sym]] = sym;
    }
  });

  try {
    const response = await axios.get(
      "/api/upstox/v2/market-quote/quotes",
      {
        params: { instrument_key: upstoxKeys.join(",") },
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${upstoxToken}`
        }
      }
    );

    const data = response.data?.data || {};
    const quotesMap = {};
    
    Object.keys(data).forEach(responseKey => {
      const item = data[responseKey];
      const instrKey = item.instrument_token || responseKey.replace(":", "|");
      const lastPrice = item.last_price;
      const netChange = item.net_change;
      
      // Calculate change percentage from net_change
      let changePercent = 0;
      if (netChange !== undefined && lastPrice !== undefined) {
        const prevClose = lastPrice - netChange;
        if (prevClose !== 0) {
          changePercent = (netChange / prevClose) * 100;
        }
      }
      
      const originalTicker = upstoxToTicker[instrKey];
      if (originalTicker) {
        quotesMap[originalTicker] = {
          price: lastPrice,
          changePercent: changePercent,
          ohlc: item.ohlc
        };
      }
    });
    
    return quotesMap;
  } catch (error) {
    console.warn("Failed fetching Upstox quotes:", error);
    return {};
  }
};

/**
 * Fetches real-time quotes using local Yahoo Finance plugin
 */
const fetchYahooQuotes = async (symbols) => {
  if (symbols.length === 0) return {};
  
  try {
    const response = await axios.get('/api/yfinance/quotes', {
      params: { symbols: symbols.join(',') }
    });
    
    const quotesMap = {};
    if (Array.isArray(response.data)) {
      response.data.forEach(item => {
        if (item && item.symbol) {
          quotesMap[item.symbol] = {
            price: item.regularMarketPrice,
            changePercent: item.regularMarketChangePercent
          };
        }
      });
    }
    return quotesMap;
  } catch (error) {
    console.warn("Failed fetching Yahoo quotes:", error);
    return {};
  }
};

/**
 * Main function to fetch quotes for all dashboard assets
 */
export const getLatestQuotes = async (currentData, upstoxToken, onExchangeRatesUpdate) => {
  try {
    const categories = Object.keys(currentData);
    const upstoxTickers = [];
    const yahooTickers = [];

    categories.forEach(category => {
      currentData[category].forEach(asset => {
        if (UPSTOX_TICKER_MAP[asset.ticker]) {
          upstoxTickers.push(asset.ticker);
        } else {
          yahooTickers.push(asset.ticker);
        }
      });
    });

    const [upstoxQuotesMap, yahooQuotesMap] = await Promise.all([
      (!upstoxToken || upstoxToken.includes("YOUR_")) ? {} : fetchUpstoxQuotes(upstoxTickers, upstoxToken),
      fetchYahooQuotes(yahooTickers)
    ]);

    const updatedData = { ...currentData };
    categories.forEach(category => {
      updatedData[category] = currentData[category].map(asset => {
        let quote = null;
        quote = upstoxQuotesMap[asset.ticker] || yahooQuotesMap[asset.ticker];

        if (quote && quote.price != null) {
          let rawPrice = quote.price;
          const rawChange = quote.changePercent != null ? quote.changePercent : 0;
          
          return {
            ...asset,
            value: rawPrice,
            changePercent: `${rawChange >= 0 ? "+" : ""}${rawChange.toFixed(2)}%`,
            isPositive: rawChange >= 0
          };
        }
        return asset; // Keep current values if quote missing
      });
    });

    return updatedData;
  } catch (error) {
    console.warn("Failed fetching live market data:", error);
    return currentData;
  }
};

/**
 * Fetches 5-day historical pricing (OHLC) for a specific ticker
 */
export const getAssetHistory = async (ticker, upstoxToken, fallbackHistory) => {
  try {
    const upstoxSymbol = UPSTOX_TICKER_MAP[ticker];
    
    // If it's a Yahoo Finance ticker
    if (!upstoxSymbol) {
      const response = await axios.get('/api/yfinance/history', {
        params: { symbol: ticker }
      });
      
      const quotes = response.data?.quotes || [];
      // Filter out any null/undefined close values
      const validQuotes = quotes.filter(q => q.close != null);
      const parsed = validQuotes.slice(-5).map((q) => {
        const dateObj = new Date(q.date);
        const dayStr = isNaN(dateObj) ? "Day" : new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(dateObj);
        return {
          day: dayStr,
          value: q.close,
          open: q.open,
          high: q.high,
          low: q.low,
          close: q.close
        };
      });
      return parsed;
    }

    // Otherwise, Upstox ticker logic
    if (!upstoxToken || upstoxToken.trim() === "" || upstoxToken.includes("YOUR_")) {
      return [];
    }
    const today = new Date().toISOString().split("T")[0];
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

    const response = await axios.get(
      `/api/upstox/v2/historical-candle/${encodeURIComponent(upstoxSymbol)}/day/${today}/${tenDaysAgo}`,
      {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${upstoxToken}`
        }
      }
    );

    const candles = response.data?.data?.candles || [];
    // Candle format: [timestamp, open, high, low, close, volume, oi]
    const parsed = candles.slice(0, 5).reverse().map((candle, idx) => {
      let open = candle[1];
      let high = candle[2];
      let low = candle[3];
      let close = candle[4];

      return {
        day: DAYS[idx] || "Day",
        value: close,
        open: open,
        high: high,
        low: low,
        close: close
      };
    });

    return parsed;
  } catch (error) {
    console.warn(`Failed fetching chart history for ticker ${ticker}:`, error);
    return [];
  }
};
