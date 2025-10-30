import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../services/firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { CreateAccount as StitchCreateAccount } from "../src/stitch_components";

export default function Register() {
  const nav = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCreate(data) {
    try {
      if (!data.email || !data.password) {
        Alert.alert("Inscription", "Email et mot de passe requis.");
        return;
      }
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(
        auth,
        String(data.email).trim(),
        String(data.password)
      );
      
      // Créer le document utilisateur dans Firestore avec le bon rôle
      const userEmail = String(data.email).trim();
      const userRole = userEmail === "gabfavergeat@gmail.com" ? "admin" : "athlete";
      
      await setDoc(doc(db, "users", cred.user.uid), {
        email: userEmail,
        role: userRole,
        createdAt: serverTimestamp(),
      });
      
      console.log("✅ User document created with role:", userRole);
      Alert.alert("Inscription", "Compte créé : " + (cred?.user?.email || ""));
      // Une fois inscrit, on bascule vers l'app (AuthGate détectera l'utilisateur)
      nav.reset({ index: 0, routes: [{ name: "App" }] });
    } catch (e) {
      Alert.alert("Erreur d'inscription", (e?.code || "") + " " + (e?.message || String(e)));
      console.log("[REGISTER ERROR]", e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StitchCreateAccount
      email={email}
      setEmail={setEmail}
      password={password}
      setPassword={setPassword}
      onCreateAccount={handleCreate}
      onBackToLogin={() => nav.goBack()}
      loading={loading}
    />
  );
}
