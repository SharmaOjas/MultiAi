function OutputPanel({ output, isRunning, activeMode }) {
  const getModeTitle = (mode) => {
    switch (mode) {
      case 1: return "COMMODITY MACRO ANALYSIS";
      case 2: return "INTEREST RATE MACRO ANALYSIS";
      case 3: return "EQUITY INDEX MACRO ANALYSIS";
      case 4: return "FOREX EXCHANGE MACRO ANALYSIS";
      default: return "MACRO ANALYSIS OUTLOOK";
    }
  };

  return (
    <div className="output-panel">
      <div className="output-panel-header">
        <div className="output-panel-title-group">
          <span className="output-indicator-dot" />
          <span className="output-panel-title">
            {isRunning ? "SYNTHESIZING MARKET INTELLIGENCE..." : getModeTitle(activeMode)}
          </span>
        </div>
        <span className="output-terminal-badge">VIRTUAL LLM ENGINE</span>
      </div>

      <div className="output-panel-body">
        {isRunning ? (
          <div className="output-loader-container">
            <div className="output-loader-spinner" />
            <span className="output-loader-text">Aggregating order books, yield curves, and index weightings...</span>
          </div>
        ) : output ? (
          <div className="output-content-markdown animate-fade-in">
            {output}
          </div>
        ) : (
          <div className="output-placeholder-container">
            <svg
              className="output-placeholder-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <p className="output-placeholder-text">
              Analysis will appear here after Run Prompt is clicked.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;
