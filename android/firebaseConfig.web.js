import { getApps, getApp, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "XXX",
  authDomain: "XXX.firebaseapp.com",
  projectId: "XXX",
  storageBucket: "XXX.appspot.com",
  messagingSenderId: "XXX",
  appId: "XXX",
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
