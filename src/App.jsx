import { useCallback, useState } from "react";
import "./App.css";
import MessageInput from "./components/MessageInput";
import ExampleMessages from "./components/ExampleMessages";
import ResultCard from "./components/ResultCard";
import CloudConsentDialog from "./components/CloudConsentDialog";
import TestRunner from "./components/TestRunner";
import HybridEngines from "./components/HybridEngines";
import { useLocalAI } from "./hooks/useLocalAI";
import { analyzeMessage, LocalUnavailableError } from "./ai/analyzeMessage";
import { anonymize } from "./ai/anonymize";
import { simulateLocalAnalysis } from "./ai/simulateLocal";

export default function App() {
  const realLocal = useLocalAI();
  // "real" = real device; "sim-local" = simulate a device WITH on-device AI; "sim-nolocal" = simulate a device WITHOUT it.
  const [mode, setMode] = useState("real");
  const local =
    mode === "real"
      ? realLocal
      : { ...realLocal, status: mode === "sim-local" ? "available" : "unavailable", simulated: true };
  const [view, setView] = useState("analyze");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [askConsent, setAskConsent] = useState(false);
  const [localReason, setLocalReason] = useState("");
  const [active, setActive] = useState(null); // engine working now: "local" | "cloud" | null
  const [trace, setTrace] = useState([]);

  function reset() {
    setResult(null);
    setError("");
    setTrace([]);
  }

  // Step 1: always try on-device first.
  async function analyzeLocalFirst() {
    reset();
    setLoading(true);
    setActive("local");
    setTrace([{ kind: "run", icon: "💻", title: "Trying on-device AI (Gemini Nano)..." }]);

    if (mode === "sim-local") {
      await new Promise((r) => setTimeout(r, 900));
      setResult(simulateLocalAnalysis(message));
      setTrace([
        {
          kind: "skip",
          icon: "🧪",
          title: "SIMULATION of the on-device path",
          detail: "This device cannot run Gemini Nano, so a small rule-based engine stands in for it.",
        },
        { kind: "ok", icon: "💻", title: "Analysed in the browser, on this device" },
        { kind: "ok", icon: "🔒", title: "Nothing was sent over the network" },
      ]);
      setLoading(false);
      setActive(null);
      return;
    }
    if (mode === "sim-nolocal") {
      const reason = "Simulation: this device has no on-device model.";
      await new Promise((r) => setTimeout(r, 500));
      setLocalReason(reason);
      setTrace([{ kind: "skip", icon: "💻", title: "On-device AI not available", detail: reason }]);
      setAskConsent(true);
      setLoading(false);
      setActive(null);
      return;
    }

    try {
      const r = await analyzeMessage(message, { allowCloud: false });
      setResult(r);
      setTrace([
        { kind: "ok", icon: "💻", title: "Analysed on-device by Gemini Nano" },
        { kind: "ok", icon: "🔒", title: "Nothing was sent over the network" },
      ]);
    } catch (err) {
      if (err instanceof LocalUnavailableError) {
        const reason = err.cause?.message || String(err.cause || "");
        setLocalReason(reason);
        setTrace([{ kind: "skip", icon: "💻", title: "On-device AI not available", detail: reason }]);
        setAskConsent(true);
      } else {
        console.error(err);
        setError(err.message || "Something went wrong. Please try again.");
        setTrace([]);
      }
    } finally {
      setLoading(false);
      setActive(null);
    }
  }

  // Step 2: cloud, only after consent, with masked data.
  async function analyzeInCloud() {
    setAskConsent(false);
    setLoading(true);
    setActive("cloud");
    const masked = anonymize(message.trim());
    const before = [
      { kind: "skip", icon: "💻", title: "On-device AI not available", detail: localReason },
      { kind: "ok", icon: "✋", title: "You allowed cloud analysis" },
      { kind: "ok", icon: "🙈", title: "Personal data masked before sending", detail: masked },
    ];
    setTrace([...before, { kind: "run", icon: "☁️", title: "Asking Gemini in the cloud..." }]);
    try {
      const r = await analyzeMessage(message, { allowCloud: true });
      setResult(r);
      setTrace([
        ...before,
        { kind: "ok", icon: "☁️", title: "Analysed in the cloud by Gemini (Firebase AI Logic + App Check)" },
      ]);
    } catch (err) {
      console.error(err);
      setError(err.message || "Cloud analysis failed. Please try again.");
      setTrace([]);
    } finally {
      setLoading(false);
      setActive(null);
    }
  }

  const cancelConsent = useCallback(() => {
    setAskConsent(false);
    setTrace([]);
    setError("Cancelled: your message stayed on your device. Nothing was sent to the cloud.");
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo" aria-hidden="true">🛡️</span>
          <div>
            <h1>ScamShield</h1>
            <p className="tagline">Spot scams in Darija, Arabic, French, Spanish and English. Private by default.</p>
          </div>
        </div>
        <nav className="nav">
          <label className="mode">
            <span>Mode</span>
            <select value={mode} onChange={(e) => { setMode(e.target.value); setResult(null); setTrace([]); setError(""); }}>
              <option value="real">Real device</option>
              <option value="sim-local">Simulation: device with on-device AI</option>
              <option value="sim-nolocal">Simulation: device without on-device AI</option>
            </select>
          </label>
          <button className={`tab ${view === "analyze" ? "active" : ""}`} onClick={() => setView("analyze")}>
            Analyze
          </button>
          <button className={`tab ${view === "tests" ? "active" : ""}`} onClick={() => setView("tests")}>
            Test runner
          </button>
        </nav>
      </header>

      {mode !== "real" && (
        <div className="sim-banner" role="status">
          🧪 Simulation mode: {mode === "sim-local" ? "on-device results come from a rule-based demo engine, not Gemini Nano." : "on-device AI is treated as unavailable; the cloud step is real."}
        </div>
      )}

      <HybridEngines local={local} active={active} used={result?.source === "local-sim" ? "local" : result?.source} />

      {view === "analyze" ? (
        <main className="grid">
          <div className="col">
            <MessageInput
              value={message}
              onChange={setMessage}
              onAnalyze={analyzeLocalFirst}
              onClear={() => {
                setMessage("");
                reset();
              }}
              loading={loading}
            />
            {error && (
              <div className="error" role="alert">
                <span>{error}</span>
                <button className="close" onClick={() => setError("")} aria-label="Dismiss">
                  ×
                </button>
              </div>
            )}
            <ExampleMessages
              onPick={(text) => {
                setMessage(text);
                reset();
              }}
            />
          </div>
          <div className="col">
            <ResultCard result={result} trace={trace} loading={loading} />
          </div>
        </main>
      ) : (
        <main>
          <TestRunner />
        </main>
      )}

      <CloudConsentDialog
        open={askConsent}
        reason={localReason}
        preview={anonymize(message.trim())}
        onCancel={cancelConsent}
        onAllow={analyzeInCloud}
      />

      <footer className="footer">
        Built for #BuildHybridAI · Firebase AI Logic hybrid inference · App Check · MIT License
      </footer>
    </div>
  );
}
