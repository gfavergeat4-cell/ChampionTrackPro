const admin = require("firebase-admin");
const fs = require("fs");
if (!fs.existsSync("./serviceAccountKey.json")) {
  console.error("serviceAccountKey.json manquant.");
  process.exit(1);
}
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

function startOfIsoWeek(d){
  const date = new Date(d);
  const day = (date.getDay()+6)%7; // 0 = Lundi
  date.setDate(date.getDate() - day);
  date.setHours(0,0,0,0);
  return date;
}
function addDays(d,n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }

async function main(){
  const email = "gfavergeat4@gmail.com";
  let uid;
  try {
    const u = await admin.auth().getUserByEmail(email);
    uid = u.uid;
  } catch(e) {
    console.error("Utilisateur non trouvé dans Auth pour", email);
    process.exit(1);
  }

  const base = startOfIsoWeek(new Date()); // lundi de cette semaine
  const titles = [
    "Course Endurance", "PPG Haut du corps", "Séance VMA",
    "Footing récup", "Jeu réduit intensité", "Match amical", "Étirements/Soins"
  ];
  const times  = ["18:00","18:30","19:00","18:15","19:30","16:00","10:30"];

  const col = db.collection("users").doc(uid).collection("planning");

  // Supprime l'existant de la semaine pour repartir propre
  const thisWeekISO = iso(base);
  const endWeekISO = iso(addDays(base,6));
  const toDel = await col.where("date", ">=", thisWeekISO).where("date", "<=", endWeekISO).get();
  const batchDel = db.batch();
  toDel.forEach(doc=> batchDel.delete(doc.ref));
  await batchDel.commit();

  // Ajoute 7 docs
  const batch = db.batch();
  for (let i=0;i<7;i++){
    const d = addDays(base,i);
    const ref = col.doc();
    batch.set(ref, {
      title: titles[i],
      date: iso(d),
      time: times[i],
      responded: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  await batch.commit();
  console.log("✅ 7 séances injectées pour", email, "semaine", thisWeekISO, "→", endWeekISO);
}
main().then(()=>process.exit(0)).catch(e=>{ console.error(e); process.exit(1); });
