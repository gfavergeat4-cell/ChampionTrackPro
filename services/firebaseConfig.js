import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Ta vraie config Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDwslrK0lbuqsBl61C_l3gjVDGF8ZqTZ5o",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.firebasestorage.app",
  messagingSenderId: "308674968497",
  appId: "1:308674968497:web:5f8d10b09ee98717a81b90"
};

// ✅ Initialise l’app (évite doublons si déjà initialisée)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
