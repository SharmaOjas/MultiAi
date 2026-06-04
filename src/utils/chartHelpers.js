// Format values for clean and professional numbers
export const formatVal = (val) => {
  if (val === undefined || val === null || isNaN(val)) return "";
  if (val >= 1000) {
    return val.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }
  if (val >= 1) {
    return val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return val.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 });
};

// Deterministically enrich history items with realistic open, high, low, close, and range
export const enrichHistoryWithOHLC = (history) => {
  if (!history || !Array.isArray(history)) return [];
  return history.map((item, index) => {
    const close = item.value;
    
    // Base open on previous day's close, or make a minor variation for Mon
    let prevClose = index > 0 ? history[index - 1].value : close * 0.985;
    
    // Enforce a minimum difference of 0.2% of close to ensure visible bodies
    const minDiff = close * 0.002;
    if (Math.abs(close - prevClose) < minDiff) {
      prevClose = close > prevClose ? close - minDiff : close + minDiff;
    }
    
    const open = prevClose;
    
    // Wicks should extend beyond the body. Add some deterministic offset.
    const bodySize = Math.abs(close - open);
    const wickHighOffset = bodySize * 0.4 + (close * 0.003);
    const wickLowOffset = bodySize * 0.4 + (close * 0.003);
    
    const high = Math.max(open, close) + wickHighOffset;
    const low = Math.min(open, close) - wickLowOffset;
    
    return {
      ...item,
      open,
      high,
      low,
      close,
      range: [open, close]
    };
  });
};
