const admin = require("firebase-admin");
const fs = require("fs");

if (!fs.existsSync("./serviceAccountKey.json")) {
  console.error("serviceAccountKey.json introuvable.");
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

/* ===== Helpers ===== */
function startOfIsoWeek(d){const x=new Date(d);const dow=(x.getDay()+6)%7;x.setDate(x.getDate()-dow);x.setHours(0,0,0,0);return x;}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function addWeeks(d,n){return addDays(d,n*7);}
function iso(d){return d.toISOString().split("T")[0];}

/* ===== Params ===== */
const EMAIL        = process.env.EMAIL        || "gfavergeat4@gmail.com";
const WEEKS_PAST   = parseInt(process.env.WEEKS_PAST ?? "12",10);
const WEEKS_FUTURE = parseInt(process.env.WEEKS_FUTURE ?? "12",10);

const TITLE_BY_DAY = [
  "Course Endurance","PPG Haut du corps","Séance VMA",
  "Footing récup","Jeu réduit intensité","Match amical","Étirements / Soins"
];
const DEFAULT_TIMES = ["18:00","18:30","19:00","18:15","19:30","16:00","10:30"];
const BASE_TIMES = (process.env.BASE_TIMES || "").split(",").filter(Boolean);
const TIMES = BASE_TIMES.length===7 ? BASE_TIMES : DEFAULT_TIMES;

function docIdFrom(dateISO,timeHHmm){return `${dateISO}_${timeHHmm}`;}

(async () => {
  // uid depuis email
  let uid;
  try {
    const u = await admin.auth().getUserByEmail(EMAIL);
    uid = u.uid;
  } catch (e) {
    console.error("❌ Utilisateur introuvable dans Auth:", EMAIL);
    process.exit(1);
  }

  const planningCol = db.collection("users").doc(uid).collection("planning");

  const base = startOfIsoWeek(new Date());                  // lundi de cette semaine
  const start = addWeeks(base, -WEEKS_PAST);                // lundi le plus ancien
  const end   = addDays(addWeeks(base, WEEKS_FUTURE), 6);   // dimanche le plus lointain
  const startISO = iso(start), endISO = iso(end);

  console.log(`🔧 Nettoyage ${startISO} → ${endISO} ...`);
  const delSnap = await planningCol.where("date",">=",startISO).where("date","<=",endISO).get();
  if (!delSnap.empty) {
    const b = db.batch();
    delSnap.forEach(d => b.delete(d.ref));
    await b.commit();
    console.log(`🗑️  ${delSnap.size} doc(s) supprimé(s).`);
  } else {
    console.log("🗑️  Rien à supprimer.");
  }

  console.log(`🧩 Injection de ${(WEEKS_PAST+1+WEEKS_FUTURE)*7} séances ...`);
  let count=0, batch=db.batch(), B=400;
  for (let w=-WEEKS_PAST; w<=WEEKS_FUTURE; w++){
    const weekStart = addWeeks(base, w);
    for (let dow=0; dow<7; dow++){
      const day = addDays(weekStart, dow);
      const dateISO = iso(day);
      const time = TIMES[dow];
      const ref = planningCol.doc(docIdFrom(dateISO,time));
      batch.set(ref,{
        title: TITLE_BY_DAY[dow],
        date: dateISO,
        time,
        responded: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      count++; if (count % B === 0){ await batch.commit(); batch=db.batch(); }
    }
  }
  if (count % B !== 0) await batch.commit();
  console.log(`✅ ${count} séances créées pour ${EMAIL} (${startISO} → ${endISO}).`);
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
