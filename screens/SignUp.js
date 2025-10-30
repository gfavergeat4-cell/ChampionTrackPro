import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [teamCode, setTeamCode] = useState("");

  const register = async () => {
    try {
      if (!email || !password || !confirm) {
        Alert.alert("Inscription", "Merci de remplir tous les champs.");
        return;
      }
      if (password !== confirm) {
        Alert.alert("Inscription", "Les mots de passe ne correspondent pas.");
        return;
      }

      // Crï¿½ation du compte Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const uid = cred.user.uid;

      // Stockage Firestore (profil basique de l'athlï¿½te)
      await setDoc(doc(db, "users", uid), {
        email: email.trim(),
        role: "athlete",
        teamJoinRequest: teamCode?.trim() || null, // on le garde en mï¿½moire pour traitement admin
        createdAt: serverTimestamp(),
      });

      Alert.alert("Bienvenue ??", "Ton compte athlï¿½te a ï¿½tï¿½ crï¿½ï¿½ avec succï¿½s !");
    } catch (e) {
      Alert.alert("Erreur", e?.message ?? String(e));
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, justifyContent: "center", backgroundColor: "#fff" }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 24 }}>
        Crï¿½er un compte Athlï¿½te
      </Text>

      <Text>Email</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="exemple@mail.com"
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}
      />

      <Text>Mot de passe</Text>
      <TextInput
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½"
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}
      />

      <Text>Confirmer le mot de passe</Text>
      <TextInput
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        placeholder="ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½ï¿½"
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 12 }}
      />

      <Text>Code dï¿½ï¿½quipe (optionnel pour test)</Text>
      <TextInput
        value={teamCode}
        onChangeText={setTeamCode}
        placeholder="Ex: ABC123"
        style={{ borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, marginBottom: 16 }}
      />

      <TouchableOpacity onPress={register} style={{ backgroundColor: "#16a34a", padding: 14, borderRadius: 8 }}>
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 16 }}>Crï¿½er mon compte</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
        <Text style={{ textAlign: "center", color: "#2563eb" }}>
          Dï¿½jï¿½ inscrit ? Se connecter
        </Text>
      </TouchableOpacity>
    </View>
  );
}
