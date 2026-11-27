// Shows the two AI engines side by side: on-device (Gemini Nano) and cloud (Gemini).
// "active" = engine currently working, "used" = engine that produced the last result.

const LOCAL_TEXT = {
  checking: { dot: "wait", label: "Checking..." },
  available: { dot: "ok", label: "Ready on this device" },
  downloadable: { dot: "wait", label: "Model not downloaded" },
  downloading: { dot: "wait", label: "Downloading model" },
  unavailable: { dot: "off", label: "Not available on this device" },
  unsupported: { dot: "off", label: "Not supported in this browser" },
  error: { dot: "off", label: "Could not check status" },
};

export default function HybridEngines({ local, active, used }) {
  const l = LOCAL_TEXT[local.status] || { dot: "wait", label: local.status };
  const localState = active === "local" ? "active" : used === "local" ? "used" : "";
  const cloudState = active === "cloud" ? "active" : used === "cloud" ? "used" : "";

  return (
    <section className="engines" aria-label="Hybrid AI engines">
      <div className={`engine engine-local ${localState}`}>
        <div className="engine-top">
          <span className="engine-icon" aria-hidden="true">💻</span>
          <div>
            <p className="engine-kicker">1 · First choice</p>
            <h3>On-device AI</h3>
            <p className="engine-model">Gemini Nano in Chrome</p>
          </div>
          {localState === "used" && <span className="engine-tag">Used</span>}
          {localState === "active" && <span className="engine-tag pulse">Working</span>}
        </div>
        <p className="engine-status">
          <span className={`dot dot-${l.dot}`} />
          {l.label}
          {local.status === "downloading" && ` · ${local.progress}%`}
        </p>
        <ul className="engine-points">
          <li>🔒 Message never leaves your device</li>
          <li>📴 Works offline · free · instant</li>
        </ul>
        {local.status === "downloadable" && (
          <button className="btn primary small-btn" onClick={local.download}>
            Download model
          </button>
        )}
        {(local.status === "unavailable" || local.status === "unsupported") && (
          <p className="engine-note">
            Needs desktop Chrome on a device with 22 GB free disk and a GPU (&gt;4 GB VRAM) or 16 GB RAM.
          </p>
        )}
      </div>

      <div className="engine-arrow" aria-hidden="true">
        <span>if unavailable</span>
        <span className="arrow">→</span>
        <span>+ your consent</span>
      </div>

      <div className={`engine engine-cloud ${cloudState}`}>
        <div className="engine-top">
          <span className="engine-icon" aria-hidden="true">☁️</span>
          <div>
            <p className="engine-kicker">2 · Fallback</p>
            <h3>Cloud AI</h3>
            <p className="engine-model">Gemini via Firebase AI Logic</p>
          </div>
          {cloudState === "used" && <span className="engine-tag">Used</span>}
          {cloudState === "active" && <span className="engine-tag pulse">Working</span>}
        </div>
        <p className="engine-status">
          <span className="dot dot-ok" />
          Available · only with your consent
        </p>
        <ul className="engine-points">
          <li>🙈 Phones, emails, cards and IBANs masked</li>
          <li>🛡️ Protected by Firebase App Check</li>
        </ul>
      </div>
    </section>
  );
}
