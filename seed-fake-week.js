const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

function startOfIsoWeek(d){ const x=new Date(d); const dow=(x.getDay()+6)%7; x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }

const EMAIL = process.env.FAKE_EMAIL || "gfavergeat4@gmail.com";   // ← change si besoin

const TITRES = [
  "Course Endurance",        // lun
  "PPG Haut du corps",       // mar
  "Séance VMA",              // mer
  "Footing récupération",    // jeu
  "Jeu réduit intensité",    // ven
  "Match amical",            // sam
  "Étirements / Soins"       // dim
];
const HORAIRES = ["18:00","18:30","19:00","18:15","19:30","16:00","10:30"];

(async () => {
  try {
    const user = await admin.auth().getUserByEmail(EMAIL);
    const uid = user.uid;
    console.log("👤 Cible:", EMAIL, "uid=", uid);

    const col = db.collection("users").doc(uid).collection("planning");
    const monday = startOfIsoWeek(new Date());

    // crée 7 séances (lun→dim)
    const batch = db.batch();
    for (let i=0;i<7;i++){
      const dateISO = iso(addDays(monday,i));
      const time = HORAIRES[i];
      const id = `${dateISO}_${time}`;
      const ref = col.doc(id);
      batch.set(ref, {
        title: TITRES[i],
        date: dateISO,
        time,
        responded: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      console.log(`  • ${id} -> ${TITRES[i]}`);
    }
    await batch.commit();
    console.log("✅ Séances fictives créées pour la semaine", iso(monday), "→", iso(addDays(monday,6)));
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur:", e.message);
    process.exit(1);
  }
})();
