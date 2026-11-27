// GET    /api/rooms               -> { rooms: [{ a, b, at }] }
// POST   /api/rooms { me, mate }  -> { room }
// DELETE /api/rooms?slug=...      -> { removed }
import { leaveRoom, listRooms, pairRoom } from '../lib/trips.js';
import { readBody, send } from '../lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return send(res, 200, { rooms: await listRooms() });
    if (req.method === 'POST') return send(res, 200, await pairRoom(await readBody(req)));
    if (req.method === 'DELETE') {
      const slug = new URL(req.url, 'http://localhost').searchParams.get('slug');
      return send(res, 200, await leaveRoom(slug));
    }
    res.setHeader('Allow', 'GET, POST, DELETE');
    return send(res, 405, { error: 'Metoda nije podržana.' });
  } catch (err) {
    console.error(err);
    return send(res, err.status || 500, { error: err.status ? err.message : 'Nešto je pošlo po zlu. Pokušaj ponovno.' });
  }
}
