import React from "react";
import React, { useEffect, useState } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import { auth } from "../services/firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "firebase/auth";
import { Field, Button } from "../components/UI";
import {
  getUserMeta,
  setUserRoleAndTeam,
  verifyCoachCode,
  verifyAthleteCode,
  isAdminUser
} from "../services/roles";

export default function Landing({ onRouted }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [signupJustNow, setSignupJustNow] = useState(false); // vrai juste après création
  const [role, setRole] = useState(null); // "coach" | "athlete"
  const [code, setCode] = useState("");

  // Au démarrage : si connecté + admin/role connu -> route
  useEffect(() => {
    const sub = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        if (await isAdminUser(user.uid)) { onRouted("admin", null); return; }
        const meta = await getUserMeta(user.uid);
        if (meta?.role) onRouted(meta.role, meta.teamId ?? null);
      } catch (e) {
        console.warn("[Landing] meta error", e);
      }
    });
    return () => sub();
  }, [onRouted]);

  // Connexion -> route immédiate (sans attendre onAuthStateChanged)
  async function handleSignIn() {
    try {
      if (!email || !pass) return Alert.alert("Champs requis", "Email et mot de passe.");
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      if (await isAdminUser(cred.user.uid)) { onRouted("admin", null); return; }
      const meta = await getUserMeta(cred.user.uid);
      if (meta?.role) { onRouted(meta.role, meta.teamId ?? null); return; }
      Alert.alert(
        "Compte connecté",
        "Aucun rôle n'est encore associé.\n" +
        "Si c'est ta première connexion, déconnecte-toi puis clique sur 'Créer un compte' pour lier ton rôle.\n" +
        "Sinon, demande à l'admin de te rattacher à une équipe."
      );
    } catch (e) {
      Alert.alert(`Erreur connexion: ${e.code}`, e.message ?? String(e));
    }
  }

  // Création : demande rôle + code ensuite (une seule fois)
  async function handleSignUp() {
    try {
      if (!email || !pass) return Alert.alert("Champs requis", "Email et mot de passe.");
      await createUserWithEmailAndPassword(auth, email.trim(), pass);
      setSignupJustNow(true);
      setRole(null);
      setCode("");
      Alert.alert("Compte créé", "Choisis ton rôle (Coach ou Athlète) puis renseigne le code d'équipe.");
    } catch (e) {
      Alert.alert(`Erreur création: ${e.code}`, e.message ?? String(e));
    }
  }

  async function finalizeSignupWithRole() {
    const user = auth.currentUser;
    if (!user) return Alert.alert("Non connecté", "Connecte-toi d'abord.");
    if (!signupJustNow) return Alert.alert("Action non disponible", "Étape visible uniquement après la création du compte.");
    if (!role) return Alert.alert("Rôle requis", "Choisis Coach ou Athlète.");
    if (!code) return Alert.alert("Code requis", "Renseigne le code de ton équipe.");

    try {
      if (role === "coach") {
        const teamId = await verifyCoachCode(code.trim());
        if (!teamId) return Alert.alert("Code invalide", "Vérifie ton code coach.");
        await setUserRoleAndTeam(user.uid, "coach", teamId);
        onRouted("coach", teamId);
      } else {
        const teamId = await verifyAthleteCode(code.trim());
        if (!teamId) return Alert.alert("Code invalide", "Vérifie ton code athlète.");
        await setUserRoleAndTeam(user.uid, "athlete", teamId);
        onRouted("athlete", teamId);
      }
    } catch (e) {
      Alert.alert("Erreur d'affectation", e.message ?? String(e));
    }
  }

  return (
    <>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: "800", textAlign:"center", marginBottom: 8 }}>
          ChampionTrackPro
        </Text>
        <Text style={{ textAlign:"center", marginBottom: 8 }}>
          Connexion ou création de compte. Le code d'équipe n'est demandé qu'à la création.
          L'accès admin est réservé aux comptes déjà définis comme admin.
        </Text>

        <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" placeholder="email@exemple.com" />
        <Field label="Mot de passe" value={pass} onChangeText={setPass} secure={true} placeholder="••••••••" />

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button title="Se connecter" onPress={handleSignIn} />
          <Button title="Créer un compte" variant="secondary" onPress={handleSignUp} />
        </View>

        <View style={{ height: 1, backgroundColor: "#eee", marginVertical: 12 }} />

        {signupJustNow && (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "700" }}>Rattacher le compte à une équipe :</Text>
            <View style={{ flexDirection:"row", gap:8, flexWrap:"wrap" }}>
              <Button title={`Coach${role==="coach"?" ✓":""}`} onPress={()=>setRole("coach")} />
              <Button title={`Athlète${role==="athlete"?" ✓":""}`} onPress={()=>setRole("athlete")} />
            </View>
            {!!role && (
              <Field
                label={role === "coach" ? "Code coach" : "Code athlète"}
                value={code}
                onChangeText={setCode}
                placeholder={role === "coach" ? "ex: C-ABC123" : "ex: A-XYZ789"}
              />
            )}
            <Button title="Valider et continuer" onPress={finalizeSignupWithRole} />
          </View>
        )}

        <Button title="Se déconnecter" variant="secondary" onPress={()=>signOut(auth)} />
      </ScrollView>
    </>
  );
}

