const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

function startOfIsoWeek(d){ const x=new Date(d); const dow=(x.getDay()+6)%7; x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }
function docId(dateISO, time){ return `${dateISO}_${time}`; }

const EMAIL = process.env.EMAIL || "gfavergeat4@gmail.com";
// WEEK_START format YYYY-MM-DD (lundi) sinon lundi de cette semaine
const WEEK_START = process.env.WEEK_START;

(async () => {
  try {
    const u = await admin.auth().getUserByEmail(EMAIL);
    const uid = u.uid;
    const planning = db.collection("users").doc(uid).collection("planning");

    const base = WEEK_START ? new Date(WEEK_START) : startOfIsoWeek(new Date());
    const days = Array.from({length:7},(_,i)=> addDays(base,i));
    const fromISO = iso(days[0]), toISO = iso(days[6]);

    console.log(`🔎 Vérification semaine ${fromISO} → ${toISO} pour ${EMAIL}`);

    const snap = await planning
      .where("date", ">=", fromISO)
      .where("date", "<=", toISO)
      .get();

    console.log(`   Trouvé: ${snap.size} séance(s).`);
    if (!snap.empty) { process.exit(0); }

    // Aucune séance → on injecte 1 par jour (titres/horaires simples)
    const TITRES = [
      "Course Endurance",
      "PPG Haut du corps",
      "Séance VMA",
      "Footing récupération",
      "Jeu réduit intensité",
      "Match amical",
      "Étirements / Soins",
    ];
    const HORAIRES = ["18:00","18:30","19:00","18:15","19:30","16:00","10:30"];

    const batch = db.batch();
    days.forEach((d,idx)=>{
      const dateISO = iso(d);
      const time = HORAIRES[idx];
      const ref = planning.doc(docId(dateISO,time));
      batch.set(ref, {
        title: TITRES[idx],
        date: dateISO,
        time,
        responded: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    console.log("✅ 7 séances créées sur la semaine.");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur:", e.message);
    process.exit(1);
  }
})();
