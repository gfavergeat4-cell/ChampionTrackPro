import { addDoc, collection, getDocs, orderBy, query, Timestamp, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { QuestionnaireResponseDoc } from '../../types/firestore';

export async function createQuestionnaireResponse(input: Omit<QuestionnaireResponseDoc, 'createdAt'>) {
  const docData: QuestionnaireResponseDoc = {
    ...input,
    createdAt: Timestamp.now(),
  };
  await addDoc(collection(db, 'questionnaireResponses'), docData);
}

export async function listQuestionnaireResponsesByUser(userId: string) {
  const q = query(
    collection(db, 'questionnaireResponses'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as QuestionnaireResponseDoc) }));
}

export async function hasResponseForSession(userId: string, sessionId: string): Promise<boolean> {
  const q = query(
    collection(db, 'questionnaireResponses'),
    where('userId', '==', userId),
    where('sessionId', '==', sessionId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}








