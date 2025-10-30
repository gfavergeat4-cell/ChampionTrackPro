import { DateTime } from 'luxon';
import IcalExpander from 'ical-expander';
import * as crypto from 'crypto';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

type EventPayload = {
  uid: string;
  summary: string;
  description: string | null;
  location: string | null;
  startUTC: number;
  endUTC: number;
  timeZone: string;
  source: 'ics';
  updatedAt: number;
};

function sha1(s: string): string {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function instanceId(teamId: string, uid: string, startUTC: number): string {
  return sha1(`${teamId}:${uid}:${startUTC}`).slice(0, 20);
}

function toUtcMillis(d: Date, zone: string): number {
  return DateTime.fromJSDate(d, { zone }).toUTC().toMillis();
}

export async function importIcsForTeam(teamId: string, icsUrl: string, defaultTz = 'Europe/Paris') {
  const teamRef = admin.firestore().doc(`teams/${teamId}`);
  const teamSnap = await teamRef.get();
  const team = teamSnap.data() || {};
  const tz = (team.timeZone as string) || defaultTz;

  console.log(`[ICS] Starting import for teamId=${teamId}, icsUrl=${icsUrl}, timezone=${tz}`);

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

    const zone = (ev.startDate?.timezone) || tz;
    const startUTC = toUtcMillis(ev.startDate.toJSDate(), zone);
    const endUTC = toUtcMillis(ev.endDate.toJSDate(), zone);
    const uid = ev.uid || `${summary}-${startUTC}`;
    const docId = instanceId(teamId, uid, startUTC);

    const payload: EventPayload = {
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

    console.log(`[ICS] Processing event: ${summary} at ${new Date(startUTC).toISOString()}`);

    const ref = teamRef.collection('events').doc(docId);
    const snap = await ref.get();
    if (!snap.exists) { 
      await ref.set(payload); 
      created++; 
      console.log(`[ICS] Created new event: ${docId}`);
    } else {
      const prev = snap.data()!;
      const same = ['summary','description','location','startUTC','endUTC','timeZone']
        .every(k => String(prev[k]) === String((payload as any)[k]));
      if (!same) { 
        await ref.set(payload, { merge: true }); 
        updated++; 
        console.log(`[ICS] Updated event: ${docId}`);
      } else { 
        skipped++; 
        console.log(`[ICS] Skipped unchanged event: ${docId}`);
      }
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

    const zone = (occ.startDate.timezone) || (ev.startDate?.timezone) || tz;
    const startUTC = toUtcMillis(occ.startDate.toJSDate(), zone);
    const endUTC = toUtcMillis(occ.endDate.toJSDate(), zone);
    const uid = ev.uid || `${summary}-${startUTC}`;
    const docId = instanceId(teamId, uid, startUTC);

    const payload: EventPayload = {
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

    console.log(`[ICS] Processing occurrence: ${summary} at ${new Date(startUTC).toISOString()}`);

    const ref = teamRef.collection('events').doc(docId);
    const snap = await ref.get();
    if (!snap.exists) { 
      await ref.set(payload); 
      created++; 
      console.log(`[ICS] Created new occurrence: ${docId}`);
    } else {
      const prev = snap.data()!;
      const same = ['summary','description','location','startUTC','endUTC','timeZone']
        .every(k => String(prev[k]) === String((payload as any)[k]));
      if (!same) { 
        await ref.set(payload, { merge: true }); 
        updated++; 
        console.log(`[ICS] Updated occurrence: ${docId}`);
      } else { 
        skipped++; 
        console.log(`[ICS] Skipped unchanged occurrence: ${docId}`);
      }
    }
  }

  console.log(`[ICS] teamId=${teamId} processed=${processed} created=${created} updated=${updated} skipped=${skipped}`);
  return { processed, created, updated, skipped };
}

