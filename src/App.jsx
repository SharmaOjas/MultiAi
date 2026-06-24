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
  fetchDynamicExchangeRates,
  generateDynamicCycles,
} from "../Services/marketData";
import {
  fetchGeminiAnalysis,
  fetchGroqAnalysis,
  extractPdfText,
} from "../Services/aiService";
import promptTemplate1 from "../promt1.txt?raw";
import promptTemplate2 from "../prompt2.txt?raw";
import promptTemplate3 from "../prompt3.txt?raw";
import promptTemplate4 from "../prompt4.txt?raw";
import "./App.css";

const formatErrorMessage = (errorMsg) => {
  if (!errorMsg) return errorMsg;
  const msg = errorMsg.toString();
  if (msg.includes("exceeds the maximum number of tokens allowed") || msg.includes("context length") || msg.includes("maximum context length")) {
    return "⚠️ The PDFs attached are too large. Please upload fewer or shorter documents.";
  }
  if (msg.includes("503") || msg.includes("high demand") || msg.includes("temporarily overloaded") || msg.includes("Service Unavailable")) {
    return "⚠️ The AI servers are currently experiencing a sudden spike in traffic. Please wait a minute and try again.";
  }
  if (msg.includes("429") || msg.includes("quota") || msg.includes("rate limit") || msg.includes("Too Many Requests")) {
    return "⚠️ You have reached the API request limit. Please wait a few moments before trying again.";
  }
  if (msg.includes("401") || msg.includes("API_KEY") || msg.includes("Unauthorized")) {
    return "⚠️ There is an issue with the API key or authentication.";
  }
  return msg;
};

