import { db, auth } from "./firebaseConfig";
import {
  doc, getDoc, setDoc, collection, query,
  where, orderBy, getDocs, serverTimestamp, updateDoc
} from "firebase/firestore";

/** Renvoie le planning de la semaine [mondayISO..sundayISO] du user courant */
export async function getWeekPlanning(mondayISO, sundayISO) {
  const uid = auth.currentUser?.uid;
  if (!uid) return [];
  const col = collection(db, "users", uid, "planning");
  // NB : orderBy(date) + orderBy(time) -> peut demander un index (à créer une fois)
  const q = query(
    col,
    where("date", ">=", mondayISO),
    where("date", "<=", sundayISO),
    orderBy("date"),
    orderBy("time")
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/** Réponse au questionnaire d'une séance */
export async function submitSessionResponse(sessionId, payload) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error("Non connecté");
  const ref = doc(db, "users", uid, "responses", sessionId);
  await setDoc(ref, {
    ...payload,
    uid,
    sessionId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  }, { merge: true });

  // marquer la séance comme répondu
  const sessRef = doc(db, "users", uid, "planning", sessionId);
  await updateDoc(sessRef, { responded: true });
}

/** Récupère une réponse existante (pour préremplir si besoin) */
export async function getMyResponse(sessionId) {
  const uid = auth.currentUser?.uid;
  if (!uid) return null;
  const ref = doc(db, "users", uid, "responses", sessionId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function getMyPlanningThisWeek(uid) {
  const base = new Date();
  const monday = new Date(base); const dow = (monday.getDay()+6)%7; monday.setDate(monday.getDate()-dow); monday.setHours(0,0,0,0);
  const sunday = new Date(monday); sunday.setDate(sunday.getDate()+6); sunday.setHours(23,59,59,999);

  const fromMs = monday.getTime(); const toMs = sunday.getTime();

  const col = collection(db, "users", uid, "planning");
  const q   = query(col, where("ts", ">=", fromMs), where("ts", "<=", toMs), orderBy("ts"));
  const snap = await getDocs(q);

  const out = [];
  snap.forEach(d => out.push({ id:d.id, ...d.data() }));
  return out;
}
