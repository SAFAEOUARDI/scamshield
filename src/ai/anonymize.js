// Masks personal data before a message is sent to the cloud.
// The local (on-device) model always receives the original text.

const RULES = [
  // Emails
  { re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, tag: "[EMAIL]" },
  // IBAN (e.g. MA64 0000 ...)
  { re: /\b[A-Z]{2}\d{2}(?:\s?[A-Z0-9]{4}){3,7}(?:\s?[A-Z0-9]{1,3})?\b/g, tag: "[IBAN]" },
  // Card numbers: 13 to 19 digits, with optional spaces or dashes
  { re: /\b(?:\d[ -]?){12,18}\d\b/g, tag: "[CARD]" },
  // Phone numbers (international or local, e.g. +212 6 12 34 56 78, 0612345678)
  { re: /(?:\+|00)?\d[\d\s.-]{7,}\d/g, tag: "[PHONE]" },
];

export function anonymize(text) {
  let out = text;
  for (const { re, tag } of RULES) out = out.replace(re, tag);
  return out;
}
