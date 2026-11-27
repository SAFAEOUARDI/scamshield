import { useEffect } from "react";

// Asks the user before anything is sent to the cloud, and shows exactly what will be sent.
export default function CloudConsentDialog({ open, reason, preview, onAllow, onCancel }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="overlay" onClick={onCancel}>
      <div
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="consent-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-flow" aria-hidden="true">
          <span className="flow-off">💻 On-device</span>
          <span className="flow-arrow">→</span>
          <span className="flow-on">☁️ Cloud</span>
        </div>
        <h2 id="consent-title">Send this message to cloud AI?</h2>
        <p>
          On-device AI is not available here, so nothing has left your device yet. With your permission, ScamShield
          will ask Gemini in the cloud through Firebase AI Logic.
        </p>
        {reason && <p className="muted small">Reason: {reason}</p>}

        <p className="preview-label">This is exactly what will be sent (personal data masked):</p>
        <pre className="preview" dir="auto">
          {preview}
        </pre>

        <div className="dialog-actions">
          <button className="btn secondary" onClick={onCancel}>
            Keep it on my device
          </button>
          <button className="btn primary" onClick={onAllow} autoFocus>
            Allow cloud analysis
          </button>
        </div>
      </div>
    </div>
  );
}
