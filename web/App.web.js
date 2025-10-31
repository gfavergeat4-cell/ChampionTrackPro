import App from "../App";
import { initAuth } from "./firebaseConfig.web";

// Ne pas bloquer le rendu web
setTimeout(() => { initAuth().catch(() => {}) }, 0);

export default App;

