import React from "react";
import { View, Text, ScrollView } from "react-native";

export default function AthleteHome(props) {
  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>AthleteHome</Text>
      <View style={{ padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, backgroundColor: "#fafafa" }}>
        <Text>Écran initialisé. Ajoutez votre contenu ici.</Text>
      </View>
    </ScrollView>
  );
}
