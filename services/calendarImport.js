export async function importExternalCalendar(icsUrl) {
  // passe toujours par le proxy local pour éviter le CORS
  const proxyUrl = `http://127.0.0.1:8787/ics?url=${encodeURIComponent(icsUrl)}`;

  try {
    const res = await fetch(proxyUrl);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    // Compte grossier des events
    const total = (text.match(/BEGIN:VEVENT/g) || []).length;
    console.log("[ICS Import] Longueur:", text.length, "événements:", total);

    // Ici tu pourrais parser et pousser en Firestore si besoin.
    return { ok: true, total, raw: text };
  } catch (err) {
    console.error("Erreur ICS:", err);
    // L’app affiche ce message — on garde la même sémantique
    throw new Error("CORS_BLOCKED_OR_PROXY_DOWN");
  }
}
