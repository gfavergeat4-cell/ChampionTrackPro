import { db } from './firebase';
import { collection, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Configuration
const DEFAULT_TIMEZONE = 'Europe/Paris';

// Fonction de hash simple pour générer des IDs stables
function generateEventId(teamId, uid, startUTC) {
  const str = `${teamId}:${uid}:${startUTC}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36).substring(0, 24);
}

// Créer des événements de test réalistes
function createTestEvents(teamId, teamTimeZone = DEFAULT_TIMEZONE) {
  const now = new Date();
  const events = [];
  
  // Créer des événements pour les 2 prochaines semaines
  for (let week = 0; week < 2; week++) {
    // Mardi de cette semaine
    const tuesday = new Date(now);
    tuesday.setDate(now.getDate() + (2 - now.getDay() + 7 * week) % 7);
    tuesday.setHours(18, 0, 0, 0); // 18h00
    
    // Jeudi de cette semaine
    const thursday = new Date(now);
    thursday.setDate(now.getDate() + (4 - now.getDay() + 7 * week) % 7);
    thursday.setHours(18, 0, 0, 0); // 18h00
    
    // Événements pour mardi
    events.push({
      summary: 'Kickboxing',
      description: 'Séance de kickboxing - Techniques de base',
      location: 'Salle de sport',
      start: new Date(tuesday),
      end: new Date(tuesday.getTime() + 90 * 60 * 1000), // 1h30
      uid: `kickboxing-${week}-tuesday`
    });
    
    // Événements pour jeudi
    events.push({
      summary: 'Boxe',
      description: 'Séance de boxe - Sparring',
      location: 'Salle de sport',
      start: new Date(thursday),
      end: new Date(thursday.getTime() + 90 * 60 * 1000), // 1h30
      uid: `boxe-${week}-thursday`
    });
  }
  
  return events;
}

// Fonction principale d'import d'événements de test
export async function importTestEvents(teamId, teamTimeZone = DEFAULT_TIMEZONE) {
  console.log(`[TEST-EVENTS] Creating test events for team: ${teamId}`);
  
  try {
    // 1. Créer des événements de test
    const testEvents = createTestEvents(teamId, teamTimeZone);
    console.log(`[TEST-EVENTS] Created ${testEvents.length} test events`);
    
    // 2. Importer les événements dans Firestore
    let importedCount = 0;
    const eventsCollectionRef = collection(db, 'teams', teamId, 'events');
    
    for (const event of testEvents) {
      try {
        // Convertir les dates en UTC milliseconds
        const startUTC = event.start.getTime();
        const endUTC = event.end.getTime();
        
        // Générer un ID stable
        const eventId = generateEventId(teamId, event.uid, startUTC);
        
        console.log(`[TEST-EVENTS] Creating event: ${event.summary} (${eventId})`);
        
        // Données de l'événement
        const eventData = {
          teamId: teamId,
          summary: event.summary,
          description: event.description,
          location: event.location,
          startUTC: startUTC,
          endUTC: endUTC,
          timeZone: teamTimeZone,
          uid: event.uid,
          status: 'CONFIRMED',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        // Créer l'événement dans Firestore
        const eventDocRef = doc(eventsCollectionRef, eventId);
        await setDoc(eventDocRef, eventData);
        
        importedCount++;
        console.log(`[TEST-EVENTS] Created event: ${eventData.summary} (${eventId})`);
        
      } catch (eventError) {
        console.error(`[TEST-EVENTS] Error creating event ${event.uid}:`, eventError);
      }
    }
    
    // 3. Mettre à jour le team
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      calendarImported: true,
      calendarImportedAt: serverTimestamp(),
      testEventsCreated: true
    });
    
    const message = `[TEST-EVENTS] Created ${importedCount} test events for team ${teamId}`;
    console.log(message);
    
    return { 
      success: true, 
      message, 
      importedCount, 
      updatedCount: 0, 
      errors: [] 
    };
    
  } catch (error) {
    console.error(`[TEST-EVENTS] Fatal error creating test events for team ${teamId}:`, error);
    return { success: false, error: error.message };
  }
}

