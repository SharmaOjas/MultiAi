function SearchPanel({
  searchQuery,
  onSearchChange,
  activeMode,
  onModeChange,
  onRunPrompt,
  isPromptRunning
}) {
  const modes = [
    { num: 1, label: "Commodity Analysis" },
    { num: 2, label: "Interest Rate Analysis" },
    { num: 3, label: "Equity Analysis" },
    { num: 4, label: "Forex Analysis" }
  ];

  return (
    <div className="search-control-panel-row">
      {/* 1. Search Input Field */}
      <div className="search-input-field-relative">
        <svg
          className="search-field-icon"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          className="search-field-input"
          placeholder="Search Company (Reliance, Tesla...)"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {/* 2. Numerical Prompt Buttons (1, 2, 3, 4) */}
      <div className="prompt-buttons-container">
        {modes.map((mode) => (
          <button
            key={mode.num}
            className={`prompt-mode-num-btn ${activeMode === mode.num ? "active" : ""}`}
            onClick={() => onModeChange(mode.num)}
            title={mode.label}
          >
            Prompt {mode.num}
          </button>
        ))}
      </div>

      {/* 3. Run Prompt Button */}
      <button
        className="run-prompt-action-btn"
        onClick={onRunPrompt}
        disabled={isPromptRunning}
      >
        {isPromptRunning ? (
          <>
            <div className="action-spinner" />
            <span>Analyzing...</span>
          </>
        ) : (
          <>
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Run Prompt</span>
          </>
        )}
      </button>
    </div>
  );
}

export default SearchPanel;
