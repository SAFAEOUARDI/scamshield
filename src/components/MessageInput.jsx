export default function MessageInput({ value, onChange, onAnalyze, onClear, loading }) {
  return (
    <section className="card">
      <h2>Check a message</h2>
      <textarea
        dir="auto"
        rows={6}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a suspicious SMS, WhatsApp or email message here..."
        disabled={loading}
        aria-label="Message to analyse"
      />
      <div className="input-footer">
        <span className="muted small">{value.length} characters</span>
        <div className="actions">
          <button className="btn secondary" onClick={onClear} disabled={loading || !value}>
            Clear
          </button>
          <button className="btn primary" onClick={onAnalyze} disabled={loading || !value.trim()}>
            {loading ? <span className="spinner" aria-hidden="true" /> : null}
            {loading ? "Analyzing..." : "Analyze"}
          </button>
        </div>
      </div>
    </section>
  );
}
