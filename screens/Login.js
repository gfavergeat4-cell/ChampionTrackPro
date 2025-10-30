import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Login as StitchLogin } from "../src/stitch_components";

export default function Login() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    console.log("🔐 handleLogin called with:", { email, password: password ? "***" : "empty" });
    
    try {
      if (!email || !password) {
        console.log("❌ Missing email or password");
        Alert.alert("Connexion", "Email et mot de passe requis.");
        return;
      }
      
      console.log("🔄 Starting login process...");
      setLoading(true);

      console.log("🔥 Calling signInWithEmailAndPassword...");
      const cred = await signInWithEmailAndPassword(
        auth,
        String(email).trim(),
        String(password)
      );
      
      console.log("✅ Login successful:", cred?.user?.uid);

      // L'AuthGate gère automatiquement la redirection
      console.log("🎉 Connexion réussie! L'AuthGate va rediriger automatiquement...");
      
      // Pas besoin de navigation manuelle - AuthGate détecte le changement d'état
    } catch (e) {
      console.log("❌ [LOGIN ERROR]", e);
      console.log("❌ Error details:", {
        code: e?.code,
        message: e?.message,
        stack: e?.stack
      });
      Alert.alert("Erreur de connexion", (e?.code || "") + " " + (e?.message || String(e)));
    } finally {
      console.log("🏁 Login process finished");
      setLoading(false);
    }
  }

  console.log("🔐 Login component rendering with:", {
    email,
    password: password ? "***" : "empty",
    loading,
    handleLoginType: typeof handleLogin
  });

  return (
    <StitchLogin
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      onLogin={handleLogin}
      onNavigateToRegister={() => navigation.navigate("Register")}
      onForgotPassword={() => Alert.alert("Forgot Password", "Password reset functionality coming soon!")}
      loading={loading}
    />
  );
}