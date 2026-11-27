// Spremište prijava.
// - Na Vercelu (kad postoji BLOB_READ_WRITE_TOKEN) svaka prijava je zaseban
//   blob `rsvp/<slug>.json`, pa istovremene prijave ne mogu pregaziti jedna drugu.
// - Lokalno i na vlastitom hostingu prijave se spremaju u <DATA_DIR>/rsvp.json.
import { dataFile, readJson, writeJson } from './datadir.js';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const PEOPLE = require('./people.json');
const BY_SLUG = new Map(PEOPLE.map((p) => [p.slug, p]));
const PREFIX = 'rsvp/';
const LOCAL_FILE = dataFile('rsvp.json');

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

/** Osoba s popisa zaposlenika (i ako se još nije prijavila). */
export const findPerson = (slug) => BY_SLUG.get(slug) || null;

export function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u0110\u0111]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function cleanName(s) {
  return String(s || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60)
    .replace(/(^|[\s-])(\S)/g, (m, sep, c) => sep + c.toUpperCase());
}

/** Vrati {slug, name, photo} za prijavu ili baci grešku. */
export function resolveAttendee({ slug, name }) {
  if (slug && BY_SLUG.has(slug)) {
    const p = BY_SLUG.get(slug);
    return { slug: p.slug, name: p.name, photo: true };
  }
  const n = cleanName(name);
  if (n.split(' ').length < 2 || n.length < 4) {
    throw Object.assign(new Error('Upiši ime i prezime.'), { status: 400 });
  }
  const s = slugify(n);
  if (BY_SLUG.has(s)) return { slug: s, name: BY_SLUG.get(s).name, photo: true };
  return { slug: s, name: n, photo: false };
}

// ---------- lokalno ----------
const readLocal = () => readJson(LOCAL_FILE, []);

// ---------- javno sučelje ----------
export async function listAttendees() {
  if (!useBlob()) {
    const list = await readLocal();
    return list.sort((a, b) => a.at.localeCompare(b.at));
  }
  const { list } = await import('@vercel/blob');
  const blobs = [];
  let cursor;
  do {
    const page = await list({ prefix: PREFIX, cursor, limit: 1000 });
    blobs.push(...page.blobs);
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const out = await Promise.all(
    blobs.map(async (b) => {
      const slug = b.pathname.slice(PREFIX.length).replace(/\.json$/, '');
      const known = BY_SLUG.get(slug);
      if (known) return { slug, name: known.name, photo: true, at: new Date(b.uploadedAt).toISOString() };
      try {
        const r = await fetch(b.url, { cache: 'no-store' });
        const data = await r.json();
        return { slug, name: data.name, photo: false, at: data.at };
      } catch {
        return null;
      }
    })
  );
  return out.filter(Boolean).sort((a, b) => a.at.localeCompare(b.at));
}

export async function addAttendee(input) {
  const a = resolveAttendee(input);
  const entry = { ...a, at: new Date().toISOString() };

  if (!useBlob()) {
    const list = await readLocal();
    const existing = list.find((x) => x.slug === a.slug);
    if (existing) return { entry: existing, already: true };
    list.push(entry);
    await writeJson(LOCAL_FILE, list);
    return { entry, already: false };
  }

  const { put, head } = await import('@vercel/blob');
  const pathname = `${PREFIX}${a.slug}.json`;
  try {
    const h = await head(pathname);
    return { entry: { ...a, at: new Date(h.uploadedAt).toISOString() }, already: true };
  } catch {
    /* ne postoji -> nastavi */
  }
  await put(pathname, JSON.stringify(entry), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
  return { entry, already: false };
}

export async function removeAttendee(slug) {
  const s = slugify(String(slug || ''));
  if (!s) throw Object.assign(new Error('Nedostaje osoba.'), { status: 400 });

  if (!useBlob()) {
    const list = await readLocal();
    const next = list.filter((x) => x.slug !== s);
    if (next.length !== list.length) {
      await writeJson(LOCAL_FILE, next);
    }
    return { removed: next.length !== list.length, slug: s };
  }

  const { head, del } = await import('@vercel/blob');
  try {
    const h = await head(`${PREFIX}${s}.json`);
    await del(h.url);
    return { removed: true, slug: s };
  } catch {
    return { removed: false, slug: s };
  }
}
