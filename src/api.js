export async function fetchAttendees() {
  const r = await fetch('/api/rsvp', { cache: 'no-store' });
  if (!r.ok) throw new Error('Ne mogu dohvatiti popis.');
  const { attendees } = await r.json();
  return attendees;
}

export async function rsvp(person) {
  const r = await fetch('/api/rsvp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(person.photo === false ? { name: person.name } : { slug: person.slug }),
  });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Prijava nije uspjela. Pokušaj ponovno.');
  return data;
}

export function normalize(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0110\u0111]/g, 'd')
    .toLowerCase()
    .trim();
}

// Početak domjenka (za odbrojavanje). Promijeni vrijeme kad bude poznato.
export const EVENT_DATE = new Date('2026-12-10T17:00:00+01:00');

export function daysUntil(date = EVENT_DATE) {
  const now = new Date();
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((b - a) / 86400000);
}

export function firstName(name) {
  return name.split(' ')[0];
}
