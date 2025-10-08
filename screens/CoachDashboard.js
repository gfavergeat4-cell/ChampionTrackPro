import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, View, Text, ActivityIndicator } from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, collection, query, orderBy, getDocs } from "firebase/firestore";

function colorFromScore(s){ // 0..100 -> couleur (vert/jaune/rouge)
  if(s==null) return "#e5e7eb";
  if(s<=33) return "#22c55e";
  if(s<=66) return "#f59e0b";
  return "#ef4444";
}

export default function CoachDashboard(){
  const uid = auth.currentUser?.uid;
  const [teamId, setTeamId] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(()=>{ (async()=>{
    setLoading(true); setErr(null);
    try{
      const me = await getDoc(doc(db,"users", uid));
      const t = me.exists()? (me.data()?.teamId || null) : null;
      setTeamId(t);
      if(!t){ setItems([]); setLoading(false); return; }
      // Derni�res r�ponses par user depuis teams/{teamId}/responses
      const respSnap = await getDocs(query(collection(db,"teams", t,"responses"), orderBy("createdAt","desc")));
      const latest = new Map();
      respSnap.forEach(r=>{
        const it = { id:r.id, ...r.data() };
        const k = it.userId || "unknown";
        if(!latest.has(k)) latest.set(k, it); // premi�re (la plus r�cente)
      });
      setItems(Array.from(latest.entries()).map(([userId, it])=>({ userId, ...it })));
    }catch(e){ console.error(e); setErr(e?.message||String(e)); }
    setLoading(false);
  })(); },[uid]);

  if(loading) return <View style={{ padding:16 }}><ActivityIndicator/><Text style={{ marginTop:8 }}>Chargement�</Text></View>;

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#fff" }} contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800", marginBottom:6 }}>Dashboard coach</Text>
      <Text style={{ color:"#6b7280", marginBottom:12 }}>�quipe: {teamId || "�"} (derni�res r�ponses par joueur)</Text>
      {err && <Text style={{ color:"#b91c1c", marginBottom:8 }}>{err}</Text>}
      {(!teamId) && <Text style={{ color:"#6b7280" }}>Aucun teamId dans ton profil. Demande � un admin de t'ajouter.</Text>}
      <View style={{ flexDirection:"row", flexWrap:"wrap" }}>
        {items.map((it,idx)=>{
          const s = Math.round(((it.intensity_avg ?? 0) + (it.fatigue ?? 0))/2);
          const bg = colorFromScore(s);
          return (
            <View key={it.userId+"-"+idx} style={{ width:"48%", margin:"1%", borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:10, backgroundColor:"#fff" }}>
              <View style={{ flexDirection:"row", alignItems:"center", marginBottom:6 }}>
                <View style={{ width:10, height:10, borderRadius:5, backgroundColor:bg, marginRight:8 }}/>
                <Text style={{ fontWeight:"700" }}>{(it.userId||"�").slice(0,8)}</Text>
              </View>
              <Text style={{ color:"#6b7280", fontSize:12 }}>{it.sessionTitle||"S�ance"} � {it.sessionDate||"�"}</Text>
              <Text style={{ marginTop:6 }}>Score charge (� moy. intensit� & fatigue) : {isFinite(s)? s : "�"}</Text>
            </View>
          );
        })}
      </View>
      {items.length===0 && <Text style={{ color:"#6b7280" }}>Aucune r�ponse d'�quipe trouv�e.</Text>}
    </ScrollView>
  );
}