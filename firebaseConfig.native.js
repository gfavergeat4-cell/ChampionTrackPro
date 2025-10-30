import "react-native-get-random-values"; // polyfill crypto.getRandomValues en RN
import { initializeApp, getApps, getApp } from "firebase/app";
import "firebase/auth"; // enregistre le composant "auth" dans firebase/app
import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// === Tes vraies clés (OK pour RN) ===
const firebaseConfig = {
  apiKey: "AIzaSyDwslrK0lbuqsBl61C_l3gjVDGF8ZqTZ5o",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.firebasestorage.app",
  messagingSenderId: "308674968497",
  appId: "1:308674968497:web:5f8d10b09ee98717a81b90",
};

// App unique
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth unique (RN nécessite une persistance spécifique)
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, auth };
