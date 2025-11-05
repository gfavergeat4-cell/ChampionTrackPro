// Script pour créer l'utilisateur admin dans Firebase Authentication
// Usage: node create-admin-user.js

const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");

// Initialiser Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const auth = admin.auth();

async function createAdminUser() {
  const email = "gabfavergeat@gmail.com";
  const password = "ChampionTrack2024!"; // Changez ce mot de passe après création
  
  try {
    console.log("🔐 Création de l'utilisateur admin...");
    
    // Créer l'utilisateur dans Firebase Auth
    let user;
    try {
      user = await auth.createUser({
        email: email,
        password: password,
        emailVerified: true,
      });
      console.log("✅ Utilisateur créé dans Firebase Auth:", user.uid);
    } catch (error) {
      if (error.code === "auth/email-already-exists") {
        // Récupérer l'utilisateur existant
        user = await auth.getUserByEmail(email);
        console.log("ℹ️ Utilisateur existe déjà:", user.uid);
      } else {
        throw error;
      }
    }
    
    // Créer le document utilisateur dans Firestore
    const userRef = db.collection("users").doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      await userRef.set({
        email: email,
        role: "admin",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log("✅ Document utilisateur créé dans Firestore avec rôle admin");
    } else {
      // Mettre à jour le rôle si nécessaire
      const currentData = userDoc.data();
      if (currentData.role !== "admin") {
        await userRef.update({ role: "admin" });
        console.log("✅ Rôle mis à jour à 'admin'");
      } else {
        console.log("ℹ️ Document utilisateur existe déjà avec rôle admin");
      }
    }
    
    console.log("");
    console.log("🎉 Compte admin créé/mis à jour avec succès!");
    console.log("📧 Email:", email);
    console.log("🔑 Mot de passe:", password);
    console.log("👤 UID:", user.uid);
    console.log("🔐 Rôle: admin");
    console.log("");
    console.log("⚠️ IMPORTANT: Changez le mot de passe après votre première connexion!");
    
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    console.error("Code:", error.code);
    process.exit(1);
  }
}

createAdminUser()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

