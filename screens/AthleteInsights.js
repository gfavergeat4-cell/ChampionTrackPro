import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import { auth, db } from "../firebaseConfig";
import { collectionGroup, getDocs, orderBy, limit, query } from "firebase/firestore";

export default function AthleteInsights() {
  const [rpes, setRpes] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const uid = auth.currentUser?.uid;
        if (!uid) return;
        const cg = collectionGroup(db, "responses");
        const qy = query(cg, orderBy("createdAt","desc"), limit(10));
        const snap = await getDocs(qy);
        if (cancelled) return;
        const rows = [];
        snap.forEach(doc => {
          const data = doc.data();
          if (data && typeof data.rpe === "number") rows.push(data.rpe);
        });
        rows.reverse();
        setRpes(rows);
      } catch {
        setRpes([]);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const maxVal = Math.max(10, ...rpes);
  return (
    <View style={{ flex:1, padding:16, backgroundColor:"#fff" }}>
      <Text style={{ fontSize:20, fontWeight:"600", marginBottom:12 }}>Tes donn�es</Text>
      <Text style={{ color:"#6b7280", marginBottom:12 }}>Derniers RPE enregistr�s</Text>

      {rpes.length === 0 ? (
        <Text style={{ color:"#6b7280" }}>Aucune donn�e pour le moment. Remplis un questionnaire dans l�onglet Planning.</Text>
      ) : (
        <View style={{ borderWidth:1, borderColor:"#e5e7eb", borderRadius:12, padding:12 }}>
          {rpes.map((v, idx) => (
            <View key={idx} style={{ marginBottom:8 }}>
              <View style={{ flexDirection:"row", justifyContent:"space-between" }}>
                <Text>Session {idx+1}</Text>
                <Text>{v}</Text>
              </View>
              <View style={{ height:10, backgroundColor:"#e5e7eb", borderRadius:6, overflow:"hidden" }}>
                <View style={{ width: `${(v/maxVal)*100}%`, height:"100%", backgroundColor:"#2563eb" }}/>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}