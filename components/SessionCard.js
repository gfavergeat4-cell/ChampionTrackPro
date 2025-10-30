import React from "react";
import { View, Text, Pressable } from "react-native";

export default function SessionCard({ session, responded, onRespond, compact=false }) {
  return (
    <View style={{
      padding:12, borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, backgroundColor:"#fff",
      position:"relative"
    }}>
      {/* Check vert si répondu */}
      {responded && (
        <View style={{
          position:"absolute", top:8, right:8, backgroundColor:"#22c55e", width:20, height:20, borderRadius:999,
          alignItems:"center", justifyContent:"center"
        }}>
          <Text style={{ color:"#fff", fontWeight:"900" }}>✓</Text>
        </View>
      )}
      <Text style={{ fontWeight:"800", marginBottom:2 }}>{session.title || "Séance"}</Text>
      <Text style={{ color:"#444", marginBottom:8 }}>{[session.time, session.end?`– ${session.end}`:null].filter(Boolean).join(" ")}</Text>

      <Pressable onPress={onRespond}
        style={{ alignSelf:"flex-start", flexDirection:"row", gap:8, backgroundColor:"#1e66f5",
                 paddingVertical:8, paddingHorizontal:12, borderRadius:999 }}>
        {!responded && <Text style={{ color:"#ffeb99" }}>🔔</Text>}
        <Text style={{ color:"#fff", fontWeight:"800" }}>Répondre</Text>
      </Pressable>
    </View>
  );
}
