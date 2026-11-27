// Validates the JSON returned by the model and normalises it to the contract:
// { risk, score, type, reasons, advice }

export const SCAM_TYPES = [
  "bank phishing",
  "fake delivery",
  "fake prize",
  "fake job",
  "impersonation",
  "other",
  "no scam",
];

const RISKS = ["low", "medium", "high"];

export function riskFromScore(score) {
  if (score >= 70) return "high";
  if (score >= 40) return "medium";
  return "low";
}

export function parseResult(rawText) {
  if (typeof rawText !== "string") throw new Error("Empty model response");

  // Models sometimes wrap JSON in ```json fences: extract the first {...} block.
  const start = rawText.indexOf("{");
  const end = rawText.lastIndexOf("}");
  if (start === -1 || end <= start) throw new Error("No JSON object in model response");

  const data = JSON.parse(rawText.slice(start, end + 1));

  let score = Number(data.score);
  if (!Number.isFinite(score)) throw new Error("Invalid score");
  score = Math.max(0, Math.min(100, Math.round(score)));

  const risk = RISKS.includes(data.risk) ? data.risk : riskFromScore(score);
  const type = SCAM_TYPES.includes(data.type) ? data.type : risk === "low" ? "no scam" : "other";

  const toList = (v) =>
    (Array.isArray(v) ? v : v ? [v] : [])
      .map((s) => String(s).trim())
      .filter(Boolean)
      .slice(0, 5);

  return { risk, score, type, reasons: toList(data.reasons), advice: toList(data.advice) };
}
