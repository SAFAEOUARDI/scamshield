import RiskGauge from "./RiskGauge";

const VERDICT = {
  high: { title: "Scam detected", icon: "⛔" },
  medium: { title: "Suspicious message", icon: "⚠️" },
  low: { title: "Looks safe", icon: "✅" },
};

// trace: list of steps explaining how the result was produced (local vs cloud).
export default function ResultCard({ result, trace, loading }) {
  if (loading) {
    return (
      <section className="card result">
        <h2>Analysis</h2>
        <Trace trace={trace} />
        <div className="skeleton" />
      </section>
    );
  }

  if (!result) {
    return (
      <section className="card result empty">
        <div className="empty-icon" aria-hidden="true">🛡️</div>
        <h2>Is this message a scam?</h2>
        <p className="muted">Paste a message or pick an example, then click Analyze.</p>
        <p className="muted small">
          ScamShield tries on-device AI first. The cloud is used only if you agree.
        </p>
      </section>
    );
  }

  // The badge depends ONLY on result.source.
  const isLocal = result.source === "local";
  const v = VERDICT[result.risk] || VERDICT.medium;

  return (
    <section className="card result" aria-live="polite">
      <div className={`verdict verdict-${result.risk}`}>
        <span className="verdict-icon" aria-hidden="true">{v.icon}</span>
        <div>
          <p className="verdict-title">{v.title}</p>
          <p className="verdict-type">{result.type}</p>
        </div>
        <span className={`badge ${isLocal ? "badge-local" : "badge-cloud"}`}>
          {isLocal ? "💻 Local analysis" : "☁️ Cloud analysis"}
        </span>
      </div>

      <RiskGauge score={result.score} risk={result.risk} />

      {result.reasons.length > 0 && (
        <>
          <h3>Why?</h3>
          <ul className="list">
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}

      {result.advice.length > 0 && (
        <>
          <h3>What to do</h3>
          <ul className="list advice">
            {result.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}

      <h3>How this result was produced</h3>
      <Trace trace={trace} />
    </section>
  );
}

function Trace({ trace }) {
  if (!trace?.length) return null;
  return (
    <ol className="trace">
      {trace.map((s, i) => (
        <li key={i} className={`trace-step trace-${s.kind}`}>
          <span className="trace-icon" aria-hidden="true">{s.icon}</span>
          <div>
            <p className="trace-title">{s.title}</p>
            {s.detail && (
              <p className="trace-detail" dir="auto">
                {s.detail}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
