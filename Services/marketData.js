import axios from "axios";

// ==========================================
// ASSET ORIGINAL CURRENCIES (Base Currencies)
// ==========================================
export const ASSET_CURRENCIES = {
  // Commodities (USD)
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

  // Interest Rates (Yields, treated as local/absolute)
  "IN2YT=RR": "Local",
  "IN10YT=RR": "Local",
  "US2YT=RR": "Local",
  "^TNX": "Local",
  "JP2YT=RR": "Local",
  "JP10YT=RR": "Local",
  "CN2YT=RR": "Local",
  "CN10YT=RR": "Local",

  // Equity Indices
  "^NSEI": "INR",
  "^NSEBANK": "INR",
  "^DJI": "USD",
  "^GSPC": "USD",
  "^IXIC": "USD",
  "^N225": "JPY",
  "000001.SS": "CNY",
  "^HSI": "HKD",
  "^GDAXI": "EUR",
  "^FCHI": "EUR",
  "^FTSE": "GBP",
  "^BVSP": "BRL",
  "IMOEX.ME": "RUB",

  // Forex
  "USDINR=X": "Local",
  "DX-Y.NYB": "Local",
  "EURINR=X": "Local",
  "JPYINR=X": "Local"
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
    const response = await axios.get("/api/frankfurter/latest?from=INR");
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
// MOCK DATA for tickers not supported on Yahoo Finance
// (India/Japan/China bond yields, etc.)
// ==========================================
const MOCK_QUOTES = {
  'IN2YT=RR':  { price: 7.02, changePercent: -0.10 },
  'IN10YT=RR': { price: 7.15, changePercent: 0.14 },
  'US2YT=RR':  { price: 4.75, changePercent: 0.05 },
  'JP2YT=RR':  { price: 0.25, changePercent: 0.01 },
  'JP10YT=RR': { price: 1.05, changePercent: 0.02 },
  'CN2YT=RR':  { price: 1.85, changePercent: -0.01 },
  'CN10YT=RR': { price: 2.25, changePercent: -0.02 }
};

const MOCK_HISTORY = {
  "IN2YT=RR": [
    { day: "Mon", value: 7.05, open: 7.02, high: 7.06, low: 7.01, close: 7.05 },
    { day: "Tue", value: 7.02, open: 7.05, high: 7.05, low: 6.99, close: 7.02 },
    { day: "Wed", value: 6.98, open: 7.02, high: 7.03, low: 6.95, close: 6.98 },
    { day: "Thu", value: 7.01, open: 6.98, high: 7.02, low: 6.98, close: 7.01 },
    { day: "Fri", value: 7.02, open: 7.01, high: 7.04, low: 7.00, close: 7.02 }
  ],
  "IN10YT=RR": [
    { day: "Mon", value: 7.18, open: 7.15, high: 7.20, low: 7.14, close: 7.18 },
    { day: "Tue", value: 7.15, open: 7.18, high: 7.19, low: 7.12, close: 7.15 },
    { day: "Wed", value: 7.10, open: 7.15, high: 7.16, low: 7.08, close: 7.10 },
    { day: "Thu", value: 7.12, open: 7.10, high: 7.14, low: 7.09, close: 7.12 },
    { day: "Fri", value: 7.15, open: 7.12, high: 7.17, low: 7.11, close: 7.15 }
  ],
  "US2YT=RR": [
    { day: "Mon", value: 4.70, open: 4.68, high: 4.72, low: 4.65, close: 4.70 },
    { day: "Tue", value: 4.72, open: 4.70, high: 4.75, low: 4.68, close: 4.72 },
    { day: "Wed", value: 4.75, open: 4.72, high: 4.78, low: 4.71, close: 4.75 },
    { day: "Thu", value: 4.73, open: 4.75, high: 4.76, low: 4.70, close: 4.73 },
    { day: "Fri", value: 4.75, open: 4.73, high: 4.77, low: 4.72, close: 4.75 }
  ],
  "JP2YT=RR": [
    { day: "Mon", value: 0.22, open: 0.20, high: 0.23, low: 0.19, close: 0.22 },
    { day: "Tue", value: 0.23, open: 0.22, high: 0.25, low: 0.21, close: 0.23 },
    { day: "Wed", value: 0.24, open: 0.23, high: 0.26, low: 0.22, close: 0.24 },
    { day: "Thu", value: 0.25, open: 0.24, high: 0.27, low: 0.23, close: 0.25 },
    { day: "Fri", value: 0.25, open: 0.25, high: 0.26, low: 0.24, close: 0.25 }
  ],
  "JP10YT=RR": [
    { day: "Mon", value: 1.02, open: 1.00, high: 1.04, low: 0.99, close: 1.02 },
    { day: "Tue", value: 1.03, open: 1.02, high: 1.05, low: 1.01, close: 1.03 },
    { day: "Wed", value: 1.05, open: 1.03, high: 1.07, low: 1.02, close: 1.05 },
    { day: "Thu", value: 1.04, open: 1.05, high: 1.06, low: 1.03, close: 1.04 },
    { day: "Fri", value: 1.05, open: 1.04, high: 1.06, low: 1.03, close: 1.05 }
  ],
  "CN2YT=RR": [
    { day: "Mon", value: 1.88, open: 1.90, high: 1.92, low: 1.85, close: 1.88 },
    { day: "Tue", value: 1.87, open: 1.88, high: 1.89, low: 1.84, close: 1.87 },
    { day: "Wed", value: 1.85, open: 1.87, high: 1.88, low: 1.83, close: 1.85 },
    { day: "Thu", value: 1.86, open: 1.85, high: 1.87, low: 1.84, close: 1.86 },
    { day: "Fri", value: 1.85, open: 1.86, high: 1.88, low: 1.84, close: 1.85 }
  ],
  "CN10YT=RR": [
    { day: "Mon", value: 2.28, open: 2.30, high: 2.32, low: 2.25, close: 2.28 },
    { day: "Tue", value: 2.27, open: 2.28, high: 2.29, low: 2.24, close: 2.27 },
    { day: "Wed", value: 2.25, open: 2.27, high: 2.28, low: 2.23, close: 2.25 },
    { day: "Thu", value: 2.26, open: 2.25, high: 2.27, low: 2.24, close: 2.26 },
    { day: "Fri", value: 2.25, open: 2.26, high: 2.28, low: 2.24, close: 2.25 }
  ]
};

// ==========================================
// YAHOO FINANCE — EOD QUOTES
// ==========================================

// Maps JS Date.getDay() index → short day name
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Returns the short weekday name ("Mon", "Tue", ...) for a given date value.
 * Accepts a Date object, ISO string, or Unix timestamp (ms).
 */
export const getDayLabel = (dateVal) => {
  if (!dateVal) return "--";
  const d = dateVal instanceof Date ? dateVal : new Date(dateVal);
  return isNaN(d.getTime()) ? "--" : DAY_NAMES[d.getDay()];
};

/**
 * Fetches EOD quotes via the local Yahoo Finance Vite plugin.
 *
 * Price logic:
 *   - regularMarketPrice  = last traded price (= close when market is shut)
 *   - regularMarketChangePercent = change vs. previous session's close
 * Both fields describe the same session, so they are always consistent.
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
          // Use regularMarketPrice — it equals the session close when the
          // exchange is shut, and is always paired with regularMarketChangePercent.
          const price = item.regularMarketPrice ?? null;
          const changePercent = item.regularMarketChangePercent ?? 0;

          quotesMap[item.symbol] = { price, changePercent };
        }
      });
    }
    return quotesMap;
  } catch (error) {
    console.warn("Failed fetching Yahoo Finance EOD quotes:", error);
    return {};
  }
};

// ==========================================
// MAIN QUOTE FETCHER — all assets via Yahoo Finance
// ==========================================

/**
 * Fetches end-of-day quotes for all dashboard assets using Yahoo Finance.
 * Upstox has been fully removed.
 */
export const getLatestQuotes = async (currentData, _unused, onExchangeRatesUpdate) => {
  try {
    const categories = Object.keys(currentData);

    // Collect every ticker that's NOT a mock-only one
    const yahooTickers = [];
    categories.forEach(category => {
      currentData[category].forEach(asset => {
        if (!MOCK_QUOTES[asset.ticker]) {
          yahooTickers.push(asset.ticker);
        }
      });
    });

    const yahooQuotesMap = await fetchYahooQuotes(yahooTickers);

    const updatedData = { ...currentData };
    categories.forEach(category => {
      updatedData[category] = currentData[category].map(asset => {
        const ticker = asset.ticker;

        // Use real Yahoo data or fall back to mock
        let quote = yahooQuotesMap[ticker] || MOCK_QUOTES[ticker] || null;

        if (quote && quote.price != null) {
          const rawPrice = quote.price;
          const rawChange = quote.changePercent != null ? quote.changePercent : 0;

          return {
            ...asset,
            value: rawPrice,
            changePercent: `${rawChange >= 0 ? "+" : ""}${rawChange.toFixed(2)}%`,
            isPositive: rawChange >= 0
          };
        }
        return asset; // Keep current values if quote is missing
      });
    });

    return updatedData;
  } catch (error) {
    console.warn("Failed fetching EOD market data:", error);
    return currentData;
  }
};

// ==========================================
// HISTORY FETCHER — 5 most recent trading days via Yahoo Finance
// ==========================================

/**
 * Fetches the last 5 trading-day OHLC bars for a ticker via Yahoo Finance.
 * Falls back to mock data for tickers not covered by Yahoo.
 */
export const getAssetHistory = async (ticker, _unused, fallbackHistory) => {
  // Return mock history immediately for unsupported tickers
  if (MOCK_HISTORY[ticker]) {
    return MOCK_HISTORY[ticker];
  }

  try {
    const response = await axios.get('/api/yfinance/history', {
      params: { symbol: ticker }
    });

    if (response.data && response.data.quotes && response.data.quotes.length > 0) {
      // Take the last 5 completed daily candles (most recent = last in array)
      const candles = response.data.quotes
        .filter(q => q.close != null) // drop partial/null candles
        .slice(-5);

      return candles.map((q) => ({
        // Derive the real weekday name from the candle's date — never hard-code
        // Mon/Tue/… by index because that breaks across week boundaries.
        day: getDayLabel(q.date),
        value: q.close,
        open: q.open,
        high: q.high,
        low: q.low,
        close: q.close
      }));
    }

    return fallbackHistory;
  } catch (error) {
    console.warn(`Failed fetching chart history for ${ticker}:`, error);
    return fallbackHistory || [];
  }
};
