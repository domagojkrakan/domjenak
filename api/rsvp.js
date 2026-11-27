// GET  /api/rsvp  -> { attendees: [...] }
// POST /api/rsvp  { slug } ili { name }  -> { entry, already }
// DELETE /api/rsvp?slug=ime-prezime  -> { removed, slug }  (miče osobu i iz sobe i iz vožnji)
import { listAttendees, addAttendee, removeAttendee } from '../lib/store.js';
import { removePersonEverywhere } from '../lib/trips.js';
import { readBody, send } from '../lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      return send(res, 200, { attendees: await listAttendees() });
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      return send(res, 200, await addAttendee(body));
    }
    if (req.method === 'DELETE') {
      const slug = new URL(req.url, 'http://localhost').searchParams.get('slug');
      const result = await removeAttendee(slug);
      await removePersonEverywhere(result.slug); // otkazan dolazak -> nema ni sobe ni vožnje
      return send(res, 200, result);
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return send(res, 405, { error: 'Metoda nije podržana.' });
  } catch (err) {
    console.error(err);
    return send(res, err.status || 500, { error: err.status ? err.message : 'Nešto je pošlo po zlu. Pokušaj ponovno.' });
  }
}
