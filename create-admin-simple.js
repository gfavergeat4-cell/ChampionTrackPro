// Script simple pour créer l'utilisateur admin
// Usage: node create-admin-simple.js

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

async function createAdmin() {
  const email = "gabfavergeat@gmail.com";
  const password = "Admin123456!"; // Changez ce mot de passe après
  
  try {
    console.log("🔐 Création du compte admin...");
    console.log("📧 Email:", email);
    
    // Créer l'utilisateur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("✅ Utilisateur créé dans Firebase Auth:", userCredential.user.uid);
    
    // Créer le document utilisateur avec rôle admin
    await setDoc(doc(db, "users", userCredential.user.uid), {
      email: email,
      role: "admin",
      createdAt: serverTimestamp(),
    });
    console.log("✅ Document utilisateur créé avec rôle admin");
    
    console.log("");
    console.log("🎉 Compte admin créé avec succès!");
    console.log("📧 Email:", email);
    console.log("🔑 Mot de passe:", password);
    console.log("👑 Rôle: admin");
    console.log("");
    console.log("✅ Vous pouvez maintenant vous connecter avec ces identifiants!");
    
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      console.log("⚠️ Cet email est déjà utilisé.");
      console.log("💡 Le compte existe déjà. Vérifiez le mot de passe dans Firebase Console.");
      console.log("💡 Ou utilisez la fonction 'Mot de passe oublié' pour réinitialiser.");
    } else {
      console.error("❌ Erreur:", error.code);
      console.error("❌ Message:", error.message);
    }
  }
}

createAdmin();

