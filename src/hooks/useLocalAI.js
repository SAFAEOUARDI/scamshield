import { useCallback, useEffect, useState } from "react";

// Status of the on-device model (Gemini Nano in Chrome, via the Prompt API).
// status: "checking" | "available" | "downloadable" | "downloading" | "unavailable" | "unsupported" | "error"
export function useLocalAI() {
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
    Promise.resolve().then(check); // run after render
  }, [check]);

  // Chrome requires a user click to start the model download.
  const download = useCallback(async () => {
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
  }, [check]);

  return { status, progress, error, download };
}
