import { formatVal } from './chartHelpers';

// Custom shape to render candlestick body and wick
export const CandlestickShape = (props) => {
  const { x, y, width, height, payload } = props;
  if (!payload || payload.open === undefined || payload.close === undefined) return null;
  
  const { open, close, high, low } = payload;
  const isUp = close >= open;
  const color = isUp ? "var(--color-up)" : "var(--color-down)";
  
  const valTop = Math.max(open, close);
  const valBottom = Math.min(open, close);
  
  // Prevent division by zero
  const valDiff = Math.max(valTop - valBottom, 0.0001);
  const pixelPerValue = height / valDiff;
  
  const yHigh = y + (valTop - high) * pixelPerValue;
  const yLow = y + (valTop - low) * pixelPerValue;
  
  const centerX = x + width / 2;
  
  return (
    <g>
      {/* Wick (High-Low line) */}
      <line
        x1={centerX}
        y1={yHigh}
        x2={centerX}
        y2={yLow}
        stroke={color}
        strokeWidth={1.5}
      />
      {/* Body (Open-Close rect) */}
      <rect
        x={x}
        y={y}
        width={width}
        height={Math.max(height, 1.5)} // Ensure thin bodies are still slightly visible
        fill={color}
        stroke={color}
        strokeWidth={1}
      />
    </g>
  );
};

// Custom tooltip for Candlestick charts
export const CandlestickTooltip = ({ active, payload, suffix = "" }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const isUp = data.close >= data.open;
    const colorClass = isUp ? "text-up" : "text-down";
    
    return (
      <div 
        style={{
          backgroundColor: "#161c2a",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          padding: "8px 12px",
          borderRadius: "6px",
          fontFamily: "var(--mono)",
          fontSize: "11px",
          color: "var(--text-primary)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          display: "flex",
          flexDirection: "column",
          gap: "2px"
        }}
      >
        <div style={{ fontWeight: "bold", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "2px", marginBottom: "4px" }}>
          {data.day}
        </div>
        <div>Open: <span style={{ color: "#f3f4f6" }}>{formatVal(data.open)}{suffix}</span></div>
        <div>High: <span style={{ color: "var(--color-up)" }}>{formatVal(data.high)}{suffix}</span></div>
        <div>Low: <span style={{ color: "var(--color-down)" }}>{formatVal(data.low)}{suffix}</span></div>
        <div>Close: <span className={colorClass}>{formatVal(data.close)}{suffix}</span></div>
      </div>
    );
  }
  return null;
};
