import { useEffect } from "react";

export default function CloudConsentDialog({ open, reason, onAllow, onCancel }) {
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
        <h2 id="consent-title">Use cloud AI?</h2>
        <p>On-device AI is not available in this browser right now.</p>
        {reason && <p className="muted small">Technical reason: {reason}</p>}
        <p>
          With your permission, ScamShield can send this message to Gemini in the cloud through Firebase AI Logic.
          Phone numbers, emails, card numbers and IBANs are masked before sending.
        </p>
        <div className="dialog-actions">
          <button className="btn secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn primary" onClick={onAllow} autoFocus>
            Allow cloud analysis
          </button>
        </div>
      </div>
    </div>
  );
}
