// Smještaj (sobe po dvoje) i prijevoz (vožnje do 4 osobe) prema Zadru.
// Ključevi su takvi da se većina podataka čita iz samih imena (bez dohvaćanja sadržaja):
//   room/<a>--<b>.json        soba za dvoje (a < b)
//   ride/<vozač>--<id>.json   ponuđena vožnja { driver, city, seats, when, note, at }
//   seat/<vozač>--<putnik>.json  putnik u vožnji
import { listAttendees, slugify } from './store.js';
import { CITY_BY_ID } from './cities.js';
import { delKeys, listKeys, putKey, readKey } from './kv.js';

const fail = (status, message) => Object.assign(new Error(message), { status });
const clean = (s, max = 80) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, max);
const parts = (key, prefix) => key.slice(prefix.length).replace(/\.json$/, '').split('--');

async function requireAttendees(...slugs) {
  const going = new Set((await listAttendees()).map((a) => a.slug));
  for (const s of slugs) {
    if (!s || !going.has(s)) throw fail(400, 'Prvo se prijavi na domjenak, pa onda biraj sobu i prijevoz.');
  }
}

// ---------- smještaj ----------
async function roomItems() {
  return (await listKeys('room/')).map((it) => {
    const [a, b] = parts(it.key, 'room/');
    return { ...it, a, b };
  });
}

export async function listRooms() {
  return (await roomItems())
    .filter((r) => r.a && r.b)
    .map(({ a, b, at }) => ({ a, b, at }))
    .sort((x, y) => x.at.localeCompare(y.at));
}

export async function pairRoom(input) {
  const me = slugify(String(input?.me || ''));
  const mate = slugify(String(input?.mate || ''));
  if (!me || !mate) throw fail(400, 'Odaberi s kim dijeliš sobu.');
  if (me === mate) throw fail(400, 'Sa sobom ne možeš dijeliti sobu. 😄');
  await requireAttendees(me, mate);
  const rooms = await roomItems();
  if (rooms.some((r) => r.a === me || r.b === me)) throw fail(409, 'Već imaš cimera. Prvo raskini sobu.');
  if (rooms.some((r) => r.a === mate || r.b === mate)) throw fail(409, 'Ta osoba već ima cimera.');
  const [a, b] = [me, mate].sort();
  const at = new Date().toISOString();
  await putKey(`room/${a}--${b}.json`, { a, b, at });
  return { room: { a, b, at } };
}

export async function leaveRoom(slug) {
  const s = slugify(String(slug || ''));
  const mine = (await roomItems()).filter((r) => r.a === s || r.b === s);
  await delKeys(mine);
  return { removed: mine.length > 0 };
}

// ---------- prijevoz ----------
async function rideItems() {
  const [rides, seats] = await Promise.all([listKeys('ride/'), listKeys('seat/')]);
  const seatList = seats.map((it) => {
    const [driver, slug] = parts(it.key, 'seat/');
    return { ...it, driver, slug };
  });
  const rideList = await Promise.all(
    rides.map(async (it) => {
      const [driver] = parts(it.key, 'ride/');
      const data = (await readKey(it)) || {};
      return { ...it, ...data, driver };
    })
  );
  return { rides: rideList, seats: seatList };
}

export async function listRides() {
  const { rides, seats } = await rideItems();
  return rides
    .filter((r) => CITY_BY_ID.has(r.city))
    .map((r) => ({
      driver: r.driver,
      city: r.city,
      seats: r.seats,
      when: r.when || '',
      note: r.note || '',
      at: r.at,
      passengers: seats
        .filter((s) => s.driver === r.driver)
        .sort((x, y) => x.at.localeCompare(y.at))
        .map((s) => s.slug),
    }))
    .sort((x, y) => x.at.localeCompare(y.at));
}

function busy(me, rides, seats) {
  if (rides.some((r) => r.driver === me)) throw fail(409, 'Već nudiš prijevoz. Prvo otkaži svoju vožnju.');
  if (seats.some((s) => s.slug === me)) throw fail(409, 'Već si u nečijim saonicama. Prvo izađi iz te vožnje.');
}

export async function createRide(input) {
  const me = slugify(String(input?.me || ''));
  const city = String(input?.city || '');
  const seats = Math.max(2, Math.min(4, Math.round(Number(input?.seats) || 4)));
  if (!CITY_BY_ID.has(city)) throw fail(400, 'Odaberi grad iz kojeg kreneš.');
  await requireAttendees(me);
  const { rides, seats: taken } = await rideItems();
  busy(me, rides, taken);
  const at = new Date().toISOString();
  const ride = { driver: me, city, seats, when: clean(input?.when, 60), note: clean(input?.note, 120), at };
  await putKey(`ride/${me}--${Date.now().toString(36)}.json`, ride);
  return { ride: { ...ride, passengers: [] } };
}

export async function joinRide(input) {
  const me = slugify(String(input?.me || ''));
  const driver = slugify(String(input?.driver || ''));
  await requireAttendees(me);
  const { rides, seats } = await rideItems();
  const ride = rides.find((r) => r.driver === driver);
  if (!ride) throw fail(404, 'Te vožnje više nema.');
  busy(me, rides, seats);
  const taken = seats.filter((s) => s.driver === driver).length;
  if (taken >= (ride.seats || 4) - 1) throw fail(409, 'Saonice su pune. 🛷');
  await putKey(`seat/${driver}--${me}.json`, { driver, slug: me, at: new Date().toISOString() });
  return { joined: true };
}

export async function leaveRide(slug) {
  const s = slugify(String(slug || ''));
  const mine = (await listKeys('seat/')).filter((it) => parts(it.key, 'seat/')[1] === s);
  await delKeys(mine);
  return { removed: mine.length > 0 };
}

export async function cancelRide(slug) {
  const s = slugify(String(slug || ''));
  const [rides, seats] = await Promise.all([listKeys('ride/'), listKeys('seat/')]);
  const gone = [
    ...rides.filter((it) => parts(it.key, 'ride/')[0] === s),
    ...seats.filter((it) => parts(it.key, 'seat/')[0] === s),
  ];
  await delKeys(gone);
  return { removed: gone.length > 0 };
}

/** Kad netko otkaže dolazak: makni ga iz sobe i iz svih vožnji. */
export async function removePersonEverywhere(slug) {
  await leaveRoom(slug);
  await leaveRide(slug);
  await cancelRide(slug);
}
