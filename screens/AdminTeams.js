import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp, query, where, getDocs } from "firebase/firestore";

function genCode(len=6){
  const A="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({length:len},()=>A[Math.floor(Math.random()*A.length)]).join("");
}

export default function AdminTeams(){
  const uid = auth.currentUser?.uid;
  const [name, setName] = useState("");
  const [code, setCode] = useState(genCode());
  const [saving, setSaving] = useState(false);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  async function loadMine(){
    if(!uid){ setTeams([]); setLoading(false); return; }
    setLoading(true);
    try{
      // Pas d'orderBy -> ï¿½vite index composite. Tri cï¿½tï¿½ client ensuite.
      const qy = query(collection(db,"teams"), where("createdBy","==",uid));
      const snap = await getDocs(qy);
      const list = snap.docs.map(d=>({ id:d.id, ...d.data() }));
      list.sort((a,b)=> (b.createdAt?.seconds||0) - (a.createdAt?.seconds||0));
      setTeams(list);
    }catch(e){
      console.error("loadMine error:", e);
      setErr(e?.message||String(e));
    }
    setLoading(false);
  }

  useEffect(()=>{ loadMine(); },[uid]);

  async function createTeam(){
    if(!uid) { Alert.alert("Admin","Utilisateur non connectï¿½."); return; }
    if(!name.trim()) { Alert.alert("Admin","Donne un nom d'ï¿½quipe."); return; }
    try{
      setSaving(true); setErr(null);
      const payload = {
        name: name.trim(),
        code: code.trim().toUpperCase(),
        createdBy: uid,
        createdAt: serverTimestamp()
      };
      await addDoc(collection(db,"teams"), payload);
      setName(""); setCode(genCode());
      await loadMine();
      Alert.alert("Admin","ï¿½quipe crï¿½ï¿½e ?");
    }catch(e){
      console.error("Create team error:", e);
      setErr(e?.message||String(e));
      Alert.alert("Admin", e?.message||String(e));
    }finally{
      setSaving(false);
    }
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#fff" }} contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800", marginBottom:12 }}>Admin ï¿½ ï¿½quipes</Text>
      {!!err && <Text style={{ color:"#b91c1c", marginBottom:8 }}>Erreur: {err}</Text>}

      <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:12, marginBottom:16 }}>
        <Text style={{ fontWeight:"700", marginBottom:8 }}>Crï¿½er une ï¿½quipe</Text>
        <TextInput
          placeholder="Nom de l'ï¿½quipe"
          value={name}
          onChangeText={setName}
          style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}
        />
        <View style={{ flexDirection:"row", alignItems:"center", marginBottom:8 }}>
          <TextInput
            placeholder="Code ï¿½ distribuer (ex: 7H3K2P)"
            value={code}
            onChangeText={(v)=> setCode(v.toUpperCase())}
            autoCapitalize="characters"
            style={{ flex:1, borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginRight:8 }}
          />
          <TouchableOpacity onPress={()=> setCode(genCode())} style={{ paddingVertical:10, paddingHorizontal:12, backgroundColor:"#e5e7eb", borderRadius:8 }}>
            <Text>?</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity onPress={createTeam} disabled={saving || !name.trim() || !code.trim()}
          style={{ backgroundColor: (!name.trim()||!code.trim()) ? "#9ca3af" : "#111827", padding:12, borderRadius:10, alignItems:"center" }}>
          {saving ? <ActivityIndicator color="#fff"/> : <Text style={{ color:"#fff", fontWeight:"700" }}>Crï¿½er l'ï¿½quipe</Text>}
        </TouchableOpacity>
      </View>

      <Text style={{ fontWeight:"800", marginBottom:8 }}>Mes ï¿½quipes</Text>
      {loading ? (
        <View style={{ paddingVertical:10 }}><ActivityIndicator/><Text style={{ marginTop:6 }}>Chargementï¿½</Text></View>
      ) : teams.length===0 ? (
        <Text style={{ color:"#6b7280" }}>Aucune ï¿½quipe encore.</Text>
      ) : teams.map(t=>(
        <View key={t.id} style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:10, marginBottom:10 }}>
          <Text style={{ fontWeight:"700" }}>{t.name}</Text>
          <Text style={{ color:"#374151" }}>Code: <Text style={{ fontWeight:"800" }}>{t.code}</Text></Text>
        </View>
      ))}
      <View style={{ height:24 }}/>
    </ScrollView>
  );
}