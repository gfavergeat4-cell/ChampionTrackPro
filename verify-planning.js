const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

function startOfIsoWeek(d){const x=new Date(d);const k=(x.getDay()+6)%7;x.setDate(x.getDate()-k);x.setHours(0,0,0,0);return x;}
function addDays(d,n){const x=new Date(d);x.setDate(x.getDate()+n);return x;}
function iso(d){return d.toISOString().split("T")[0];}

(async () => {
  try {
    const email = process.env.EMAIL || "gfavergeat4@gmail.com";
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;

    const monday = startOfIsoWeek(new Date());
    const from = iso(monday);
    const to   = iso(addDays(monday,6));

    const snap = await db.collection("users").doc(uid).collection("planning")
      .where("date", ">=", from)
      .where("date", "<=", to)
      .orderBy("date")
      .orderBy("time")
      .get();

    console.log(`Semaine ${from} → ${to} : ${snap.size} doc(s)`);
    snap.forEach(d => console.log(d.id, d.data()));
    process.exit(0);
  } catch(e){ console.error("ERR:", e.message); process.exit(1); }
})();
