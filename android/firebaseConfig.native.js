import { getApps, getApp, initializeApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⚠️ Mets tes vraies clés ci-dessous si ce n’est pas déjà le cas
const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX.firebaseapp.com",
  projectId: "XXX",
  storageBucket: "XXX.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// En RN, on DOIT initialiser Auth avec une persistance RN.
// Si Auth est déjà créé (dev hot reload), on le récupère.
let auth;
try {
  auth = getAuth(app);
} catch (e) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
}

export { app, auth };
