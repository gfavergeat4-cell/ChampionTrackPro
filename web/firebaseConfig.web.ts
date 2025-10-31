import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuration Firebase avec variables d'environnement
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyDwslrK0lbuqsBl61C_l3gjVDGF8ZqTZ5o",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "championtrackpro.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "championtrackpro",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "championtrackpro.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "308674968497",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:308674968497:web:5f8d10b09ee98717a81b90",
};

// Initialiser l'app Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialiser Auth avec persistance browser
export const auth = getAuth(app);

// Initialiser Firestore
export const db = getFirestore(app);

export async function initAuth() {
  await setPersistence(auth, browserLocalPersistence);
  await new Promise<void>((resolve) => {
    const unsub = onAuthStateChanged(auth, () => { unsub(); resolve(); });
  });
}

export { app };
export default app;

