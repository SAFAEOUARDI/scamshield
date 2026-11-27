import { useCallback, useState } from "react";
import "./App.css";
import MessageInput from "./components/MessageInput";
import ExampleMessages from "./components/ExampleMessages";
import ResultCard from "./components/ResultCard";
import CloudConsentDialog from "./components/CloudConsentDialog";
import TestRunner from "./components/TestRunner";
import LocalAIStatus from "./components/LocalAIStatus";
import { analyzeMessage, LocalUnavailableError } from "./ai/analyzeMessage";

export default function App() {
  const [view, setView] = useState("analyze");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [askConsent, setAskConsent] = useState(false);
  const [localReason, setLocalReason] = useState("");

  async function run(allowCloud) {
    setLoading(true);
    setError("");
    try {
      const r = await analyzeMessage(message, { allowCloud });
      setResult(r);
    } catch (err) {
      if (err instanceof LocalUnavailableError) {
        setLocalReason(err.cause?.message || String(err.cause || ""));
        setAskConsent(true);
      } else {
        console.error(err);
        setError(err.message || "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const cancelConsent = useCallback(() => {
    setAskConsent(false);
    setError(`Analysis cancelled: nothing was sent to the cloud. On-device AI error: ${localReason}`);
  }, [localReason]);

  return (
    <div className="app">
      <header className="header">
        <div className="brand">
          <span className="logo" aria-hidden="true">🛡️</span>
          <div>
            <h1>ScamShield</h1>
            <p className="muted small">Hybrid AI scam detector · on-device first, cloud only with your consent</p>
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

      <LocalAIStatus />

      {view === "analyze" ? (
        <main className="grid">
          <div className="col">
            <MessageInput
              value={message}
              onChange={setMessage}
              onAnalyze={() => run(false)}
              onClear={() => {
                setMessage("");
                setResult(null);
                setError("");
              }}
              loading={loading}
            />
            {error && (
              <div className="error" role="alert">
                <span>{error}</span>
                <button className="close" onClick={() => setError("")} aria-label="Dismiss">
                  Ã—
                </button>
              </div>
            )}
            <ExampleMessages
              onPick={(text) => {
                setMessage(text);
                setResult(null);
                setError("");
              }}
            />
          </div>
          <div className="col">
            <ResultCard result={result} />
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
        onCancel={cancelConsent}
        onAllow={() => {
          setAskConsent(false);
          run(true);
        }}
      />

      <footer className="footer muted small">Built for #BuildHybridAI · Firebase AI Logic · MIT License</footer>
    </div>
  );
}
