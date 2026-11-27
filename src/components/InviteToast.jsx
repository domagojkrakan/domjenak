import { useCallback, useEffect, useMemo, useState } from 'react';
import usePoll from '../usePoll.js';
import { AnimatePresence, motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { useGoingMe } from './MeBar.jsx';
import { fetchRides, fetchRooms } from '../api.js';
import { everyone } from '../everyone.js';
import { CITY_BY_ID } from '../../lib/cities.js';

const SEEN = 'domjenak-invites-seen';
const readSeen = () => {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN)) || []);
  } catch {
    return new Set();
  }
};

// Obavijest "X te poziva u sobu / saonice" — čim se pozvana osoba prijavi.
export default function InviteToast({ attendees, path, navigate }) {
  const me = useGoingMe(attendees);
  const [data, setData] = useState(null);
  const [seen, setSeen] = useState(readSeen);

  const load = useCallback(async () => {
    try {
      const [rooms, rides] = await Promise.all([fetchRooms(), fetchRides()]);
      setData({ ...rooms, rides });
    } catch {
      /* pokušat ćemo opet */
    }
  }, []);
  usePoll(load, 60000, [path], Boolean(me));

  const people = useMemo(() => everyone(attendees), [attendees]);
  const going = useMemo(() => new Set(attendees.map((a) => a.slug)), [attendees]);

  const invites = useMemo(() => {
    if (!me || !data) return [];
    const out = [];
    const roomed = data.rooms.some((r) => r.a === me.slug || r.b === me.slug);
    if (!roomed) {
      for (const i of data.invites) {
        if (i.to === me.slug && going.has(i.from) && people.has(i.from))
          out.push({ id: `room:${i.from}`, from: people.get(i.from), kind: 'room', href: '/smjestaj' });
      }
    }
    const riding = data.rides.some((r) => r.driver === me.slug || r.passengers.includes(me.slug));
    if (!riding) {
      for (const r of data.rides) {
        if (r.invited.includes(me.slug) && going.has(r.driver) && people.has(r.driver))
          out.push({ id: `ride:${r.driver}`, from: people.get(r.driver), kind: 'ride', city: CITY_BY_ID.get(r.city)?.name, href: '/prijevoz' });
      }
    }
    return out.filter((i) => !seen.has(i.id) && !path.startsWith(i.href));
  }, [me, data, going, people, seen, path]);

  const dismiss = (id) => {
    const next = new Set(seen).add(id);
    setSeen(next);
    try {
      sessionStorage.setItem(SEEN, JSON.stringify([...next]));
    } catch {}
  };

  const top = invites[0];
  return (
    <AnimatePresence>
      {top && (
        <motion.div
          key={top.id}
          className="invite-toast"
          role="status"
          initial={{ y: 80, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: 80, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        >
          <span className="invite-toast-icon" aria-hidden="true">
            {top.kind === 'room' ? '🛏️' : '🛷'}
          </span>
          <Avatar person={top.from} size={44} snow={false} />
          <p>
            <strong>{top.from.name}</strong>{' '}
            {top.kind === 'room' ? 'te poziva da dijelite sobu!' : `te poziva u saonice${top.city ? ` (${top.city} → Zadar)` : ''}!`}
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              dismiss(top.id);
              navigate(top.href);
            }}
          >
            Pogledaj
          </button>
          <button type="button" className="invite-toast-x" aria-label="Zatvori" onClick={() => dismiss(top.id)}>
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
