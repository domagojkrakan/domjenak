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

export async function cancelRsvp(slug) {
  const r = await fetch(`/api/rsvp?slug=${encodeURIComponent(slug)}`, { method: 'DELETE' });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Otkazivanje nije uspjelo. Pokušaj ponovno.');
  return data;
}

// "1 osoba dolazi", "3 osobe dolaze", "5 osoba dolazi"
export function osoba(n) {
  const d = n % 10;
  const h = n % 100;
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'osobe dolaze';
  return 'osoba dolazi';
}

async function call(url, options) {
  const r = await fetch(url, { cache: 'no-store', ...options });
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || 'Nešto je pošlo po zlu. Pokušaj ponovno.');
  return data;
}
const post = (url, body) =>
  call(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

// ---------- smještaj ----------
export const fetchRooms = () => call('/api/rooms').then((d) => d.rooms);
export const pairRoom = (me, mate) => post('/api/rooms', { me, mate });
export const leaveRoom = (me) => call(`/api/rooms?slug=${encodeURIComponent(me)}`, { method: 'DELETE' });

// ---------- prijevoz ----------
export const fetchRides = () => call('/api/rides').then((d) => d.rides);
export const createRide = (ride) => post('/api/rides', { action: 'create', ...ride });
export const joinRide = (me, driver) => post('/api/rides', { action: 'join', me, driver });
export const leaveRide = (me) => post('/api/rides', { action: 'leave', me });
export const cancelRide = (me) => post('/api/rides', { action: 'cancel', me });

// "1 mjesto", "2 mjesta", "5 mjesta"
export function mjesta(n) {
  const d = n % 10;
  const h = n % 100;
  if (d === 1 && h !== 11) return 'slobodno mjesto';
  if (d >= 2 && d <= 4 && (h < 12 || h > 14)) return 'slobodna mjesta';
  return 'slobodnih mjesta';
}
