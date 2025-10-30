/**
 * Helper de diagnostic de connexion (séparé pour éviter les erreurs de syntaxe dans Landing.js)
 */
import { signInWithEmailAndPassword } from "firebase/auth";

export async function __diagSignIn(auth, email, password) {
  try {
    console.log("[AUTH DIAG] try signInWithEmailAndPassword", { email, hasPassword: !!password });
    const cred = await signInWithEmailAndPassword(
      auth,
      String(email || "").trim(),
      String(password || "")
    );
    console.log("[AUTH DIAG] success:", cred?.user?.uid, cred?.user?.email);
    alert("Connexion OK : " + (cred?.user?.email || ""));
    return cred;
  } catch (e) {
    const code = e?.code || "";
    const msg  = e?.message || String(e);
    console.log("[AUTH DIAG] ERROR:", code, msg, e);
    alert("Erreur de connexion: " + (code ? code + " – " : "") + msg);
    throw e;
  }
}