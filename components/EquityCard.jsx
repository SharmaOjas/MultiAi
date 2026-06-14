import { useState } from "react";
import {
  LineChart,
  Line,
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { enrichHistoryWithOHLC } from "../src/utils/chartHelpers";
import {
  CandlestickShape,
  CandlestickTooltip
} from "../src/utils/chartUtils";


// Minimal tooltip for clean dashboard cards
const CardTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div 
        style={{
          backgroundColor: "#161c2a",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "6px 10px",
          borderRadius: "4px",
          fontFamily: "var(--mono)",
          fontSize: "11px",
          color: "var(--text-primary)"
        }}
      >
        Index: {payload[0].value}
      </div>
    );
  }
  return null;
};

// Empty state placeholder for charts
const NoDataOverlay = () => (
  <div style={{
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "250px",
    color: "var(--text-muted)",
    fontFamily: "var(--mono)",
    fontSize: "11px",
    letterSpacing: "0.5px",
    opacity: 0.5
  }}>
    NO DATA — CONFIGURE API
  </div>
);

function EquityCard({ assets, selectedAsset, onSelectAsset }) {
  const [chartType, setChartType] = useState("line");
  const hasData = selectedAsset.history && selectedAsset.history.length > 0;
  const strokeColor = selectedAsset.isPositive === null ? "#6b7280" : selectedAsset.isPositive ? "#10b981" : "#ef4444";
  
  // Enrich history with OHLC data
  const enrichedHistory = hasData ? enrichHistoryWithOHLC(selectedAsset.history) : [];
  
  // Dynamic domains for clean line fits
  let domainMin = 0, domainMax = 1;
  if (hasData) {
    if (chartType === "candle" && enrichedHistory.length > 0) {
      const highs = enrichedHistory.map(d => d.high);
      const lows = enrichedHistory.map(d => d.low);
      const minVal = Math.min(...lows);
      const maxVal = Math.max(...highs);
      const padding = (maxVal - minVal) * 0.1 || 10;
      domainMin = Math.max(0, minVal - padding);
      domainMax = maxVal + padding;
    } else {
      const values = selectedAsset.history.map(d => d.value);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const padding = (maxVal - minVal) * 0.15 || 10;
      domainMin = Math.max(0, minVal - padding);
      domainMax = maxVal + padding;
    }
  }

  return (
    <div className="macro-card">
      <div className="card-header">
        <h3 className="card-title">Equity Index</h3>
        <div className="chart-type-selector">
          <button 
            className={`chart-type-btn ${chartType === "line" ? "active" : ""}`}
            onClick={() => setChartType("line")}
          >
            Line
          </button>
          <button 
            className={`chart-type-btn ${chartType === "candle" ? "active" : ""}`}
            onClick={() => setChartType("candle")}
          >
            Candle
          </button>
        </div>
      </div>
      
      <div className="card-main-split">
        {/* Left Side: Scrollable Assets Menu (25% width) */}
        <div className="card-menu-left-sidebar">
          {assets.map((asset) => {
            const isCurrent = asset.name === selectedAsset.name;
            const assetChangeColor = asset.isPositive === null ? "text-muted" : asset.isPositive ? "text-up" : "text-down";
            return (
              <button
                key={asset.name}
                className={`card-menu-item-btn ${isCurrent ? "active" : ""}`}
                onClick={() => onSelectAsset(asset)}
              >
                <span className="asset-btn-name">{asset.name}</span>
                <span className={`asset-btn-change ${assetChangeColor}`}>
                  {asset.changePercent}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Side: Selected Asset details & Chart (75% width) */}
        <div className="card-content-right-section">
          <div className="details-header-row">
            <div className="active-asset-info">
              <span className="details-asset-title">{selectedAsset.name}</span>
              <span className="card-active-ticker">{selectedAsset.ticker}</span>
            </div>
            <div className="active-asset-pricing">
              <span className="details-price-value">{selectedAsset.value}</span>
              <span className={`details-change-pct-badge ${selectedAsset.isPositive === null ? "neutral" : selectedAsset.isPositive ? "positive" : "negative"}`}>
                {selectedAsset.changePercent}
              </span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="card-chart-container">
            {!hasData ? (
              <NoDataOverlay />
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                {chartType === "line" ? (
                  <LineChart
                    data={selectedAsset.history}
                    margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="day" 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      domain={[domainMin, domainMax]}
                      tickFormatter={(val) => val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(1)}
                    />
                    <Tooltip content={<CardTooltip />} cursor={{ stroke: "rgba(255, 255, 255, 0.05)" }} />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke={strokeColor}
                      strokeWidth={2.5}
                      dot={{ r: 2.5, stroke: strokeColor, strokeWidth: 1 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                ) : (
                  <ComposedChart
                    data={enrichedHistory}
                    margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
                  >
                    <XAxis 
                      dataKey="day" 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="var(--text-muted)" 
                      fontSize={10} 
                      tickLine={false}
                      axisLine={false}
                      domain={[domainMin, domainMax]}
                      tickFormatter={(val) => val >= 1000000 ? (val / 1000000).toFixed(1) + 'M' : val >= 1000 ? (val / 1000).toFixed(1) + 'k' : val.toFixed(1)}
                    />
                    <Tooltip content={<CandlestickTooltip />} cursor={{ fill: "rgba(255, 255, 255, 0.03)" }} />
                    <Bar
                      dataKey="range"
                      shape={<CandlestickShape />}
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EquityCard;
