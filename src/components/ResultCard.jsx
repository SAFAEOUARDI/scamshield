import RiskGauge from "./RiskGauge";

export default function ResultCard({ result }) {
  if (!result) {
    return (
      <section className="card result empty">
        <h2>Analysis</h2>
        <p className="muted">Paste a message or pick an example, then click Analyze.</p>
        <p className="muted small">
          ScamShield first tries on-device AI, so your message stays on your device. Cloud AI is used only if you
          agree.
        </p>
      </section>
    );
  }

  // The badge depends ONLY on result.source.
  const isLocal = result.source === "local";

  return (
    <section className="card result" aria-live="polite">
      <div className="result-head">
        <h2>Analysis</h2>
        <span className={`badge ${isLocal ? "badge-local" : "badge-cloud"}`}>
          {isLocal ? "Local analysis (on-device)" : "Cloud analysis"}
        </span>
      </div>

      <RiskGauge score={result.score} risk={result.risk} />

      <p className="type">
        Type: <span className={`type-pill risk-${result.risk}`}>{result.type}</span>
      </p>

      {result.reasons.length > 0 && (
        <>
          <h3>Why?</h3>
          <ul>
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      )}

      {result.advice.length > 0 && (
        <>
          <h3>Safety advice</h3>
          <ul>
            {result.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
