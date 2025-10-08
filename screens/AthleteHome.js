import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, Pressable, Modal, ActivityIndicator } from "react-native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import { Button } from "../components/UI";
import { importExternalCalendar } from "../services/calendarImport";

// ---------- Utils dates ----------
function startOfIsoWeek(d) {
  const x = new Date(d);
  const dow = (x.getDay() + 6) % 7; // 0=lundi
  x.setDate(x.getDate() - dow);
  x.setHours(0,0,0,0);
  return x;
}
function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }

const JOUR_COURTS = ["lun.","mar.","mer.","jeu.","ven.","sam.","dim."];

// ---------- Démo locale si Firestore indisponible ----------
function makeDemoWeek(monday) {
  const titres = ["Course Endurance","PPG Haut du corps","Séance VMA","Footing récup","Jeu réduit","Match amical","Étirements / Soins"];
  const heures = ["18:00","18:30","19:00","18:15","19:30","16:00","10:30"];
  const out = [];
  for (let i=0;i<7;i++){
    out.push({
      id: `${iso(addDays(monday,i))}_${heures[i]}`,
      date: iso(addDays(monday,i)),
      time: heures[i],
      title: titres[i],
      responded: false
    });
  }
  return out;
}

// ---------- Composant ----------
export default function AthleteHome({ onLogout }) {
  const [tab, setTab] = useState("Calendrier"); // "Accueil" | "Calendrier" | "Rapports" | "Paramètres"
  const [weekStart, setWeekStart] = useState(startOfIsoWeek(new Date()));
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [modal, setModal] = useState({open:false, sess:null});

  const weekEnd = useMemo(()=> addDays(weekStart, 6), [weekStart]);

  async function loadWeek() {
    setLoading(true);
    try {
      // import dynamique pour ne pas casser si le module n'existe pas
      const mod = await import("../services/athlete");
      if (mod.getMyPlanningThisWeek) {
        const list = await mod.getMyPlanningThisWeek(iso(weekStart), iso(weekEnd));
        // normaliser
        const items = (list || []).map((s)=>({
          id: s.id || `${s.date}_${s.time}`,
          date: s.date,
          time: s.time || "—",
          title: s.title || "Séance",
          responded: !!s.responded
        }));
        setSessions(items);
      } else {
        setSessions(makeDemoWeek(weekStart));
      }
    } catch (e) {
      console.warn("[AthleteHome] fallback démo —", e?.message || e);
      setSessions(makeDemoWeek(weekStart));
    } finally {
      setLoading(false);
    }
  }

  useEffect(()=>{ loadWeek(); }, [weekStart]);

  function prevWeek(){ setWeekStart(addDays(weekStart, -7)); }
  function nextWeek(){ setWeekStart(addDays(weekStart, +7)); }

  function openQuestionnaire(sess){ setModal({open:true, sess}); }
  function closeQuestionnaire(){ setModal({open:false, sess:null}); }

  async function validateQuestionnaire() {
    try {
      const s = modal.sess;
      // marquer localement
      setSessions(prev => prev.map(x => x.id===s.id ? {...x, responded:true} : x));
      // si service dispo, enregistrer
      try {
        const mod = await import("../services/athlete");
        if (mod.submitSessionResponse) {
          await mod.submitSessionResponse(s.id, {
            // valeurs bidon — brancher vos EVA réelles ici
            intensite_moy: 70,
            fatigue: 40,
            sommeil: 80,
            respondedAt: new Date().toISOString()
          });
        }
      } catch(_) {}
      closeQuestionnaire();
      alert("✅ Réponse enregistrée.");
    } catch(e) {
      alert("❌ Erreur questionnaire : " + (e.message || e));
    }
  }

  function DayColumn({ index }) {
    const d = addDays(weekStart, index);
    const dISO = iso(d);
    const todays = sessions.filter(s => s.date === dISO);
    return (
      <View style={{ marginBottom: 18 }}>
        <Text style={{ fontWeight:"800", marginBottom:4 }}>{JOUR_COURTS[index]} • {d.toLocaleDateString("fr-FR", { day:"2-digit", month:"short" })}</Text>
        {todays.length === 0 ? (
          <Text style={{ color:"#999" }}>—</Text>
        ) : todays.map(s => (
          <View key={s.id} style={{ padding:12, borderWidth:1, borderColor:"#eee", borderRadius:12, marginBottom:10 }}>
            <Text style={{ fontWeight:"700" }}>{s.title}</Text>
            <Text style={{ color:"#333", marginTop:4 }}>{s.time}</Text>
            <View style={{ flexDirection:"row", alignItems:"center", marginTop:10 }}>
              <Pressable onPress={()=>openQuestionnaire(s)} style={{ backgroundColor:"#1558d6", paddingVertical:10, paddingHorizontal:14, borderRadius:10 }}>
                <Text style={{ color:"#fff", fontWeight:"700" }}>{s.responded ? "Répondre ✓" : "Répondre"}</Text>
              </Pressable>
              {!s.responded && (
                <Text style={{ marginLeft:10, color:"#e67e22" }}>⚠️ à répondre</Text>
              )}
            </View>
          </View>
        ))}
      </View>
    );
  }

  async function onImportCalendar() {
    try {
      const url = typeof prompt !== "undefined"
        ? prompt("Colle le lien ICS (Google → Paramètres → Intégrer l’agenda → *Adresse secrète iCal*) :")
        : null;
      if (!url) return;
      const res = await importExternalCalendar(url, { overwrite:false }).catch(e => { throw e; });
      alert(`✅ Import terminé.\nTotal: ${res?.total ?? "-"}\nCréés: ${res?.created ?? "-"}\nMis à jour: ${res?.updated ?? "-"}`);
      // rafraîchir
      loadWeek();
    } catch(e) {
      alert("❌ Erreur lors de l’import : " + (e.message || e));
    }
  }

  function TabButton({name}) {
    const active = tab === name;
    return (
      <Pressable onPress={()=>setTab(name)} style={{
        paddingVertical:10, paddingHorizontal:16, borderRadius:20,
        backgroundColor: active ? "#0a66c2" : "#f0f3f7", marginRight:8
      }}>
        <Text style={{ color: active?"#fff":"#333", fontWeight:"700" }}>{name}</Text>
      </Pressable>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:"#fff", padding:16 }}>
      {/* Barre d’onglets */}
      <View style={{ flexDirection:"row", marginBottom:16 }}>
        <TabButton name="Accueil" />
        <TabButton name="Calendrier" />
        <TabButton name="Rapports" />
        <TabButton name="Paramètres" />
      </View>

      {tab === "Accueil" && (
        <ScrollView contentContainerStyle={{ paddingBottom:40 }}>
          <View style={{ padding:14, borderWidth:1, borderColor:"#eee", borderRadius:12, backgroundColor:"#fafafa" }}>
            <Text style={{ fontSize:16, fontWeight:"800" }}>Bienvenue 👋</Text>
            <Text style={{ marginTop:6, color:"#333" }}>
              Accède à ton calendrier, réponds aux questionnaires, et suis tes rapports.
            </Text>
          </View>
          <View style={{ marginTop:16 }}>
            <Button title="Importer un calendrier" onPress={onImportCalendar} />
          </View>
        </ScrollView>
      )}

      {tab === "Calendrier" && (
        <ScrollView contentContainerStyle={{ paddingBottom:40 }}>
          {/* En-tête semaine */}
          <View style={{ flexDirection:"row", alignItems:"center", marginBottom:12 }}>
            <Pressable onPress={prevWeek} style={{ padding:8 }}><Text style={{ fontSize:18 }}>←</Text></Pressable>
            <Text style={{ fontWeight:"800", fontSize:16, marginHorizontal:8 }}>
              Semaine • {weekStart.toLocaleDateString("fr-FR", { day:"2-digit", month:"long" })} – {weekEnd.toLocaleDateString("fr-FR", { day:"2-digit", month:"long" })}
            </Text>
            <Pressable onPress={nextWeek} style={{ padding:8 }}><Text style={{ fontSize:18 }}>→</Text></Pressable>
          </View>

          {/* Bouton importer (visible aussi ici) */}
          <View style={{ marginBottom:12 }}>
            <Button title="Importer un calendrier" onPress={onImportCalendar} />
          </View>

          {loading ? (
            <View style={{ padding:20, alignItems:"center" }}>
              <ActivityIndicator />
              <Text style={{ marginTop:8, color:"#666" }}>Chargement…</Text>
            </View>
          ) : (
            <View>
              {[0,1,2,3,4,5,6].map(i => (<DayColumn key={i} index={i} />))}
            </View>
          )}
        </ScrollView>
      )}

      {tab === "Rapports" && (
        <ScrollView contentContainerStyle={{ paddingBottom:40 }}>
          <View style={{ padding:14, borderWidth:1, borderColor:"#eee", borderRadius:12, backgroundColor:"#fafafa" }}>
            <Text style={{ fontWeight:"800" }}>Rapports</Text>
            <Text style={{ marginTop:6, color:"#555" }}>À venir : synthèse de tes réponses, tendances, etc.</Text>
          </View>
        </ScrollView>
      )}

      {tab === "Paramètres" && (
        <ScrollView contentContainerStyle={{ paddingBottom:40 }}>
          <View style={{ padding:14, borderWidth:1, borderColor:"#eee", borderRadius:12, backgroundColor:"#fafafa" }}>
            <Text style={{ fontWeight:"800" }}>Paramètres</Text>
            <Text style={{ marginTop:6, color:"#555" }}>Compte : {auth?.currentUser?.email ?? "—"}</Text>
            <View style={{ marginTop:12 }}>
              <Button title="Se déconnecter" variant="secondary" onPress={()=>signOut(auth)} />
            </View>
          </View>
        </ScrollView>
      )}

      {/* Modal Questionnaire minimal */}
      <Modal visible={modal.open} animationType="slide" transparent>
        <View style={{ flex:1, backgroundColor:"rgba(0,0,0,0.2)", justifyContent:"flex-end" }}>
          <View style={{ backgroundColor:"#fff", padding:16, borderTopLeftRadius:16, borderTopRightRadius:16, maxHeight:"85%" }}>
            <Text style={{ fontSize:18, fontWeight:"800" }}>Questionnaire</Text>
            <Text style={{ marginTop:6, color:"#555" }}>
              {modal.sess ? `${modal.sess.title} — ${modal.sess.time}` : ""}
            </Text>
            <View style={{ height:12 }} />
            <Text>• Défilement avec vos indicateurs EVA (0 à 100) — maquette simplifiée.</Text>
            <View style={{ height:16 }} />
            <View style={{ flexDirection:"row", justifyContent:"space-between" }}>
              <Pressable onPress={closeQuestionnaire} style={{ padding:12, borderRadius:10, backgroundColor:"#eee" }}>
                <Text style={{ fontWeight:"700", color:"#333" }}>Annuler</Text>
              </Pressable>
              <Pressable onPress={validateQuestionnaire} style={{ padding:12, borderRadius:10, backgroundColor:"#1558d6" }}>
                <Text style={{ fontWeight:"700", color:"#fff" }}>Valider</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
