import "./firebaseConfig.native";
import 'firebase/auth';
import { initAuth } from "./firebaseConfig.native";

/** Lance l'init Auth sans bloquer le rendu */
setImmediate(() => { initAuth().catch(()=>{}); });
import { registerRootComponent } from "expo";
import App from "./App";
registerRootComponent(App);


