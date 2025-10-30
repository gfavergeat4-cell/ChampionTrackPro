// Script de debug pour diagnostiquer le problème d'affichage des événements
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

async function debugScheduleIssue() {
  try {
    console.log('🔍 Debugging Schedule Issue...');
    
    // 1. Lister tous les teams
    console.log('\n=== TEAMS ===');
    const teamsSnap = await getDocs(collection(db, 'teams'));
    console.log('Teams count:', teamsSnap.size);
    
    if (teamsSnap.empty) {
      console.log('❌ No teams found!');
      return;
    }
    
    // 2. Pour chaque team, vérifier les événements
    for (const teamDoc of teamsSnap.docs) {
      const teamId = teamDoc.id;
      const teamData = teamDoc.data();
      
      console.log(`\n=== TEAM: ${teamId} ===`);
      console.log('Team data:', {
        name: teamData.name,
        icsUrl: teamData.icsUrl,
        timeZone: teamData.timeZone,
        calendarImported: teamData.calendarImported
      });
      
      // 3. Vérifier les événements de ce team
      const eventsSnap = await getDocs(collection(db, 'teams', teamId, 'events'));
      console.log(`Events count: ${eventsSnap.size}`);
      
      if (eventsSnap.size > 0) {
        console.log('📅 Events found:');
        eventsSnap.docs.forEach((eventDoc, index) => {
          const eventData = eventDoc.data();
          const eventDate = new Date(eventData.startUTC);
          const dayOfWeek = eventDate.getDay();
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
          
          console.log(`  ${index + 1}. ${eventData.summary || 'No title'}`);
          console.log(`     Date: ${eventDate.toLocaleString()}`);
          console.log(`     Day: ${dayName} (${dayOfWeek})`);
          console.log(`     startUTC: ${eventData.startUTC}`);
          console.log(`     timeZone: ${eventData.timeZone}`);
          console.log(`     isTuesdayOrThursday: ${dayOfWeek === 2 || dayOfWeek === 4}`);
          console.log('');
        });
        
        // 4. Filtrer pour mardi et jeudi
        const tuesdayThursdayEvents = eventsSnap.docs.filter(eventDoc => {
          const eventData = eventDoc.data();
          const eventDate = new Date(eventData.startUTC);
          const dayOfWeek = eventDate.getDay();
          return dayOfWeek === 2 || dayOfWeek === 4; // Mardi ou jeudi
        });
        
        console.log(`📅 Tuesday/Thursday events: ${tuesdayThursdayEvents.length}`);
        tuesdayThursdayEvents.forEach((eventDoc, index) => {
          const eventData = eventDoc.data();
          const eventDate = new Date(eventData.startUTC);
          console.log(`  ${index + 1}. ${eventData.summary} - ${eventDate.toLocaleString()}`);
        });
        
      } else {
        console.log('❌ No events found for this team');
      }
    }
    
    // 5. Test de l'import ICS
    console.log('\n=== ICS IMPORT TEST ===');
    const icsUrl = 'https://calendar.google.com/calendar/ical/gfavergeat4%40gmail.com/public/basic.ics';
    console.log(`Testing ICS URL: ${icsUrl}`);
    
    try {
      const response = await fetch(icsUrl);
      if (response.ok) {
        const icsContent = await response.text();
        console.log(`✅ ICS fetch successful: ${icsContent.length} characters`);
        console.log('📄 First 200 characters:', icsContent.substring(0, 200));
        
        // Parser simple pour compter les événements
        const eventCount = (icsContent.match(/BEGIN:VEVENT/g) || []).length;
        console.log(`📅 Events in ICS: ${eventCount}`);
      } else {
        console.log(`❌ ICS fetch failed: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log(`❌ ICS fetch error: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error during debug:', error);
  }
}

debugScheduleIssue().catch(console.error);

