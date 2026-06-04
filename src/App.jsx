import { useState } from "react";
import CommodityCard from "../components/CommodityCard";
import InterestRateCard from "../components/InterestRateCard";
import EquityCard from "../components/EquityCard";
import ForexCard from "../components/ForexCard";
import SearchPanel from "../components/SearchPanel";
import OutputPanel from "../components/OutputPanel";
import "./App.css";

// Dynamic financial database containing 37 total assets with mock 5-day charts
const initialData = {
  commodity: [
    { name: "Gold", ticker: "XAU/USD", value: "$2,342.50", changePercent: "+0.45%", isPositive: true, history: [{ day: "Mon", value: 2330 }, { day: "Tue", value: 2335 }, { day: "Wed", value: 2328 }, { day: "Thu", value: 2338 }, { day: "Fri", value: 2342.5 }] },
    { name: "Brent Crude", ticker: "BZ=F", value: "$78.20", changePercent: "-1.25%", isPositive: false, history: [{ day: "Mon", value: 80.1 }, { day: "Tue", value: 79.5 }, { day: "Wed", value: 79.2 }, { day: "Thu", value: 78.9 }, { day: "Fri", value: 78.2 }] },
    { name: "WTI Crude", ticker: "CL=F", value: "$74.10", changePercent: "-1.40%", isPositive: false, history: [{ day: "Mon", value: 76.0 }, { day: "Tue", value: 75.2 }, { day: "Wed", value: 74.9 }, { day: "Thu", value: 74.7 }, { day: "Fri", value: 74.1 }] },
    { name: "Natural Gas", ticker: "NG=F", value: "$2.58", changePercent: "+2.10%", isPositive: true, history: [{ day: "Mon", value: 2.50 }, { day: "Tue", value: 2.52 }, { day: "Wed", value: 2.48 }, { day: "Thu", value: 2.54 }, { day: "Fri", value: 2.58 }] },
    { name: "Silver", ticker: "XAG/USD", value: "$29.40", changePercent: "+1.10%", isPositive: true, history: [{ day: "Mon", value: 28.8 }, { day: "Tue", value: 28.9 }, { day: "Wed", value: 29.1 }, { day: "Thu", value: 29.2 }, { day: "Fri", value: 29.4 }] },
    { name: "Cotton", ticker: "CT=F", value: "$75.80", changePercent: "-0.50%", isPositive: false, history: [{ day: "Mon", value: 76.5 }, { day: "Tue", value: 76.2 }, { day: "Wed", value: 76.0 }, { day: "Thu", value: 76.1 }, { day: "Fri", value: 75.8 }] },
    { name: "Wheat", ticker: "KE=F", value: "$615.50", changePercent: "+0.75%", isPositive: true, history: [{ day: "Mon", value: 610.0 }, { day: "Tue", value: 612.0 }, { day: "Wed", value: 608.0 }, { day: "Thu", value: 611.0 }, { day: "Fri", value: 615.5 }] },
    { name: "Steel", ticker: "HRC=F", value: "$725.00", changePercent: "-0.20%", isPositive: false, history: [{ day: "Mon", value: 730.0 }, { day: "Tue", value: 728.0 }, { day: "Wed", value: 726.0 }, { day: "Thu", value: 727.0 }, { day: "Fri", value: 725.0 }] },
    { name: "Aluminium", ticker: "ALI=F", value: "$2,450.00", changePercent: "+0.35%", isPositive: true, history: [{ day: "Mon", value: 2430 }, { day: "Tue", value: 2435 }, { day: "Wed", value: 2440 }, { day: "Thu", value: 2442 }, { day: "Fri", value: 2450 }] },
    { name: "Copper", ticker: "HG=F", value: "$4.52", changePercent: "-0.30%", isPositive: false, history: [{ day: "Mon", value: 4.58 }, { day: "Tue", value: 4.55 }, { day: "Wed", value: 4.56 }, { day: "Thu", value: 4.54 }, { day: "Fri", value: 4.52 }] },
    { name: "Lithium", ticker: "LIT=F", value: "$13,200.00", changePercent: "-2.50%", isPositive: false, history: [{ day: "Mon", value: 13700 }, { day: "Tue", value: 13600 }, { day: "Wed", value: 13500 }, { day: "Thu", value: 13400 }, { day: "Fri", value: 13200 }] },
    { name: "Zinc", ticker: "ZNC=F", value: "$2,840.00", changePercent: "+0.80%", isPositive: true, history: [{ day: "Mon", value: 2810 }, { day: "Tue", value: 2820 }, { day: "Wed", value: 2815 }, { day: "Thu", value: 2830 }, { day: "Fri", value: 2840 }] }
  ],
  interest_rate: [
    { name: "India 2Y GSec", ticker: "IN2YT", value: "7.02%", changePercent: "-0.05%", isPositive: false, history: [{ day: "Mon", value: 7.06 }, { day: "Tue", value: 7.05 }, { day: "Wed", value: 7.04 }, { day: "Thu", value: 7.03 }, { day: "Fri", value: 7.02 }] },
    { name: "India 10Y GSec", ticker: "IN10YT", value: "6.98%", changePercent: "-0.03%", isPositive: false, history: [{ day: "Mon", value: 7.01 }, { day: "Tue", value: 7.00 }, { day: "Wed", value: 7.00 }, { day: "Thu", value: 6.99 }, { day: "Fri", value: 6.98 }] },
    { name: "US 2Y Treasury", ticker: "US2YT", value: "4.89%", changePercent: "-0.10%", isPositive: false, history: [{ day: "Mon", value: 4.95 }, { day: "Tue", value: 4.93 }, { day: "Wed", value: 4.92 }, { day: "Thu", value: 4.90 }, { day: "Fri", value: 4.89 }] },
    { name: "US 10Y Treasury", ticker: "US10YT", value: "4.28%", changePercent: "+0.47%", isPositive: true, history: [{ day: "Mon", value: 4.21 }, { day: "Tue", value: 4.23 }, { day: "Wed", value: 4.22 }, { day: "Thu", value: 4.25 }, { day: "Fri", value: 4.28 }] },
    { name: "Japan 2Y", ticker: "JP2YT", value: "0.35%", changePercent: "+2.90%", isPositive: true, history: [{ day: "Mon", value: 0.33 }, { day: "Tue", value: 0.33 }, { day: "Wed", value: 0.34 }, { day: "Thu", value: 0.34 }, { day: "Fri", value: 0.35 }] },
    { name: "Japan 10Y", ticker: "JP10YT", value: "1.02%", changePercent: "+1.50%", isPositive: true, history: [{ day: "Mon", value: 0.99 }, { day: "Tue", value: 1.00 }, { day: "Wed", value: 1.01 }, { day: "Thu", value: 1.01 }, { day: "Fri", value: 1.02 }] },
    { name: "China 2Y", ticker: "CN2YT", value: "1.88%", changePercent: "0.00%", isPositive: true, history: [{ day: "Mon", value: 1.88 }, { day: "Tue", value: 1.88 }, { day: "Wed", value: 1.88 }, { day: "Thu", value: 1.88 }, { day: "Fri", value: 1.88 }] },
    { name: "China 10Y", ticker: "CN10YT", value: "2.29%", changePercent: "-0.43%", isPositive: false, history: [{ day: "Mon", value: 2.31 }, { day: "Tue", value: 2.30 }, { day: "Wed", value: 2.30 }, { day: "Thu", value: 2.29 }, { day: "Fri", value: 2.29 }] }
  ],
  equity_index: [
    { name: "Nifty50", ticker: "^NSEI", value: "23,260.30", changePercent: "+0.60%", isPositive: true, history: [{ day: "Mon", value: 23100 }, { day: "Tue", value: 23150 }, { day: "Wed", value: 23180 }, { day: "Thu", value: 23220 }, { day: "Fri", value: 23260.3 }] },
    { name: "BankNifty", ticker: "^NSEBANK", value: "49,850.20", changePercent: "+0.85%", isPositive: true, history: [{ day: "Mon", value: 49400 }, { day: "Tue", value: 49550 }, { day: "Wed", value: 49680 }, { day: "Thu", value: 49750 }, { day: "Fri", value: 49850.2 }] },
    { name: "Dow Jones", ticker: "^DJI", value: "38,880.10", changePercent: "-0.15%", isPositive: false, history: [{ day: "Mon", value: 39010 }, { day: "Tue", value: 38950 }, { day: "Wed", value: 38920 }, { day: "Thu", value: 38900 }, { day: "Fri", value: 38880.1 }] },
    { name: "S&P500", ticker: "^GSPC", value: "5,432.75", changePercent: "+0.85%", isPositive: true, history: [{ day: "Mon", value: 5380 }, { day: "Tue", value: 5395 }, { day: "Wed", value: 5410 }, { day: "Thu", value: 5420 }, { day: "Fri", value: 5432.75 }] },
    { name: "Nasdaq", ticker: "^IXIC", value: "19,250.40", changePercent: "+1.20%", isPositive: true, history: [{ day: "Mon", value: 18950 }, { day: "Tue", value: 19050 }, { day: "Wed", value: 19120 }, { day: "Thu", value: 19180 }, { day: "Fri", value: 19250.4 }] },
    { name: "Nikkei", ticker: "^N225", value: "38,480.00", changePercent: "-0.40%", isPositive: false, history: [{ day: "Mon", value: 38700 }, { day: "Tue", value: 38650 }, { day: "Wed", value: 38600 }, { day: "Thu", value: 38520 }, { day: "Fri", value: 38480 }] },
    { name: "Shanghai", ticker: "000001.SS", value: "3,080.50", changePercent: "-0.12%", isPositive: false, history: [{ day: "Mon", value: 3095 }, { day: "Tue", value: 3090 }, { day: "Wed", value: 3088 }, { day: "Thu", value: 3084 }, { day: "Fri", value: 3080.5 }] },
    { name: "Hang Seng", ticker: "^HSI", value: "18,250.00", changePercent: "+0.55%", isPositive: true, history: [{ day: "Mon", value: 18120 }, { day: "Tue", value: 18150 }, { day: "Wed", value: 18190 }, { day: "Thu", value: 18210 }, { day: "Fri", value: 18250 }] },
    { name: "DAX", ticker: "^GDAXI", value: "18,520.40", changePercent: "+0.22%", isPositive: true, history: [{ day: "Mon", value: 18450 }, { day: "Tue", value: 18480 }, { day: "Wed", value: 18490 }, { day: "Thu", value: 18510 }, { day: "Fri", value: 18520.4 }] },
    { name: "CAC", ticker: "^FCHI", value: "7,950.20", changePercent: "-0.30%", isPositive: false, history: [{ day: "Mon", value: 7990 }, { day: "Tue", value: 7980 }, { day: "Wed", value: 7965 }, { day: "Thu", value: 7958 }, { day: "Fri", value: 7950.2 }] },
    { name: "FTSE", ticker: "^FTSE", value: "8,240.50", changePercent: "+0.15%", isPositive: true, history: [{ day: "Mon", value: 8215 }, { day: "Tue", value: 8225 }, { day: "Wed", value: 8230 }, { day: "Thu", value: 8235 }, { day: "Fri", value: 8240.5 }] },
    { name: "Bovespa", ticker: "^BVSP", value: "122,500.00", changePercent: "-0.65%", isPositive: false, history: [{ day: "Mon", value: 123500 }, { day: "Tue", value: 123200 }, { day: "Wed", value: 122900 }, { day: "Thu", value: 122700 }, { day: "Fri", value: 122500 }] },
    { name: "MOEX", ticker: "IMOEX.ME", value: "3,180.20", changePercent: "+0.40%", isPositive: true, history: [{ day: "Mon", value: 3160 }, { day: "Tue", value: 3165 }, { day: "Wed", value: 3170 }, { day: "Thu", value: 3175 }, { day: "Fri", value: 3180.2 }] }
  ],
  forex: [
    { name: "USD/INR", ticker: "USDINR=X", value: "83.52", changePercent: "-0.05%", isPositive: false, history: [{ day: "Mon", value: 83.60 }, { day: "Tue", value: 83.58 }, { day: "Wed", value: 83.55 }, { day: "Thu", value: 83.54 }, { day: "Fri", value: 83.52 }] },
    { name: "DXY", ticker: "DX-Y.NYB", value: "104.15", changePercent: "+0.25%", isPositive: true, history: [{ day: "Mon", value: 103.80 }, { day: "Tue", value: 103.95 }, { day: "Wed", value: 104.10 }, { day: "Thu", value: 104.05 }, { day: "Fri", value: 104.15 }] },
    { name: "EUR/INR", ticker: "EURINR=X", value: "90.45", changePercent: "-0.15%", isPositive: false, history: [{ day: "Mon", value: 90.80 }, { day: "Tue", value: 90.70 }, { day: "Wed", value: 90.62 }, { day: "Thu", value: 90.50 }, { day: "Fri", value: 90.45 }] },
    { name: "JPY/INR", ticker: "JPYINR=X", value: "0.5340", changePercent: "+0.12%", isPositive: true, history: [{ day: "Mon", value: 0.5310 }, { day: "Tue", value: 0.5320 }, { day: "Wed", value: 0.5315 }, { day: "Thu", value: 0.5330 }, { day: "Fri", value: 0.5340 }] }
  ]
};

