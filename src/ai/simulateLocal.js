// SIMULATION ONLY – used by "Simulation mode" to show how the on-device path behaves
// on devices that cannot run Gemini Nano. This is a small rule-based engine that runs in
// the browser. It is NOT Gemini Nano and its results are always labelled as a simulation.

import { riskFromScore } from "./parseResult";

const SIGNALS = [
  {
    key: "link",
    re: /(https?:\/\/|www\.|\b[a-z0-9-]+\.(com|net|co|ma|org|info|xyz)\b)/i,
    points: 25,
    reason: "Contains a link to an unknown website",
  },
  {
    key: "urgency",
    re: /(urgent|immediately|right now|within 24|today|24 ?h|sous 24|imm[ée]diatement|daba|d[ée]bloquer|blocked|bloqu|suspend|inmediatamente|ahora|فورا|حالا|عاجل)/i,
    points: 20,
    reason: "Creates urgency or threatens to block an account",
  },
  {
    key: "money",
    re: /(\$|€|dh\b|mad\b|dirham|درهم|fee|frais|tarifa|pay|payer|pague|send .*money|sift|envoyer|أرسل|transfer|virement|تحويل)/i,
    points: 20,
    reason: "Asks for money or a payment",
  },
  {
    key: "data",
    re: /(card|carte|tarjeta|password|mot de passe|contraseña|pin|cvv|id card|carte nationale|بطاقة|confirm your details|vos informations|ismek|numero)/i,
    points: 25,
    reason: "Asks for personal or banking information",
  },
  {
    key: "prize",
    re: /(won|winner|congratulations|prize|gagn|félicitations|premio|ganador|rbehti|mabrouk|مبروك|ربحت|جائزة|iphone)/i,
    points: 20,
    reason: "Promises a prize or reward you did not ask for",
  },
  {
    key: "job",
    re: /(work from home|earn \$?\d+|per week|travail à domicile|وظيفة|من المنزل|راتب|processing fee)/i,
    points: 15,
    reason: "Too-good-to-be-true job offer",
  },
  {
    key: "impersonation",
    re: /(new number|nouveau numéro|nuevo número|numero jdid|رقم جديد|my phone broke|tlefli|telephone t?khser)/i,
    points: 25,
    reason: "Someone claims to be a relative with a new number",
  },
];

const SAFE_HINTS = /(do not share|ne partagez|no action is required|aucune action|reminder|rappel|recordatorio)/i;

function guessType(hits) {
  if (hits.has("impersonation")) return "impersonation";
  if (hits.has("prize")) return "fake prize";
  if (hits.has("job")) return "fake job";
  if (/parcel|colis|paquete|customs|douane|livraison|envio/i.test([...hits].join(" "))) return "fake delivery";
  return hits.size ? "other" : "no scam";
}

export function simulateLocalAnalysis(message) {
  const text = String(message || "");
  const hits = new Set();
  let score = 0;
  const reasons = [];
  for (const s of SIGNALS) {
    if (s.re.test(text)) {
      hits.add(s.key);
      score += s.points;
      reasons.push(s.reason);
    }
  }
  if (SAFE_HINTS.test(text)) score -= 30;
  // A single weak signal is not enough to call it a scam.
  if (hits.size <= 1) score = Math.min(score, 25);
  score = Math.max(0, Math.min(98, score));

  let type = guessType(hits);
  if (/parcel|colis|paquete|customs|douane|retenido|on hold/i.test(text) && score >= 40) type = "fake delivery";
  if (/bank|banque|banco|compte bancaire|account/i.test(text) && score >= 40 && type === "other") type = "bank phishing";

  const risk = riskFromScore(score);
  const advice =
    risk === "low"
      ? ["No strong scam signals found", "Stay careful with unexpected links or payment requests"]
      : ["Do not click links or reply", "Never share card numbers, codes or ID documents", "Contact the company or person through an official channel"];

  return {
    risk,
    score,
    type: risk === "low" ? "no scam" : type,
    reasons: risk === "low" ? ["No urgent request for money, data or links"] : reasons.slice(0, 4),
    advice,
    source: "local-sim",
  };
}
