import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { QuestionnairePainNo as StitchQuestionnaire } from "../stitch_components";

function Field({ label, value, setValue }) {
  return (
    <View style={{ marginBottom:12 }}>
      <Text style={{ marginBottom:6 }}>{label}: {value}</Text>
      <View style={{ flexDirection:"row", gap:8 }}>
        <Button title="-10" onPress={() => setValue(Math.max(0, value-10))} />
        <Button title="-1" onPress={() => setValue(Math.max(0, value-1))} />
        <Button title="+1" onPress={() => setValue(Math.min(100, value+1))} />
        <Button title="+10" onPress={() => setValue(Math.min(100, value+10))} />
      </View>
    </View>
  );
}

export default function Questionnaire({ navigation }) {
  const [rpe, setRpe] = useState(50);
  const [fatigue, setFatigue] = useState(50);
  const [sleep, setSleep] = useState(50);
  const [msg, setMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    setMsg("");
    try {
      setSaving(true);
      await addDoc(collection(db, "responses"), { rpe, fatigue, sleep, createdAt: serverTimestamp() });
      navigation.goBack();
    } catch (e) { setMsg(String(e?.message || e)); }
    finally { setSaving(false); }
  };

  return (
    <StitchQuestionnaire
      rpe={rpe}
      setRpe={setRpe}
      fatigue={fatigue}
      setFatigue={setFatigue}
      sleep={sleep}
      setSleep={setSleep}
      onSave={save}
      saving={saving}
      error={msg}
    />
  );
}
