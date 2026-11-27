// ScamShield hybrid analysis (Firebase AI Logic).
//
// 1. Try the ON-DEVICE model first (Gemini Nano in Chrome). The message never leaves the device.
// 2. If on-device is unavailable:
//      - allowCloud = false  -> throw LocalUnavailableError so the UI can ask for consent.
//      - allowCloud = true   -> mask personal data, then use the CLOUD model.
//
// Contract:
//   analyzeMessage(message, { allowCloud = false })
//   -> { risk: "low"|"medium"|"high", score: 0..100, type, reasons: string[], advice: string[], source: "local"|"cloud" }

import { getGenerativeModel, InferenceMode, InferenceSource } from "firebase/ai";
import { ai } from "../firebase";
import { anonymize } from "./anonymize";
import { parseResult, SCAM_TYPES } from "./parseResult";

export class LocalUnavailableError extends Error {
  constructor(cause) {
    super(`On-device AI failed: ${cause?.message || cause || "not available in this browser"}`);
    this.name = "LocalUnavailableError";
    this.cause = cause;
  }
}

// JSON schema used to constrain the on-device model output.
const RESULT_SCHEMA = {
  type: "object",
  properties: {
    risk: { type: "string", enum: ["low", "medium", "high"] },
    score: { type: "number" },
    type: { type: "string", enum: SCAM_TYPES },
    reasons: { type: "array", items: { type: "string" } },
    advice: { type: "array", items: { type: "string" } },
  },
  required: ["risk", "score", "type", "reasons", "advice"],
};

// Two models with explicit modes, so we always know where inference runs.
const localModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_ON_DEVICE,
  onDeviceParams: { promptOptions: { responseConstraint: RESULT_SCHEMA } },
});

const cloudModel = getGenerativeModel(ai, {
  mode: InferenceMode.ONLY_IN_CLOUD,
});

function buildPrompt(message) {
  return `You are ScamShield, an assistant that detects scam and phishing messages (SMS, WhatsApp, email).
The message can be in English, French, Spanish, Arabic or Moroccan Darija (Arabic or Latin script).
Analyse the message between <message> tags. Values like [PHONE], [EMAIL], [CARD], [IBAN] are masked personal data.

Answer ONLY with a JSON object, no other text:
{
  "risk": "low" | "medium" | "high",
  "score": number from 0 (safe) to 100 (certain scam),
  "type": one of ${SCAM_TYPES.map((t) => `"${t}"`).join(", ")},
  "reasons": up to 4 short reasons in English,
  "advice": up to 3 short safety tips in English
}
Typical scam signs: urgency, threats, requests for money, card numbers, passwords or ID documents,
unknown links, prizes you did not apply for, new phone numbers of relatives asking for money.
Normal messages (appointments, friends, real order notices, verification codes with "do not share") are low risk.

<message>
${message}
</message>`;
}

async function runModel(model, prompt, attempts = 2) {
  // Retry if the call fails or the JSON is invalid (small local models are sometimes flaky).
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt++) {
    let res;
    try {
      res = await model.generateContent(prompt);
    } catch (err) {
      lastError = err;
      console.warn(`[ScamShield] call failed (attempt ${attempt + 1}/${attempts}):`, err?.message || err);
      // If the on-device API does not exist at all, retrying is useless.
      if (/not available in this environment|api-not-enabled/i.test(String(err?.message))) break;
      continue;
    }
    try {
      const parsed = parseResult(res.response.text());
      return { parsed, inferenceSource: res.response.inferenceSource };
    } catch (err) {
      lastError = err;
      console.warn("[ScamShield] invalid JSON, retrying...", err.message);
    }
  }
  throw lastError;
}

export async function analyzeMessage(message, { allowCloud = false } = {}) {
  const text = String(message || "").trim();
  if (!text) throw new Error("Please enter a message to analyse.");

  // ---- 1. Local first ----
  try {
    // IMPORTANT: if the browser has no Prompt API (window.LanguageModel), the SDK does not
    // create an on-device adapter and would silently call the cloud. We check it ourselves
    // so that nothing leaves the device without consent.
    if (typeof globalThis.LanguageModel === "undefined") {
      throw new Error("This browser has no on-device Prompt API (LanguageModel). Use Chrome with Gemini Nano enabled.");
    }
    const availability = await globalThis.LanguageModel.availability();
    if (availability !== "available") {
      throw new Error(`On-device model status: ${availability}.`);
    }
    const { parsed, inferenceSource } = await runModel(localModel, buildPrompt(text));
    if (inferenceSource !== InferenceSource.ON_DEVICE) {
      throw new Error(`Unexpected inference source: ${inferenceSource}.`);
    }
    console.info("[ScamShield] source = local (on-device)");
    return { ...parsed, source: "local" };
  } catch (err) {
    console.warn("[ScamShield] on-device inference failed:", err?.message || err);
    if (!allowCloud) throw new LocalUnavailableError(err);
  }

  // ---- 2. Cloud fallback, only with consent and masked data ----
  const masked = anonymize(text);
  const { parsed, inferenceSource } = await runModel(cloudModel, buildPrompt(masked));
  const source = inferenceSource === InferenceSource.ON_DEVICE ? "local" : "cloud";
  console.info(`[ScamShield] source = ${source}`);
  return { ...parsed, source };
}
