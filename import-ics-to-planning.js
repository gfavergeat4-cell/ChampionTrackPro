const admin = require("firebase-admin");
const ical = require("node-ical");

admin.initializeApp({ credential: admin.credential.cert(require("./serviceAccountKey.json")) });
const db = admin.firestore();

/** ------- Helpers ------- */
const pad = n => String(n).padStart(2, "0");
function toLocalYMDHM(date) {
  const d = new Date(date);
  const y = d.getFullYear(), m = pad(d.getMonth()+1), day = pad(d.getDate());
  const hh = pad(d.getHours()), mm = pad(d.getMinutes());
  return { date: `${y}-${m}-${day}`, time: `${hh}:${mm}`, ts: d.getTime() };
}
function hash6(s) {
  let h = 0;
  for (let i=0;i<s.length;i++) h = (h*31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0,6);
}
function mondayOfISOWeek(d){
  const x = new Date(d);
  const dow = (x.getDay()+6)%7; // 0=lundi
  x.setDate(x.getDate()-dow); x.setHours(0,0,0,0); return x;
}
function addDays(d,n){ const x=new Date(d); x.setDate(x.getDate()+n); return x; }

(async () => {
  try {
    const ICS_URL   = process.env.ICS_URL;                         // <- ton lien .ics
    const EMAIL     = process.env.EMAIL || "gfavergeat4@gmail.com";
    const WEEKS_AHEAD = Number(process.env.WEEKS_AHEAD || 8);      // nb de semaines à importer (dès cette semaine)
    const DRY_RUN   = (process.env.DRY_RUN ?? "0") !== "0";        // DRY_RUN=1 par défaut => juste afficher, pas écrire

    if (!ICS_URL) throw new Error("ICS_URL manquant (mets un lien .ics)");

    // 1) Trouver l'uid
    const user = await admin.auth().getUserByEmail(EMAIL);
    const uid = user.uid;
    const planningCol = db.collection("users").doc(uid).collection("planning");
    console.log("👤", EMAIL, "uid=", uid);
    console.log("🔗 ICS:", ICS_URL);

    // 2) Définir la plage d'import (lundi de la semaine courante -> +WEEKS_AHEAD)
    const start = mondayOfISOWeek(new Date());                // lundi
    const end   = addDays(start, 7*WEEKS_AHEAD + 6);          // dimanche fin de dernière semaine

    // 3) Charger et parser l'ICS
    const data = await ical.async.fromURL(ICS_URL);
    const events = Object.values(data).filter(e => e.type === "VEVENT");

    // 4) Filtrer la plage + transformer
    const toWrite = [];
    for (const ev of events) {
      if (!ev.start) continue;
      const s = new Date(ev.start), e = ev.end ? new Date(ev.end) : null;
      if (s < start || s > end) continue;

      const { date, time, ts } = toLocalYMDHM(s);
      const summary = (ev.summary || "Séance").toString().trim();
      const id = `${date}_${time}_${hash6(summary)}`;

      toWrite.push({
        id, date, time, ts,
        title: summary,
        location: ev.location || "",
        description: ev.description || "",
        endTs: e ? e.getTime() : null,
        responded: false,
        source: "ics",
      });
    }

    // 5) Écriture batch (merge) ou DRY-RUN
    console.log(`🗓  ${toWrite.length} événement(s) dans la plage ${start.toISOString().slice(0,10)} → ${end.toISOString().slice(0,10)}`);
    if (!toWrite.length) { console.log("Rien à importer."); process.exit(0); }

    if (DRY_RUN) {
      console.log("DRY_RUN=1 → aperçu (aucune écriture) :");
      console.table(toWrite.slice(0,10).map(x => ({ id:x.id, date:x.date, time:x.time, title:x.title })));
      console.log("… (passe DRY_RUN=0 pour écrire)");
      process.exit(0);
    }

    let wrote = 0;
    const batch = db.batch();
    for (const item of toWrite) {
      const ref = planningCol.doc(item.id);
      batch.set(ref, {
        date: item.date,
        time: item.time,
        ts: item.ts,
        title: item.title,
        location: item.location,
        description: item.description,
        endTs: item.endTs,
        responded: item.responded,
        source: item.source,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });
      wrote++;
      // Commit par paquets de 400 pour rester safe
      if (wrote % 400 === 0) { await batch.commit(); }
    }
    await batch.commit();
    console.log(`✅ Import terminé : ${wrote} séance(s) écrite(s)/fusionnée(s).`);
    process.exit(0);
  } catch (e) {
    console.error("❌ Erreur import ICS:", e.message, e.stack || "");
    process.exit(1);
  }
})();
