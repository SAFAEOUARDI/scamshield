import { useCallback, useEffect, useState } from "react";

// Shows whether on-device AI (Gemini Nano in Chrome) is ready, and lets the user download it.
export default function LocalAIStatus() {
  const [status, setStatus] = useState("checking");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const check = useCallback(async () => {
    if (typeof globalThis.LanguageModel === "undefined") {
      setStatus("unsupported");
      return;
    }
    try {
      setStatus(await globalThis.LanguageModel.availability());
    } catch (e) {
      setError(String(e?.message || e));
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    check();
  }, [check]);

  async function download() {
    setError("");
    setStatus("downloading");
    setProgress(0);
    try {
      const session = await globalThis.LanguageModel.create({
        monitor(m) {
          m.addEventListener("downloadprogress", (e) => setProgress(Math.round(e.loaded * 100)));
        },
      });
      session.destroy?.();
    } catch (e) {
      setError(String(e?.message || e));
    }
    await check();
  }

  const palette = {
    ready: { bg: "#e6f6ec", fg: "#146c2e" },
    wait: { bg: "#fff4e0", fg: "#8a5a00" },
    bad: { bg: "#fde8e8", fg: "#9b1c1c" },
  };
  let tone = palette.wait;
  let text = "Checking on-device AI...";
  let showButton = false;

  if (status === "available") {
    tone = palette.ready;
    text = "On-device AI: ready ✓ (your messages can be analysed without leaving your device)";
  } else if (status === "downloadable") {
    text = "On-device AI: model not downloaded yet";
    showButton = true;
  } else if (status === "downloading") {
    text = `On-device AI: downloading the model... ${progress}% (keep this tab open)`;
  } else if (status === "unavailable") {
    tone = palette.bad;
    text = "On-device AI: not available on this device";
  } else if (status === "unsupported") {
    tone = palette.bad;
    text = "On-device AI: not supported in this browser. Use Google Chrome 139+ with Gemini Nano enabled.";
  } else if (status === "error") {
    tone = palette.bad;
    text = "On-device AI: could not check status";
  }

  return (
    <div
      role="status"
      style={{
        background: tone.bg,
        color: tone.fg,
        borderRadius: 12,
        padding: "10px 14px",
        margin: "12px 0",
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
        fontSize: 14,
      }}
    >
      <span style={{ flex: 1 }}>{text}</span>
      {showButton && (
        <button className="btn primary" onClick={download}>
          Download model
        </button>
      )}
      {error && <span style={{ width: "100%", fontSize: 12 }}>{error}</span>}
    </div>
  );
}