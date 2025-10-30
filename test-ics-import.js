import { DateTime } from 'luxon';
import IcalExpander from 'ical-expander';
import crypto from 'crypto';

function sha1(s) {
  return crypto.createHash('sha1').update(s).digest('hex');
}

function instanceId(teamId, uid, startUTC) {
  return sha1(`${teamId}:${uid}:${startUTC}`).slice(0, 20);
}

function toUtcMillis(d, zone) {
  return DateTime.fromJSDate(d, { zone }).toUTC().toMillis();
}

async function testIcsImport(icsUrl) {
  console.log(`[TEST] Testing ICS import from: ${icsUrl}`);

  // Fetch ICS
  const res = await fetch(icsUrl);
  if (!res.ok) {
    throw new Error(`ICS fetch failed: ${res.status} ${res.statusText}`);
  }
  const ics = await res.text();

  console.log(`[TEST] Fetched ${ics.length} characters of ICS data`);

  const expander = new IcalExpander({ ics, maxIterations: 5000 });
  const from = DateTime.now().minus({ days: 7 }).startOf('day').toJSDate();
  const to = DateTime.now().plus({ days: 90 }).endOf('day').toJSDate();

  console.log(`[TEST] Expanding events between ${from.toISOString()} and ${to.toISOString()}`);

  const { events, occurrences } = expander.between(from, to);

  console.log(`[TEST] Found ${events.length} non-recurring events and ${occurrences.length} recurring occurrences`);

  let processed = 0, skipped = 0;

  // Événements non récurrents
  for (const ev of events) {
    processed++;
    const summary = ev.summary || '';
    if (summary.toLowerCase() === 'busy') { 
      skipped++; 
      console.log(`[TEST] Skipping busy event: ${summary}`);
      continue; 
    }

    const zone = (ev.startDate?.timezone) || 'Europe/Paris';
    const startUTC = toUtcMillis(ev.startDate.toJSDate(), zone);
    const endUTC = toUtcMillis(ev.endDate.toJSDate(), zone);
    const uid = ev.uid || `${summary}-${startUTC}`;
    const docId = instanceId('test', uid, startUTC);

    console.log(`[TEST] Event: ${summary} at ${new Date(startUTC).toISOString()} (${zone})`);
  }

  // Occurrences récurrentes dépliées
  for (const occ of occurrences) {
    processed++;
    const ev = occ.item;
    const summary = ev.summary || '';
    if (summary.toLowerCase() === 'busy') { 
      skipped++; 
      console.log(`[TEST] Skipping busy occurrence: ${summary}`);
      continue; 
    }

    const zone = (occ.startDate.timezone) || (ev.startDate?.timezone) || 'Europe/Paris';
    const startUTC = toUtcMillis(occ.startDate.toJSDate(), zone);
    const endUTC = toUtcMillis(occ.endDate.toJSDate(), zone);
    const uid = ev.uid || `${summary}-${startUTC}`;
    const docId = instanceId('test', uid, startUTC);

    try {
      console.log(`[TEST] Occurrence: ${summary} at ${new Date(startUTC).toISOString()} (${zone})`);
    } catch (e) {
      console.log(`[TEST] Occurrence: ${summary} at invalid date (${zone})`);
    }
  }

  console.log(`[TEST] processed=${processed} skipped=${skipped}`);
  return { processed, skipped };
}

// Test avec votre calendrier Google
const icsUrl = 'https://calendar.google.com/calendar/ical/gfavergeat4%40gmail.com/public/basic.ics';

testIcsImport(icsUrl)
  .then(result => {
    console.log('✅ Test completed:', result);
  })
  .catch(error => {
    console.error('❌ Test failed:', error);
  });