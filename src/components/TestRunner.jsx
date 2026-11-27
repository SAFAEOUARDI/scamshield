import { useState } from "react";
import { allMessages } from "../allMessages";
import { analyzeMessage } from "../ai/analyzeMessage";

// Runs the 20 test messages. A result counts as "scam" when risk is high or medium.
export default function TestRunner() {
  const [allowCloud, setAllowCloud] = useState(false);
  const [rows, setRows] = useState([]);
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    setRows([]);
    for (const m of allMessages) {
      let row;
      try {
        const r = await analyzeMessage(m.text, { allowCloud });
        const predicted = r.risk === "low" ? "legitimate" : "scam";
        row = { ...m, predicted, score: r.score, source: r.source, ok: predicted === m.expected };
      } catch (err) {
        row = { ...m, predicted: "error", error: err.message, ok: false };
      }
      setRows((prev) => [...prev, row]);
    }
    setRunning(false);
  }

  const done = rows.filter((r) => r.predicted !== "error");
  const correct = rows.filter((r) => r.ok).length;
  const local = done.filter((r) => r.source === "local").length;

  return (
    <section className="card">
      <h2>Test runner (20 messages)</h2>
      <div className="runner-controls">
        <label className="check">
          <input type="checkbox" checked={allowCloud} onChange={(e) => setAllowCloud(e.target.checked)} />
          Allow cloud fallback
        </label>
        <button className="btn primary" onClick={run} disabled={running}>
          {running ? `Running ${rows.length}/${allMessages.length}...` : "Run all tests"}
        </button>
      </div>

      {rows.length > 0 && (
        <p className="summary">
          Accuracy: <strong>{correct}/{rows.length}</strong> ({Math.round((correct / rows.length) * 100)}%) · Local:{" "}
          {local} · Cloud: {done.length - local} · Errors: {rows.length - done.length}
        </p>
      )}

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Language</th>
              <th>Message</th>
              <th>Expected</th>
              <th>Result</th>
              <th>Score</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={r.ok ? "ok" : "ko"}>
                <td>{r.id}</td>
                <td>{r.language}</td>
                <td dir="auto">{r.label}</td>
                <td>{r.expected}</td>
                <td title={r.error || ""}>
                  {r.ok ? "✓ " : "✗ "}
                  {r.predicted}
                  {r.error && <div className="err-detail">{r.error}</div>}
                </td>
                <td>{r.score ?? "-"}</td>
                <td>{r.source ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!allowCloud && (
        <p className="muted small">Without cloud fallback, every test fails if on-device AI is not available.</p>
      )}
    </section>
  );
}
