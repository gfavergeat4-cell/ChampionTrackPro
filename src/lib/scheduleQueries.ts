import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs, 
  onSnapshot, 
  Unsubscribe,
  doc,
  getDoc
} from 'firebase/firestore';
import { FirestoreEvent, fromSeconds, isEventInRange } from '../utils/time';
// Fonctions de date simples pour remplacer date-fns
const startOfWeek = (date: Date, options: { weekStartsOn: number } = { weekStartsOn: 0 }): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) - (options.weekStartsOn || 0);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfWeek = (date: Date, options: { weekStartsOn: number } = { weekStartsOn: 0 }): Date => {
  const d = startOfWeek(date, options);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

const startOfMonth = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfMonth = (date: Date): Date => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
};

export interface ScheduleQueryOptions {
  teamId: string;
  startDate: Date;
  endDate: Date;
  timeZone?: string;
}

export interface EventWithResponse extends FirestoreEvent {
  hasResponse: boolean;
  responseId?: string;
}

/**
 * Query les événements pour une plage de dates
 */
export async function getEventsForDateRange(options: ScheduleQueryOptions): Promise<FirestoreEvent[]> {
  try {
    const { teamId, startDate, endDate } = options;
    
    if (!teamId || !startDate || !endDate) {
      console.log("📅 Missing required parameters:", { teamId, startDate, endDate });
      return [];
    }
    
    const startUTC = startDate.getTime(); // milliseconds
    const endUTC = endDate.getTime(); // milliseconds
    
    console.log(`📅 Querying events for team ${teamId} from ${startUTC} to ${endUTC}`);
    
    const eventsRef = collection(db, 'teams', teamId, 'events');
    const q = query(
      eventsRef,
      where('startUTC', '>=', startUTC),
      where('startUTC', '<', endUTC),
      orderBy('startUTC', 'asc')
    );
    
    const snapshot = await getDocs(q);
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreEvent));
    
    console.log("📅 getEventsForDateRange found", events.length, "events");
    return events;
  } catch (error) {
    console.error("📅 Error in getEventsForDateRange:", error);
    return [];
  }
}

/**
 * Query les événements avec écoute en temps réel
 */
export function subscribeToEvents(
  options: ScheduleQueryOptions,
  callback: (events: FirestoreEvent[]) => void
): Unsubscribe {
  const { teamId, startDate, endDate } = options;
  
  // Utiliser directement les millisecondes
  
  const eventsRef = collection(db, 'teams', teamId, 'events');
  const q = query(
    eventsRef,
    where('startUTC', '>=', startDate.getTime()),
    where('startUTC', '<', endDate.getTime()),
    orderBy('startUTC', 'asc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as FirestoreEvent));
    callback(events);
  });
}

/**
 * Vérifie si un utilisateur a répondu à un événement
 */
export async function checkEventResponse(
  teamId: string,
  eventId: string,
  userId: string
): Promise<{ hasResponse: boolean; responseId?: string }> {
  try {
    if (!teamId || !eventId || !userId) {
      console.log("📅 Missing required parameters for checkEventResponse:", { teamId, eventId, userId });
      return { hasResponse: false };
    }
    
    const responseRef = doc(db, 'teams', teamId, 'events', eventId, 'responses', userId);
    const responseDoc = await getDoc(responseRef);
    
    return {
      hasResponse: responseDoc.exists(),
      responseId: responseDoc.exists() ? responseDoc.id : undefined
    };
  } catch (error) {
    console.error('📅 Error checking event response:', error);
    return { hasResponse: false };
  }
}

/**
 * Query les événements avec statut de réponse
 */
export async function getEventsWithResponseStatus(
  options: ScheduleQueryOptions,
  userId: string
): Promise<EventWithResponse[]> {
  try {
    if (!userId) {
      console.log("📅 Missing userId for getEventsWithResponseStatus");
      return [];
    }
    
    const events = await getEventsForDateRange(options);
    
    if (!Array.isArray(events)) {
      console.log("📅 Events is not an array in getEventsWithResponseStatus:", events);
      return [];
    }
    
    const eventsWithResponse: EventWithResponse[] = [];
    
    for (const event of events) {
      try {
        const responseStatus = await checkEventResponse(options.teamId, event.id, userId);
        eventsWithResponse.push({
          ...event,
          hasResponse: responseStatus.hasResponse,
          responseId: responseStatus.responseId
        });
      } catch (error) {
        console.error("📅 Error processing event", event.id, ":", error);
        // Ajouter l'événement sans statut de réponse
        eventsWithResponse.push({
          ...event,
          hasResponse: false
        });
      }
    }
    
    return eventsWithResponse;
  } catch (error) {
    console.error("📅 Error in getEventsWithResponseStatus:", error);
    return [];
  }
}

/**
 * Query les événements pour une semaine
 */
export async function getEventsForWeek(
  teamId: string,
  weekStart: Date,
  userId: string
): Promise<EventWithResponse[]> {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
  
  return getEventsWithResponseStatus({
    teamId,
    startDate: weekStart,
    endDate: weekEnd,
    timeZone: 'Europe/Paris'
  }, userId);
}

/**
 * Query les événements pour un jour
 */
export async function getEventsForDay(
  teamId: string,
  date: Date,
  userId: string
): Promise<EventWithResponse[]> {
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  return getEventsWithResponseStatus({
    teamId,
    startDate: dayStart,
    endDate: dayEnd,
    timeZone: 'Europe/Paris'
  }, userId);
}

/**
 * Query les événements pour un mois
 */
export async function getEventsForMonth(
  teamId: string,
  monthStart: Date,
  userId: string
): Promise<EventWithResponse[]> {
  const monthEnd = endOfMonth(monthStart);
  
  return getEventsWithResponseStatus({
    teamId,
    startDate: monthStart,
    endDate: monthEnd,
    timeZone: 'Europe/Paris'
  }, userId);
}

/**
 * Filtre les événements par jour de la semaine (mardi et jeudi)
 */
export function filterEventsByDayOfWeek(events: EventWithResponse[]): EventWithResponse[] {
  return events.filter(event => {
    const eventDate = new Date(event.startUTC);
    const dayOfWeek = eventDate.getDay();
    return dayOfWeek === 2 || dayOfWeek === 4; // Mardi ou jeudi
  });
}

/**
 * Query la prochaine session (next event) - REQUÊTE UNIQUE CORRECTE
 */
export async function getNextSession(
  teamId: string, 
  userId: string
): Promise<EventWithResponse | null> {
  try {
    const nowUTC = Date.now(); // milliseconds
    console.log(`[NEXT] nowUTC=${nowUTC} teamId=${teamId}`);
    
    const eventsRef = collection(db, 'teams', teamId, 'events');
    const q = query(
      eventsRef,
      where('startUTC', '>=', nowUTC),
      orderBy('startUTC', 'asc'),
      limit(1)
    );
    
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.log(`[NEXT] No upcoming events found`);
      return null;
    }
    
    const eventDoc = snapshot.docs[0];
    const eventData = eventDoc.data() as FirestoreEvent;
    
    // Vérifier si l'utilisateur a déjà répondu
    const responseStatus = await checkEventResponse(teamId, eventDoc.id, userId);
    
    const nextEvent: EventWithResponse = {
      id: eventDoc.id,
      ...eventData,
      hasResponse: responseStatus.hasResponse,
      responseId: responseStatus.responseId
    };
    
    console.log(`[NEXT] next.startUTC=${nextEvent.startUTC} tz=${nextEvent.timeZone}`);
    return nextEvent;
    
  } catch (error) {
    console.error('📅 Error getting next session:', error);
    return null;
  }
}
