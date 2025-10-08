const admin = require("firebase-admin");
const sa = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

function startOfWeek(d) {
  const x = new Date(d);
  const day = (x.getDay()+6)%7; // Lundi=0
  x.setDate(x.getDate()-day);
  x.setHours(0,0,0,0);
  return x;
}
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }

async function main() {
  const email = "gfavergeat4@gmail.com";

  // Récupère uid par email
  let uid;
  try {
    const user = await admin.auth().getUserByEmail(email);
    uid = user.uid;
    console.log("✅ Utilisateur:", email, "uid=", uid);
  } catch (e) {
    console.error("❌ Utilisateur introuvable:", email, e.message);
    process.exit(1);
  }

  const weekStart = startOfWeek(new Date()); // lundi de la semaine courante
  const titles = [
    "Course Endurance", "PPG Haut du corps", "Fractionné",
    "Renforcement Bas du corps", "Footing Récup", "Pliométrie", "Match / Test"
  ];
  const times  = ["18:00","18:30","19:00","18:00","17:30","10:00","15:00"];
  const ends   = ["19:00","19:15","19:30","19:00","18:00","11:00","16:30"];

  const col = db.collection("users").doc(uid).collection("planning");

  for (let i=0;i<7;i++) {
    const d = addDays(weekStart,i);
    const id = iso(d); // 1 doc par jour => id = YYYY-MM-DD (écrase si existe)
    const payload = {
      date: id,
      time:  times[i],
      end:   ends[i],
      title: titles[i],
      description: "Séance auto-ajoutée (démo)."
    };
    await col.doc(id).set(payload, { merge: true });
    console.log("🗓️  Ajout/MAJ:", id, "-", payload.title, payload.time);
  }

  console.log("\n✅ Planning semaine injecté pour", email);
  process.exit(0);
}

main().catch(e=>{ console.error(e); process.exit(1); });
