const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase (même que dans votre projet)
const firebaseConfig = {
  apiKey: "AIzaSyDwslrK0lbuqsBl61C_l3gjVDGF8ZqTZ5o",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.appspot.com",
  messagingSenderId: "308674968497",
  appId: "1:308674968497:web:5f8d10b09ee98717a81b90"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestEvents() {
  try {
    console.log("🚀 Ajout d'événements de test...");
    
    // Vous devez remplacer cet ID par l'ID de votre équipe
    // Vous pouvez le trouver dans la console Firebase ou dans votre interface admin
    const teamId = "YOUR_TEAM_ID_HERE"; // ⚠️ REMPLACEZ PAR VOTRE ID D'ÉQUIPE
    
    if (teamId === "YOUR_TEAM_ID_HERE") {
      console.log("❌ Veuillez d'abord remplacer 'YOUR_TEAM_ID_HERE' par l'ID de votre équipe");
      console.log("💡 Vous pouvez trouver l'ID de votre équipe dans la console Firebase ou dans votre interface admin");
      return;
    }
    
    // Créer plusieurs événements pour aujourd'hui
    const today = new Date();
    const events = [
      {
        title: "Entraînement Matin",
        summary: "Entraînement Matin",
        startTime: "09:00",
        endTime: "10:30",
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 90 * 60000).toISOString(),
        description: "Entraînement matinal - Cardio et renforcement"
      },
      {
        title: "Entraînement Après-midi",
        summary: "Entraînement Après-midi", 
        startTime: "14:00",
        endTime: "15:30",
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 90 * 60000).toISOString(),
        description: "Entraînement après-midi - Technique et endurance"
      },
      {
        title: "Entraînement Soir",
        summary: "Entraînement Soir",
        startTime: "18:00", 
        endTime: "19:30",
        startDate: today.toISOString(),
        endDate: new Date(today.getTime() + 90 * 60000).toISOString(),
        description: "Entraînement du soir - Récupération et stretching"
      }
    ];

    for (const event of events) {
      const eventRef = await addDoc(collection(db, "teams", teamId, "events"), {
        ...event,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log(`✅ Événement créé: ${event.title} (ID: ${eventRef.id})`);
    }

    console.log("🎉 Tous les événements de test ont été créés !");
    console.log("📱 Rechargez votre application pour voir les nouveaux événements");

  } catch (error) {
    console.error("❌ Erreur lors de la création des événements:", error);
  }
}

// Exécuter le script
addTestEvents();

