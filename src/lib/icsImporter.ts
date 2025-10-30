import { db } from './firebase';
import { collection, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { createHash } from 'crypto';

export interface ICSImportResult {
  success: boolean;
  message: string;
  importedCount?: number;
  updatedCount?: number;
  errors?: string[];
}

/**
 * Génère un ID idempotent pour un événement
 */
function generateEventIdempotencyKey(teamId: string, uid: string, startUTC: number): string {
  const uniqueString = `${teamId}:${uid}:${startUTC}`;
  return createHash('sha1').update(uniqueString).digest('hex').slice(0, 24);
}

/**
 * Parse un fichier ICS et retourne les événements
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
 * Importe un fichier ICS dans Firestore avec idempotence
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
        // Normaliser les dates en UTC
        const startUTC = event.start.getTime();
        const endUTC = event.end.getTime();
        const originalTimeZone = event.timezone || teamTimeZone;

        // Générer un ID idempotent
        const eventId = generateEventIdempotencyKey(teamId, event.uid, startUTC);

        console.log(`[ICS] upsert teamId=${teamId} id=${eventId} startUTC(ms)=${startUTC} tz=${originalTimeZone}`);

        const eventData = {
          teamId: teamId,
          summary: event.summary || 'Training',
          description: event.description || '',
          location: event.location || '',
          startUTC: startUTC,
          endUTC: endUTC,
          timeZone: originalTimeZone,
          startLocalISO: event.start.toISOString(),
          endLocalISO: event.end.toISOString(),
          uid: event.uid,
          rrule: event.rrule ? JSON.stringify(event.rrule) : null,
          exdates: event.exdates || [],
          status: event.status || 'CONFIRMED',
          updatedAt: serverTimestamp(),
        };

        // Vérifier si l'événement existe déjà
        const eventDocRef = doc(eventsCollectionRef, eventId);
        const existingEvent = await getDoc(eventDocRef);

        if (existingEvent.exists()) {
          // Vérifier si les données ont changé
          const existingData = existingEvent.data();
          const hasChanged = (
            existingData.summary !== eventData.summary ||
            existingData.startUTC !== eventData.startUTC ||
            existingData.endUTC !== eventData.endUTC ||
            existingData.description !== eventData.description
          );

          if (hasChanged) {
            await setDoc(eventDocRef, { 
              ...eventData, 
              createdAt: existingData.createdAt,
              updatedAt: serverTimestamp() 
            }, { merge: true });
            updatedCount++;
            console.log(`[ICS] Updated event: ${eventData.summary} (${eventId})`);
          } else {
            console.log(`[ICS] Event unchanged: ${eventData.summary} (${eventId})`);
          }
        } else {
          await setDoc(eventDocRef, { 
            ...eventData, 
            createdAt: serverTimestamp() 
          }, { merge: true });
          importedCount++;
          console.log(`[ICS] Imported new event: ${eventData.summary} (${eventId})`);
        }
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