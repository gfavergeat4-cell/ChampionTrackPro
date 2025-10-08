const admin = require("firebase-admin");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

function startOfIsoWeek(d0){ const d=new Date(d0); const dow=(d.getDay()+6)%7; d.setDate(d.getDate()-dow); d.setHours(0,0,0,0); return d; }
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }
function iso(d){ return d.toISOString().split("T")[0]; }

(async ()=>{
  const email = process.env.EMAIL || "gfavergeat4@gmail.com";
  const user = await admin.auth().getUserByEmail(email);
  const uid = user.uid;

  const monday = startOfIsoWeek(new Date());
  const fromISO = iso(monday), toISO = iso(addDays(monday,6));
  const col = db.collection(`users/${uid}/planning`);
  const snap = await col.where("date", ">=", fromISO).where("date","<=", toISO).orderBy("date").get();
  const arr = snap.docs.map(d => ({id:d.id, ...d.data()}))
    .sort((a,b)=> a.date===b.date ? String(a.time||"").localeCompare(String(b.time||"")) : String(a.date).localeCompare(String(b.date)));
  console.log("UID:", uid, "week:", fromISO, "->", toISO, "found:", arr.length);
  console.log(arr);
  process.exit(0);
})().catch(e=>{console.error(e);process.exit(1);});
