// Smještaj (sobe po dvoje) i prijevoz (vožnje do 4 osobe) prema Zadru.
// Ključevi su takvi da se većina podataka čita iz samih imena (bez dohvaćanja sadržaja):
//   room/<a>--<b>.json                soba za dvoje (a < b)
//   invite-room/<od>--<za>.json       poziv u sobu osobi koja se još nije prijavila
//   ride/<vozač>--<id>.json           ponuđena vožnja { driver, city, seats, when, note, at }
//   seat/<vozač>--<putnik>.json       putnik u vožnji
//   invite-ride/<vozač>--<za>.json    poziv u vožnju osobi koja se još nije prijavila
import { findPerson, listAttendees, slugify } from './store.js';
import { CITY_BY_ID } from './cities.js';
import { delKeys, listKeys, putKey, readKey } from './kv.js';

const fail = (status, message) => Object.assign(new Error(message), { status });
const clean = (s, max = 80) => String(s || '').replace(/\s+/g, ' ').trim().slice(0, max);
const parts = (key, prefix) => key.slice(prefix.length).replace(/\.json$/, '').split('--');
const slugOf = (v) => slugify(String(v || ''));
const named = (prefix) => async () =>
  (await listKeys(prefix)).map((it) => {
    const [x, y] = parts(it.key, prefix);
    return { ...it, x, y };
  });
const roomInvites = named('invite-room/');
const rideInvites = named('invite-ride/');

async function goingSet() {
  return new Set((await listAttendees()).map((a) => a.slug));
}
async function requireGoing(going, ...slugs) {
  for (const s of slugs) {
    if (!s || !going.has(s)) throw fail(400, 'Prvo se prijavi na domjenak, pa onda biraj sobu i prijevoz.');
  }
}
// osoba koju se poziva: prijavljena ili barem na popisu zaposlenika
function requireKnown(going, slug) {
  if (!slug || (!going.has(slug) && !findPerson(slug))) throw fail(400, 'Ta osoba nije na popisu.');
}
const nameOf = (slug) => findPerson(slug)?.name?.split(' ')[0] || 'Ta osoba';

// ---------- smještaj ----------
async function roomItems() {
  return (await listKeys('room/')).map((it) => {
    const [a, b] = parts(it.key, 'room/');
    return { ...it, a, b };
  });
}
const inRoom = (rooms, s) => rooms.some((r) => r.a === s || r.b === s);

export async function listRooms() {
  const [rooms, invites] = await Promise.all([roomItems(), roomInvites()]);
  return {
    rooms: rooms
      .filter((r) => r.a && r.b)
      .map(({ a, b, at }) => ({ a, b, at }))
      .sort((x, y) => x.at.localeCompare(y.at)),
    invites: invites.map(({ x, y, at }) => ({ from: x, to: y, at })).sort((p, q) => p.at.localeCompare(q.at)),
  };
}

async function makeRoom(me, mate) {
  const [a, b] = [me, mate].sort();
  const at = new Date().toISOString();
  await putKey(`room/${a}--${b}.json`, { a, b, at });
  // pozivi u kojima je bilo tko od njih dvoje više ne vrijede
  await delKeys((await roomInvites()).filter((i) => [me, mate].includes(i.x) || [me, mate].includes(i.y)));
  return { a, b, at };
}

/** Odabir cimera. Ako se cimer još nije prijavio, šalje mu se poziv. */
export async function pairRoom(input) {
  const me = slugOf(input?.me);
  const mate = slugOf(input?.mate);
  if (!me || !mate) throw fail(400, 'Odaberi s kim dijeliš sobu.');
  if (me === mate) throw fail(400, 'Sa sobom ne možeš dijeliti sobu. 😄');
  const going = await goingSet();
  await requireGoing(going, me);
  requireKnown(going, mate);
  const [rooms, invites] = await Promise.all([roomItems(), roomInvites()]);
  if (inRoom(rooms, me)) throw fail(409, 'Već imaš cimera. Prvo raskini sobu.');
  if (inRoom(rooms, mate)) throw fail(409, 'Ta osoba već ima cimera.');
  const mine = invites.find((i) => i.x === me);
  if (mine) throw fail(409, `Već si poslao/la poziv osobi ${nameOf(mine.y)}. Prvo ga povuci.`);
  if (going.has(mate)) return { room: await makeRoom(me, mate) };
  const at = new Date().toISOString();
  await putKey(`invite-room/${me}--${mate}.json`, { from: me, to: mate, at });
  return { invite: { from: me, to: mate, at } };
}

