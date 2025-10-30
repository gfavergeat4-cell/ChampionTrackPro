const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdefghijklmnop"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function addTestEvents() {
  try {
    console.log("🚀 Ajout d'événements de test...");
    
    // ID de l'équipe (remplacez par votre ID d'équipe)
    const teamId = "YOUR_TEAM_ID"; // Remplacez par l'ID de votre équipe
    
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