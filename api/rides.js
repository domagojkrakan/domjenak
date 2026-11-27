// GET  /api/rides  -> { rides: [{ driver, city, seats, when, note, at, passengers: [slug], invited: [slug] }] }
// POST /api/rides  { action: 'create', me, city, seats, when, note }
//                  { action: 'join', me, driver }      uskoči (ili prihvati poziv)
//                  { action: 'decline', me, driver }   odbij poziv
//                  { action: 'invite', me, who }       vozač dodaje kolegu
//                  { action: 'drop', me, who }         vozač miče putnika / povlači poziv
//                  { action: 'leave', me } | { action: 'cancel', me }
//                  { action: 'need', me, city, note }  trebam prijevoz | { action: 'unneed', me }
// GET vraća i needs: [{ slug, city, note, at }]
import {
  cancelNeed,
  cancelRide,
  createRide,
  declineRide,
  dropFromRide,
  inviteRide,
  joinRide,
  leaveRide,
  listNeeds,
  listRides,
  needRide,
} from '../lib/trips.js';
import { readBody, send } from '../lib/http.js';

const ACTIONS = {
  create: createRide,
  join: joinRide,
  decline: declineRide,
  invite: inviteRide,
  drop: dropFromRide,
  leave: (b) => leaveRide(b.me),
  cancel: (b) => cancelRide(b.me),
  need: needRide,
  unneed: (b) => cancelNeed(b.me),
};

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const [rides, needs] = await Promise.all([listRides(), listNeeds()]);
      return send(res, 200, { rides, needs });
    }
    if (req.method === 'POST') {
      const body = await readBody(req);
      const fn = ACTIONS[body.action];
      if (!fn) return send(res, 400, { error: 'Nepoznata radnja.' });
      return send(res, 200, await fn(body));
    }
    res.setHeader('Allow', 'GET, POST');
    return send(res, 405, { error: 'Metoda nije podržana.' });
  } catch (err) {
    console.error(err);
    return send(res, err.status || 500, { error: err.status ? err.message : 'Nešto je pošlo po zlu. Pokušaj ponovno.' });
  }
}
