import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";

export default function JoinTeam(){
  const nav = useNavigation();
  const uid = auth.currentUser?.uid;
  const email = auth.currentUser?.email ?? null;
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  async function join(){
    const c = String(code||"").trim();
    if(!uid){ Alert.alert("�quipe","Utilisateur non connect�."); return; }
    if(!c){ Alert.alert("�quipe","Saisis un code."); return; }
    try{
      setBusy(true);
      // V�rifie joinCodeAthlete
      const qy = query(collection(db,"teams"), where("joinCodeAthlete","==", c));
      const snap = await getDocs(qy);
      if(snap.empty){ setBusy(false); Alert.alert("�quipe","Code invalide (athl�te)."); return; }
      const team = snap.docs[0]; const teamId = team.id; const tname = team.data().name || "�quipe";

      await setDoc(doc(db,"users", uid), {
        teamId: teamId, teamRole: "athlete", teamJoinedAt: serverTimestamp()
      }, { merge:true });

      await setDoc(doc(db,"teams", teamId, "members", uid), {
        role:"athlete", email, joinedAt: serverTimestamp()
      }, { merge:true });

      setBusy(false);
      Alert.alert("�quipe", `Tu as rejoint "${tname}".`);
      nav.goBack();
    }catch(e){ setBusy(false); Alert.alert("�quipe", e?.message || String(e)); }
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:"#fff", padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800", marginBottom:12 }}>Rejoindre une �quipe</Text>
      <Text style={{ color:"#6b7280", marginBottom:8 }}>Entre le code fourni par ton coach/admin (ex: A-ABC123).</Text>
      <TextInput value={code} onChangeText={setCode} autoCapitalize="characters" placeholder="A-ABC123"
        style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:12, marginBottom:12 }}/>
      <TouchableOpacity onPress={join} disabled={!code || busy}
        style={{ backgroundColor: (!code||busy)?"#9ca3af":"#0ea5e9", padding:14, borderRadius:10, alignItems:"center" }}>
        {busy ? <ActivityIndicator color="#fff"/> : <Text style={{ color:"#fff", fontWeight:"800" }}>Rejoindre</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}