import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

export default function Athlete() {
  return (
    <View style={{ flex:1, padding:20, justifyContent:"center", alignItems:"center", backgroundColor:"#f9fafb" }}>
      <Text style={{ fontSize:22, marginBottom:20 }}>Tableau de bord Athl�te</Text>
      <TouchableOpacity
        style={{ padding:12, backgroundColor:"#ef4444", borderRadius:8 }}
        onPress={() => signOut(auth)}
      >
        <Text style={{ color:"#fff" }}>Se d�connecter</Text>
      </TouchableOpacity>
    </View>
  );
}