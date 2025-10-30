import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export default function AdminPanel(){
  const [teamId, setTeamId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [targetUid, setTargetUid] = useState("");
  const [targetRole, setTargetRole] = useState("athlete"); // athlete | coach | admin

  async function createTeam(){
    if(!teamId) return Alert.alert("Admin","teamId requis");
    try{
      await setDoc(doc(db,"teams", teamId), { name: teamName||teamId, createdAt: serverTimestamp() }, { merge:true });
      Alert.alert("Admin","ï¿½quipe crï¿½ï¿½e/mise ï¿½ jour.");
    }catch(e){ Alert.alert("Admin", e?.message||String(e)); }
  }
  async function setUserRole(){
    if(!targetUid) return Alert.alert("Admin","UID requis");
    try{
      await setDoc(doc(db,"users", targetUid), { role: targetRole, updatedAt: serverTimestamp() }, { merge:true });
      Alert.alert("Admin","Rï¿½le mis ï¿½ jour.");
    }catch(e){ Alert.alert("Admin", e?.message||String(e)); }
  }
  async function assignUserToTeam(){
    if(!targetUid || !teamId) return Alert.alert("Admin","UID et teamId requis");
    try{
      await setDoc(doc(db,"users", targetUid), { teamId }, { merge:true });
      await setDoc(doc(db,"teams", teamId, targetRole==="coach"?"coaches":"members", targetUid),
        { role: targetRole, addedAt: serverTimestamp() }, { merge:true });
      Alert.alert("Admin","Affectation enregistrï¿½e.");
    }catch(e){ Alert.alert("Admin", e?.message||String(e)); }
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#fff" }} contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800", marginBottom:12 }}>Admin ï¿½ Gestion</Text>

      <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:12, marginBottom:12 }}>
        <Text style={{ fontWeight:"700", marginBottom:8 }}>Crï¿½er/ï¿½diter une ï¿½quipe</Text>
        <TextInput placeholder="teamId (ex: u15-a)" value={teamId} onChangeText={setTeamId}
          autoCapitalize="none" style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}/>
        <TextInput placeholder="Nom d'ï¿½quipe (optionnel)" value={teamName} onChangeText={setTeamName}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}/>
        <TouchableOpacity onPress={createTeam} style={{ backgroundColor:"#111827", padding:12, borderRadius:10, alignItems:"center" }}>
          <Text style={{ color:"#fff", fontWeight:"700" }}>Crï¿½er / Mettre ï¿½ jour</Text>
        </TouchableOpacity>
      </View>

      <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:12, marginBottom:12 }}>
        <Text style={{ fontWeight:"700", marginBottom:8 }}>Affecter un utilisateur</Text>
        <TextInput placeholder="UID joueur/coach" value={targetUid} onChangeText={setTargetUid}
          autoCapitalize="none" style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}/>
        <TextInput placeholder="teamId (pour l'affectation)" value={teamId} onChangeText={setTeamId}
          autoCapitalize="none" style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}/>
        <Text style={{ marginBottom:8, color:"#6b7280" }}>Rï¿½le cible (athlete / coach / admin)</Text>
        <TextInput placeholder="athlete | coach | admin" value={targetRole} onChangeText={setTargetRole}
          autoCapitalize="none" style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}/>
        <View style={{ flexDirection:"row", flexWrap:"wrap" }}>
          <TouchableOpacity onPress={setUserRole} style={{ backgroundColor:"#0ea5e9", padding:10, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ color:"#fff", fontWeight:"700" }}>Dï¿½finir rï¿½le</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={assignUserToTeam} style={{ backgroundColor:"#16a34a", padding:10, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ color:"#fff", fontWeight:"700" }}>Affecter ï¿½ l'ï¿½quipe</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={{ color:"#6b7280" }}>
        Note: si un message "missing or insufficient permissions" apparaï¿½t, dï¿½ploie les rï¿½gles Firestore adaptï¿½es (voir patch plus bas).
      </Text>
    </ScrollView>
  );
}