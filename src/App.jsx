import { useState, useEffect, useRef } from "react";
import CommodityCard from "../components/CommodityCard";
import InterestRateCard from "../components/InterestRateCard";
import EquityCard from "../components/EquityCard";
import ForexCard from "../components/ForexCard";
import SearchPanel from "../components/SearchPanel";
import OutputPanel from "../components/OutputPanel";
import {
  getLatestQuotes,
  getAssetHistory,
  ASSET_CURRENCIES,
  BASE_INR_EXCHANGE_RATES,
  convertValue,
  formatCurrencyValue,
  parseStringToNumber,
  fetchDynamicExchangeRates
} from "../Services/marketData";
import "./App.css";

// Dynamic financial database — starts empty (shows "--" until API provides real data)
const initialData = {
  commodity: [
    { name: "Gold ($)", ticker: "GC=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Brent Crude", ticker: "BZ=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "WTI Crude", ticker: "CL=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Natural Gas", ticker: "NG=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Silver", ticker: "SI=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Cotton", ticker: "CT=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Wheat", ticker: "KE=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Steel", ticker: "HRC=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Aluminium", ticker: "ALI=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Copper", ticker: "HG=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Lithium", ticker: "LIT=F", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Zinc", ticker: "ZNC=F", value: "--", changePercent: "--", isPositive: null, history: [] }
  ],
  interest_rate: [
    { name: "India 2Y G-Sec", ticker: "IN2YT=RR", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "India 10Y G-Sec", ticker: "IN10YT=RR", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "US 2Y Treasury", ticker: "US2YT=RR", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "US 10Y Treasury", ticker: "^TNX", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Japan 2Y", ticker: "JP2YT=RR", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Japan 10Y", ticker: "JP10YT=RR", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "China 2Y", ticker: "CN2YT=RR", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "China 10Y", ticker: "CN10YT=RR", value: "--", changePercent: "--", isPositive: null, history: [] }
  ],
  equity_index: [
    { name: "Nifty 50", ticker: "^NSEI", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Bank Nifty", ticker: "^NSEBANK", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Dow Jones", ticker: "^DJI", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "S&P 500", ticker: "^GSPC", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "NASDAQ", ticker: "^IXIC", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Nikkei", ticker: "^N225", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Shanghai", ticker: "000001.SS", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Hang Seng", ticker: "^HSI", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "DAX", ticker: "^GDAXI", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "CAC", ticker: "^FCHI", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "FTSE", ticker: "^FTSE", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "Bovespa", ticker: "^BVSP", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "MOEX Russia", ticker: "IMOEX.ME", value: "--", changePercent: "--", isPositive: null, history: [] }
  ],
  forex: [
    { name: "USD/INR", ticker: "USDINR=X", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "DXY", ticker: "DX-Y.NYB", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "EUR/INR", ticker: "EURINR=X", value: "--", changePercent: "--", isPositive: null, history: [] },
    { name: "JPY/INR", ticker: "JPYINR=X", value: "--", changePercent: "--", isPositive: null, history: [] }
  ]
};

function App() {
  const [marketData, setMarketData] = useState(initialData);
  const [targetCurrency, setTargetCurrency] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState(BASE_INR_EXCHANGE_RATES);

  // Upstox Access Token state (persisted via LocalStorage)
  const [upstoxToken, setUpstoxToken] = useState(() => localStorage.getItem("upstox_access_token") || "");
  const [tokenInput, setTokenInput] = useState(upstoxToken);
  const [showConfig, setShowConfig] = useState(false);

  // Local card-specific selection state managed as tickers
  const [selectedCommodityTicker, setSelectedCommodityTicker] = useState(initialData.commodity[0].ticker);
  const [selectedInterestRateTicker, setSelectedInterestRateTicker] = useState("^TNX");
  const [selectedEquityTicker, setSelectedEquityTicker] = useState(initialData.equity_index[0].ticker);
  const [selectedForexTicker, setSelectedForexTicker] = useState(initialData.forex[0].ticker);

  // Control panel inputs & output panel state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMode, setActiveMode] = useState(1);
  const [isPromptRunning, setIsPromptRunning] = useState(false);
  const [promptOutput, setPromptOutput] = useState("");

  const marketDataRef = useRef(marketData);
  useEffect(() => {
    marketDataRef.current = marketData;
  }, [marketData]);

  // 1. Fetch daily exchange rates dynamically from Frankfurter on mount
  useEffect(() => {
    const loadExchangeRates = async () => {
      const rates = await fetchDynamicExchangeRates();
      setExchangeRates(rates);
    };
    loadExchangeRates();
  }, []);

  // 2. Fetch quotes in the background
  useEffect(() => {
    const loadQuotes = async () => {
      const updated = await getLatestQuotes(
        marketDataRef.current,
        upstoxToken,
        (rates) => {
          setExchangeRates(prev => ({ ...prev, ...rates }));
        }
      );
      setMarketData(updated);
    };

    loadQuotes();
    const interval = setInterval(loadQuotes, 60000);
    return () => clearInterval(interval);
  }, [upstoxToken]);

  // 3. Fetch real-time chart history when selected asset changes
  useEffect(() => {
    let isMounted = true;
    
    const fetchHistoryForTicker = async (ticker, category) => {
      const list = marketDataRef.current[category];
      const asset = list.find(a => a.ticker === ticker);
      if (!asset || asset.hasRealHistory) return;

      const realHistory = await getAssetHistory(ticker, upstoxToken, asset.history);
      if (isMounted) {
        setMarketData(prev => ({
          ...prev,
          [category]: prev[category].map(a => 
            a.ticker === ticker 
              ? { ...a, history: realHistory, hasRealHistory: true } 
              : a
          )
        }));
      }
    };

    fetchHistoryForTicker(selectedCommodityTicker, "commodity");
    fetchHistoryForTicker(selectedInterestRateTicker, "interest_rate");
    fetchHistoryForTicker(selectedEquityTicker, "equity_index");
    fetchHistoryForTicker(selectedForexTicker, "forex");

    return () => {
      isMounted = false;
    };
  }, [selectedCommodityTicker, selectedInterestRateTicker, selectedEquityTicker, selectedForexTicker, upstoxToken]);

  // Configure Access Token handlers
  const handleSaveToken = () => {
    localStorage.setItem("upstox_access_token", tokenInput);
    setUpstoxToken(tokenInput);
    setShowConfig(false);
    
    // Clear hasRealHistory tags to trigger history re-fetch
    setMarketData(prev => {
      const reset = {};
      Object.keys(prev).forEach(cat => {
        reset[cat] = prev[cat].map(a => ({ ...a, hasRealHistory: false }));
      });
      return reset;
    });
  };

  const handleClearToken = () => {
    localStorage.removeItem("upstox_access_token");
    setTokenInput("");
    setUpstoxToken("");
    setShowConfig(false);
    setMarketData(initialData);
  };

  // Dynamic currency conversion helper
  const convertAsset = (asset, category) => {
    if (category === "interest_rate" || category === "forex") {
      return asset;
    }
    
    // If value is placeholder "--", skip conversion entirely
    if (asset.value === "--" || asset.value === null || asset.value === undefined) {
      return asset;
    }
    
    const fromCurrency = ASSET_CURRENCIES[asset.ticker] || "USD";
    const toCurrency = asset.ticker === "GC=F" ? "USD" : (targetCurrency === "Local" ? fromCurrency : targetCurrency);
    
    const rawValue = typeof asset.value === "number" 
      ? asset.value 
      : parseStringToNumber(asset.value);
    
    if (isNaN(rawValue) || rawValue === 0) {
      return asset;
    }
    
    const convertedValue = convertValue(rawValue, fromCurrency, toCurrency, exchangeRates);
    const formattedValue = formatCurrencyValue(convertedValue, toCurrency);

    // Convert chart data
    const convertedHistory = (asset.history || []).map(item => {
      const rawHistVal = parseStringToNumber(item.value);
      if (isNaN(rawHistVal) || rawHistVal === 0) return item;
      const convertedHistVal = convertValue(rawHistVal, fromCurrency, toCurrency, exchangeRates);
      
      const result = {
        ...item,
        value: convertedHistVal
      };

      if (item.open !== undefined) {
        result.open = convertValue(parseStringToNumber(item.open), fromCurrency, toCurrency, exchangeRates);
        result.high = convertValue(parseStringToNumber(item.high), fromCurrency, toCurrency, exchangeRates);
        result.low = convertValue(parseStringToNumber(item.low), fromCurrency, toCurrency, exchangeRates);
        result.close = convertValue(parseStringToNumber(item.close), fromCurrency, toCurrency, exchangeRates);
      }

      return result;
    });

    return {
      ...asset,
      value: formattedValue,
      history: convertedHistory
    };
  };

  // Build converted derived lists
  const convertedData = {
    commodity: marketData.commodity.map(a => convertAsset(a, "commodity")),
    interest_rate: marketData.interest_rate.map(a => convertAsset(a, "interest_rate")),
    equity_index: marketData.equity_index.map(a => convertAsset(a, "equity_index")),
    forex: marketData.forex.map(a => convertAsset(a, "forex"))
  };

  // Select corresponding active converted assets
  const selectedCommodity = convertedData.commodity.find(a => a.ticker === selectedCommodityTicker) || convertedData.commodity[0];
  const selectedInterestRate = convertedData.interest_rate.find(a => a.ticker === selectedInterestRateTicker) || convertedData.interest_rate[0];
  const selectedEquity = convertedData.equity_index.find(a => a.ticker === selectedEquityTicker) || convertedData.equity_index[0];
  const selectedForex = convertedData.forex.find(a => a.ticker === selectedForexTicker) || convertedData.forex[0];

  const handleRunPrompt = () => {
    setIsPromptRunning(true);
    setPromptOutput("");

    let targetAsset = "";
    let targetDetails = "";
    const companyText = searchQuery.trim() ? `referencing key entity "${searchQuery.trim()}"` : "under current corporate holdings";

    switch (activeMode) {
      case 1:
        targetAsset = `${selectedCommodity.name} (${selectedCommodity.ticker})`;
        targetDetails = `Commodity market fluctuations show a strong consolidation cycle for ${targetAsset}. ${companyText ? `Analyzing ${companyText}, resource cost bases and supply chain hedging indicate medium sensitivity to spot variations. ` : ""}Historically, current valuation metrics of ${selectedCommodity.value} (${selectedCommodity.changePercent}) remain within standard weekly boundaries with technical support established.`;
        break;
      case 2:
        targetAsset = `${selectedInterestRate.name} (${selectedInterestRate.ticker})`;
        targetDetails = `Yield curves for ${targetAsset} are flattening following recent central bank announcements. Corporate capital expenditures ${searchQuery.trim() ? `for "${searchQuery.trim()}"` : ""} are highly leveraged to these long-duration debt cost adjustments. The current yield of ${selectedInterestRate.value} (${selectedInterestRate.changePercent}) indicates tight credit conditions in local regions.`;
        break;
      case 3:
        targetAsset = `${selectedEquity.name} (${selectedEquity.ticker})`;
        targetDetails = `The ${targetAsset} equity index has exhibited a major sector rotation. Mega-cap performance profiles ${searchQuery.trim() ? `associated with "${searchQuery.trim()}" correlation lists` : ""} outline strong support levels near moving averages. Current index pricing sits at ${selectedEquity.value} (${selectedEquity.changePercent}), showing positive technical momentum for momentum traders.`;
        break;
      case 4:
        targetAsset = `${selectedForex.name} (${selectedForex.ticker})`;
        targetDetails = `Currency exchange valuation for ${targetAsset} remains range-bound. Foreign exchange exposures ${searchQuery.trim() ? `for corporate importer "${searchQuery.trim()}"` : ""} present short-term hedging opportunities at spot rates. The currency index rate stands at ${selectedForex.value} (${selectedForex.changePercent}) with a baseline established.`;
        break;
      default:
        targetDetails = "Macro-economic indicators are stable. Ready to synthesize next trigger request.";
    }

    setTimeout(() => {
      setIsPromptRunning(false);
      setPromptOutput(
        `AI MACRO SCALE ANALYTICS REPORT\n================================\nMode: Mode ${activeMode} - ${getModeName(activeMode)}\nAsset Reference: ${targetAsset}\nValuation: ${getActiveAssetValuation(activeMode)}\n\nEXECUTIVE INSIGHT:\n${targetDetails}\n\nTECHNICAL OUTLOOK:\nVolume profile indicators indicate institutional accumulation. Hedging recommendations suggest maintaining standard long ratios in low-beta assets.`
      );
    }, 1200);
  };

  const getModeName = (mode) => {
    if (mode === 1) return "Commodity Analysis";
    if (mode === 2) return "Interest Rate Analysis";
    if (mode === 3) return "Equity Analysis";
    if (mode === 4) return "Forex Analysis";
    return "";
  };

  const getActiveAssetValuation = (mode) => {
    if (mode === 1) return `${selectedCommodity.value} (${selectedCommodity.changePercent})`;
    if (mode === 2) return `${selectedInterestRate.value} (${selectedInterestRate.changePercent})`;
    if (mode === 3) return `${selectedEquity.value} (${selectedEquity.changePercent})`;
    if (mode === 4) return `${selectedForex.value} (${selectedForex.changePercent})`;
    return "";
  };

  return (
    <div className="macro-scale-app">
      {/* Dynamic Dashboard Header Bar */}
      <header className="dashboard-header-bar">
        <div className="header-brand">
          <div className="header-brand-logo">M</div>
          <h1 className="header-brand-name">MacroScale</h1>
        </div>
        
        <div className="header-meta-group" style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* API Configuration Button Overlay */}
          <div className="api-config-container" style={{ position: "relative" }}>
            <button
              onClick={() => setShowConfig(!showConfig)}
              style={{
                backgroundColor: upstoxToken ? "var(--accent-bg)" : "rgba(255, 255, 255, 0.04)",
                color: upstoxToken ? "var(--accent-light)" : "var(--text-secondary)",
                border: `1px solid ${upstoxToken ? "var(--accent-border)" : "var(--border-color)"}`,
                borderRadius: "6px",
                padding: "5px 12px",
                fontSize: "11px",
                fontFamily: "var(--mono)",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.2s ease"
              }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <span>{upstoxToken ? "ACTIVE TOKEN" : "CONFIGURE API"}</span>
            </button>

            {showConfig && (
              <div
                style={{
                  position: "absolute",
                  top: "34px",
                  right: "0",
                  width: "280px",
                  backgroundColor: "var(--bg-card)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  padding: "16px",
                  boxShadow: "0 12px 30px -5px rgba(0,0,0,0.8)",
                  zIndex: 999,
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}
              >
                <div style={{ fontSize: "11px", fontWeight: "700", color: "var(--text-primary)", fontFamily: "var(--mono)" }}>
                  UPSTOX ACCESS TOKEN
                </div>
                <input
                  type="password"
                  placeholder="Paste Upstox OAuth token..."
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  style={{
                    backgroundColor: "rgba(0, 0, 0, 0.3)",
                    border: "1px solid var(--border-color)",
                    borderRadius: "4px",
                    padding: "8px 10px",
                    color: "var(--text-primary)",
                    fontSize: "11px",
                    fontFamily: "var(--mono)",
                    outline: "none",
                    width: "100%"
                  }}
                />
                <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                  <button
                    onClick={handleSaveToken}
                    style={{
                      flex: 1,
                      backgroundColor: "var(--accent)",
                      border: "none",
                      borderRadius: "4px",
                      color: "white",
                      padding: "8px",
                      fontSize: "11px",
                      fontFamily: "var(--sans)",
                      fontWeight: "700",
                      cursor: "pointer",
                      transition: "opacity 0.15s ease"
                    }}
                  >
                    Save
                  </button>
                  {upstoxToken && (
                    <button
                      onClick={handleClearToken}
                      style={{
                        backgroundColor: "rgba(239, 68, 68, 0.15)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: "4px",
                        color: "#f87171",
                        padding: "8px 12px",
                        fontSize: "11px",
                        fontFamily: "var(--sans)",
                        fontWeight: "700",
                        cursor: "pointer",
                        transition: "opacity 0.15s ease"
                      }}
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Currency Selection Dropdown */}
          <div className="currency-selector-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label 
              htmlFor="currency-select" 
              style={{ 
                fontSize: "11px", 
                color: "var(--text-secondary)", 
                fontFamily: "var(--mono)", 
                fontWeight: "bold" 
              }}
            >
              CURRENCY:
            </label>
            <select
              id="currency-select"
              value={targetCurrency}
              onChange={(e) => setTargetCurrency(e.target.value)}
              style={{
                backgroundColor: "var(--bg-card)",
                color: "var(--text-primary)",
                border: "1px solid var(--border-color)",
                borderRadius: "4px",
                padding: "4px 8px",
                fontSize: "11px",
                fontFamily: "var(--mono)",
                outline: "none",
                cursor: "pointer"
              }}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
              <option value="Local">Local (Original)</option>
            </select>
          </div>

          <div className="header-meta-info">
            <span className="live-status-dot" />
            <span className="live-status-text">LIVE MARKET FEED</span>
          </div>
        </div>
      </header>

      {/* Main Grid - 2x2 cards layout */}
      <main className="dashboard-grid-2x2">
        <CommodityCard
          assets={convertedData.commodity}
          selectedAsset={selectedCommodity}
          onSelectAsset={(asset) => setSelectedCommodityTicker(asset.ticker)}
        />
        <InterestRateCard
          assets={convertedData.interest_rate}
          selectedAsset={selectedInterestRate}
          onSelectAsset={(asset) => setSelectedInterestRateTicker(asset.ticker)}
        />
        <EquityCard
          assets={convertedData.equity_index}
          selectedAsset={selectedEquity}
          onSelectAsset={(asset) => setSelectedEquityTicker(asset.ticker)}
        />
        <ForexCard
          assets={convertedData.forex}
          selectedAsset={selectedForex}
          onSelectAsset={(asset) => setSelectedForexTicker(asset.ticker)}
        />
      </main>

      {/* Control panel and AI Output stacked below */}
      <section className="dashboard-controls-section">
        <SearchPanel
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onRunPrompt={handleRunPrompt}
          isPromptRunning={isPromptRunning}
        />
        <OutputPanel
          output={promptOutput}
          isRunning={isPromptRunning}
          activeMode={activeMode}
        />
      </section>
    </div>
  );
}

export default App;