export async function acceptRoom(input) {
  const me = slugOf(input?.me);
  const from = slugOf(input?.from);
  const going = await goingSet();
  await requireGoing(going, me);
  const [rooms, invites] = await Promise.all([roomItems(), roomInvites()]);
  const invite = invites.find((i) => i.x === from && i.y === me);
  if (!invite) throw fail(404, 'Taj poziv više ne vrijedi.');
  if (!going.has(from)) {
    await delKeys([invite]);
    throw fail(409, `${nameOf(from)} je otkazao/la dolazak.`);
  }
  if (inRoom(rooms, me)) throw fail(409, 'Već imaš cimera. Prvo raskini sobu.');
  if (inRoom(rooms, from)) {
    await delKeys([invite]);
    throw fail(409, `${nameOf(from)} već ima cimera.`);
  }
  return { room: await makeRoom(me, from) };
}

export async function declineRoom(input) {
  const me = slugOf(input?.me);
  const from = slugOf(input?.from);
  const gone = (await roomInvites()).filter((i) => i.x === from && i.y === me);
  await delKeys(gone);
  return { removed: gone.length > 0 };
}

/** Raskini sobu i povuci poslani poziv. */
export async function leaveRoom(slug) {
  const s = slugOf(slug);
  const [rooms, invites] = await Promise.all([roomItems(), roomInvites()]);
  const gone = [...rooms.filter((r) => r.a === s || r.b === s), ...invites.filter((i) => i.x === s)];
  await delKeys(gone);
  return { removed: gone.length > 0 };
}

// ---------- prijevoz ----------
async function rideItems() {
  const [rides, seats, invites] = await Promise.all([listKeys('ride/'), listKeys('seat/'), rideInvites()]);
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
  return { rides: rideList, seats: seatList, invites: invites.map((i) => ({ ...i, driver: i.x, slug: i.y })) };
}
const byAt = (x, y) => x.at.localeCompare(y.at);
const taken = (ride, seats, invites) =>
  seats.filter((s) => s.driver === ride.driver).length + invites.filter((i) => i.driver === ride.driver).length;

export async function listRides() {
  const { rides, seats, invites } = await rideItems();
  return rides
    .filter((r) => CITY_BY_ID.has(r.city))
    .map((r) => ({
      driver: r.driver,
      city: r.city,
      seats: r.seats,
      when: r.when || '',
      note: r.note || '',
      at: r.at,
      passengers: seats.filter((s) => s.driver === r.driver).sort(byAt).map((s) => s.slug),
      invited: invites.filter((i) => i.driver === r.driver).sort(byAt).map((i) => i.slug),
    }))
    .sort(byAt);
}

function busy(me, rides, seats, self = true) {
  if (rides.some((r) => r.driver === me))
    throw fail(409, self ? 'Već nudiš prijevoz. Prvo otkaži svoju vožnju.' : `${nameOf(me)} već vozi svoj auto.`);
  if (seats.some((s) => s.slug === me))
    throw fail(409, self ? 'Već si u nečijim saonicama. Prvo izađi iz te vožnje.' : `${nameOf(me)} već ima prijevoz.`);
}

async function seatIn(driver, me, invites) {
  await putKey(`seat/${driver}--${me}.json`, { driver, slug: me, at: new Date().toISOString() });
  // ostali pozivi za tu osobu više ne vrijede
  await delKeys(invites.filter((i) => i.slug === me));
}

export async function createRide(input) {
  const me = slugOf(input?.me);
  const city = String(input?.city || '');
  const seats = Math.max(2, Math.min(4, Math.round(Number(input?.seats) || 3)));
  if (!CITY_BY_ID.has(city)) throw fail(400, 'Odaberi grad iz kojeg kreneš.');
  await requireGoing(await goingSet(), me);
  const { rides, seats: taken_, invites } = await rideItems();
  busy(me, rides, taken_);
  const at = new Date().toISOString();
  const ride = { driver: me, city, seats, when: clean(input?.when, 60), note: clean(input?.note, 120), at };
  await putKey(`ride/${me}--${Date.now().toString(36)}.json`, ride);
  await delKeys(invites.filter((i) => i.slug === me));
  return { ride: { ...ride, passengers: [], invited: [] } };
}

