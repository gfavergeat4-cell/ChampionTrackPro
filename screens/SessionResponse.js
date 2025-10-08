import React, { useEffect, useState, useMemo } from "react";
import { View, Text, ScrollView, ActivityIndicator } from "react-native";
import { useRoute } from "@react-navigation/native";
import { auth, db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy, limit, doc, getDoc } from "firebase/firestore";

function Row({ k, v }){
  return (
    <View style={{ flexDirection:"row", justifyContent:"space-between", paddingVertical:6, borderBottomWidth:1, borderColor:"#f3f4f6" }}>
      <Text style={{ fontWeight:"600" }}>{k.replace(/_/g," ")}</Text>
      <Text>{String(v)}</Text>
    </View>
  );
}

export default function SessionResponse(){
  const route = useRoute();
  const session = route.params?.session;
  const [loading, setLoading] = useState(true);
  const [resp, setResp] = useState(null);

  useEffect(()=>{
    (async ()=>{
      try{
        const uid = auth.currentUser?.uid;
        if(!uid || !session?.id){ setLoading(false); return; }
        // si la s�ance a lastResponseId, tente lecture directe
        if(session.lastResponseId){
          const rdoc = await getDoc(doc(db, "users", uid, "sessions", String(session.id), "responses", session.lastResponseId));
          if(rdoc.exists()){ setResp({ id: rdoc.id, ...rdoc.data() }); setLoading(false); return; }
        }
        // sinon, on prend la derni�re par createdAt
        const col = collection(db, "users", uid, "sessions", String(session.id), "responses");
        const qy = query(col, orderBy("createdAt","desc"), limit(1));
        const snap = await getDocs(qy);
        if(!snap.empty){ setResp({ id: snap.docs[0].id, ...snap.docs[0].data() }); }
      }catch(e){
        console.error("Read resp error:", e);
      }finally{
        setLoading(false);
      }
    })();
  },[session?.id, session?.lastResponseId]);

  const entries = useMemo(()=>{
    if(!resp) return [];
    return Object.entries(resp).filter(([k])=> !["createdAt","sessionDate","sessionTitle","id"].includes(k));
  },[resp]);

  if(loading){
    return <View style={{ flex:1, justifyContent:"center", alignItems:"center" }}><ActivityIndicator/></View>;
  }
  if(!resp){
    return <View style={{ flex:1, justifyContent:"center", alignItems:"center", padding:16 }}>
      <Text style={{ fontWeight:"700", marginBottom:6 }}>Aucune r�ponse trouv�e</Text>
      <Text style={{ color:"#6b7280", textAlign:"center" }}>Cette s�ance ne poss�de pas encore de r�ponse.</Text>
    </View>;
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#fff" }} contentContainerStyle={{ padding:16 }}>
      <Text style={{ fontSize:20, fontWeight:"800", marginBottom:4 }}>{session?.title || "S�ance"}</Text>
      <Text style={{ color:"#6b7280", marginBottom:12 }}>
        {session?.date} {session?.start ? `� ${session.start}-${session.end||""}` : ""}
      </Text>

      <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12 }}>
        {entries.length===0 ? <Text style={{ color:"#6b7280" }}>R�ponse vide</Text> :
          entries.map(([k,v])=> <Row key={k} k={k} v={v} />)}
      </View>
    </ScrollView>
  );
}