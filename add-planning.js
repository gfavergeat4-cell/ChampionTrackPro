const admin = require("firebase-admin");
const sa = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function ts(date) { return admin.firestore.Timestamp.fromDate(date); }
function idFromDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,"0");
  const da = String(d.getDate()).padStart(2,"0");
  const hh = String(d.getHours()).padStart(2,"0");
  const mi = String(d.getMinutes()).padStart(2,"0");
  return `${y}${m}${da}-${hh}${mi}`;
}

async function ensureTeam() {
  const envTeam = process.env.TEAM_ID && String(process.env.TEAM_ID).trim();
  if (envTeam) {
    const r = await db.collection("teams").doc(envTeam).get();
    if (r.exists) return { id: envTeam, from: "env" };
    console.warn(`TEAM_ID="${envTeam}" introuvable -> fallback auto.`);
  }
  const snap = await db.collection("teams").limit(1).get();
  if (!snap.empty) return { id: snap.docs[0].id, from: "first" };

  // crée une équipe démo si aucune n'existe
  const code = () => Math.random().toString(36).slice(2,8).toUpperCase();
  const ref = await db.collection("teams").add({
    name: "Equipe Démo",
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    codes: { coach: "C-"+code(), athlete: "A-"+code() }
  });
  return { id: ref.id, from: "created" };
});
  return { id: ref.id, from: "created" };
}

function sessionsTemplate(startDate) {
  // 7 jours à partir de demain, heures “sport”
  const items = [
    { addDays: 1, hour: 18, title: "PPG – gainage", type: "PPG", note: "Tapis + bouteille" },
    { addDays: 2, hour: 19, title: "Sprint – 6x40m", type: "Vitesse", note: "Récup 2’" },
    { addDays: 3, hour: 18, title: "Force – bas du corps", type: "Muscu", note: "Squat, fente" },
    { addDays: 4, hour: 18, title: "Intervalles 10x1’/1’", type: "Cardio", note: "Z4" },
    { addDays: 5, hour: 20, title: "Technique – ateliers spécifiques", type: "Technique", note: "" },
    { addDays: 6, hour: 17, title: "Match amical", type: "Match", note: "Terrain A" },
    { addDays: 7, hour: 10, title: "Récup – mobilité", type: "Récup", note: "10’ vélo + stretching" },
  ];
  return items.map(it => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + it.addDays);
    d.setHours(it.hour, 0, 0, 0);
    return { when: d, ...it };
  });
}

(async () => {
  try {
    const { id: teamId, from } = await ensureTeam();
    console.log(`\nTeam cible: ${teamId} (source: ${from})`);

    const now = new Date();
    const plan = sessionsTemplate(now);

    const col = db.collection(`teams/${teamId}/planning`);
    let created = 0;
    for (const s of plan) {
      const docId = idFromDate(s.when); // doc déterministe
      await col.doc(docId).set({
        date: ts(s.when),
        title: s.title,
        type: s.type,
        note: s.note || "",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      created++;
      console.log(`  ✓ ${docId}  ${s.title}  (${s.type})  ${s.when.toLocaleString()}`);
    }
    console.log(`\n✅ Planning injecté: ${created} séances.`);
    console.log("➡️ Dans l'app: Athlète > onglet Planning pour répondre.");
    process.exit(0);
  } catch (e) {
    console.error("Erreur:", e.message);
    process.exit(1);
  }
})();

