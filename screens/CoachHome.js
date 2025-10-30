import React from "react";
import { View, Text, ScrollView } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Button } from "../components/UI";

export default function CoachHome({ teamId }) {
  return (
    <ScrollView contentContainerStyle={{ padding:20, gap:12 }}>
      <Text style={{ fontSize:24, fontWeight:"800" }}>Coach — Équipe</Text>
      <Text>teamId: {teamId}</Text>
      <View style={{ padding:12, borderWidth:1, borderColor:"#ddd", borderRadius:8, backgroundColor:"#fafafa" }}>
        <Text>📊 Ici : données collectives & individuelles de l'équipe (placeholder).</Text>
      </View>
      <Button title="Se déconnecter" variant="secondary" onPress={()=>signOut(auth)} />
    </ScrollView>
  );
}
