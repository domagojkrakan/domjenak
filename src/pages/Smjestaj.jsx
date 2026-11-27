import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SubNav from '../components/SubNav.jsx';
import MeBar, { useGoingMe } from '../components/MeBar.jsx';
import PersonPicker from '../components/PersonPicker.jsx';
import Avatar from '../components/Avatar.jsx';
import Bed from '../components/Bed.jsx';
import { ask } from '../components/ConfirmHost.jsx';
import { acceptRoom, declineRoom, fetchRooms, firstName, leaveRoom, pairRoom } from '../api.js';
import { byName, everyone } from '../everyone.js';

export default function Smjestaj({ attendees, path, navigate }) {
  const me = useGoingMe(attendees);
  const [data, setData] = useState(null); // { rooms, invites }
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [party, setParty] = useState(null); // { a, b } za animaciju

  const load = useCallback(async () => {
    try {
      setData(await fetchRooms());
    } catch {
      setData((d) => d || { rooms: [], invites: [] });
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  const going = useMemo(() => new Set(attendees.map((a) => a.slug)), [attendees]);
  const people = useMemo(() => everyone(attendees), [attendees]);

  // sobe u kojima su oba cimera još prijavljena + poslani pozivi (čekaju da druga osoba potvrdi)
  const list = useMemo(() => {
    if (!data) return [];
    const rooms = data.rooms
      .filter((r) => going.has(r.a) && going.has(r.b))
      .map((r) => ({ ...r, A: people.get(r.a), B: people.get(r.b), pending: false }));
    const invites = data.invites
      .filter((i) => going.has(i.from) && people.has(i.to))
      .map((i) => ({ a: i.from, b: i.to, at: i.at, A: people.get(i.from), B: people.get(i.to), pending: true }));
    return [...rooms, ...invites];
  }, [data, going, people]);

  const roomed = useMemo(() => new Set(list.filter((r) => !r.pending).flatMap((r) => [r.a, r.b])), [list]);
  const inviting = useMemo(() => new Set(list.filter((r) => r.pending).map((r) => r.a)), [list]);
  const myRoom = me && list.find((r) => !r.pending && (r.a === me.slug || r.b === me.slug));
  const mate = myRoom && (myRoom.a === me.slug ? myRoom.B : myRoom.A);
  const myInvite = me && !myRoom && list.find((r) => r.pending && r.a === me.slug);
  const incoming = me && !myRoom && !myInvite ? list.filter((r) => r.pending && r.b === me.slug && !roomed.has(r.a)) : [];

  // koga mogu odabrati: svi koji nemaju cimera (i oni koji se još nisu prijavili)
  const candidates = useMemo(
    () =>
      me
        ? [...people.values()]
            .filter((p) => p.slug !== me.slug && !roomed.has(p.slug) && !inviting.has(p.slug))
            .sort((x, y) => Number(going.has(y.slug)) - Number(going.has(x.slug)) || byName(x, y))
        : [],
    [me, people, roomed, inviting, going]
  );
  const free = attendees.filter((a) => !roomed.has(a.slug) && !inviting.has(a.slug)).sort(byName);
  const roomCount = list.filter((r) => !r.pending).length;

  const run = async (fn) => {
    setBusy(true);
    setError('');
    try {
      const res = await fn();
      await load();
      return res;
    } catch (e) {
      setError(e.message);
      load();
      return null;
    } finally {
      setBusy(false);
    }
  };

  const pick = async (p) => {
    const res = await run(() => pairRoom(me.slug, p.slug));
    if (res?.room) setParty({ a: me, b: p });
  };
  const accept = async (r) => {
    const res = await run(() => acceptRoom(me.slug, r.a));
    if (res?.room) setParty({ a: me, b: r.A });
  };
  const leave = async () => {
    const q = mate
      ? { title: 'Raskinuti sobu?', text: `${mate.name} će ostati bez cimera.`, ok: 'Raskini sobu', cancel: 'Ne, ostajemo' }
      : { title: 'Povući poziv?', text: `${myInvite.B.name} više neće dobiti zahtjev za sobu.`, ok: 'Povuci poziv' };
    if (await ask({ icon: '🛏️', danger: true, ...q })) run(() => leaveRoom(me.slug));
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
        <p className="list-hint">Odaberi cimera. Ako se još nije prijavio/la, dobit će zahtjev za sobu čim se prijavi.</p>
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
                <button type="button" className="btn-ghost danger" onClick={leave} disabled={busy}>
                  Raskini sobu
                </button>
              </div>
            </>
          ) : myInvite ? (
            <>
              <h2>Poziv je poslan 📨</h2>
              <Bed a={me} b={myInvite.B} pending />
              <p className="my-room-text">
                {going.has(myInvite.b) ? (
                  <>
                    Čekamo da <strong>{myInvite.B.name}</strong> potvrdi sobu.
                  </>
                ) : (
                  <>
                    <strong>{myInvite.B.name}</strong> se još nije prijavio/la. Čim se prijavi, dobit će zahtjev da potvrdi
                    sobu s tobom.
                  </>
                )}
              </p>
              <div className="trip-actions">
                <button type="button" className="btn-ghost danger" onClick={leave} disabled={busy}>
                  Povuci poziv
                </button>
              </div>
            </>
          ) : (
            <>
              {incoming.map((r) => (
                <div key={r.a} className="invite-box">
                  <Avatar person={r.A} size={56} snow={false} />
                  <p>
                    <strong>{r.A.name}</strong> te poziva da dijelite sobu! 🛏️
                  </p>
                  <div className="invite-actions">
                    <button type="button" className="btn-primary" disabled={busy} onClick={() => accept(r)}>
                      Prihvati
                    </button>
                    <button
                      type="button"
                      className="btn-ghost"
                      disabled={busy}
                      onClick={() => run(() => declineRoom(me.slug, r.a))}
                    >
                      Odbij
                    </button>
                  </div>
                </div>
              ))}
              <h2>{incoming.length ? 'Ili odaberi nekog drugog' : 'Odaberi cimera'}</h2>
              <p className="muted">Možeš odabrati i kolegu koji se još nije prijavio. Dobit će zahtjev kad se prijavi.</p>
              <PersonPicker
                people={candidates}
                onPick={pick}
                busy={busy}
                placeholder="Upiši ime cimera…"
                empty="Trenutno nema slobodnih cimera. 🙂"
                note={(p) => (going.has(p.slug) ? '' : '📨 dobit će poziv')}
              />
            </>
          )}
          {error && <p className="error">{error}</p>}
        </section>
      )}

      <section className="trip-section">
        <h2 className="trip-title">
          Sobe <span className="trip-count">{roomCount}</span>
        </h2>
        {data === null ? (
          <p className="empty">Učitavam sobe… ❄</p>
        ) : !list.length ? (
          <p className="empty">Još nitko nije odabrao cimera. Budi prvi! 🛏️</p>
        ) : (
          <>
            <ul className="room-grid">
              {list.map((r, i) => {
                const mine = me && (r.a === me.slug || r.b === me.slug);
                return (
                  <motion.li
                    key={`${r.a}--${r.b}`}
                    className={`room-card ${mine ? 'mine' : ''} ${r.pending ? 'pending' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.05 }}
                  >
                    <span className="room-no">{r.pending ? '📨 Čeka potvrdu' : `Soba ${i + 1}`}</span>
                    <Bed a={r.A} b={r.B} pending={r.pending} className="bed-small" />
                    <p>
                      {firstName(r.A.name)} <span aria-hidden="true">&</span> {firstName(r.B.name)}
                    </p>
                  </motion.li>
                );
              })}
            </ul>

            <div className="table-wrap">
              <table className="trip-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cimer 1</th>
                    <th>Cimer 2</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r, i) => (
                    <tr key={`${r.a}--${r.b}`} className={me && (r.a === me.slug || r.b === me.slug) ? 'mine' : ''}>
                      <td>{i + 1}</td>
                      <td>
                        <span className="cell-person">
                          <Avatar person={r.A} size={30} snow={false} /> {r.A.name}
                        </span>
                      </td>
                      <td>
                        <span className="cell-person">
                          <Avatar person={r.B} size={30} snow={false} muted={r.pending} /> {r.B.name}
                        </span>
                      </td>
                      <td>
                        {r.pending ? (
                          <span className="status pending">📨 čeka potvrdu</span>
                        ) : (
                          <span className="status ok">✓ potvrđeno</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {data !== null && free.length > 0 && (
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
