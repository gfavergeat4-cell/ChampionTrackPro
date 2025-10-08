const admin = require("firebase-admin");
const fs = require("fs");
admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

(async () => {
  try {
    const email = "gfavergeat4@gmail.com";
    const user = await admin.auth().getUserByEmail(email);
    const uid = user.uid;
    const col = db.collection("users").doc(uid).collection("planning");

    const today = new Date();
    const mkDate = (offset) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d.toISOString().split("T")[0];
    };

    const sessions = [
      { title: "Course Endurance", time: "18:00" },
      { title: "PPG Haut du corps", time: "18:30" },
      { title: "Séance VMA", time: "19:00" },
      { title: "Footing récup", time: "18:15" },
      { title: "Jeu réduit intensité", time: "19:30" },
      { title: "Match amical", time: "16:00" },
      { title: "Étirements / Soins", time: "10:30" },
    ];

    for (let i = 0; i < sessions.length; i++) {
      const s = sessions[i];
      await col.add({
        title: s.title,
        date: mkDate(i),
        time: s.time,
        responded: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    console.log("✅ 7 séances ajoutées pour", email);
  } catch (err) {
    console.error("❌ Erreur:", err);
  }
})();
