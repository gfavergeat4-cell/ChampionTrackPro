const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDoc, serverTimestamp } = require('firebase/firestore');
const ical = require('ical');
const { DateTime } = require('luxon');
const crypto = require('crypto');

// Configuration Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBvQZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8QZ8Q",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// URL ICS fournie
const ICS_URL = 'https://calendar.google.com/calendar/ical/gfavergeat4%40gmail.com/public/basic.ics';

// TeamId à utiliser (vous devrez le remplacer par le vrai teamId)
const TEAM_ID = 'your-team-id-here';
const TEAM_TIMEZONE = 'Europe/Paris';

function makeId(teamId, uid, startMs) {
  return crypto.createHash('sha1').update(`${teamId}:${uid}:${startMs}`).digest('hex').slice(0, 24);
}

async function importICS(teamId, icsUrl, teamTimeZone = 'Europe/Paris') {
  try {
    console.log(`[ICS] fetch start url=${icsUrl}`);
    
    // Fetch ICS content
    const response = await fetch(icsUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch ICS: ${response.statusText}`);
    }
    const icsContent = await response.text();
    
    console.log('[ICS] fetch ok, parsing…');
    
    // Parse ICS
    const data = ical.parseICS(icsContent);
    let imported = 0, upserted = 0;
    
    console.log(`[ICS] parsed count=${Object.keys(data).length}`);
    
    for (const k in data) {
      const ev = data[k];
      if (ev.type !== 'VEVENT') continue;

      try {
        const tz = (ev.start?.tz) || ev['x-wr-timezone'] || teamTimeZone;
        const startUtc = DateTime.fromJSDate(ev.start, { zone: tz }).toUTC().toMillis();
        const endUtc = DateTime.fromJSDate(ev.end, { zone: tz }).toUTC().toMillis();

        const uid = ev.uid || ev.summary || 'no-uid';
        const id = makeId(teamId, uid, startUtc);

        console.log(`[ICS] upsert teamId=${teamId} id=${id} startUTC(ms)=${startUtc} tz=${tz}`);

        const eventData = {
          teamId,
          uid,
          summary: ev.summary || 'Training',
          description: ev.description || null,
          location: ev.location || null,
          startUTC: startUtc,
          endUTC: endUtc,
          timeZone: tz,
          startLocalISO: DateTime.fromJSDate(ev.start, { zone: tz }).toISO(),
          endLocalISO: DateTime.fromJSDate(ev.end, { zone: tz }).toISO(),
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp(),
        };

        // Upsert avec merge
        await setDoc(doc(db, 'teams', teamId, 'events', id), eventData, { merge: true });
        upserted++;
        
        console.log(`[ICS] upserted: ${eventData.summary} (${id})`);
        
      } catch (eventError) {
        console.error(`[ICS] Error processing event ${ev.uid || 'unknown'}:`, eventError);
      }
    }
    
    console.log(`[ICS] done imported=${imported} upserted=${upserted} teamId=${teamId}`);
    
  } catch (error) {
    console.error(`[ICS] Fatal error during ICS import for team ${teamId}:`, error);
  }
}

// Fonction pour tester les queries
async function testQueries(teamId) {
  try {
    console.log('\n=== TESTING QUERIES ===');
    
    // Test 1: Count events
    const eventsCollection = collection(db, 'teams', teamId, 'events');
    const snap = await getDocs(eventsCollection);
    console.log('[PROBE] events count =', snap.size);
    
    // Sample events
    snap.docs.slice(0, 3).forEach(doc => {
      const data = doc.data();
      console.log('[PROBE] sample', doc.id, {
        summary: data.summary,
        startUTC: data.startUTC,
        endUTC: data.endUTC,
        timeZone: data.timeZone,
        uid: data.uid,
        teamId: data.teamId
      });
    });
    
    // Test 2: Next session
    const nowUTC = Date.now();
    console.log('[NEXT] nowUTC =', nowUTC);
    
    const nextQuery = query(
      eventsCollection,
      where('startUTC', '>=', nowUTC),
      orderBy('startUTC', 'asc'),
      limit(1)
    );
    
    const nextSnap = await getDocs(nextQuery);
    if (nextSnap.empty) {
      console.log('[NEXT] No upcoming events found');
    } else {
      const nextEvent = nextSnap.docs[0].data();
      console.log('[NEXT] next event:', {
        summary: nextEvent.summary,
        startUTC: nextEvent.startUTC,
        timeZone: nextEvent.timeZone
      });
    }
    
    // Test 3: Week query
    const teamTz = TEAM_TIMEZONE;
    const localStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const localEnd = endOfWeek(localStart, { weekStartsOn: 1 });
    
    const weekStartUTC = localStart.getTime();
    const weekEndUTC = localEnd.getTime();
    
    console.log('[WEEK] tz=', teamTz, 'startUTC=', weekStartUTC, 'endUTC=', weekEndUTC);
    
    const weekQuery = query(
      eventsCollection,
      where('startUTC', '>=', weekStartUTC),
      where('startUTC', '<', weekEndUTC),
      orderBy('startUTC', 'asc')
    );
    
    const weekSnap = await getDocs(weekQuery);
    const weekEvents = weekSnap.docs.map(doc => {
      const data = doc.data();
      return {
        summary: data.summary,
        startUTC: data.startUTC,
        timeZone: data.timeZone
      };
    });
    
    console.log('[WEEK] events =', weekEvents);
    
  } catch (error) {
    console.error('[PROBE] Error:', error);
  }
}

// Exécution
async function main() {
  console.log('🚀 Starting ICS import and probe...');
  
  if (TEAM_ID === 'your-team-id-here') {
    console.error('❌ Please set the correct TEAM_ID in the script');
    process.exit(1);
  }
  
  // Import ICS
  await importICS(TEAM_ID, ICS_URL, TEAM_TIMEZONE);
  
  // Test queries
  await testQueries(TEAM_ID);
  
  console.log('✅ Done!');
}

main().catch(console.error);


