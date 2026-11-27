// GET  /api/rsvp  -> { attendees: [...] }
// POST /api/rsvp  { slug } ili { name }  -> { entry, already }
import { listAttendees, addAttendee } from '../lib/store.js';

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(data));
}

async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}');
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return send(res, 200, { attendees: await listAttendees() });
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      return send(res, 200, await addAttendee(body));
    }
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Metoda nije podržana.' });
  } catch (err) {
    console.error(err);
    return send(res, err.status || 500, { error: err.status ? err.message : 'Nešto je pošlo po zlu. Pokušaj ponovno.' });
  }
}
