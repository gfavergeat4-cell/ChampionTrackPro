import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collection, addDoc, doc, setDoc, getDoc, getDocs, serverTimestamp, query, orderBy } from "firebase/firestore";

export default function AdminDashboard(){
  const uid = auth.currentUser?.uid;
  const [teamId,setTeamId] = useState(null);
  const [teamName,setTeamName] = useState("");
  const [memberUid,setMemberUid] = useState("");
  const [loading,setLoading] = useState(false);
  const [members,setMembers] = useState([]);
  const [responses,setResponses] = useState([]);

  useEffect(()=>{ (async()=>{
    if(!uid) return;
    const me = await getDoc(doc(db,"users", uid));
    const tid = me.exists()? (me.data().teamId || null) : null;
    setTeamId(tid);
    if(tid){ await reload(tid); }
  })(); },[uid]);

  async function reload(tid){
    const mem = await getDocs(collection(db,"teams", tid, "members"));
    setMembers(mem.docs.map(d=>({id:d.id,...d.data()})));
    const resp = await getDocs(query(collection(db,"teams", tid, "responses"), orderBy("createdAt","desc")));
    setResponses(resp.docs.map(d=>({id:d.id,...d.data()})));
  }

  async function createTeam(){
    try{
      setLoading(true);
      const tRef = await addDoc(collection(db,"teams"), { name: teamName||"ï¿½quipe", createdBy: uid, createdAt: serverTimestamp() });
      const id = tRef.id;
      await setDoc(doc(db,"teams", id, "coaches", uid), { at: serverTimestamp() });
      await setDoc(doc(db,"users", uid), { teamId: id, role: "admin" }, { merge:true });
      setTeamId(id); setTeamName("");
      await reload(id);
      Alert.alert("Admin","ï¿½quipe crï¿½ï¿½e: "+id);
    }catch(e){ Alert.alert("Admin", e?.message ?? String(e)); } finally{ setLoading(false); }
  }

  async function addMember(){
    if(!teamId || !memberUid) return;
    try{
      setLoading(true);
      await setDoc(doc(db,"teams", teamId, "members", memberUid), { at: serverTimestamp() });
      await setDoc(doc(db,"users", memberUid), { teamId: teamId }, { merge:true });
      setMemberUid("");
      await reload(teamId);
    }catch(e){ Alert.alert("Admin", e?.message ?? String(e)); } finally{ setLoading(false); }
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#fff" }} contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800", marginBottom:12 }}>Admin</Text>

      {!teamId ? (
        <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:12, marginBottom:12 }}>
          <Text style={{ fontWeight:"700", marginBottom:8 }}>Crï¿½er une ï¿½quipe</Text>
          <TextInput placeholder="Nom de lï¿½ï¿½quipe" value={teamName} onChangeText={setTeamName}
            style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}/>
          <TouchableOpacity onPress={createTeam} disabled={loading}
            style={{ backgroundColor:"#111827", padding:12, borderRadius:10, alignItems:"center" }}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={{ color:"#fff", fontWeight:"700" }}>Crï¿½er</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:12, marginBottom:12 }}>
          <Text style={{ fontWeight:"700" }}>ï¿½quipe : {teamId}</Text>
          <Text style={{ color:"#6b7280", marginBottom:8 }}>Ajouter un membre (UID)</Text>
          <TextInput placeholder="UID de lï¿½athlï¿½te" value={memberUid} onChangeText={setMemberUid}
            style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:8, padding:10, marginBottom:8 }}/>
          <TouchableOpacity onPress={addMember} disabled={loading || !memberUid}
            style={{ backgroundColor: !memberUid ? "#9ca3af" : "#16a34a", padding:12, borderRadius:10, alignItems:"center" }}>
            {loading ? <ActivityIndicator color="#fff"/> : <Text style={{ color:"#fff", fontWeight:"700" }}>Ajouter</Text>}
          </TouchableOpacity>
        </View>
      )}

      {teamId && (
        <>
          <Text style={{ fontWeight:"700", marginBottom:6 }}>Membres ({members.length})</Text>
          {members.map(m=> <Text key={m.id} style={{ marginBottom:4 }}>ï¿½ {m.id}</Text>)}

          <View style={{ height:12 }} />
          <Text style={{ fontWeight:"700", marginBottom:6 }}>Rï¿½ponses rï¿½centes (miroir ï¿½quipe)</Text>
          {responses.length===0 ? <Text style={{ color:"#6b7280" }}>Aucune rï¿½ponse.</Text> :
            responses.slice(0,20).map((r,i)=>(
              <View key={r.id+"-"+i} style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:10, marginBottom:8 }}>
                <Text style={{ fontWeight:"700" }}>{r.sessionTitle||"Sï¿½ance"} ï¿½ {r.sessionDate||"ï¿½"}</Text>
                <Text style={{ color:"#6b7280", fontSize:12 }}>athlï¿½te: {r.uid?.slice(0,8) || "ï¿½"}</Text>
                <Text style={{ marginTop:4 }}>Intensitï¿½ moy: {r.intensity_avg ?? "ï¿½"} / Fatigue: {r.fatigue ?? "ï¿½"}</Text>
              </View>
            ))
          }
        </>
      )}
    </ScrollView>
  );
}