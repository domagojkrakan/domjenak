// GET  /api/rides  -> { rides: [{ driver, city, seats, when, note, at, passengers: [slug] }] }
// POST /api/rides  { action: 'create', me, city, seats, when, note }
//                  { action: 'join', me, driver } | { action: 'leave', me } | { action: 'cancel', me }
import { cancelRide, createRide, joinRide, leaveRide, listRides } from '../lib/trips.js';
import { readBody, send } from '../lib/http.js';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') return send(res, 200, { rides: await listRides() });
    if (req.method === 'POST') {
      const body = await readBody(req);
      if (body.action === 'create') return send(res, 200, await createRide(body));
      if (body.action === 'join') return send(res, 200, await joinRide(body));
      if (body.action === 'leave') return send(res, 200, await leaveRide(body.me));
      if (body.action === 'cancel') return send(res, 200, await cancelRide(body.me));
      return send(res, 400, { error: 'Nepoznata radnja.' });
    }
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Metoda nije podržana.' });
  } catch (err) {
    console.error(err);
    return send(res, err.status || 500, { error: err.status ? err.message : 'Nešto je pošlo po zlu. Pokušaj ponovno.' });
  }
}
