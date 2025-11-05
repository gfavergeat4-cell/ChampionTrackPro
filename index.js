import { Platform } from "react-native";
import { registerRootComponent } from "expo";
import App from "./App";

// Détecter la plateforme et utiliser la bonne config Firebase
// Utiliser try-catch pour gérer les imports qui ne fonctionnent pas sur certaines plateformes
try {
  if (Platform.OS === "web") {
    // Web : utiliser la config web (TypeScript sera compilé par Metro)
    const webConfig = require("./web/firebaseConfig.web.ts");
    if (webConfig && webConfig.initAuth) {
      setTimeout(() => { webConfig.initAuth().catch(() => {}); }, 0);
    }
  } else {
    // React Native : utiliser la config native
    const nativeConfig = require("./firebaseConfig.native");
    if (nativeConfig && nativeConfig.initAuth) {
      setImmediate(() => { nativeConfig.initAuth().catch(() => {}); });
    }
  }
} catch (error) {
  // Si l'import échoue, continuer sans initialisation (sera géré par le composant)
  console.warn("Firebase config import failed:", error);
}

registerRootComponent(App);




