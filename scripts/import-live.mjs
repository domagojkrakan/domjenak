// Preuzmi prijave s postojeće (Vercel) stranice u lokalne podatke za vlastiti hosting.
//   node scripts/import-live.mjs https://rentlio-domjenak-chi.vercel.app
// Spaja s postojećim <DATA_DIR>/rsvp.json (ništa ne briše). Sobe i vožnje se ne prenose.
import { dataFile, readJson, writeJson } from '../lib/datadir.js';

const base = (process.argv[2] || 'https://rentlio-domjenak-chi.vercel.app').replace(/\/$/, '');
const res = await fetch(`${base}/api/rsvp`, { cache: 'no-store' });
if (!res.ok) throw new Error(`GET ${base}/api/rsvp -> ${res.status}`);
const { attendees = [] } = await res.json();

const file = dataFile('rsvp.json');
const list = await readJson(file, []);
const have = new Set(list.map((a) => a.slug));
const added = attendees.filter((a) => !have.has(a.slug));
await writeJson(file, [...list, ...added].sort((a, b) => a.at.localeCompare(b.at)));
console.log(`Preuzeto ${attendees.length} prijava, dodano ${added.length} novih -> ${file}`);
