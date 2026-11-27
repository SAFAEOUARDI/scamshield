# ScamShield

Hybrid AI scam detector for SMS, WhatsApp and email messages, built for the Google **#BuildHybridAI** hackathon with **Firebase AI Logic**.

ScamShield analyses a message and returns a risk score (0-100), the scam type, the reasons and safety advice. It works in English, French, Spanish, Arabic and Moroccan Darija.

## Why hybrid?

Messages are private. ScamShield runs **on-device first** (Gemini Nano in Chrome), so the message never leaves the device. If on-device AI is not available, the app **asks for consent** before using Gemini in the cloud, and masks phone numbers, emails, card numbers and IBANs before sending.

```
message ──► on-device Gemini Nano (InferenceMode.ONLY_ON_DEVICE)
               │ ok ──► result, badge "Local analysis"
               │ unavailable
               ▼
        consent dialog ── cancel ──► nothing is sent
               │ allow
               ▼
        anonymize() ──► cloud Gemini (InferenceMode.ONLY_IN_CLOUD) ──► result, badge "Cloud analysis"
```

Each result shows a badge based only on where inference really ran (`source: "local" | "cloud"`).

## Project structure

- `src/firebase.js`: Firebase app, App Check (reCAPTCHA Enterprise or v3), Firebase AI Logic (Gemini Developer API)
- `src/ai/analyzeMessage.js`: hybrid logic (local first, cloud fallback with consent)
- `src/ai/anonymize.js`: masks personal data before cloud calls
- `src/ai/parseResult.js`: JSON validation of the model output
- `src/components/`: UI (input, examples, gauge, result card, consent dialog, test runner)
- `src/testMessages.js`, `src/testMessagesIntl.js`: 20 test messages in 5 languages

## Run locally

```bash
npm install
cp .env.example .env   # then fill in your Firebase values
npm run dev
```

Open http://localhost:5173 in Chrome.

## Enable on-device AI (Gemini Nano) in Chrome

1. Use Chrome 139 or newer on desktop, with enough free disk space for the model (check Chrome's current requirements).
2. Open `chrome://flags`, enable **Prompt API for Gemini Nano** and **Enables optimization guide on device**, then restart Chrome.
3. Open `chrome://on-device-internals` and check that the model is downloaded and ready.
4. In ScamShield, analyse a message: the badge must show **Local analysis**. You can turn off Wi-Fi to prove it runs offline.

## App Check

- Set `VITE_RECAPTCHA_SITE_KEY` and `VITE_APPCHECK_PROVIDER` (`enterprise` or `v3`) in `.env`.
- On localhost a debug token is printed in the browser console. Register it in Firebase console > App Check > your web app > Manage debug tokens.
- Add your domains (localhost, your Hosting domain) to the reCAPTCHA key.

## Test runner

The **Test runner** tab analyses the 20 test messages and shows expected vs. predicted results, the inference source and the accuracy. A result counts as a scam when the risk is medium or high.

## License

MIT
