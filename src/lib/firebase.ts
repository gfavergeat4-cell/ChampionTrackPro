import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Constants from "expo-constants";

const extra = (Constants?.expoConfig?.extra as any) || {};
const firebaseConfig = extra?.firebase ?? {};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { app };