// Dynamic financial database — starts empty (shows "--" until API provides real data)
const initialDataTemplate = {
  commodity: [
    {
      name: "Gold ($)",
      ticker: "GC=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Brent Crude",
      ticker: "BZ=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "WTI Crude",
      ticker: "CL=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Natural Gas",
      ticker: "NG=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Silver",
      ticker: "SI=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Cotton",
      ticker: "CT=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Wheat",
      ticker: "KE=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Steel",
      ticker: "HRC=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Aluminium",
      ticker: "ALI=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Copper",
      ticker: "HG=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Lithium",
      ticker: "LIT=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Zinc",
      ticker: "ZNC=F",
      assetType: "Futures",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
  ],
  interest_rate: [
    {
      name: "India 2Y G-Sec",
      ticker: "IN2YT=RR",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "India 10Y G-Sec",
      ticker: "IN10YT=RR",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "US 2Y Treasury",
      ticker: "US2YT=RR",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "US 10Y Treasury",
      ticker: "^TNX",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Japan 2Y",
      ticker: "JP2YT=RR",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Japan 10Y",
      ticker: "JP10YT=RR",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "China 2Y",
      ticker: "CN2YT=RR",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "China 10Y",
      ticker: "CN10YT=RR",
      assetType: "Yield",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
  ],
  equity_index: [
    {
      name: "Nifty 50",
      ticker: "^NSEI",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Bank Nifty",
      ticker: "^NSEBANK",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Dow Jones",
      ticker: "^DJI",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "S&P 500",
      ticker: "^GSPC",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "NASDAQ",
      ticker: "^IXIC",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Nikkei",
      ticker: "^N225",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Shanghai",
      ticker: "000001.SS",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Hang Seng",
      ticker: "^HSI",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "DAX",
      ticker: "^GDAXI",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "CAC",
      ticker: "^FCHI",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "FTSE",
      ticker: "^FTSE",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "Bovespa",
      ticker: "^BVSP",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "MOEX Russia",
      ticker: "IMOEX.ME",
      assetType: "Cash Index",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
  ],
  forex: [
    {
      name: "USD/INR",
      ticker: "USDINR=X",
      assetType: "Spot",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "DXY",
      ticker: "DX-Y.NYB",
      assetType: "Spot",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "EUR/INR",
      ticker: "EURINR=X",
      assetType: "Spot",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
    {
      name: "JPY/INR",
      ticker: "JPYINR=X",
      assetType: "Spot",
      value: "--",
      changePercent: "--",
      isPositive: null,
      history: [],
    },
  ],
};

// Generate dynamic data payload applying active cyclical futures
const initialData = {
  ...initialDataTemplate,
  commodity: initialDataTemplate.commodity.map((asset) => {
    const cycles = generateDynamicCycles(asset.ticker);
    if (cycles) {
      return { ...asset, cycleTickers: cycles };
    }
    return asset;
  }),
};

function App() {
  const [marketData, setMarketData] = useState(initialData);
  const [targetCurrency, setTargetCurrency] = useState("INR");
  const [exchangeRates, setExchangeRates] = useState(BASE_INR_EXCHANGE_RATES);

  // Local card-specific selection state managed as tickers
  const [selectedCommodityTicker, setSelectedCommodityTicker] = useState(
    initialData.commodity[0].ticker,
  );
  const [selectedInterestRateTicker, setSelectedInterestRateTicker] =
    useState("^TNX");
  const [selectedEquityTicker, setSelectedEquityTicker] = useState(
    initialData.equity_index[0].ticker,
  );
  const [selectedForexTicker, setSelectedForexTicker] = useState(
    initialData.forex[0].ticker,
  );

  // Control panel inputs & output panel state
  const [activeMode, setActiveMode] = useState(1);
  const [isPromptRunning, setIsPromptRunning] = useState(false);
  const [promptOutput, setPromptOutput] = useState({ gemini: "", groq: "" });
  const [selectedModel, setSelectedModel] = useState("BothSummarized");
  const [selectedPdfs, setSelectedPdfs] = useState([]); // Array of PDF files
  const [extractionStatus, setExtractionStatus] = useState("");
  const [editablePrompt, setEditablePrompt] = useState(promptTemplate1);

  useEffect(() => {
    switch (activeMode) {
      case 1: setEditablePrompt(promptTemplate1); break;
      case 2: setEditablePrompt(promptTemplate2); break;
      case 3: setEditablePrompt(promptTemplate3); break;
      case 4: setEditablePrompt(promptTemplate4); break;
      default: setEditablePrompt(promptTemplate1);
    }
  }, [activeMode]);

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

  // 2. Fetch EOD quotes on mount (Yahoo Finance — previous close)
  useEffect(() => {
    const loadQuotes = async () => {
      const updated = await getLatestQuotes(marketDataRef.current);
      setMarketData(updated);
    };

    loadQuotes();
    // Refresh once a day (86 400 000 ms) — EOD data doesn't need frequent polling
    const interval = setInterval(loadQuotes, 86400000);
    return () => clearInterval(interval);
  }, []);

  // 3. Fetch chart history when selected asset changes
  useEffect(() => {
    let isMounted = true;

    const fetchHistoryForTicker = async (ticker, category) => {
      const list = marketDataRef.current[category];
      const asset = list.find((a) => a.ticker === ticker);
      if (!asset || asset.hasRealHistory) return;

      const realHistory = await getAssetHistory(ticker, null, asset.history);
      if (isMounted) {
        setMarketData((prev) => ({
          ...prev,
          [category]: prev[category].map((a) =>
            a.ticker === ticker
              ? { ...a, history: realHistory, hasRealHistory: true }
              : a,
          ),
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
  }, [
    selectedCommodityTicker,
    selectedInterestRateTicker,
    selectedEquityTicker,
    selectedForexTicker,
  ]);

  // Dynamic currency conversion helper
  const convertAsset = (asset, category) => {
    if (category === "interest_rate" || category === "forex") {
      return asset;
    }

    // If value is placeholder "--", skip conversion entirely
    if (
      asset.value === "--" ||
      asset.value === null ||
      asset.value === undefined
    ) {
      return asset;
    }

    const fromCurrency = ASSET_CURRENCIES[asset.ticker] || "USD";
    const toCurrency =
      asset.ticker === "GC=F"
        ? "USD"
        : targetCurrency === "Local"
          ? fromCurrency
          : targetCurrency;

    const rawValue =
      typeof asset.value === "number"
        ? asset.value
        : parseStringToNumber(asset.value);

    if (isNaN(rawValue) || rawValue === 0) {
      return asset;
    }

    const convertedValue = convertValue(
      rawValue,
      fromCurrency,
      toCurrency,
      exchangeRates,
    );
    const formattedValue = formatCurrencyValue(convertedValue, toCurrency);

    // Convert chart data
    const convertedHistory = (asset.history || []).map((item) => {
      const rawHistVal = parseStringToNumber(item.value);
      if (isNaN(rawHistVal) || rawHistVal === 0) return item;
      const convertedHistVal = convertValue(
        rawHistVal,
        fromCurrency,
        toCurrency,
        exchangeRates,
      );

      const result = {
        ...item,
        value: convertedHistVal,
      };

      if (item.open !== undefined) {
        result.open = convertValue(
          parseStringToNumber(item.open),
          fromCurrency,
          toCurrency,
          exchangeRates,
        );
        result.high = convertValue(
          parseStringToNumber(item.high),
          fromCurrency,
          toCurrency,
          exchangeRates,
        );
        result.low = convertValue(
          parseStringToNumber(item.low),
          fromCurrency,
          toCurrency,
          exchangeRates,
        );
        result.close = convertValue(
          parseStringToNumber(item.close),
          fromCurrency,
          toCurrency,
          exchangeRates,
        );
      }

      return result;
    });

    const convertedAsset = {
      ...asset,
      value: formattedValue,
      history: convertedHistory,
    };

    if (asset.cycleTickers) {
      convertedAsset.cycleTickers = asset.cycleTickers.map((cycle) => {
        if (
          cycle.value === "--" ||
          cycle.value === null ||
          cycle.value === undefined
        ) {
          return cycle;
        }
        const rawCycleVal =
          typeof cycle.value === "number"
            ? cycle.value
            : parseStringToNumber(cycle.value);
        if (isNaN(rawCycleVal) || rawCycleVal === 0) {
          return cycle;
        }
        const convertedCycleVal = convertValue(
          rawCycleVal,
          fromCurrency,
          toCurrency,
          exchangeRates,
        );
        return {
          ...cycle,
          value: formatCurrencyValue(convertedCycleVal, toCurrency),
        };
      });
    }

    return convertedAsset;
  };

  // Build converted derived lists
  const convertedData = {
    commodity: marketData.commodity.map((a) => convertAsset(a, "commodity")),
    interest_rate: marketData.interest_rate.map((a) =>
      convertAsset(a, "interest_rate"),
    ),
    equity_index: marketData.equity_index.map((a) =>
      convertAsset(a, "equity_index"),
    ),
    forex: marketData.forex.map((a) => convertAsset(a, "forex")),
  };

  // Select corresponding active converted assets
  const selectedCommodity =
    convertedData.commodity.find((a) => a.ticker === selectedCommodityTicker) ||
    convertedData.commodity[0];
  const selectedInterestRate =
    convertedData.interest_rate.find(
      (a) => a.ticker === selectedInterestRateTicker,
    ) || convertedData.interest_rate[0];
  const selectedEquity =
    convertedData.equity_index.find((a) => a.ticker === selectedEquityTicker) ||
    convertedData.equity_index[0];
  const selectedForex =
    convertedData.forex.find((a) => a.ticker === selectedForexTicker) ||
    convertedData.forex[0];

  const handleRunPrompt = async () => {
    setIsPromptRunning(true);
    setExtractionStatus("");
    setPromptOutput({ gemini: "", groq: "" });

    // ── Step 1: Acquire report content (PDF base64) ─────────────────────────
    if (!selectedPdfs || selectedPdfs.length === 0) {
      setPromptOutput({
        gemini: `⚠️ **Report Acquisition Failed**\n\nPlease attach at least one PDF report to analyze.`,
        groq: `⚠️ **Report Acquisition Failed**\n\nPlease attach at least one PDF report to analyze.`,
      });
      setIsPromptRunning(false);
      return;
    }

    const fileBase64s = [];
    try {
      // Manual PDF upload(s) — read as base64
      for (const pdf of selectedPdfs) {
        const b64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result.split(",")[1]);
          reader.onerror = (error) => reject(error);
          reader.readAsDataURL(pdf);
        });
        fileBase64s.push(b64);
      }
    } catch (err) {
      console.error("Report acquisition error:", err);
      setPromptOutput({
        gemini: `⚠️ **Report Acquisition Failed**\n\n${err.message}`,
        groq: `⚠️ **Report Acquisition Failed**\n\n${err.message}`,
      });
      setIsPromptRunning(false);
      return;
    }

    // ── Step 2: Build the clean prompt (no boilerplate market text) ──────────
    const reportSource = `Manual upload: ${selectedPdfs.map((p) => `"${p.name}"`).join(", ")}`;

    const geminiPrompt = `System Instructions:
${editablePrompt}

Report Source: ${reportSource}

Analyze the documents provided above according to the instructions in the System Instructions. Extract only information explicitly disclosed in the reports. Quote relevant figures, dates, percentages, and page numbers wherever available.`;

    // ── Step 3: Extract PDF text for Groq (text-only model) ─────────────────
    let extractedReportText = "";
    const needsGroq =
      selectedModel === "Both" ||
      selectedModel === "BothSummarized" ||
      selectedModel === "Groq";

    if (needsGroq && fileBase64s.length > 0) {
      setExtractionStatus("Extracting PDF text for Groq (Llama 3.3)...");
      try {
        // Extract text from all uploaded PDFs
        const extractPromises = fileBase64s.map((b64) => extractPdfText(b64));
        const texts = await Promise.all(extractPromises);
        extractedReportText = texts.join("\n\n=== NEXT DOCUMENT ===\n\n");
      } catch (extractErr) {
        console.error("PDF text extraction error:", extractErr);
        extractedReportText = `[PDF text extraction failed: ${extractErr.message}]`;
      }
      setExtractionStatus("");
    }

    const groqPrompt = `System Instructions:
${editablePrompt}

Report Source: ${reportSource}

${
  extractedReportText
    ? `--- REPORTS CONTENT START ---\n${extractedReportText}\n--- REPORTS CONTENT END ---\n\n`
    : ""
}
Analyze the documents content provided above according to the instructions in the System Instructions. Extract only information explicitly disclosed in the reports. Quote relevant figures, dates, percentages, and page numbers wherever available.`;

    // ── Step 4: Call AI models ───────────────────────────────────────────────
    try {
      let geminiRes = "";
      let groqRes = "";

      const fetchTasks = [];

      if (
        selectedModel === "Both" ||
        selectedModel === "BothSummarized" ||
        selectedModel === "Gemini"
      ) {
        fetchTasks.push(
          fetchGeminiAnalysis(geminiPrompt, fileBase64s).then((res) => {
            geminiRes = res;
          }),
        );
      }

      if (needsGroq) {
        fetchTasks.push(
          fetchGroqAnalysis(groqPrompt).then((res) => {
            groqRes = res;
          }),
        );
      }

      await Promise.all(fetchTasks);

      if (selectedModel === "BothSummarized") {
        // If either underlying API failed, abort the synthesis and show the raw errors
        if (geminiRes.startsWith("Error") || groqRes.startsWith("Error")) {
          setPromptOutput({ 
            gemini: geminiRes.startsWith("Error") ? formatErrorMessage(geminiRes) : "Gemini succeeded, but synthesis aborted due to Groq error.", 
            groq: groqRes.startsWith("Error") ? formatErrorMessage(groqRes) : "Groq succeeded, but synthesis aborted due to Gemini error." 
          });
          setIsPromptRunning(false);
          setExtractionStatus("");
          return;
        }

        setPromptOutput({
          gemini: "",
          groq: "Synthesizing a unified report from Groq and Gemini...",
        });
        const summaryPrompt = `You are a senior financial analyst. Synthesize the following two independent analyses of the same company's annual report into a single comprehensive, cohesive report. Resolve any contradictions by preferring the more specific/data-backed claim. Retain all specific figures, percentages, and page references. Use the table structure from the original instructions where applicable.

### Groq (Llama 3.3) Analysis
${groqRes}

### Gemini Analysis
${geminiRes}

### Unified Report:`;

        const summaryRes = await fetchGeminiAnalysis(summaryPrompt);
        setPromptOutput({ gemini: summaryRes.startsWith("Error") ? formatErrorMessage(summaryRes) : summaryRes, groq: "" });
      } else {
        setPromptOutput({ 
          gemini: geminiRes.startsWith("Error") ? formatErrorMessage(geminiRes) : geminiRes, 
          groq: groqRes.startsWith("Error") ? formatErrorMessage(groqRes) : groqRes 
        });
      }
    } catch (error) {
      console.error(error);
      setPromptOutput({
        gemini: formatErrorMessage(`Error fetching analysis: ${error.message}`),
        groq: formatErrorMessage(`Error fetching analysis: ${error.message}`),
      });
    } finally {
      setIsPromptRunning(false);
      setExtractionStatus("");
    }
  };

  return (
    <div className="macro-scale-app">
      {/* Dynamic Dashboard Header Bar */}
      <header className="dashboard-header-bar">
        <div className="header-brand">
          <div className="header-brand-logo">M</div>
          <h1 className="header-brand-name">MacroScale</h1>
        </div>

        <div
          className="header-meta-group"
          style={{ display: "flex", alignItems: "center", gap: "14px" }}
        >
          {/* Currency Selection Dropdown */}
          <div
            className="currency-selector-wrapper"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <label
              htmlFor="currency-select"
              style={{
                fontSize: "11px",
                color: "var(--text-secondary)",
                fontFamily: "var(--mono)",
                fontWeight: "bold",
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
                cursor: "pointer",
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
            <span className="live-status-text">EOD MARKET DATA</span>
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
          activeMode={activeMode}
          onModeChange={setActiveMode}
          onRunPrompt={handleRunPrompt}
          isPromptRunning={isPromptRunning}
          selectedModel={selectedModel}
          onModelChange={setSelectedModel}
          selectedPdfs={selectedPdfs}
          onPdfsChange={setSelectedPdfs}
          editablePrompt={editablePrompt}
          onPromptEdit={setEditablePrompt}
        />
        <OutputPanel
          output={promptOutput}
          isRunning={isPromptRunning}
          activeMode={activeMode}
          selectedModel={selectedModel}
          extractionStatus={extractionStatus}
        />
      </section>
    </div>
  );
}

export default App;
