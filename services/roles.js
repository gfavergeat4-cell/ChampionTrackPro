import { db } from "./firebaseConfig";
import {
  doc, setDoc, getDoc, addDoc, collection,
  serverTimestamp, query, where, getDocs
} from "firebase/firestore";

// Crée une équipe et génère des codes coach/athlète
export async function createTeam(teamName) {
  const code = () => Math.random().toString(36).slice(2, 8).toUpperCase();
  const coachCode = "C-" + code();
  const athleteCode = "A-" + code();
  const ref = await addDoc(collection(db, "teams"), {
    name: teamName,
    createdAt: serverTimestamp(),
    codes: { coach: coachCode, athlete: athleteCode }
  });
  return { id: ref.id, coachCode, athleteCode };
}

// Vérifie code coach -> renvoie teamId si ok
export async function verifyCoachCode(codeStr) {
  const q = query(collection(db, "teams"), where("codes.coach", "==", codeStr));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}

// Vérifie code athlète -> renvoie teamId si ok
export async function verifyAthleteCode(codeStr) {
  const q = query(collection(db, "teams"), where("codes.athlete", "==", codeStr));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  return snap.docs[0].id;
}

// Assigne un rôle + teamId à l'utilisateur
export async function setUserRoleAndTeam(uid, role, teamId = null) {
  const ref = doc(db, "users", uid);
  const prev = await getDoc(ref);
  const base = prev.exists() ? prev.data() : {};
  await setDoc(ref, {
    ...base,
    role,
    teamId: teamId ?? base.teamId ?? null,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

// Métadonnées utilisateur
export async function getUserMeta(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

// Admin = users/{uid}.role === "admin"
export async function isAdminUser(uid) {
  try {
    const u = await getDoc(doc(db, "users", uid));
    return u.exists() && u.data()?.role === "admin";
  } catch {
    return false;
  }
}
