import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function HomeAfterLogin({ navigation }){
  const u = auth.currentUser;
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ (async()=>{
    try{
      if(!u){ setLoading(false); return; }
      const me = await getDoc(doc(db,"users", u.uid));
      setRole(me.exists()? (me.data().role || "athlete") : "athlete");
    }catch(e){ console.error("Home role load:", e); }
    finally{ setLoading(false); }
  })(); },[u?.uid]);

  if(loading){
    return <SafeAreaView style={{flex:1,justifyContent:"center",alignItems:"center"}}><ActivityIndicator/><Text>Chargement profil�</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex:1, backgroundColor:"#fff", padding:16 }}>
      <Text style={{ fontSize:22, fontWeight:"800", marginBottom:8 }}>Bienvenue</Text>
      <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:10, padding:10, marginBottom:12 }}>
        <Text>UID : <Text style={{ fontWeight:"700" }}>{u?.uid||"�"}</Text></Text>
        <Text>Email : <Text style={{ fontWeight:"700" }}>{u?.email||"�"}</Text></Text>
        <Text>R�le : <Text style={{ fontWeight:"700" }}>{role||"�"}</Text></Text>
      </View>

      <View style={{ flexDirection:"row", flexWrap:"wrap" }}>
        <TouchableOpacity onPress={()=> navigation.navigate("Planning")}
          style={{ backgroundColor:"#111827", padding:12, borderRadius:10, marginRight:8, marginBottom:8 }}>
          <Text style={{ color:"#fff", fontWeight:"700" }}>Ouvrir Planning</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={()=> navigation.navigate("MyData")}
          style={{ backgroundColor:"#e5e7eb", padding:12, borderRadius:10, marginRight:8, marginBottom:8 }}>
          <Text style={{ fontWeight:"700" }}>Mes donn�es</Text>
        </TouchableOpacity>
        {(role==="admin") && (
          <TouchableOpacity onPress={()=> navigation.navigate("AdminDashboard")}
            style={{ backgroundColor:"#dbeafe", padding:12, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ fontWeight:"700", color:"#1d4ed8" }}>Admin</Text>
          </TouchableOpacity>
        )}
        {(role==="admin" || role==="coach") && (
          <TouchableOpacity onPress={()=> navigation.navigate("CoachDashboard")}
            style={{ backgroundColor:"#ecfdf5", padding:12, borderRadius:10, marginRight:8, marginBottom:8 }}>
            <Text style={{ fontWeight:"700", color:"#065f46" }}>Coach</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}