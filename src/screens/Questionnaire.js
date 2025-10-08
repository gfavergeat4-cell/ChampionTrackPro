import React, { useState } from "react";
import { View, Text, Button } from "react-native";
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

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

  const save = async () => {
    setMsg("");
    try {
      await addDoc(collection(db, "responses"), { rpe, fatigue, sleep, createdAt: serverTimestamp() });
      navigation.goBack();
    } catch (e) { setMsg(String(e?.message || e)); }
  };

  return (
    <View style={{ flex:1, padding:24 }}>
      <Text style={{ fontSize:20, fontWeight:"600", marginBottom:12 }}>Questionnaire</Text>
      <Field label="RPE" value={rpe} setValue={setRpe} />
      <Field label="Fatigue" value={fatigue} setValue={setFatigue} />
      <Field label="Sleep Quality" value={sleep} setValue={setSleep} />
      <View style={{ height:12 }} />
      <Button title="Save" onPress={save} />
      {msg ? <Text style={{ color:"crimson", marginTop:8 }}>{msg}</Text> : null}
    </View>
  );
}
