import React, { useState } from "react";
import { View, Text, ScrollView } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { createTeam } from "../services/roles";
import { Field, Button } from "../components/UI";

export default function AdminHome() {
  const [name, setName] = useState("");
  const [lastCodes, setLastCodes] = useState(null);

  async function handleCreate() {
    if (!name.trim()) return;
    try {
      const t = await createTeam(name.trim());
      setLastCodes(t);
    } catch (e) {
      alert("Erreur création équipe: " + (e.message ?? String(e)));
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding:20, gap:12 }}>
      <Text style={{ fontSize:24, fontWeight:"800" }}>Admin — Gestion équipes</Text>
      <Field label="Nom d'équipe" value={name} onChangeText={setName} placeholder="ex: U19 A" />
      <Button title="Créer l'équipe (génère codes)" onPress={handleCreate} />
      {lastCodes && (
        <View style={{ padding:12, borderWidth:1, borderColor:"#ddd", borderRadius:8 }}>
          <Text>Code coach : <Text style={{fontWeight:"800"}}>{lastCodes.coachCode}</Text></Text>
          <Text>Code athlète : <Text style={{fontWeight:"800"}}>{lastCodes.athleteCode}</Text></Text>
        </View>
      )}
      <Button title="Se déconnecter" variant="secondary" onPress={() => signOut(auth)} />
    </ScrollView>
  );
}

