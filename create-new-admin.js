// Script pour créer un nouvel utilisateur admin
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDwslrK0lbuqsBl61C_l3gjVDGF8ZqTZ5o",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.firebasestorage.app",
  messagingSenderId: "308674968497",
  appId: "1:308674968497:web:5f8d10b09ee98717a81b90"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createNewAdmin() {
  try {
    console.log("🔐 Creating new admin user...");
    
    // Utiliser un email différent pour éviter le blocage
    const email = "admin@championtrackpro.com";
    const password = "admin123456";
    
    // Créer l'utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ User created:", userCredential.user.uid);
    
    // Créer le document utilisateur avec le rôle admin
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "admin",
      createdAt: serverTimestamp(),
    });
    
    console.log("🎉 New admin user created successfully!");
    console.log("📧 Email:", email);
    console.log("🔑 Password:", password);
    console.log("👑 Role: admin");
    console.log("");
    console.log("✅ You can now login with these credentials!");
    
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("⚠️ This email is already in use. Try a different email.");
    } else {
      console.error("❌ Error:", error.message);
    }
  }
}

createNewAdmin();
