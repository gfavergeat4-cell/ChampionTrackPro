import React, { useMemo, useState } from "react";
import { View, Text, ScrollView } from "react-native";
import EvaRow from "../components/EvaRow";
import { Button } from "../components/UI";
import { submitSessionResponse } from "../services/athlete";

/**
 * Indicateurs (sans "Capacité adverse" et sans "Durée perçue")
 * rappel: chaque indicateur est EVA 0-100
 */
const FIELDS = [
  { key:"intensite_moy", label:"Intensité moyenne", hint:"Moyenne des intensités de tous mes efforts" },
  { key:"hautes_intensites", label:"Hautes intensités", hint:"Moyenne des intensités les plus intenses" },
  { key:"douleurs", label:"Douleurs articulaires", hint:"Gênes, inquiétude, ..." },
  { key:"fatigue", label:"Fatigue", hint:"Diminution des ressources" },
  { key:"impact_cardiaque", label:"Impact cardiaque", hint:"Moyenne des sollicitations cardiaques" },
  { key:"impact_musculaire", label:"Impact musculaire", hint:"Moyenne des sollicitations musculaires" },
  { key:"technique", label:"Technique", hint:"Maîtrise des gestes, des mouvements ..." },
  { key:"tactique", label:"Tactique", hint:"Pertinence des décisions, des stratégies..." },
  { key:"dynamisme", label:"Dynamisme", hint:"Rapidité de réaction, de mise en action" },
  { key:"nervosite", label:"Nervosité", hint:"Irritation, impatience, agacement ..." },
  { key:"confiance", label:"Confiance en soi", hint:"Croyances en mes capacités" },
  { key:"concentration", label:"Concentration", hint:"Capacité à affronter les situations" },
  { key:"bien_etre", label:"Bien-être", hint:"Épanouissement relationnel, équilibre personnel" },
  { key:"sommeil", label:"Sommeil", hint:"Qualité des dernières 24h" },
];

export default function SessionQuestionnaire({ session, onClose }) {
  const initial = useMemo(()=> {
    const o={}; FIELDS.forEach(f=>o[f.key]=50); return o;
  },[]);
  const [vals, setVals] = useState(initial);
  const set = (k,v)=> setVals(s=>({...s,[k]:v}));

  async function handleValidate() {
    try {
      await submitSessionResponse(session, vals);
      onClose?.(true);
    } catch(e) {
      alert("Erreur lors de l’enregistrement: " + (e?.message || e));
    }
  }

  return (
    <View style={{ flex:1, backgroundColor:"#fff" }}>
      {/* Header */}
      <View style={{ padding:12, borderBottomWidth:1, borderColor:"#e5e7eb", flexDirection:"row", justifyContent:"space-between", alignItems:"center" }}>
        <Text style={{ fontSize:18, fontWeight:"900" }}>
          Questionnaire — {session?.title || "Séance"}
        </Text>
        <View style={{ flexDirection:"row", gap:8 }}>
          <Button title="Annuler" variant="secondary" onPress={()=>onClose?.(false)} />
          <Button title="Valider" onPress={handleValidate} />
        </View>
      </View>

      {/* Corps */}
      <ScrollView contentContainerStyle={{ padding:14, paddingBottom:30 }}>
        {FIELDS.map(f=>(
          <EvaRow
            key={f.key}
            label={f.label}
            hint={f.hint}
            value={vals[f.key]}
            onChange={(v)=>set(f.key,v)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