export async function joinRide(input) {
  const me = slugOf(input?.me);
  const driver = slugOf(input?.driver);
  await requireGoing(await goingSet(), me);
  const { rides, seats, invites } = await rideItems();
  const ride = rides.find((r) => r.driver === driver);
  if (!ride) throw fail(404, 'Te vožnje više nema.');
  busy(me, rides, seats);
  const invited = invites.some((i) => i.driver === driver && i.slug === me);
  // pozvani već ima rezervirano mjesto
  if (!invited && taken(ride, seats, invites) >= (ride.seats || 4) - 1) throw fail(409, 'Saonice su pune. 🛷');
  await seatIn(driver, me, invites);
  return { joined: true };
}

/** Vozač dodaje kolegu: prijavljeni odmah sjeda, ostali dobivaju poziv. */
export async function inviteRide(input) {
  const me = slugOf(input?.me);
  const who = slugOf(input?.who);
  const going = await goingSet();
  await requireGoing(going, me);
  requireKnown(going, who);
  if (who === me) throw fail(400, 'Ti već voziš. 😄');
  const { rides, seats, invites } = await rideItems();
  const ride = rides.find((r) => r.driver === me);
  if (!ride) throw fail(404, 'Prvo ponudi prijevoz.');
  if (invites.some((i) => i.driver === me && i.slug === who)) throw fail(409, 'Već si pozvao/la tu osobu.');
  busy(who, rides, seats, false);
  if (taken(ride, seats, invites) >= (ride.seats || 4) - 1) throw fail(409, 'Saonice su pune. 🛷');
  if (going.has(who)) {
    await seatIn(me, who, invites);
    return { joined: true };
  }
  await putKey(`invite-ride/${me}--${who}.json`, { driver: me, slug: who, at: new Date().toISOString() });
  return { invited: true };
}

export async function declineRide(input) {
  const me = slugOf(input?.me);
  const driver = slugOf(input?.driver);
  const gone = (await rideInvites()).filter((i) => i.x === driver && i.y === me);
  await delKeys(gone);
  return { removed: gone.length > 0 };
}

/** Vozač miče putnika ili povlači poziv. */
export async function dropFromRide(input) {
  const me = slugOf(input?.me);
  const who = slugOf(input?.who);
  const [seats, invites] = await Promise.all([listKeys('seat/'), rideInvites()]);
  const gone = [
    ...seats.filter((it) => {
      const [d, s] = parts(it.key, 'seat/');
      return d === me && s === who;
    }),
    ...invites.filter((i) => i.x === me && i.y === who),
  ];
  await delKeys(gone);
  return { removed: gone.length > 0 };
}

export async function leaveRide(slug) {
  const s = slugOf(slug);
  const mine = (await listKeys('seat/')).filter((it) => parts(it.key, 'seat/')[1] === s);
  await delKeys(mine);
  return { removed: mine.length > 0 };
}

export async function cancelRide(slug) {
  const s = slugOf(slug);
  const [rides, seats, invites] = await Promise.all([listKeys('ride/'), listKeys('seat/'), rideInvites()]);
  const gone = [
    ...rides.filter((it) => parts(it.key, 'ride/')[0] === s),
    ...seats.filter((it) => parts(it.key, 'seat/')[0] === s),
    ...invites.filter((i) => i.x === s),
  ];
  await delKeys(gone);
  return { removed: gone.length > 0 };
}

/** Kad netko otkaže dolazak: makni ga iz sobe, vožnji i svih poziva. */
export async function removePersonEverywhere(slug) {
  const s = slugOf(slug);
  await leaveRoom(s);
  await leaveRide(s);
  await cancelRide(s);
  const [ri, vi] = await Promise.all([roomInvites(), rideInvites()]);
  await delKeys([...ri.filter((i) => i.y === s), ...vi.filter((i) => i.y === s)]);
}
