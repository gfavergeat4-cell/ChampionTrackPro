// Script de debug pour vérifier l'état de Firestore
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, getDoc } = require('firebase/firestore');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8Q",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function debugFirestore() {
  try {
    console.log('🔍 Debugging Firestore...');
    
    // 1. Lister tous les teams
    console.log('\n=== TEAMS ===');
    const teamsSnap = await getDocs(collection(db, 'teams'));
    console.log('Teams count:', teamsSnap.size);
    
    teamsSnap.docs.forEach(teamDoc => {
      const teamData = teamDoc.data();
      console.log(`Team: ${teamDoc.id}`, {
        name: teamData.name,
        icsUrl: teamData.icsUrl,
        timeZone: teamData.timeZone,
        calendarImported: teamData.calendarImported
      });
    });
    
    // 2. Pour chaque team, vérifier les événements
    for (const teamDoc of teamsSnap.docs) {
      const teamId = teamDoc.id;
      console.log(`\n=== EVENTS FOR TEAM ${teamId} ===`);
      
      const eventsSnap = await getDocs(collection(db, 'teams', teamId, 'events'));
      console.log(`Events count: ${eventsSnap.size}`);
      
      if (eventsSnap.size > 0) {
        eventsSnap.docs.slice(0, 5).forEach(eventDoc => {
          const eventData = eventDoc.data();
          console.log(`Event: ${eventDoc.id}`, {
            summary: eventData.summary,
            startUTC: eventData.startUTC,
            endUTC: eventData.endUTC,
            timeZone: eventData.timeZone,
            uid: eventData.uid
          });
        });
      } else {
        console.log('❌ No events found for this team');
      }
    }
    
  } catch (error) {
    console.error('❌ Error debugging Firestore:', error);
  }
}

debugFirestore().catch(console.error);


