import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, ActivityIndicator, Alert } from "react-native";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { getFunctions, httpsCallable } from "firebase/functions";
import { db } from "../services/firebaseConfig";

const TEAM_ID = "demo-team";

export default function TeamCalendarSettings() {
  const [icsUrl, setIcsUrl] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(function () {
    (async function(){
      try {
        const ref = doc(db, "teams", TEAM_ID);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() || {};
          setIcsUrl(data.icsUrl || "");
        }
      } catch(e) {}
    })();
  }, []);

  async function saveIcsUrl() {
    try {
      setLoading(true);
      await setDoc(doc(db, "teams", TEAM_ID), { icsUrl: icsUrl }, { merge: true });
      Alert.alert("Sauvegardé", "Lien ICS enregistré.");
    } catch (e) {
      Alert.alert("Erreur", (e && e.message) ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function syncNow() {
    try {
      setLoading(true);
      const fn = httpsCallable(getFunctions(), "syncIcsNow");
      const res = await fn({ teamId: TEAM_ID });
      const r = (res && res.data) ? res.data : {};
      const msg = "vus:" + (r.seen||0) + " • créés:" + (r.created||0) + " • maj:" + (r.updated||0) + " • annulés:" + (r.cancelled||0) + (r.note ? " • " + r.note : "");
      Alert.alert("Synchronisation terminée", msg);
    } catch (e) {
      Alert.alert("Erreur sync", (e && e.message) ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>Calendrier externe (ICS)</Text>
      <TextInput
        placeholder="https://…/basic.ics"
        value={icsUrl}
        onChangeText={setIcsUrl}
        autoCapitalize="none"
        autoCorrect={false}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 10, borderRadius: 8, marginBottom: 12 }}
      />

      {loading ? <ActivityIndicator /> : (
        <View style={{ gap: 8 }}>
          <Button title="Enregistrer le lien" onPress={saveIcsUrl} />
          <View style={{ height: 8 }} />
          <Button title="Synchroniser maintenant" onPress={syncNow} />
        </View>
      )}

      <Text style={{ color: "#666", marginTop: 12 }}>
        Astuce Google Calendar : Paramètres de l’agenda → “Intégrer l’agenda” → “Adresse publique au format iCal”.
      </Text>
    </View>
  );
}