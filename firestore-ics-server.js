import express from 'express';
import cors from 'cors';
import { DateTime } from 'luxon';
import IcalExpander from 'ical-expander';
import crypto from 'crypto';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc, collection } from 'firebase/firestore';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDwslrK0lbuqsBl61C_l3gjVDGF8ZqTZ5o",
  authDomain: "championtrackpro.firebaseapp.com",
  projectId: "championtrackpro",
  storageBucket: "championtrackpro.appspot.com",
  messagingSenderId: "308674968497",
  appId: "1:308674968497:web:5f8d10b09ee98717a81b90"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

function sha1(s) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function instanceId(teamId, uid, startUTC) {
  return sha1(`${teamId}:${uid}:${startUTC}`).slice(0, 20);
}

function toUtcMillis(d, zone) {
  return DateTime.fromJSDate(d, { zone }).toUTC().toMillis();
}

async function importIcsForTeam(teamId, icsUrl, defaultTz = 'Europe/Paris') {
  console.log(`[ICS] Starting import for teamId=${teamId}, icsUrl=${icsUrl}, timezone=${defaultTz}`);

  // Fetch ICS côté serveur
  const res = await fetch(icsUrl);
  if (!res.ok) {
    throw new Error(`ICS fetch failed: ${res.status} ${res.statusText}`);
  }
  const ics = await res.text();

  console.log(`[ICS] Fetched ${ics.length} characters of ICS data`);

  const expander = new IcalExpander({ ics, maxIterations: 5000 });
  const from = DateTime.now().minus({ days: 7 }).startOf('day').toJSDate();
  const to = DateTime.now().plus({ days: 90 }).endOf('day').toJSDate();

  console.log(`[ICS] Expanding events between ${from.toISOString()} and ${to.toISOString()}`);

  const { events, occurrences } = expander.between(from, to);

  console.log(`[ICS] Found ${events.length} non-recurring events and ${occurrences.length} recurring occurrences`);

  let processed = 0, created = 0, updated = 0, skipped = 0;

  // Événements non récurrents
  for (const ev of events) {
    processed++;
    const summary = ev.summary || '';
    if (summary.toLowerCase() === 'busy') { 
      skipped++; 
      console.log(`[ICS] Skipping busy event: ${summary}`);
      continue; 
    }

    const zone = (ev.startDate?.timezone) || defaultTz;
    const startUTC = toUtcMillis(ev.startDate.toJSDate(), zone);
    const endUTC = toUtcMillis(ev.endDate.toJSDate(), zone);
    const uid = ev.uid || `${summary}-${startUTC}`;
    const docId = instanceId(teamId, uid, startUTC);

    const payload = {
      uid,
      summary: summary || 'Session',
      description: ev.description || null,
      location: ev.location || null,
      startUTC,
      endUTC,
      timeZone: zone,
      source: 'ics',
      updatedAt: Date.now()
    };

    console.log(`[ICS] Event: ${summary} at ${new Date(startUTC).toISOString()}`);

    try {
      const ref = doc(db, `teams/${teamId}/events/${docId}`);
      const snap = await getDoc(ref);
      if (!snap.exists()) { 
        await setDoc(ref, payload); 
        created++; 
        console.log(`[ICS] Created new event: ${docId}`);
      } else {
        const prev = snap.data();
        const same = ['summary','description','location','startUTC','endUTC','timeZone']
          .every(k => String(prev[k]) === String(payload[k]));
        if (!same) { 
          await setDoc(ref, payload, { merge: true }); 
          updated++; 
          console.log(`[ICS] Updated event: ${docId}`);
        } else { 
          skipped++; 
          console.log(`[ICS] Skipped unchanged event: ${docId}`);
        }
      }
    } catch (error) {
      console.error(`[ICS] Error saving event ${docId}:`, error);
    }
  }

  // Occurrences récurrentes dépliées
  for (const occ of occurrences) {
    processed++;
    const ev = occ.item;
    const summary = ev.summary || '';
    if (summary.toLowerCase() === 'busy') { 
      skipped++; 
      console.log(`[ICS] Skipping busy occurrence: ${summary}`);
      continue; 
    }

    const zone = (occ.startDate.timezone) || (ev.startDate?.timezone) || defaultTz;
    // Fix for UTC timezone
    const finalZone = zone === 'Z' ? defaultTz : zone;
    const startUTC = toUtcMillis(occ.startDate.toJSDate(), finalZone);
    const endUTC = toUtcMillis(occ.endDate.toJSDate(), finalZone);
    const uid = ev.uid || `${summary}-${startUTC}`;
    const docId = instanceId(teamId, uid, startUTC);

    const payload = {
      uid,
      summary: summary || 'Session',
      description: ev.description || null,
      location: ev.location || null,
      startUTC,
      endUTC,
      timeZone: finalZone,
      source: 'ics',
      updatedAt: Date.now()
    };

    console.log(`[ICS] Occurrence: ${summary} at ${new Date(startUTC).toISOString()}`);

    try {
      const ref = doc(db, `teams/${teamId}/events/${docId}`);
      const snap = await getDoc(ref);
      if (!snap.exists()) { 
        await setDoc(ref, payload); 
        created++; 
        console.log(`[ICS] Created new occurrence: ${docId}`);
      } else {
        const prev = snap.data();
        const same = ['summary','description','location','startUTC','endUTC','timeZone']
          .every(k => String(prev[k]) === String(payload[k]));
        if (!same) { 
          await setDoc(ref, payload, { merge: true }); 
          updated++; 
          console.log(`[ICS] Updated occurrence: ${docId}`);
        } else { 
          skipped++; 
          console.log(`[ICS] Skipped unchanged occurrence: ${docId}`);
        }
      }
    } catch (error) {
      console.error(`[ICS] Error saving occurrence ${docId}:`, error);
    }
  }

  console.log(`[ICS] teamId=${teamId} processed=${processed} created=${created} updated=${updated} skipped=${skipped}`);
  return { processed, created, updated, skipped };
}

app.post('/api/import-ics', async (req, res) => {
  try {
    const { teamId, icsUrl } = req.body;
    
    if (!teamId || !icsUrl) {
      return res.status(400).json({ 
        ok: false, 
        error: 'teamId and icsUrl required' 
      });
    }

    console.log(`[ICS-SERVER] Starting import for team ${teamId} with URL: ${icsUrl}`);

    const result = await importIcsForTeam(teamId, icsUrl);
    
    console.log(`[ICS-SERVER] Import completed:`, result);
    res.json({ ok: true, ...result });

  } catch (e) {
    console.error('[ICS-SERVER] Error:', e);
    res.status(500).json({ 
      ok: false, 
      error: e.message 
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 ICS Import Server running on port ${PORT}`);
  console.log(`📡 Endpoint: http://localhost:${PORT}/api/import-ics`);
});
