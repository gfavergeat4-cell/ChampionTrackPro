import React, { useState, useEffect } from "react";
import { View, Text, Alert, ScrollView } from "react-native";
import EvaRow from "../components/EvaRow";
import { submitSessionResponse, getMyResponse } from "../services/athlete";
import { Button } from "../components/UI";

const FIELDS = [
  { key:"intensityAvg", label:"Intensité moyenne", left:"-", right:"Moyenne des intensités de tous mes efforts" },
  { key:"intensityHigh", label:"Hautes intensités", left:"-", right:"Moyenne des intensités les plus intenses" },
  { key:"cardio", label:"Impact cardiaque", left:"-", right:"Moyenne des sollicitations cardiaques" },
  { key:"muscle", label:"Impact musculaire", left:"-", right:"Moyenne des sollicitations musculaires" },
  { key:"fatigue", label:"Fatigue", left:"-", right:"Diminution des ressources" },
  { key:"technique", label:"Technique", left:"-", right:"Maîtrise des gestes, des mouvements ..." },
  { key:"tactic", label:"Tactique", left:"-", right:"Pertinence des décisions, des stratégies..." },
  { key:"dynamism", label:"Dynamisme", left:"-", right:"Rapidité de réaction, de mise en action" },
  { key:"nervosity", label:"Nervosité", left:"-", right:"Irritation, impatience, agacement ..." },
  { key:"focus", label:"Concentration", left:"-", right:"Capacité à affronter les situations" },
  { key:"confidence", label:"Confiance en soi", left:"-", right:"Croyances en mes capacités" },
  { key:"wellbeing", label:"Bien-être", left:"-", right:"Épanouissement relationnel, équilibre personnel" },
  { key:"sleep", label:"Sommeil", left:"-", right:"Qualité des dernières 24h" },
];

export default function Questionnaire({ session, onClose, onSaved }) {
  const [vals, setVals] = useState({});

  useEffect(() => {
    (async () => {
      const prev = await getMyResponse(session.id);
      if (prev) setVals({ ...prev.scores });
    })();
  }, [session?.id]);

  function setField(k, v){ setVals(p => ({...p, [k]:v})); }

  async function save() {
    try {
      await submitSessionResponse(session.id, {
        date: session.date, time: session.time, title: session.title,
        scores: vals,
      });
      onSaved?.();
      onClose?.();
    } catch (e) {
      Alert.alert("Erreur lors de l’enregistrement", e?.message ?? String(e));
    }
  }

  return (
    <View style={{flex:1, backgroundColor:"#fff"}}>
      <ScrollView contentContainerStyle={{ padding:16 }}>
        <Text style={{fontSize:24, fontWeight:"800", marginBottom:8}}>Questionnaire</Text>
        <Text style={{marginBottom:14}}>{session?.title} • {session?.date} • {session?.time}</Text>

        {FIELDS.map(f => (
          <EvaRow
            key={f.key}
            label={f.label}
            hintLeft={f.left}
            hintRight={f.right}
            value={vals[f.key] ?? 50}
            onChange={(v)=>setField(f.key, v)}
          />
        ))}

        <View style={{ flexDirection:"row", gap:10, marginTop:16 }}>
          <Button title="Annuler" variant="secondary" onPress={()=>onClose?.()} />
          <Button title="Valider" onPress={()=>{
            Alert.alert("Valider ?", "Envoyer tes réponses maintenant ?", [
              { text:"Annuler" },
              { text:"Valider", onPress: save }
            ]);
          }} />
        </View>
      </ScrollView>
    </View>
  );
}
