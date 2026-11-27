import { PEOPLE } from './people.js';

// Svi koje se može pozvati: zaposlenici s popisa + ručno upisani prijavljeni.
export function everyone(attendees) {
  const map = new Map(PEOPLE.map((p) => [p.slug, { ...p, photo: true }]));
  for (const a of attendees) map.set(a.slug, a);
  return map;
}

export const byName = (x, y) => x.name.localeCompare(y.name, 'hr');
