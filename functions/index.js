/**
 * Cloud Functions – Sync ICS (CRON + callable)
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const ical = require("node-ical");
const fetch = require("node-fetch"); // v2 CJS
const crypto = require("crypto");

try { admin.app(); } catch { admin.initializeApp(); }
const db = admin.firestore();

const REGION = "us-central1";
const RUN_WINDOW_DAYS = 180;  // 6 mois
const CRON = "every 10 minutes";

function makeHash(ev) {
  const json = JSON.stringify({
    title: ev.title||"",
    description: ev.description||"",
    location: ev.location||"",
    start: ev.start?.toISOString?.() || ev.start || "",
    end: ev.end?.toISOString?.() || ev.end || "",
    status: ev.status||"",
    allDay: !!ev.allDay,
  });
  return crypto.createHash("sha256").update(json).digest("hex");
}

function eventDocId(uid, start) {
  const key = `${uid || "NOUID"}_${+start}`;
  return crypto.createHash("sha1").update(key).digest("hex");
}

function expandEvents(parsed, windowStart, windowEnd) {
  const out = [];
  for (const k in parsed) {
    const item = parsed[k];
    if (item.type !== "VEVENT") continue;

    const base = {
      uid: item.uid || null,
      title: item.summary || "",
      description: item.description || "",
      location: item.location || "",
      status: (item.status || "CONFIRMED").toUpperCase(),
      source: "ics",
    };

    if (item.rrule) {
      const ex = new Set();
      if (item.exdate) {
        Object.values(item.exdate).forEach(d => ex.add(+d));
      }
      const dates = item.rrule.between(windowStart, windowEnd, true);
      dates.forEach(dt => {
        const start = new Date(dt);
        if (ex.has(+start)) return;
        const durationMs = item.duration ? item.duration.asSeconds()*1000 : (item.end - item.start);
        const end = new Date(+start + durationMs);
        out.push({
          ...base,
          start, end,
          allDay: !!item.datetype && item.datetype === "date",
          cancelled: base.status === "CANCELLED",
        });
      });
    } else if (item.recurrences) {
      for (const rk in item.recurrences) {
        const inst = item.recurrences[rk];
        if (inst.exdate) continue;
        out.push({
          ...base,
          start: new Date(inst.start),
          end: new Date(inst.end),
          allDay: !!inst.datetype && inst.datetype === "date",
          cancelled: base.status === "CANCELLED",
        });
      }
    } else {
      if (!item.start || !item.end) continue;
      out.push({
        ...base,
        start: new Date(item.start),
        end: new Date(item.end),
        allDay: !!item.datetype && item.datetype === "date",
        cancelled: base.status === "CANCELLED",
      });
    }
  }
  return out.filter(ev => ev.start >= windowStart && ev.start <= windowEnd);
}

async function syncTeam(teamId) {
  const tRef = db.collection("teams").doc(teamId);
  const tSnap = await tRef.get();
  if (!tSnap.exists) throw new Error(`Team ${teamId} introuvable`);
  const t = tSnap.data() || {};
  const icsUrl = t.icsUrl;
  if (!icsUrl) return { seen:0, created:0, updated:0, cancelled:0, note:"no icsUrl" };

  const now = new Date();
  const windowStart = new Date();
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + RUN_WINDOW_DAYS);

  const res = await fetch(icsUrl);
  if (!res.ok) throw new Error(`Fetch ICS HTTP ${res.status}`);
  const text = await res.text();
  const parsed = ical.sync.parseICS(text);

  const instances = expandEvents(parsed, windowStart, windowEnd);

  let seen = 0, created = 0, updated = 0, cancelled = 0;
  const evCol = tRef.collection("events");

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
      await ref.set(payload, { merge: true });
      if (payload.cancelled) cancelled++;
      else created++;
    } else {
      const prev = cur.data() || {};
      if (prev.hash !== payload.hash || prev.cancelled !== payload.cancelled) {
        await ref.set(payload, { merge: true });
        if (payload.cancelled && !prev.cancelled) cancelled++;
        else updated++;
      } else {
        await ref.set({ lastSeenAt: admin.firestore.FieldValue.serverTimestamp() }, { merge: true });
      }
    }
  }

  if (!t.lastIcsSyncAt || (t.lastIcsSyncAt.toMillis?.() || 0) < now.getTime()) {
    await tRef.set({ lastIcsSyncAt: admin.firestore.Timestamp.fromDate(now) }, { merge: true });
  }

  return { seen, created, updated, cancelled };
}

exports.syncIcsNow = functions.region(REGION).https.onCall(async (data, context) => {
  const teamId = data?.teamId;
  if (!teamId) throw new functions.https.HttpsError("invalid-argument", "teamId requis");
  const res = await syncTeam(teamId);
  return res;
});

exports.syncIcsEvery10min = functions.region(REGION).pubsub.schedule(CRON).onRun(async () => {
  const snap = await db.collection("teams").where("icsUrl", ">", "").get();
  let totals = { seen:0, created:0, updated:0, cancelled:0 };
  for (const doc of snap.docs) {
    try {
      const t = await syncTeam(doc.id);
      totals.seen += t.seen; totals.created += t.created; totals.updated += t.updated; totals.cancelled += t.cancelled;
    } catch (e) {
      console.error("sync error team:", doc.id, e.message);
    }
  }
  console.log("ICS sync done:", totals);
  return null;
});