function App() {
  // Local card-specific selection state managed in App to enable AI prompt triggers
  const [selectedCommodity, setSelectedCommodity] = useState(initialData.commodity[0]);
  const [selectedInterestRate, setSelectedInterestRate] = useState(initialData.interest_rate[0]);
  const [selectedEquity, setSelectedEquity] = useState(initialData.equity_index[0]);
  const [selectedForex, setSelectedForex] = useState(initialData.forex[0]);

  // Control panel inputs & output panel state
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMode, setActiveMode] = useState(1);
  const [isPromptRunning, setIsPromptRunning] = useState(false);
  const [promptOutput, setPromptOutput] = useState("");

  const handleRunPrompt = () => {
    setIsPromptRunning(true);
    setPromptOutput("");

    // Identify active asset based on chosen mode (1-4)
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
      {/* Main Grid - 2x2 cards layout */}
      <main className="dashboard-grid-2x2">
        <CommodityCard
          assets={initialData.commodity}
          selectedAsset={selectedCommodity}
          onSelectAsset={setSelectedCommodity}
        />
        <InterestRateCard
          assets={initialData.interest_rate}
          selectedAsset={selectedInterestRate}
          onSelectAsset={setSelectedInterestRate}
        />
        <EquityCard
          assets={initialData.equity_index}
          selectedAsset={selectedEquity}
          onSelectAsset={setSelectedEquity}
        />
        <ForexCard
          assets={initialData.forex}
          selectedAsset={selectedForex}
          onSelectAsset={setSelectedForex}
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