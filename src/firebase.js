// Firebase initialisation: app, App Check and Firebase AI Logic.
// All values come from .env (never hardcode them here).
import { initializeApp } from "firebase/app";
import {
  initializeAppCheck,
  ReCaptchaEnterpriseProvider,
  ReCaptchaV3Provider,
} from "firebase/app-check";
import { getAI, GoogleAIBackend } from "firebase/ai";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);

// ---- App Check ----
// On localhost we use a debug token. The token is printed in the browser
// console the first time; register it in Firebase console > App Check >
// your web app > Manage debug tokens.
if (import.meta.env.DEV) {
  self.FIREBASE_APPCHECK_DEBUG_TOKEN = import.meta.env.VITE_APPCHECK_DEBUG_TOKEN || true;
}

const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
const providerName = (import.meta.env.VITE_APPCHECK_PROVIDER || "enterprise").toLowerCase();

export let appCheck = null;
try {
  if (siteKey) {
    const provider =
      providerName === "v3"
        ? new ReCaptchaV3Provider(siteKey)
        : new ReCaptchaEnterpriseProvider(siteKey);
    appCheck = initializeAppCheck(app, {
      provider,
      isTokenAutoRefreshEnabled: true,
    });
    console.info(`[ScamShield] App Check initialised (${providerName}).`);
  } else {
    console.warn("[ScamShield] VITE_RECAPTCHA_SITE_KEY missing: App Check disabled.");
  }
} catch (err) {
  // Never block the app because of App Check during development.
  console.warn("[ScamShield] App Check init failed:", err);
}

// ---- Firebase AI Logic (Gemini Developer API backend) ----
export const ai = getAI(app, { backend: new GoogleAIBackend() });
