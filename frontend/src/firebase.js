import { initializeApp } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

// Firebase is only used for OTP (ENABLE_OTP flag in Register.jsx).
// These env vars must be set in Vercel's environment settings before enabling OTP.
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;

if (!apiKey) {
  console.warn(
    "[Firebase] VITE_FIREBASE_API_KEY is not set. " +
    "Firebase will not be initialized. OTP features are disabled."
  );
}

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Only initialize Firebase if the API key is present
let app = null;
let auth = null;

if (apiKey) {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
}

export { auth, RecaptchaVerifier, signInWithPhoneNumber };
