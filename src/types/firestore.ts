export type UserRole = 'athlete' | 'admin';

export interface UserDoc {
  uid: string;
  role: UserRole;
  fullName: string;
  email: string;
  teamId?: string;
  createdAt: any; // Firestore Timestamp
}

export interface TeamDoc {
  name: string;
  accessCode: string;
  createdAt: any; // Firestore Timestamp
}

export type SessionType = 'practice' | 'match' | 'meeting' | string;

export interface SessionDoc {
  teamId: string;
  title: string;
  type?: SessionType;
  start: any; // Firestore Timestamp
  end: any; // Firestore Timestamp
  assignedUserIds?: string[];
  source?: 'manual' | 'ics' | 'google';
  sourceId?: string;
}

export interface QuestionnaireResponseDoc {
  sessionId: string;
  userId: string;
  createdAt: any; // Firestore Timestamp
  payload: any;
}



