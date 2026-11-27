import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SubNav from '../components/SubNav.jsx';
import MeBar, { useGoingMe } from '../components/MeBar.jsx';
import PersonPicker from '../components/PersonPicker.jsx';
import Avatar from '../components/Avatar.jsx';
import Bed from '../components/Bed.jsx';
import { fetchRooms, firstName, leaveRoom, pairRoom } from '../api.js';

export default function Smjestaj({ attendees, path, navigate }) {
  const me = useGoingMe(attendees);
  const [rooms, setRooms] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [party, setParty] = useState(null); // { a, b } za animaciju

  const load = useCallback(async () => {
    try {
      setRooms(await fetchRooms());
    } catch {
      setRooms((r) => r || []);
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  const bySlug = useMemo(() => new Map(attendees.map((a) => [a.slug, a])), [attendees]);
  // samo sobe u kojima su oba cimera još prijavljena
  const list = useMemo(
    () => (rooms || []).filter((r) => bySlug.has(r.a) && bySlug.has(r.b)).map((r) => ({ ...r, A: bySlug.get(r.a), B: bySlug.get(r.b) })),
    [rooms, bySlug]
  );
  const roomed = useMemo(() => new Set(list.flatMap((r) => [r.a, r.b])), [list]);
  const myRoom = me && list.find((r) => r.a === me.slug || r.b === me.slug);
  const mate = myRoom && (myRoom.a === me.slug ? myRoom.B : myRoom.A);
  const free = useMemo(
    () => attendees.filter((a) => !roomed.has(a.slug)).sort((x, y) => x.name.localeCompare(y.name, 'hr')),
    [attendees, roomed]
  );
  const freeForMe = me ? free.filter((a) => a.slug !== me.slug) : [];

  const pick = async (p) => {
    setBusy(true);
    setError('');
    try {
      await pairRoom(me.slug, p.slug);
      setParty({ a: me, b: p });
      await load();
    } catch (e) {
      setError(e.message);
      load();
    } finally {
      setBusy(false);
    }
  };

  const leave = async () => {
    if (!window.confirm(`Sigurno želiš raskinuti sobu s osobom ${mate.name}?`)) return;
    setBusy(true);
    setError('');
    try {
      await leaveRoom(me.slug);
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="list-page trip-page">
      <SubNav path={path} navigate={navigate} />
      <motion.header
        className="list-head trip-head"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">
          <span className="dot" /> Smještaj u Zadru · po dvoje u sobi
        </p>
        <h1>S kim spavaš? 🛏️</h1>
        <p className="list-hint">Odaberi cimera s kojim dijeliš sobu. Kad oboje budete na popisu, soba je vaša.</p>
      </motion.header>

      <MeBar attendees={attendees} navigate={navigate} />

      {me && (
        <section className="card trip-card my-room">
          <div className="card-snow" aria-hidden="true" />
          {mate ? (
            <>
              <h2>Tvoja soba</h2>
              <Bed a={me} b={mate} />
              <p className="my-room-text">
                Ti i <strong>{mate.name}</strong> dijelite sobu. Laku noć! 🌙
              </p>
              <div className="trip-actions">
                <button type="button" className="btn-ghost" onClick={() => setParty({ a: me, b: mate })}>
                  Pusti animaciju ✨
                </button>
                <button type="button" className="btn-ghost danger" onClick={leave} disabled={busy}>
                  Raskini sobu
                </button>
              </div>
            </>
          ) : (
            <>
              <h2>Odaberi cimera</h2>
              <p className="muted">Ovdje su kolege koji su prijavljeni i još nemaju cimera.</p>
              <PersonPicker
                people={freeForMe}
                onPick={pick}
                busy={busy}
                placeholder="Upiši ime cimera…"
                empty="Trenutno nema slobodnih cimera. Pričekaj da se još netko prijavi. 🙂"
              />
            </>
          )}
          {error && <p className="error">{error}</p>}
        </section>
      )}

      <section className="trip-section">
        <h2 className="trip-title">
          Sobe <span className="trip-count">{list.length}</span>
        </h2>
        {rooms === null ? (
          <p className="empty">Učitavam sobe… ❄</p>
        ) : !list.length ? (
          <p className="empty">Još nitko nije odabrao cimera. Budi prvi! 🛏️</p>
        ) : (
          <>
            <ul className="room-grid">
              {list.map((r, i) => (
                <motion.li
                  key={`${r.a}--${r.b}`}
                  className={`room-card ${myRoom === r ? 'mine' : ''}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i, 12) * 0.05 }}
                >
                  <span className="room-no">Soba {i + 1}</span>
                  <Bed a={r.A} b={r.B} className="bed-small" />
                  <p>
                    {firstName(r.A.name)} <span aria-hidden="true">&</span> {firstName(r.B.name)}
                  </p>
                </motion.li>
              ))}
            </ul>

            <div className="table-wrap">
              <table className="trip-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cimer 1</th>
                    <th>Cimer 2</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r, i) => (
                    <tr key={`${r.a}--${r.b}`} className={myRoom === r ? 'mine' : ''}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="cell-person">
                          <Avatar person={r.A} size={30} snow={false} /> {r.A.name}
                        </span>
                      </td>
                      <td>
                        <span className="cell-person">
                          <Avatar person={r.B} size={30} snow={false} /> {r.B.name}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {rooms !== null && free.length > 0 && (
          <div className="waiting-list">
            <h2>Još bez cimera ({free.length})</h2>
            <div className="waiting-row">
              {free.map((p) => (
                <span key={p.slug} className="waiting-item" title={p.name}>
                  <Avatar person={p} size={40} snow={false} />
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {createPortal(
      <AnimatePresence>
        {party && (
          <motion.div
            key="bed-party"
            className="trip-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setParty(null)}
          >
            <motion.div
              className="trip-modal"
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Bed a={party.a} b={party.b} play />
              <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 2.2 }}>
                Ti i {firstName(party.b.name)} dijelite sobu! 🛏️
              </motion.h2>
              <motion.p className="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.6 }}>
                Laku noć i bez hrkanja. 😴
              </motion.p>
              <button type="button" className="btn-primary" onClick={() => setParty(null)}>
                Super!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>,
        document.body
      )}
    </main>
  );
}
