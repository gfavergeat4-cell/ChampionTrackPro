// Removed date-fns import to avoid dependency issues

export interface EventTime {
  seconds: number;
  nanoseconds: number;
  timeZone: string;
}

export interface FirestoreEvent {
  id: string;
  teamId: string;
  summary: string;
  description?: string;
  location?: string;
  startUTC: number; // milliseconds UTC
  endUTC: number; // milliseconds UTC
  timeZone: string; // ex: "Europe/Paris"
  startLocalISO?: string; // ISO string in original timezone
  endLocalISO?: string;
  uid: string;
  rrule?: string;
  exdates?: string[];
  status?: string;
  createdAt: any;
  updatedAt: any;
  hasResponse?: boolean; // Added for client-side status
}

/**
 * Convertit un timestamp UTC (milliseconds) en Date
 */
export const fromUTC = (utcMs: number): Date => {
  return new Date(utcMs);
};

/**
 * Convertit un timestamp Firestore en Date avec timezone (legacy)
 */
export const fromSeconds = (seconds: number): Date => {
  return new Date(seconds * 1000);
};

/**
 * Formate une plage horaire avec timezone
 */
export const fmtRange = (start: Date, end: Date, tz: string): string => {
  const startTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
    hour12: false
  }).format(start);
  
  const endTime = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: tz,
    hour12: false
  }).format(end);
  
  return `${startTime} – ${endTime}`;
};

/**
 * Formate une plage horaire à partir d'un événement Firestore
 */
export const fmtEventRangeOld = (event: FirestoreEvent): string => {
  const start = fromUTC(event.startUTC);
  const end = fromUTC(event.endUTC);
  return fmtRange(start, end, event.timeZone);
};


/**
 * Formate une date avec timezone
 */
export const fmtDate = (date: Date, tz: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: tz
  }).format(date);
};

/**
 * Formate une heure avec timezone
 */
export const fmtTime = (date: Date, tz: string): string => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: tz,
    hour12: false
  }).format(date);
};

/**
 * Formate une plage horaire à partir d'un événement avec startUTC/endUTC
 */
export const fmtEventRange = (ev: {startUTC: number; endUTC: number; timeZone?: string}): string => {
  const tz = ev.timeZone || 'Europe/Paris';
  const f = (ms: number) => new Intl.DateTimeFormat('fr-FR', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: tz 
  }).format(new Date(ms));
  
  return `${f(ev.startUTC)} – ${f(ev.endUTC)}`;
};

/**
 * Convertit une date en timestamp Firestore
 */
export const toFirestoreTimestamp = (date: Date): { seconds: number; nanoseconds: number } => {
  const seconds = Math.floor(date.getTime() / 1000);
  const nanoseconds = (date.getTime() % 1000) * 1000000;
  return { seconds, nanoseconds };
};

/**
 * Groupe les événements par jour
 */
export const groupEventsByDay = (events: FirestoreEvent[]): Record<string, FirestoreEvent[]> => {
  const grouped: Record<string, FirestoreEvent[]> = {};
  
  events.forEach(event => {
    const startDate = fromUTC(event.startUTC);
    const dayKey = startDate.toISOString().split('T')[0]; // Format YYYY-MM-DD
    
    if (!grouped[dayKey]) {
      grouped[dayKey] = [];
    }
    
    grouped[dayKey].push(event);
  });
  
  // Trier les événements par heure dans chaque jour
  Object.keys(grouped).forEach(dayKey => {
    grouped[dayKey].sort((a, b) => a.startUTC - b.startUTC);
  });
  
  return grouped;
};

/**
 * Vérifie si un événement est dans une plage de dates
 */
export const isEventInRange = (event: FirestoreEvent, startDate: Date, endDate: Date): boolean => {
  const eventStart = fromUTC(event.startUTC);
  const eventEnd = fromUTC(event.endUTC);
  
  return eventStart >= startDate && eventStart < endDate;
};
