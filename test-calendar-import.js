// Script de test pour vérifier l'import de calendrier
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';

// Configuration Firebase
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

async function testCalendarImport() {
  try {
    console.log("🧪 Test d'import de calendrier...");
    
    // Créer des événements de test avec des dates futures
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const testEvents = [
      {
        title: "Sambo Training",
        startTime: "18:30",
        startDate: tomorrow,
        description: "Sambo training session"
      },
      {
        title: "Kickboxing Training", 
        startTime: "19:45",
        startDate: tomorrow,
        description: "Kickboxing training session"
      },
      {
        title: "Morning Training",
        startTime: "12:15", 
        startDate: nextWeek,
        description: "Morning training session"
      }
    ];
    
    // Supposons que vous avez une équipe avec l'ID "test-team"
    const teamId = "test-team"; // Remplacez par l'ID réel de votre équipe
    
    console.log("📅 Création d'événements de test...");
    
    const eventsCollection = collection(db, "teams", teamId, "events");
    
    // Supprimer les anciens événements
    const existingEvents = await getDocs(eventsCollection);
    const deletePromises = existingEvents.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    console.log("🗑️ Anciens événements supprimés:", existingEvents.size);
    
    // Créer les nouveaux événements
    for (let i = 0; i < testEvents.length; i++) {
      const event = testEvents[i];
      const eventData = {
        title: event.title,
        startTime: event.startTime,
        startDate: event.startDate,
        description: event.description,
        createdAt: serverTimestamp()
      };
      
      console.log(`📅 Création événement ${i + 1}:`, eventData);
      await addDoc(eventsCollection, eventData);
    }
    
    console.log("✅ Événements de test créés avec succès !");
    
    // Vérifier que les événements ont été créés
    const eventsSnapshot = await getDocs(eventsCollection);
    console.log("📊 Nombre d'événements créés:", eventsSnapshot.size);
    
    eventsSnapshot.forEach((doc) => {
      const eventData = doc.data();
      console.log("📅 Événement trouvé:", {
        id: doc.id,
        title: eventData.title,
        startDate: eventData.startDate,
        startTime: eventData.startTime
      });
    });
    
  } catch (error) {
    console.error("❌ Erreur:", error);
  }
}

testCalendarImport();

