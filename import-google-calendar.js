// Script pour importer directement les événements depuis Google Calendar
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

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

// Fonction pour parser l'ICS et extraire les événements
function parseICSContent(icsContent) {
  const events = [];
  const lines = icsContent.split('\n');
  let currentEvent = {};
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {};
    } else if (line === 'END:VEVENT') {
      if (currentEvent.summary && currentEvent.start && currentEvent.end) {
        events.push(currentEvent);
      }
      currentEvent = {};
    } else if (line.startsWith('SUMMARY:')) {
      currentEvent.summary = line.substring(8);
    } else if (line.startsWith('DTSTART:')) {
      currentEvent.start = line.substring(8);
    } else if (line.startsWith('DTEND:')) {
      currentEvent.end = line.substring(8);
    } else if (line.startsWith('DESCRIPTION:')) {
      currentEvent.description = line.substring(12);
    } else if (line.startsWith('LOCATION:')) {
      currentEvent.location = line.substring(9);
    }
  }
  
  return events;
}

// Fonction pour convertir une date ICS en timestamp UTC
function icsDateToUTC(icsDate) {
  // Format ICS: 20241201T100000Z ou 20241201T100000
  const year = icsDate.substring(0, 4);
  const month = icsDate.substring(4, 6);
  const day = icsDate.substring(6, 8);
  const hour = icsDate.substring(9, 11);
  const minute = icsDate.substring(11, 13);
  const second = icsDate.substring(13, 15);
  
  const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
  return date.getTime(); // Retourne en millisecondes UTC
}

// Fonction pour créer un ID unique
function createEventId(teamId, summary, startUTC) {
  const crypto = require('crypto');
  const hash = crypto.createHash('sha1');
  hash.update(`${teamId}:${summary}:${startUTC}`);
  return hash.digest('hex').substring(0, 24);
}

async function importGoogleCalendarEvents() {
  try {
    console.log('🚀 Début de l\'import des événements Google Calendar...');
    
    // 1. Récupérer les teams
    const teamsSnap = await getDocs(collection(db, 'teams'));
    if (teamsSnap.empty) {
      console.log('❌ Aucun team trouvé');
      return;
    }
    
    const teamId = teamsSnap.docs[0].id;
    const teamData = teamsSnap.docs[0].data();
    console.log(`📅 Team trouvé: ${teamId} (${teamData.name})`);
    
    // 2. Récupérer l'ICS depuis Google Calendar
    const icsUrl = 'https://calendar.google.com/calendar/ical/gfavergeat4%40gmail.com/public/basic.ics';
    console.log(`📥 Récupération de l'ICS: ${icsUrl}`);
    
    const response = await fetch(icsUrl);
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const icsContent = await response.text();
    console.log(`✅ ICS récupéré: ${icsContent.length} caractères`);
    
    // 3. Parser l'ICS
    const icsEvents = parseICSContent(icsContent);
    console.log(`📅 ${icsEvents.length} événements trouvés dans l'ICS`);
    
    // 4. Filtrer les événements pour mardi et jeudi
    const filteredEvents = icsEvents.filter(event => {
      const startUTC = icsDateToUTC(event.start);
      const eventDate = new Date(startUTC);
      const dayOfWeek = eventDate.getDay();
      return dayOfWeek === 2 || dayOfWeek === 4; // Mardi ou jeudi
    });
    
    console.log(`📅 ${filteredEvents.length} événements Mardi/Jeudi trouvés`);
    
    // 5. Importer les événements filtrés
    let importedCount = 0;
    let updatedCount = 0;
    
    for (const icsEvent of filteredEvents) {
      try {
        const startUTC = icsDateToUTC(icsEvent.start);
        const endUTC = icsDateToUTC(icsEvent.end);
        
        // Créer un ID unique
        const eventId = createEventId(teamId, icsEvent.summary, startUTC);
        
        const eventData = {
          teamId: teamId,
          summary: icsEvent.summary,
          description: icsEvent.description || null,
          location: icsEvent.location || null,
          startUTC: startUTC,
          endUTC: endUTC,
          timeZone: 'Europe/Paris',
          uid: eventId,
          status: 'CONFIRMED',
          updatedAt: new Date()
        };
        
        // Vérifier si l'événement existe déjà
        const eventRef = doc(db, 'teams', teamId, 'events', eventId);
        const existingEvent = await getDoc(eventRef);
        
        if (existingEvent.exists()) {
          await setDoc(eventRef, { ...eventData, createdAt: existingEvent.data().createdAt }, { merge: true });
          updatedCount++;
          console.log(`🔄 Événement mis à jour: ${icsEvent.summary}`);
        } else {
          await setDoc(eventRef, { ...eventData, createdAt: new Date() }, { merge: true });
          importedCount++;
          console.log(`✅ Événement importé: ${icsEvent.summary}`);
        }
        
      } catch (eventError) {
        console.error(`❌ Erreur lors de l'import de l'événement ${icsEvent.summary}:`, eventError);
      }
    }
    
    // 6. Mettre à jour le team
    const teamRef = doc(db, 'teams', teamId);
    await updateDoc(teamRef, {
      icsUrl: icsUrl,
      timeZone: 'Europe/Paris',
      calendarImported: true,
      calendarImportedAt: serverTimestamp()
    });
    
    console.log(`🎉 Import terminé! ${importedCount} nouveaux, ${updatedCount} mis à jour`);
    console.log(`📅 ${filteredEvents.length} événements Mardi/Jeudi importés`);
    
    return {
      success: true,
      importedCount,
      updatedCount,
      totalEvents: filteredEvents.length
    };
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'import:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Exécuter l'import
importGoogleCalendarEvents();


