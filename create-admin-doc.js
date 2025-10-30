// Script simple pour créer le document utilisateur admin
// Exécutez ce script dans la console du navigateur sur votre app

// 1. Ouvrez la console (F12)
// 2. Collez ce code et exécutez-le

import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Remplacez par votre configuration Firebase
const firebaseConfig = {
  // Vos config ici
};

// Initialiser Firebase
import { initializeApp } from "firebase/app";
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Fonction pour créer le document admin
async function createAdminDoc() {
  try {
    console.log("🔐 Connexion en cours...");
    
    // Se connecter (remplacez par votre mot de passe)
    const userCredential = await signInWithEmailAndPassword(
      auth, 
      "gabfavergeat@gmail.com", 
      "VOTRE_MOT_DE_PASSE" // ⚠️ Remplacez par votre vrai mot de passe
    );
    
    const user = userCredential.user;
    console.log("✅ Connecté:", user.email);
    
    // Créer le document utilisateur
    await setDoc(doc(db, "users", user.uid), {
      email: user.email,
      role: "admin",
      createdAt: serverTimestamp(),
    });
    
    console.log("🎉 Document admin créé avec succès!");
    console.log("UID:", user.uid);
    console.log("Email:", user.email);
    console.log("Rôle: admin");
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
  }
}

// Exécuter
createAdminDoc();



