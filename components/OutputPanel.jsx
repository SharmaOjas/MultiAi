import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

function OutputPanel({ output, isRunning, activeMode, selectedModel, extractionStatus }) {
  const getModeTitle = (mode) => {
    switch (mode) {
      case 1: return "ANNUAL REPORT ANALYSIS — PROMPT 1";
      case 2: return "ANNUAL REPORT ANALYSIS — PROMPT 2";
      case 3: return "ANNUAL REPORT ANALYSIS — PROMPT 3";
      case 4: return "ANNUAL REPORT ANALYSIS — PROMPT 4";
      default: return "ANNUAL REPORT ANALYSIS";
    }
  };

  const getStatusText = () => {
    if (extractionStatus) return extractionStatus;
    return "Extracting and synthesizing report data...";
  };

  const getHeaderTitle = () => {
    if (!isRunning) return getModeTitle(activeMode);
    if (extractionStatus) return "PREPARING GROQ INPUT...";
    return "SYNTHESIZING REPORT INTELLIGENCE...";
  };

  return (
    <div className="output-panel">
      <div className="output-panel-header">
        <div className="output-panel-title-group">
          <span className="output-indicator-dot" />
          <span className="output-panel-title">
            {getHeaderTitle()}
          </span>
        </div>
        <span className="output-terminal-badge">VIRTUAL LLM ENGINE</span>
      </div>

      <div className="output-panel-body">
        {isRunning ? (
          <div className="output-loader-container">
            <div className="output-loader-spinner" />
            <span className="output-loader-text">{getStatusText()}</span>
          </div>
        ) : output && (output.gemini || output.groq) ? (
          <div className="output-content-markdown animate-fade-in" style={{ display: "flex", gap: "20px" }}>
            {/* If Both, show two columns. Otherwise, show one column for the selected model. */}
            {(selectedModel === "Both" || selectedModel === "Groq") && output.groq && (
              <div style={{ flex: 1, minWidth: 0, overflowX: "auto" }}>
                {selectedModel === "Both" && <h3 style={{ fontFamily: "var(--heading)", color: "var(--text-primary)", marginBottom: "12px" }}>Groq Analysis</h3>}
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.groq}</ReactMarkdown>
                </div>
              </div>
            )}
            {(selectedModel === "Both" || selectedModel === "Gemini" || selectedModel === "BothSummarized") && output.gemini && (
              <div style={{ flex: 1, minWidth: 0, overflowX: "auto", borderLeft: selectedModel === "Both" ? "1px solid var(--border-color)" : "none", paddingLeft: selectedModel === "Both" ? "20px" : "0" }}>
                {selectedModel === "Both" && <h3 style={{ fontFamily: "var(--heading)", color: "var(--text-primary)", marginBottom: "12px" }}>Gemini Analysis</h3>}
                {selectedModel === "BothSummarized" && <h3 style={{ fontFamily: "var(--heading)", color: "var(--text-primary)", marginBottom: "12px" }}>Unified AI Report (Groq + Gemini)</h3>}
                <div className="markdown-body">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{output.gemini}</ReactMarkdown>
                </div>
              </div>
            )}
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
              Attach PDF reports and click Run Prompt to begin analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OutputPanel;

