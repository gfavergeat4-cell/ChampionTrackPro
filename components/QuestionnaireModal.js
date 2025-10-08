import React, { useState, useEffect } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView } from "react-native";

export default function QuestionnaireModal({ visible, onClose, onSave, session }) {
  const [vals, setVals] = useState({ intensite: "", fatigue: "", douleurs: "" });

  useEffect(() => {
    if (visible) setVals({ intensite:"", fatigue:"", douleurs:"" });
  }, [visible]);

  function setField(k, v) {
    // garde uniquement des chiffres
    const n = v.replace(/[^0-9]/g, "");
    setVals(s => ({ ...s, [k]: n }));
  }

  function canSave() {
    const keys = ["intensite","fatigue","douleurs"];
    return keys.every(k => {
      const n = Number(vals[k]);
      return Number.isFinite(n) && n >= 0 && n <= 100;
    });
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex:1, backgroundColor:"rgba(0,0,0,0.35)", alignItems:"center", justifyContent:"center" }}>
        <View style={{ width:"92%", maxWidth:520, backgroundColor:"#fff", borderRadius:14, padding:16 }}>
          <Text style={{ fontSize:18, fontWeight:"800", marginBottom:8 }}>
            Questionnaire — {session?.title ?? "Séance"}
          </Text>
          <Text style={{ color:"#444", marginBottom:12 }}>
            Indique des valeurs entre 0 et 100.
          </Text>

          <ScrollView style={{ maxHeight:360 }}>
            {[
              { key:"intensite", label:"Intensité moyenne" },
              { key:"fatigue", label:"Fatigue" },
              { key:"douleurs", label:"Douleurs articulaires" },
            ].map(f => (
              <View key={f.key} style={{ marginBottom:12 }}>
                <Text style={{ fontWeight:"700", marginBottom:6 }}>{f.label}</Text>
                <TextInput
                  value={vals[f.key]}
                  onChangeText={(t)=>setField(f.key, t)}
                  keyboardType="numeric"
                  placeholder="0 à 100"
                  style={{
                    borderWidth:1, borderColor:"#ddd", borderRadius:8,
                    padding:12, backgroundColor:"#fff"
                  }}
                />
              </View>
            ))}
          </ScrollView>

          <View style={{ flexDirection:"row", gap:8, justifyContent:"flex-end", marginTop:12 }}>
            <Pressable onPress={onClose}
              style={{ paddingVertical:10, paddingHorizontal:14, borderRadius:10, backgroundColor:"#eee", borderWidth:1, borderColor:"#ddd" }}>
              <Text style={{ fontWeight:"700", color:"#333" }}>Annuler</Text>
            </Pressable>
            <Pressable disabled={!canSave()}
              onPress={()=>onSave && onSave({
                intensite: Number(vals.intensite),
                fatigue: Number(vals.fatigue),
                douleurs: Number(vals.douleurs),
              })}
              style={{
                paddingVertical:10, paddingHorizontal:14, borderRadius:10,
                backgroundColor: canSave() ? "#0a66c2" : "#9fbfe2"
              }}>
              <Text style={{ fontWeight:"700", color:"#fff" }}>Valider</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
