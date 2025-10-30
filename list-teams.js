const admin = require("firebase-admin");
const sa = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

(async () => {
  const snap = await db.collection("teams").get();
  if (snap.empty) {
    console.log("Aucune équipe.");
  } else {
    console.log("\nÉquipes existantes :");
    snap.forEach(d => {
      const data = d.data() || {};
      console.log(`- id=${d.id} | name="${data.name||""}" | coach=${data?.codes?.coach||"-"} | athlete=${data?.codes?.athlete||"-"}`);
    });
  }
  process.exit(0);
})();
