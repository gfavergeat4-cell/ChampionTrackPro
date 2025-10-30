const admin = require("firebase-admin");
const sa = require("./serviceAccountKey.json");
admin.initializeApp({ credential: admin.credential.cert(sa) });
const db = admin.firestore();

async function main() {
  try {
    const email = "gfavergeat4@gmail.com";

    // Trouve l'utilisateur dans Auth pour récupérer son uid
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;
    console.log("✅ Utilisateur Auth:", email, "uid=", uid);

    const planningCol = db.collection("users").doc(uid).collection("planning");

    const today = new Date();
    const mkDate = (offsetDays) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offsetDays);
      return d.toISOString().split("T")[0];
    };

    const sessions = [
      { date: mkDate(1), time: "18:00", title: "Course Endurance", description: "Footing 45 min - allure confortable" },
      { date: mkDate(3), time: "19:00", title: "Musculation - Full Body", description: "Force & puissance, 1h15" },
      { date: mkDate(5), time: "10:00", title: "Match Amical", description: "2x30 min - intensité match" },
    ];

    let created = 0;
    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      const docId = `demo-${s.date}-${i+1}`;
      await planningCol.doc(docId).set({
        title: s.title,
        date: s.date,
        time: s.time,
        description: s.description,
        demo: true,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
      console.log("  ✓ Ajouté:", docId, s.title, s.date);
      created++;
    }

    console.log(`\n✅ ${created} séances fictives ajoutées pour ${email}.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Erreur:", err.message);
    process.exit(1);
  }
}
main();
