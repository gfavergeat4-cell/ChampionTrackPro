const admin = require("firebase-admin");
const sa = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

const EMAIL = "gfavergeat4@gmail.com";

function startOfWeek(d) { const x=new Date(d); const day=(x.getDay()+6)%7; x.setDate(x.getDate()-day); x.setHours(0,0,0,0); return x; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }

(async()=>{
  try{
    const user = await admin.auth().getUserByEmail(EMAIL);
    const uid = user.uid;
    const weekStart = startOfWeek(new Date());

    const titles = [
      "Course Endurance", "PPG Haut du corps", "Fractionné",
      "Renfo Bas du corps", "Footing Récup", "Pliométrie", "Match / Test"
    ];
    const times  = ["18:00","18:30","19:00","18:00","17:30","10:00","15:00"];
    const ends   = ["19:00","19:15","19:30","19:00","18:00","11:00","16:30"];

    const col = db.collection("users").doc(uid).collection("planning");

    for (let i=0;i<7;i++){
      const d = addDays(weekStart,i);
      const id = iso(d); // docId = YYYY-MM-DD
      const payload = { id, date:id, time:times[i], end:ends[i], title:titles[i], description:"Séance auto (démo)" };
      await col.doc(id).set(payload, { merge:true });
      console.log(`🗓️  ${id} · ${payload.time}-${payload.end} · ${payload.title}`);
    }
    console.log("✅ Planning injecté pour la semaine courante.");
    process.exit(0);
  } catch(e){ console.error("❌", e.message); process.exit(1); }
})();
