import { collection, doc, getDocs, query, where, orderBy, addDoc, Timestamp, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { SessionDoc } from '../../types/firestore';

export async function fetchUpcomingSessions(teamId: string): Promise<(SessionDoc & { id: string })[]> {
  const now = Timestamp.now();
  const q = query(
    collection(db, 'sessions'),
    where('teamId', '==', teamId),
    where('start', '>=', now),
    orderBy('start', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as SessionDoc) }));
}

export async function upsertSessionBySourceId(session: SessionDoc): Promise<string> {
  if (session.source && session.sourceId) {
    const q = query(
      collection(db, 'sessions'),
      where('teamId', '==', session.teamId),
      where('source', '==', session.source),
      where('sourceId', '==', session.sourceId)
    );
    const snap = await getDocs(q);
    if (!snap.empty) {
      const existing = snap.docs[0];
      await setDoc(doc(db, 'sessions', existing.id), session, { merge: true });
      return existing.id;
    }
  }
  const ref = await addDoc(collection(db, 'sessions'), session);
  return ref.id;
}








