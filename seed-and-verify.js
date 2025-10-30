const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

/** ==== Helpers dates (ISO semaine: lundi->dimanche) ==== */
function startOfIsoWeek(date) {
  const d = new Date(date);
  const dow = (d.getDay() + 6) % 7; // 0=lundi
  d.setDate(d.getDate() - dow);
  d.setHours(0,0,0,0);
  return d;
}
function addDays(d, n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }
function docId(dateISO, time){ return `${dateISO}_${time}`; }

const EMAIL = process.env.SEED_EMAIL || "gfavergeat4@gmail.com";
const WEEKS = Number(process.env.SEED_WEEKS || 4);

const TITRES = [
  "Course Endurance",
  "PPG Haut du corps",
  "Séance VMA",
  "Footing récupération",
  "Jeu réduit intensité",
  "Match amical",
  "Étirements / Soins"
];
const HORAIRES = ["18:00","18:30","19:00","18:15","19:30","16:00","10:30"];

async function ensureWeek(planningCol, monday) {
  const fromISO = iso(monday);
  const toISO   = iso(addDays(monday, 6));

  // Lire ce qui existe déjà
  const snap = await planningCol
    .where("date", ">=", fromISO)
    .where("date", "<=", toISO)
    .get();

  console.log(`\n📅 Semaine ${fromISO} → ${toISO} : ${snap.size} séance(s) trouvée(s).`);
  if (snap.empty) {
    console.log("  → Aucun document. Création de 7 séances…");
    const batch = db.batch();
    for (let i=0; i<7; i++) {
      const dateISO = iso(addDays(monday, i));
      const time = HORAIRES[i];
      const ref = planningCol.doc(docId(dateISO, time));
      batch.set(ref, {
        title: TITRES[i],
        date: dateISO,      // format 'YYYY-MM-DD'
        time,               // 'HH:mm'
        responded: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    await batch.commit();
    // Relire après création
    const after = await planningCol
      .where("date", ">=", fromISO)
      .where("date", "<=", toISO)
      .orderBy("date")
      .orderBy("time")
      .get();
    console.log(`  → ✅ Créées: ${after.size} séance(s).`);
    after.forEach(d => console.log(`    - ${d.id} ::`, d.data()));
  } else {
    // Lister l'existant
    const ordered = await planningCol
      .where("date", ">=", fromISO)
      .where("date", "<=", toISO)
      .orderBy("date")
      .orderBy("time")
      .get();
    ordered.forEach(d => console.log(`  • ${d.id} ::`, d.data()));
  }
}

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(EMAIL);
    const uid = user.uid;
    console.log("👤 Utilisateur:", EMAIL, "uid=", uid);

    const planningCol = db.collection("users").doc(uid).collection("planning");
    console.log("🔎 Chemin Firestore:", `users/${uid}/planning`);

    const start = startOfIsoWeek(new Date());
    for (let w = 0; w <= WEEKS; w++) {
      const monday = addDays(start, 7*w);
      await ensureWeek(planningCol, monday);
    }
    console.log("\n✅ Seed + vérification terminés.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur:", e.message, e.stack || "");
    process.exit(1);
  }
})();
