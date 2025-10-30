/**
 * Import ICS via proxy local http://localhost:8787/ics?url=...
 * Récupère le texte ICS et renvoie un simple compteur d'événements.
 * Aucune écriture Firestore ici.
 */
export async function importExternalCalendar(icsUrl) {
  if (!icsUrl) { throw new Error("Lien ICS manquant"); }
  const proxy = "http://localhost:8787/ics?url=" + encodeURIComponent(icsUrl);
  let res;
  try {
    res = await fetch(proxy, { method: "GET" });
  } catch (e) {
    throw new Error("Failed to fetch proxy");
  }
  if (!res.ok) {
    throw new Error("HTTP " + res.status);
  }
  const text = await res.text();
  const count = (text.match(/BEGIN:VEVENT/g) || []).length;
  return { ok: true, total: count };
}