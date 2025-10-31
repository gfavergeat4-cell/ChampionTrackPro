import "./firebaseConfig.native";
import { initAuth } from "./firebaseConfig.native";
import { registerRootComponent } from "expo";
import App from "./App";

/** Lance l'init Auth sans bloquer le rendu */
setImmediate(() => { initAuth().catch(()=>{}); });

registerRootComponent(App);




