// Jednostavno spremište ključeva za sobe i vožnje.
// - Na Vercelu: svaki ključ je zaseban blob (ime ključa = putanja bloba).
// - Lokalno: sve u .data/kv.json.
import { promises as fs } from 'node:fs';
import path from 'node:path';

const LOCAL_FILE = path.join(process.cwd(), '.data', 'kv.json');
const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readLocal() {
  try {
    return JSON.parse(await fs.readFile(LOCAL_FILE, 'utf8'));
  } catch {
    return {};
  }
}
async function writeLocal(data) {
  await fs.mkdir(path.dirname(LOCAL_FILE), { recursive: true });
  await fs.writeFile(LOCAL_FILE, JSON.stringify(data, null, 2));
}

/** Svi ključevi s prefiksom: [{ key, url, at }] */
export async function listKeys(prefix) {
  if (!useBlob()) {
    const data = await readLocal();
    return Object.keys(data)
      .filter((k) => k.startsWith(prefix))
      .map((k) => ({ key: k, url: null, at: data[k].at }));
  }
  const { list } = await import('@vercel/blob');
  const out = [];
  let cursor;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    out.push(...page.blobs.map((b) => ({ key: b.pathname, url: b.url, at: new Date(b.uploadedAt).toISOString() })));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return out;
}

/** Sadržaj ključa (za stavke iz listKeys). */
export async function readKey(item) {
  if (!useBlob()) {
    const data = await readLocal();
    return data[item.key]?.value ?? null;
  }
  try {
    const r = await fetch(item.url, { cache: 'no-store' });
    return await r.json();
  } catch {
    return null;
  }
}

export async function putKey(key, value) {
  if (!useBlob()) {
    const data = await readLocal();
    data[key] = { value, at: new Date().toISOString() };
    await writeLocal(data);
    return;
  }
  const { put } = await import('@vercel/blob');
  await put(key, JSON.stringify(value), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
  });
}

export async function delKeys(items) {
  if (!items.length) return;
  if (!useBlob()) {
    const data = await readLocal();
    for (const it of items) delete data[it.key];
    await writeLocal(data);
    return;
  }
  const { del } = await import('@vercel/blob');
  await del(items.map((it) => it.url));
}
