# ScamShield

Hybrid AI scam detector for SMS, WhatsApp and email messages, built for the Google **#BuildHybridAI** hackathon with **Firebase AI Logic**.

**Live demo:** https://scamshield-ai-f2647.web.app

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

1. Use desktop Chrome (the Prompt API ships in recent stable versions) on a device that meets Chrome's built-in AI requirements: at least 22 GB free disk space, and either a GPU with more than 4 GB of VRAM or 16 GB of RAM with 4+ CPU cores. See https://developer.chrome.com/docs/ai/get-started
2. Open ScamShield. The status bar under the title shows the on-device model state. If it offers to download the model, click the download button and keep Chrome open.
3. When the bar shows that on-device AI is ready, analyse a message: the badge shows **Local analysis**. Turn off Wi-Fi to check that it runs offline.
4. You can also check the model in `chrome://on-device-internals`.

On devices that do not meet these requirements (or in browsers without the Prompt API), the bar says so and ScamShield asks for consent before using the cloud. It never labels a cloud result as local.

## App Check

- Set `VITE_RECAPTCHA_SITE_KEY` and `VITE_APPCHECK_PROVIDER` (`enterprise` or `v3`) in `.env`.
- On localhost a debug token is printed in the browser console. Register it in Firebase console > App Check > your web app > Manage debug tokens.
- Add your domains (localhost, your Hosting domain) to the reCAPTCHA key.

## Test runner

The **Test runner** tab analyses the 20 test messages and shows expected vs. predicted results, the inference source and the accuracy. A result counts as a scam when the risk is medium or high.

## Testing status

- Cloud path: tested on the 20 messages (English, French, Spanish, Arabic, Darija). All analysed messages were classified correctly; the free Gemini tier allows 15 requests per minute, so the Test runner waits between cloud calls.
- On-device path: implemented with Firebase AI Logic (`InferenceMode.ONLY_ON_DEVICE`) and an explicit `LanguageModel.availability()` check. Our development laptop does not meet Chrome's hardware requirements for Gemini Nano, so it shows "not available on this device" and uses the consent + cloud flow.

## License

MIT
