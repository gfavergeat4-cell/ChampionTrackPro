import * as DocumentPicker from 'expo-document-picker';
import { SessionDoc } from '../../types/firestore';
import { Timestamp } from 'firebase/firestore';

export type IcsEvent = {
  uid?: string;
  summary?: string;
  dtstart?: string; // e.g., 20251006T180000Z
  dtend?: string;
};

function parseIcsDate(value?: string): Date | undefined {
  if (!value) return undefined;
  // Very basic parser: YYYYMMDDTHHMMSSZ
  const m = value.match(/^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/);
  if (!m) return undefined;
  const [_, y, mo, d, h, mi, s] = m;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)));
}

export function parseIcs(text: string): IcsEvent[] {
  const lines = text.split(/\r?\n/);
  const events: IcsEvent[] = [];
  let current: IcsEvent | null = null;
  for (const line of lines) {
    if (line.startsWith('BEGIN:VEVENT')) {
      current = {};
    } else if (line.startsWith('END:VEVENT')) {
      if (current) events.push(current);
      current = null;
    } else if (current) {
      if (line.startsWith('UID:')) current.uid = line.slice(4).trim();
      if (line.startsWith('SUMMARY:')) current.summary = line.slice(8).trim();
      if (line.startsWith('DTSTART')) current.dtstart = line.split(':').pop()?.trim();
      if (line.startsWith('DTEND')) current.dtend = line.split(':').pop()?.trim();
    }
  }
  return events;
}

export async function pickIcsFile(): Promise<{ name: string; content: string } | null> {
  const res = await DocumentPicker.getDocumentAsync({ type: 'text/calendar' });
  if (res.canceled) return null;
  const file = res.assets?.[0];
  if (!file) return null;
  const content = await (await fetch(file.uri)).text();
  return { name: file.name ?? 'calendar.ics', content };
}

export function icsEventsToSessions(teamId: string, events: IcsEvent[]): SessionDoc[] {
  return events
    .map((ev) => {
      const start = parseIcsDate(ev.dtstart);
      const end = parseIcsDate(ev.dtend);
      if (!start || !end) return null;
      const title = ev.summary || 'Session';
      const session: SessionDoc = {
        teamId,
        title,
        start: Timestamp.fromDate(start),
        end: Timestamp.fromDate(end),
        source: 'ics',
        sourceId: ev.uid,
      };
      return session;
    })
    .filter(Boolean) as SessionDoc[];
}








