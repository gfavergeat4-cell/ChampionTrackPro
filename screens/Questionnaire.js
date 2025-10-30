/**
 * screens/Questionnaire.js
 * Écran unique (scroll) avec curseurs EVA 0–100 + question douleur.
 * Sauvegarde dans: teams/{teamId}/events/{eventId}/responses/{uid}
 *
 * Attendu via navigation:
 *   route.params = { teamId: string, eventId: string, templateId?: string }
 */
import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import Slider from "@react-native-community/slider";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

function SliderRow({ labelLeft, labelRight, value, onChange }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowHeader}>
        <Text style={styles.labelLeft}>{labelLeft}</Text>
        <Text style={styles.labelRight}>{labelRight}</Text>
      </View>
      <View style={styles.scaleRow}>
        <Text style={styles.scaleEdge}>-</Text>
        <Slider
          style={{ flex: 1, height: 40 }}
          minimumValue={0}
          maximumValue={100}
          step={1}
          value={value}
          onValueChange={onChange}
        />
        <Text style={styles.scaleEdge}>+</Text>
      </View>
      <Text style={styles.valueText}>{value}</Text>
    </View>
  );
}

export default function QuestionnaireScreen({ route, navigation }) {
  const uid = auth?.currentUser?.uid;
  const { teamId, eventId, templateId = "sRPE" } = route?.params || {};

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pain, setPain] = useState(null); // true / false / null

  const [values, setValues] = useState({
    // PHYSIQUE
    intensiteMoyenne: 50,
    hautesIntensites: 50,
    impactCardiaque: 50,
    impactMusculaire: 50,
    fatigue: 50,
    // TECH/TACTIQUE/MENTAL
    technique: 50,
    tactique: 50,
    dynamisme: 50,
    nervosite: 50,
    concentration: 50,
    confiance: 50,
    bienEtre: 50,
    sommeil: 50,
  });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!teamId || !eventId || !uid) return;
        const ref = doc(db, "teams", teamId, "events", eventId, "responses", uid);
        const snap = await getDoc(ref);
        if (snap.exists() && mounted) {
          const data = snap.data();
          if (data?.values) setValues((prev) => ({ ...prev, ...data.values }));
          if (typeof data?.pain === "boolean") setPain(data.pain);
        }
      } catch (e) {
        console.warn("Load response failed:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [teamId, eventId, uid]);

  const sections = useMemo(() => ([
    {
      title: "PHYSIQUE",
      rows: [
        { key: "intensiteMoyenne", labelLeft: "INTENSITÉ MOYENNE", labelRight: "Moyenne des intensités de tous mes efforts" },
        { key: "hautesIntensites", labelLeft: "HAUTES INTENSITÉS", labelRight: "Moyenne des intensités les plus intenses" },
        { key: "impactCardiaque", labelLeft: "IMPACT CARDIAQUE", labelRight: "Moyenne des sollicitations cardiaques" },
        { key: "impactMusculaire", labelLeft: "IMPACT MUSCULAIRE", labelRight: "Moyenne des sollicitations musculaires" },
        { key: "fatigue", labelLeft: "FATIGUE", labelRight: "Diminution des ressources" },
      ],
    },
    {
      title: "TECHNIQUE / TACTIQUE",
      rows: [
        { key: "technique", labelLeft: "TECHNIQUE", labelRight: "Maîtrise des gestes, des mouvements…" },
        { key: "tactique", labelLeft: "TACTIQUE", labelRight: "Pertinence des décisions, des stratégies…" },
        { key: "dynamisme", labelLeft: "DYNAMISME", labelRight: "Rapidité de réaction, de mise en action" },
        { key: "nervosite", labelLeft: "NERVOSITÉ", labelRight: "Irritation, impatience, agacement…" },
      ],
    },
    {
      title: "MENTAL",
      rows: [
        { key: "concentration", labelLeft: "CONCENTRATION", labelRight: "Capacité à affronter les situations" },
        { key: "confiance", labelLeft: "CONFIANCE EN SOI", labelRight: "Croyances en mes capacités" },
        { key: "bienEtre", labelLeft: "BIEN-ÊTRE", labelRight: "Personnel, relationnel" },
        { key: "sommeil", labelLeft: "SOMMEIL", labelRight: "Qualité des dernières 24h" },
      ],
    },
  ]), []);

  const onChange = (k, v) => setValues((prev) => ({ ...prev, [k]: Math.round(v) }));

  const onSubmit = async () => {
    if (!uid || !teamId || !eventId) {
      Alert.alert("Erreur", "Paramètres manquants (utilisateur/équipe/événement).");
      return;
    }
    try {
      setSaving(true);
      const ref = doc(db, "teams", teamId, "events", eventId, "responses", uid);
      await setDoc(ref, {
        uid, teamId, eventId, templateId,
        values,
        pain: pain === true ? true : pain === false ? false : null,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      Alert.alert("Enregistré ✅", "Merci, ta réponse a bien été sauvegardée.");
      if (navigation?.goBack) navigation.goBack();
    } catch (e) {
      console.error(e);
      Alert.alert("Erreur", "Impossible d’enregistrer. Réessaie.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Chargement…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>QUESTIONNAIRE</Text>
        <Text style={styles.subtitle}>EVA de 0 à 100 — fais glisser le curseur.</Text>

        {sections.map((sec) => (
          <View key={sec.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{sec.title}</Text>
            {sec.rows.map((r) => (
              <SliderRow
                key={r.key}
                labelLeft={r.labelLeft}
                labelRight={r.labelRight}
                value={values[r.key]}
                onChange={(v) => onChange(r.key, v)}
              />
            ))}
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>DOULEUR</Text>
          <Text style={styles.subtitle}>As-tu ressenti une douleur physique ?</Text>
          <View style={styles.painRow}>
            <TouchableOpacity
              onPress={() => setPain(true)}
              style={[styles.painBtn, pain === true && styles.painBtnActiveYes]}
            >
              <Text style={styles.painBtnText}>OUI</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setPain(false)}
              style={[styles.painBtn, pain === false && styles.painBtnActiveNo]}
            >
              <Text style={styles.painBtnText}>NON</Text>
            </TouchableOpacity>
          </View>
          {pain === true && (
            <Text style={styles.hint}>
              (Plus tard) Affichage d’un mannequin 3D pour cliquer sur la zone douloureuse.
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={onSubmit} disabled={saving} style={styles.saveBtn}>
          {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
  subtitle: { fontSize: 14, opacity: 0.7, marginBottom: 12 },
  section: { marginTop: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  row: { marginVertical: 12 },
  rowHeader: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  labelLeft: { fontSize: 15, fontWeight: "700" },
  labelRight: { fontSize: 12, opacity: 0.7, textAlign: "right", maxWidth: "50%" },
  scaleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  scaleEdge: { width: 16, textAlign: "center", fontWeight: "700", opacity: 0.6 },
  valueText: { alignSelf: "flex-end", fontSize: 12, opacity: 0.6, marginTop: 4 },
  painRow: { flexDirection: "row", gap: 12, marginTop: 8 },
  painBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, backgroundColor: "#ddd", alignItems: "center" },
  painBtnActiveYes: { backgroundColor: "#d9534f" },
  painBtnActiveNo: { backgroundColor: "#5cb85c" },
  painBtnText: { color: "#fff", fontWeight: "700" },
  saveBtn: { marginTop: 24, backgroundColor: "#4a67ff", paddingVertical: 14, borderRadius: 12, alignItems: "center" },
  saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  hint: { marginTop: 8, fontSize: 12, fontStyle: "italic", opacity: 0.7 },
});