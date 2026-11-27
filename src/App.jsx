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

export default function App() {
  const local = useLocalAI();
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
          <button className={`tab ${view === "analyze" ? "active" : ""}`} onClick={() => setView("analyze")}>
            Analyze
          </button>
          <button className={`tab ${view === "tests" ? "active" : ""}`} onClick={() => setView("tests")}>
            Test runner
          </button>
        </nav>
      </header>

      <HybridEngines local={local} active={active} used={result?.source} />

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
