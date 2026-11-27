// Produkcijski server za vlastiti hosting (Node 18+), bez dodatnih paketa.
//   npm run build && npm start
// Poslužuje izgrađenu stranicu iz dist/ i API (/api/rsvp, /api/rooms, /api/rides).
// Podaci se spremaju u JSON datoteke u mapi DATA_DIR (zadano: ./.data).
// Varijable: PORT (zadano 3000), HOST (zadano 0.0.0.0), DATA_DIR, SITE_URL (puna adresa za slike pri dijeljenju).
import http from 'node:http';
import { promises as fs, createReadStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

// Na vlastitom hostingu nikad ne koristimo Vercel Blob, čak i ako je token negdje ostao u okruženju.
delete process.env.BLOB_READ_WRITE_TOKEN;

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const DIST = path.join(ROOT, 'dist');
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

const { DATA_DIR } = await import('./lib/datadir.js');
const API = {
  rsvp: (await import('./api/rsvp.js')).default,
  rooms: (await import('./api/rooms.js')).default,
  rides: (await import('./api/rides.js')).default,
};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.json', '.svg', '.txt']);

// Sve izmjene (POST/DELETE) idu jedna po jedna, da se dvije istovremene
// prijave ne bi međusobno pregazile pri čitanju i pisanju JSON datoteka.
let queue = Promise.resolve();
const serial = (fn) => {
  const run = queue.then(fn, fn);
  queue = run.catch(() => {});
  return run;
};

async function serveFile(req, res, file, { immutable = false } = {}) {
  const stat = await fs.stat(file);
  const ext = path.extname(file).toLowerCase();
  res.setHeader('Content-Type', TYPES[ext] || 'application/octet-stream');
  res.setHeader('Cache-Control', immutable ? 'public, max-age=31536000, immutable' : 'no-cache');
  res.setHeader('Last-Modified', stat.mtime.toUTCString());
  if (req.headers['if-modified-since'] && new Date(req.headers['if-modified-since']) >= new Date(stat.mtime.toUTCString())) {
    res.statusCode = 304;
    return res.end();
  }
  if (req.method === 'HEAD') return res.end();

  const gzip = COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
  if (gzip) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    return createReadStream(file).pipe(zlib.createGzip()).pipe(res);
  }

  // audio: podrška za Range (premotavanje i iOS Safari)
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
  res.setHeader('Accept-Ranges', 'bytes');
  if (range) {
    const start = range[1] ? Number(range[1]) : stat.size - Number(range[2]);
    const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
    if (start >= stat.size || start > end) {
      res.statusCode = 416;
      res.setHeader('Content-Range', `bytes */${stat.size}`);
      return res.end();
    }
    res.statusCode = 206;
    res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    res.setHeader('Content-Length', end - start + 1);
    return createReadStream(file, { start, end }).pipe(res);
  }
  res.setHeader('Content-Length', stat.size);
  return createReadStream(file).pipe(res);
}

// Puna adresa stranice za og:image / og:url (Facebook, WhatsApp, LinkedIn traže apsolutni URL).
// SITE_URL (npr. https://domjenak.rentlio.com) ima prednost; inače se slaže iz zahtjeva.
function originOf(req) {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, '');
  const proto = String(req.headers['x-forwarded-proto'] || (req.socket.encrypted ? 'https' : 'http')).split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
  return `${proto}://${host}`;
}

async function serveIndex(req, res) {
  const origin = originOf(req);
  const html = (await fs.readFile(path.join(DIST, 'index.html'), 'utf8'))
    .replace(/(property="og:url" content=")\/(")/, `$1${origin}/$2`)
    .replace(/(content=")\/og\.jpg(")/g, `$1${origin}/og.jpg$2`);
  res.setHeader('Content-Type', TYPES['.html']);
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Length', Buffer.byteLength(html));
  return res.end(req.method === 'HEAD' ? undefined : html);
}

async function handleStatic(req, res, pathname) {
  let rel;
  try {
    rel = decodeURIComponent(pathname);
  } catch {
    rel = pathname;
  }
  const file = path.join(DIST, path.normalize(rel).replace(/^([/\\])+/, ''));
  if (!file.startsWith(DIST)) {
    res.statusCode = 403;
    return res.end();
  }
  try {
    const stat = await fs.stat(file);
    if (stat.isFile() && path.basename(file) !== 'index.html') {
      return await serveFile(req, res, file, { immutable: rel.startsWith('/assets/') });
    }
  } catch {
    /* nije datoteka -> SPA */
  }
  // nepostojeća datoteka s ekstenzijom -> 404; inače je to ruta aplikacije (/prijevoz, /smjestaj…)
  if (path.extname(rel) && path.basename(rel) !== 'index.html') {
    res.statusCode = 404;
    return res.end('Not found');
  }
  return serveIndex(req, res);
}

const server = http.createServer(async (req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');
  try {
    const api = /^\/api\/(rsvp|rooms|rides)\/?$/.exec(pathname);
    if (api) {
      const handler = API[api[1]];
      if (req.method === 'GET' || req.method === 'HEAD') return await handler(req, res);
      return await serial(() => handler(req, res));
    }
    if (pathname.startsWith('/api/')) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      return res.end(JSON.stringify({ error: 'Nepoznata adresa.' }));
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.statusCode = 405;
      return res.end();
    }
    return await handleStatic(req, res, pathname);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) res.statusCode = 500;
    res.end();
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Božićni domjenak radi na http://${HOST === '0.0.0.0' ? 'localhost' : HOST}:${PORT}`);
  console.log(`Podaci: ${DATA_DIR}`);
});
