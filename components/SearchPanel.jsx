function SearchPanel({
  activeMode,
  onModeChange,
  onRunPrompt,
  isPromptRunning,
  selectedModel,
  onModelChange,
  selectedPdfs,
  onPdfsChange,
  editablePrompt,
  onPromptEdit
}) {
  const modes = [
    { num: 1, label: "Prompt 1", active: true },
    { num: 2, label: "Prompt 2", active: true },
    { num: 3, label: "Prompt 3", active: true },
    { num: 4, label: "Prompt 4", active: true },
  ];

  return (
    <div className="search-panel-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div className="search-control-panel-row">
      {/* PDF Upload Button */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "8px" }}>
        <input
          type="file"
          accept="application/pdf"
          id="pdf-upload"
          multiple
          style={{ display: "none" }}
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              const filesArray = Array.from(e.target.files);
              // Append newly selected files to existing ones
              onPdfsChange([...selectedPdfs, ...filesArray]);
            }
          }}
        />
        <label
          htmlFor="pdf-upload"
          className="run-prompt-action-btn"
          style={{ background: selectedPdfs && selectedPdfs.length > 0 ? "var(--color-up-bg)" : "rgba(255, 255, 255, 0.05)", border: "1px solid var(--border-color)", color: selectedPdfs && selectedPdfs.length > 0 ? "var(--color-up)" : "var(--text-primary)", cursor: "pointer", height: "36px", margin: "0" }}
          title="Attach PDF Reports"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
          <span style={{ fontSize: "12px", maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedPdfs && selectedPdfs.length > 0 ? `${selectedPdfs.length} PDF(s) Attached` : "Attach PDFs"}
          </span>
        </label>
        {selectedPdfs && selectedPdfs.length > 0 && (
          <button
            onClick={() => onPdfsChange([])}
            style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", marginLeft: "4px", padding: "4px" }}
            title="Clear all PDFs"
          >
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Model Selection Dropdown */}
      <div className="model-selector-wrapper" style={{ display: "flex", alignItems: "center", gap: "8px", marginLeft: "10px" }}>
        <select
          value={selectedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="model-select-dropdown"
          style={{
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-color)",
            borderRadius: "4px",
            padding: "8px",
            fontSize: "13px",
            fontFamily: "var(--mono)",
            outline: "none",
            cursor: "pointer"
          }}
        >
          <option value="Both">Both (Side-by-Side)</option>
          <option value="BothSummarized">Both (Summarized into 1)</option>
          <option value="Groq">Groq (Llama 3)</option>
          <option value="Gemini">Gemini 2.5</option>
        </select>
      </div>

      {/* 2. Numerical Prompt Buttons (1, 2, 3, 4) */}
      <div className="prompt-buttons-container">
        {modes.map((mode) => (
          <button
            key={mode.num}
            className={`prompt-mode-num-btn ${activeMode === mode.num ? "active" : ""}`}
            onClick={() => mode.active && onModeChange(mode.num)}
            title={mode.active ? mode.label : "Coming Soon — drop a prompt file to enable"}
            disabled={!mode.active}
            style={mode.active ? {} : { opacity: 0.38, cursor: "not-allowed" }}
          >
            {mode.label}
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

      {/* Prompt Editor */}
      <div className="prompt-editor-wrapper" style={{ padding: '0 8px 8px 8px' }}>
        <textarea
          value={editablePrompt}
          onChange={(e) => onPromptEdit(e.target.value)}
          placeholder="Edit your prompt before running..."
          style={{
            width: '100%',
            minHeight: '120px',
            backgroundColor: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '13px',
            fontFamily: 'var(--mono)',
            resize: 'vertical',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
      </div>
    </div>
  );
}

export default SearchPanel;
