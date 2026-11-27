// GET    /api/rooms                              -> { rooms: [{ a, b, at }], invites: [{ from, to, at }] }
// POST   /api/rooms { me, mate }                 -> { room } ili { invite } (ako se cimer još nije prijavio)
// POST   /api/rooms { action: 'accept'|'decline', me, from }
// DELETE /api/rooms?slug=...                     -> raskini sobu / povuci poziv
import { acceptRoom, declineRoom, leaveRoom, listRooms, pairRoom } from '../lib/trips.js';
import { readBody, send } from '../lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return send(res, 200, await listRooms());
    if (req.method === 'POST') {
      const body = await readBody(req);
      if (body.action === 'accept') return send(res, 200, await acceptRoom(body));
      if (body.action === 'decline') return send(res, 200, await declineRoom(body));
      return send(res, 200, await pairRoom(body));
    }
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
