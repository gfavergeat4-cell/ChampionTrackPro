import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

// Configuration Firebase (utilisez votre configuration)
const firebaseConfig = {
  apiKey: "AIzaSyBQJQJQJQJQJQJQJQJQJQJQJQJQJQJQJQ",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkEvents() {
  try {
    console.log("🔍 Vérification des événements dans Firestore...");
    
    // Récupérer toutes les équipes
    const teamsRef = collection(db, "teams");
    const teamsSnapshot = await getDocs(teamsRef);
    
    console.log(`📊 Nombre d'équipes trouvées: ${teamsSnapshot.size}`);
    
    for (const teamDoc of teamsSnapshot.docs) {
      const teamData = teamDoc.data();
      console.log(`\n🏆 Équipe: ${teamData.name} (ID: ${teamDoc.id})`);
      console.log(`📅 Calendrier importé: ${teamData.calendarImported || false}`);
      
      // Vérifier les événements de cette équipe
      const eventsRef = collection(db, "teams", teamDoc.id, "events");
      const eventsSnapshot = await getDocs(eventsRef);
      
      console.log(`📅 Nombre d'événements: ${eventsSnapshot.size}`);
      
      if (eventsSnapshot.size > 0) {
        console.log("📋 Événements trouvés:");
        eventsSnapshot.forEach((eventDoc) => {
          const eventData = eventDoc.data();
          console.log(`  - ${eventData.title} (${eventData.startTime})`);
          console.log(`    Date: ${eventData.startDate?.toDate?.() || eventData.startDate}`);
        });
      }
    }
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

checkEvents();


