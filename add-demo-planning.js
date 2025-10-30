import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { firebaseConfig } from "./services/firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- Paramètres test ---
const email = "gfavergeat4@gmail.com";
const password = "TON_MOT_DE_PASSE_TEST"; // ⚠️ Mets le bon mot de passe de ton compte test

async function main() {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const uid = cred.user.uid;
    console.log("✅ Connecté comme", email, "uid:", uid);

    const planningRef = doc(db, "users", uid, "planning", "demo-planning");

    await setDoc(planningRef, {
      sessions: [
        { date: "2025-10-05", title: "Course Endurance", details: "Footing 45 min" },
        { date: "2025-10-07", title: "Musculation", details: "Full body 1h15" },
        { date: "2025-10-09", title: "Match Amical", details: "Durée 2x30 min" }
      ],
      createdAt: serverTimestamp()
    });

    console.log("✅ Planning fictif ajouté pour l'athlète test !");
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur:", e.message);
    process.exit(1);
  }
}

main();
