const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

function startOfIsoWeek(d){ const x=new Date(d); const dow=(x.getDay()+6)%7; x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }
function docId(dateISO,time){ return `${dateISO}_${time}`; }

const EMAIL = process.env.SEED_USER_EMAIL || "gfavergeat4@gmail.com";
const WEEKS = Number(process.env.WEEKS || 8); // nb de semaines à remplir à partir de la semaine courante

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

async function ensureWeek(planningCol, monday){
  const fromISO = iso(monday);
  const toISO = iso(addDays(monday,6));
  const snap = await planningCol
    .where("date",">=",fromISO)
    .where("date","<=",toISO)
    .get();

  console.log(`Semaine ${fromISO} → ${toISO} : ${snap.size} séance(s).`);
  if (!snap.empty) return;

  const batch = db.batch();
  for (let i=0;i<7;i++){
    const d = addDays(monday,i);
    const dateISO = iso(d);
    const time = HORAIRES[i];
    const ref = planningCol.doc(docId(dateISO,time));
    batch.set(ref, {
      title: TITRES[i],
      date: dateISO,
      time,
      responded: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
  await batch.commit();
  console.log(`  → ✅ séances créées pour ${fromISO} → ${toISO}`);
}

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(EMAIL);
    const uid = user.uid;
    const planning = db.collection("users").doc(uid).collection("planning");

    const start = startOfIsoWeek(new Date());
    for (let w=0; w<=WEEKS; w++){
      const monday = addDays(start, 7*w);
      await ensureWeek(planning, monday);
    }
    console.log("✅ Ensemencement terminé.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur:", e.message);
    process.exit(1);
  }
})();
