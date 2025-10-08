const admin = require("firebase-admin");
const sa = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

(async () => {
  try {
    const email = "gfavergeat4@gmail.com";
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;

    const planning = db.collection("users").doc(uid).collection("planning");
    const today = new Date();
    const mk = (off) => {
      const d = new Date(today); d.setDate(d.getDate()+off);
      return d.toISOString().split("T")[0];
    };

    const items = [
      { id:`demo-${mk(1)}`, date: mk(1),  time:"12:45", end:"14:00", title:"Séance", description:"Entraînement collectif – Montpellier Hérault" },
      { id:`demo-${mk(3)}`, date: mk(3),  time:"18:00", end:"19:15", title:"Musculation – Full Body", description:"Force & puissance" },
      { id:`demo-${mk(5)}`, date: mk(5),  time:"10:00", end:"11:30", title:"Match amical", description:"Terrain A" },
    ];

    for (const it of items) {
      await planning.doc(it.id).set({
        ...it, createdAt: admin.firestore.FieldValue.serverTimestamp(), demo:true
      }, { merge:true });
      console.log("✓ Ajout", it.id, it.title, it.date);
    }
    console.log("✅ Planning démo injecté pour", email);
    process.exit(0);
  } catch (e) {
    console.error("❌", e.message);
    process.exit(1);
  }
})();
