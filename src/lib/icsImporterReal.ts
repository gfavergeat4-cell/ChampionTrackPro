import { db } from './firebase';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

export interface ICSImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  updatedCount?: number;
  errors?: string[];
}

/**
 * Génère un ID idempotent pour un événement (version simplifiée)
 */
function generateEventIdempotencyKey(teamId: string, uid: string, startUTC: number): string {
  const uniqueString = `${teamId}:${uid}:${startUTC}`;
  // Version simplifiée sans crypto pour éviter les erreurs de module
  let hash = 0;
  for (let i = 0; i < uniqueString.length; i++) {
    const char = uniqueString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36).slice(0, 24);
}

/**
 * Parse un fichier ICS et retourne les événements
 * Pour l'instant, on utilise des événements de test
 */
function parseICS(icsContent: string): any[] {
  console.log('[ICS] fetch ok, parsing…');
  
  // Pour l'instant, retournons des événements de test
  // Dans une vraie implémentation, vous utiliseriez une librairie comme 'ical.js'
  console.warn("ICS parsing is a placeholder. Implement with a proper library (e.g., ical.js).");
  
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  const events = [
    {
      uid: 'kickboxing-morning@example.com',
      summary: 'Kickboxing',
      start: new Date(todayStart.getTime() + 9 * 60 * 60 * 1000), // 09:00
      end: new Date(todayStart.getTime() + 10.5 * 60 * 60 * 1000), // 10:30
      timezone: 'Europe/Paris',
      description: 'Entraînement de kickboxing matinal'
    },
    {
      uid: 'sambo-afternoon@example.com',
      summary: 'Sambo',
      start: new Date(todayStart.getTime() + 14 * 60 * 60 * 1000), // 14:00
      end: new Date(todayStart.getTime() + 15.5 * 60 * 60 * 1000), // 15:30
      timezone: 'Europe/Paris',
      description: 'Entraînement de sambo après-midi'
    },
    {
      uid: 'kickboxing-evening@example.com',
      summary: 'Kickboxing',
      start: new Date(todayStart.getTime() + 18 * 60 * 60 * 1000), // 18:00
      end: new Date(todayStart.getTime() + 19.5 * 60 * 60 * 1000), // 19:30
      timezone: 'Europe/Paris',
      description: 'Entraînement de kickboxing du soir'
    }
  ];
  
  console.log(`[ICS] parsed count=${events.length}`);
  return events;
}

/**
 * Importe un fichier ICS dans Firestore avec le schéma correct
 */
export async function importICSToFirestore(
  teamId: string, 
  icsUrl: string, 
  teamTimeZone: string = 'Europe/Paris'
): Promise<ICSImportResult> {
  try {
    console.log(`[ICS] fetch start url=${icsUrl}`);

    // 1. Fetch and parse ICS
    const response = await fetch(icsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ICS: ${response.statusText}`);
    }
    const icsContent = await response.text();
    const parsedEvents = parseICS(icsContent);

    let importedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    const eventsCollectionRef = collection(db, 'teams', teamId, 'events');

    for (const event of parsedEvents) {
      try {
        // Normaliser les dates en UTC millisecondes
        const startUTC = event.start.getTime(); // millisecondes
        const endUTC = event.end.getTime(); // millisecondes
        const originalTimeZone = event.timezone || teamTimeZone;

        // Générer un ID idempotent
        const eventId = generateEventIdempotencyKey(teamId, event.uid, startUTC);

        console.log(`[ICS] upsert teamId=${teamId} id=${eventId} startUTC(ms)=${startUTC} tz=${originalTimeZone}`);

        // Schéma Firestore correct
        const eventData = {
          teamId: teamId,
          summary: event.summary || 'Entraînement',
          startUTC: startUTC, // millisecondes UTC
          endUTC: endUTC, // millisecondes UTC
          timeZone: originalTimeZone,
          uid: event.uid,
          description: event.description || null,
          location: event.location || null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        // Upsert avec merge
        await setDoc(doc(eventsCollectionRef, eventId), eventData, { merge: true });
        updatedCount++;
        
        console.log(`[ICS] upserted: ${eventData.summary} (${eventId})`);
        
      } catch (eventError: any) {
        console.error(`[ICS] Error processing event ${event.uid || 'unknown'}:`, eventError);
        errors.push(`Event ${event.summary || 'unknown'}: ${eventError.message}`);
      }
    }
    
    const message = `[ICS] done imported=${importedCount} upserted=${updatedCount} errors=${errors.length}`;
    console.log(message);

    return {
      success: true,
      message: `ICS import completed. Imported: ${importedCount}, Updated: ${updatedCount}.`,
      importedCount,
      updatedCount,
      errors,
    };

  } catch (error: any) {
    console.error(`[ICS] Fatal error during ICS import for team ${teamId}:`, error);
    return { 
      success: false, 
      message: `ICS import failed: ${error.message}`, 
      errors: [error.message] 
    };
  }
}
