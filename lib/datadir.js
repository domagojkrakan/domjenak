// Mapa s podacima kad se ne koristi Vercel Blob (lokalno i na vlastitom hostingu).
// Može se promijeniti varijablom DATA_DIR (npr. /home/korisnik/domjenak-data).
import { promises as fs } from 'node:fs';
import path from 'node:path';

export const DATA_DIR = process.env.DATA_DIR ? path.resolve(process.env.DATA_DIR) : path.join(process.cwd(), '.data');
export const dataFile = (name) => path.join(DATA_DIR, name);

/** Upis preko privremene datoteke pa rename, da datoteka nikad ne ostane napola zapisana. */
export async function writeJson(file, data) {
  await fs.mkdir(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2));
  await fs.rename(tmp, file);
}

export async function readJson(file, fallback) {
  try {
    return JSON.parse(await fs.readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}
