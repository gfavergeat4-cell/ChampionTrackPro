/* Cloud Functions – Sync ICS (CRON + callable)
 * - Lit teams/{teamId}.icsUrl
 * - Parse ICS (node-ical), expansion récurrences + EXDATE
 * - Upsert vers teams/{teamId}/events/{eventId}
 * - Champs: cancelled, lastSeenAt, updatedAt, hash (sha256 du payload utile)
 */

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ical = require("node-ical");
const fetch = require("node-fetch"); // v2 CJS
const crypto = require("crypto");

try { admin.app(); } catch { admin.initializeApp(); }
const db = admin.firestore();

const REGION = "us-central1";   // adapte si besoin
const CRON   = "every 10 minutes";
const EXPANSION_DAYS = 180;     // 6 mois

function makeHash(ev) {
  const json = JSON.stringify({
    title: ev.title || "",
    description: ev.description || "",
    location: ev.location || "",
    start: ev.start && ev.start.toISOString ? ev.start.toISOString() : (ev.start || ""),
    end: ev.end && ev.end.toISOString ? ev.end.toISOString() : (ev.end || ""),
    status: ev.status || "",
    allDay: !!ev.allDay,
    cancelled: !!ev.cancelled,
  });
  return crypto.createHash("sha256").update(json).digest("hex");
}

function eventDocId(uid, start) {
  const key = (uid || "NOUID") + "_" + (+start);
  return crypto.createHash("sha1").update(key).digest("hex");
}

function expandEvents(parsed, windowStart, windowEnd) {
  const out = [];

  for (const k in parsed) {
    const item = parsed[k];
    if (!item || item.type !== "VEVENT") continue;

    const base = {
      uid: item.uid || null,
      title: item.summary || "",
      description: item.description || "",
      location: item.location || "",
      status: (item.status || "CONFIRMED").toUpperCase(),
      source: "ics",
    };

    const isAllDay =
      (item.datetype && item.datetype === "date") ||
      (item.start && typeof item.start.toISOString !== "function");

    const durationMs = item.duration
      ? item.duration.asSeconds() * 1000
      : (item.end && item.start ? (new Date(item.end) - new Date(item.start)) : 0);

    if (item.rrule) {
      const ex = new Set();
      if (item.exdate) {
        Object.values(item.exdate).forEach(d => ex.add(+new Date(d)));
      }
      const dates = item.rrule.between(windowStart, windowEnd, true);
      dates.forEach(function(dt) {
        const start = new Date(dt);
        if (ex.has(+start)) return;
        const end = new Date(+start + (durationMs || 0));
        out.push({
          ...base,
          start: start,
          end: end,
          allDay: !!isAllDay,
          cancelled: base.status === "CANCELLED",
        });
      });
    } else if (item.recurrences) {
      for (const rk in item.recurrences) {
        const inst = item.recurrences[rk];
        if (inst && inst.exdate) continue;
        const start = new Date(inst.start);
        const end = new Date(inst.end);
        if (start >= windowStart && start <= windowEnd) {
          out.push({
            ...base,
            start: start,
            end: end,
            allDay: !!isAllDay,
            cancelled: base.status === "CANCELLED",
          });
        }
      }
    } else {
      if (!item.start || !item.end) continue;
      const start = new Date(item.start);
      const end = new Date(item.end);
      if (start >= windowStart && start <= windowEnd) {
        out.push({
          ...base,
          start: start,
          end: end,
          allDay: !!isAllDay,
          cancelled: base.status === "CANCELLED",
        });
      }
    }
  }

  return out;
}

async function syncTeam(teamId) {
  const tRef = db.collection("teams").doc(teamId);
  const tSnap = await tRef.get();
  if (!tSnap.exists) throw new Error("Team " + teamId + " introuvable");
  const t = tSnap.data() || {};
  const icsUrl = t.icsUrl;
  if (!icsUrl) return { seen: 0, created: 0, updated: 0, cancelled: 0, note: "no icsUrl" };

  const now = new Date();
  const windowStart = new Date();
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + EXPANSION_DAYS);

  const res = await fetch(icsUrl);
  if (!res.ok) throw new Error("Fetch ICS HTTP " + res.status);
  const icsText = await res.text();
  const parsed = ical.sync.parseICS(icsText);

  const instances = expandEvents(parsed, windowStart, windowEnd);

  let seen = 0, created = 0, updated = 0, cancelled = 0;
  const evCol = tRef.collection("events");
  const batch = db.batch();

  for (const ev of instances) {
    seen++;
    const id = eventDocId(ev.uid, ev.start);
    const ref = evCol.doc(id);

    const payload = {
      title: ev.title,
      description: ev.description || "",
      location: ev.location || "",
      start: admin.firestore.Timestamp.fromDate(ev.start),
      end: admin.firestore.Timestamp.fromDate(ev.end),
      allDay: !!ev.allDay,
      uid: ev.uid || null,
      status: ev.status || "CONFIRMED",
      source: "ics",
      cancelled: !!ev.cancelled,
      hash: makeHash(ev),
      lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const cur = await ref.get();
    if (!cur.exists) {
      batch.set(ref, payload, { merge: true });
      if (payload.cancelled) cancelled++;
      else created++;
    } else {
      const prev = cur.data() || {};
      if (prev.hash !== payload.hash || prev.cancelled !== payload.cancelled) {
        batch.set(ref, payload, { merge: true });
        if (payload.cancelled && !prev.cancelled) cancelled++;
        else updated++;
      } else {
        batch.set(ref, { lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    }
  }

  await batch.commit();
  await tRef.set({ lastIcsSyncAt: admin.firestore.Timestamp.fromDate(now) }, { merge: true });

  return { seen: seen, created: created, updated: updated, cancelled: cancelled };
}

exports.syncIcsNow = functions.region(REGION).https.onCall(async (data, context) => {
  const teamId = data && data.teamId ? data.teamId : null;
  if (!teamId) {
    throw new functions.https.HttpsError("invalid-argument", "teamId requis");
  }
  // TODO: vérifier context.auth + rôle (admin/coach)
  const result = await syncTeam(teamId);
  return result;
});

exports.syncIcsEvery10min = functions
  .region(REGION)
  .pubsub.schedule(CRON)
  .onRun(async () => {
    const snap = await db.collection("teams").where("icsUrl", ">", "").get();
    let totals = { seen: 0, created: 0, updated: 0, cancelled: 0 };
    for (const doc of snap.docs) {
      try {
        const t = await syncTeam(doc.id);
        totals.seen += t.seen;
        totals.created += t.created;
        totals.updated += t.updated;
        totals.cancelled += t.cancelled;
      } catch (e) {
        console.error("sync error team:", doc.id, e.message);
      }
    }
    console.log("ICS sync done:", totals);
    return null;
  });