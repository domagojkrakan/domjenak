import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import SubNav from '../components/SubNav.jsx';
import MeBar, { useGoingMe } from '../components/MeBar.jsx';
import Avatar from '../components/Avatar.jsx';
import RideSleigh from '../components/RideSleigh.jsx';
import PersonPicker from '../components/PersonPicker.jsx';
import { byName, everyone } from '../everyone.js';
import { CITIES, CITY_BY_ID } from '../../lib/cities.js';
import {
  cancelRide,
  createRide,
  declineRide,
  dropFromRide,
  fetchRides,
  firstName,
  inviteToRide,
  joinRide,
  leaveRide,
  mjesta,
} from '../api.js';

const CITY_OPTIONS = [...CITIES].sort((a, b) => a.name.localeCompare(b.name, 'hr'));
const cityName = (id) => CITY_BY_ID.get(id)?.name || id;

function OfferForm({ me, onDone }) {
  const [city, setCity] = useState('');
  const [seats, setSeats] = useState(4);
  const [when, setWhen] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!city) return setError('Odaberi grad iz kojeg krećeš.');
    setBusy(true);
    setError('');
    try {
      await createRide({ me: me.slug, city, seats, when, note });
      onDone(city);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="offer-form" onSubmit={submit}>
      <label>
        <span>Krećem iz</span>
        <select value={city} onChange={(e) => setCity(e.target.value)} required>
          <option value="">Odaberi grad…</option>
          {CITY_OPTIONS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <div className="offer-seats">
        <span>Koliko nas ide u auto (s tobom)?</span>
        <div className="seat-toggle" role="radiogroup">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={seats === n}
              className={seats === n ? 'on' : ''}
              onClick={() => setSeats(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>
      <label>
        <span>Polazak</span>
        <input value={when} onChange={(e) => setWhen(e.target.value)} maxLength={60} placeholder="npr. 10.12. u 13:00 ispred Arene" />
      </label>
      <label>
        <span>Napomena</span>
        <input value={note} onChange={(e) => setNote(e.target.value)} maxLength={120} placeholder="npr. imam mjesta za prtljagu, pjevamo cijelim putem 🎶" />
      </label>
      {error && <p className="error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? 'Šaljem…' : '🛷 Nudim prijevoz do Zadra'}
      </button>
    </form>
  );
}

export default function Prijevoz({ attendees, path, navigate }) {
  const me = useGoingMe(attendees);
  const [rides, setRides] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [offering, setOffering] = useState(false);
  const [adding, setAdding] = useState(false);
  const [party, setParty] = useState(null); // vozač čije saonice slavimo

  const load = useCallback(async () => {
    try {
      const list = await fetchRides();
      setRides(list);
      return list;
    } catch {
      setRides((r) => r || []);
      return null;
    }
  }, []);
  useEffect(() => {
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [load]);

  const going = useMemo(() => new Set(attendees.map((a) => a.slug)), [attendees]);
  const people = useMemo(() => everyone(attendees), [attendees]);
  const list = useMemo(
    () =>
      (rides || [])
        .filter((r) => going.has(r.driver))
        .map((r) => {
          const P = r.passengers.filter((s) => going.has(s)).map((s) => people.get(s));
          const I = r.invited.filter((s) => people.has(s)).map((s) => ({ ...people.get(s), pending: true }));
          return { ...r, D: people.get(r.driver), P, I, all: [people.get(r.driver), ...P, ...I], free: Math.max(0, r.seats - 1 - P.length - I.length) };
        }),
    [rides, going, people]
  );
  const myDrive = me && list.find((r) => r.driver === me.slug);
  const myRide = me && !myDrive && list.find((r) => r.passengers.includes(me.slug));
  const incoming = me && !myDrive && !myRide ? list.filter((r) => r.invited.includes(me.slug)) : [];
  const seated = useMemo(() => new Set(list.flatMap((r) => [r.driver, ...r.P.map((p) => p.slug)])), [list]);
  const invitedAny = useMemo(() => new Set(list.flatMap((r) => r.invited)), [list]);
  const walking = attendees.filter((a) => !seated.has(a.slug)).sort(byName);
  const freeSeats = list.reduce((n, r) => n + r.free, 0);

  // koga vozač može dodati: svi koji još nemaju prijevoz (i oni koji se nisu prijavili)
  const candidates = useMemo(
    () =>
      myDrive
        ? [...people.values()]
            .filter((p) => !seated.has(p.slug) && !myDrive.invited.includes(p.slug))
            .sort((x, y) => Number(going.has(y.slug)) - Number(going.has(x.slug)) || byName(x, y))
        : [],
    [myDrive, people, seated, going]
  );

  const act = async (fn, after) => {
    setBusy(true);
    setError('');
    try {
      await fn();
      await load();
      after?.();
    } catch (e) {
      setError(e.message);
      load();
    } finally {
      setBusy(false);
    }
  };
  const join = (r) => act(() => joinRide(me.slug, r.driver), () => setParty(r.driver));
  const partyRide = party && list.find((r) => r.driver === party);

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
          <span className="dot" /> Prijevoz · do 4 osobe po saonicama
        </p>
        <h1>Saonice za Zadar 🛷</h1>
        <p className="list-hint">
          Imaš auto? Ponudi prijevoz i pozovi kolege. Nemaš? Uskoči nekome u saonice. Svi idemo u Zadar! 🎄
        </p>
        <div className="map-legend">
          <span>
            <b>{list.length}</b> {list.length === 1 ? 'vožnja' : list.length >= 2 && list.length <= 4 ? 'vožnje' : 'vožnji'}
          </span>
          <span>
            <b>{freeSeats}</b> {mjesta(freeSeats)}
          </span>
          <span>
            <b>{walking.length}</b> još bez prijevoza
          </span>
        </div>
      </motion.header>

      <MeBar attendees={attendees} navigate={navigate} />

      {me && (
        <section className="card trip-card">
          <div className="card-snow" aria-hidden="true" />
          {myDrive ? (
            <>
              <h2>Tvoja vožnja: {cityName(myDrive.city)} → Zadar 🚗</h2>
              <RideSleigh people={myDrive.all} seats={myDrive.seats} />
              {myDrive.P.length + myDrive.I.length > 0 ? (
                <ul className="crew">
                  {[...myDrive.P, ...myDrive.I].map((p) => (
                    <li key={p.slug} className={p.pending ? 'pending' : ''}>
                      <Avatar person={p} size={30} snow={false} muted={p.pending} />
                      <span className="crew-name">
                        {p.name}
                        {p.pending && <small>{going.has(p.slug) ? ' · čeka potvrdu' : ' · čeka prijavu'}</small>}
                      </span>
                      <button
                        type="button"
                        className="crew-x"
                        title={p.pending ? 'Povuci poziv' : 'Makni iz saonica'}
                        disabled={busy}
                        onClick={() => window.confirm(`Maknuti osobu ${p.name} iz saonica?`) && act(() => dropFromRide(me.slug, p.slug))}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="my-room-text">Još nitko nije uskočio. Pozovi kolege!</p>
              )}
              {myDrive.free > 0 &&
                (adding ? (
                  <div className="crew-add">
                    <h3>Dodaj kolegu u saonice</h3>
                    <p className="muted">Prijavljeni odmah sjedaju, a ostali dobivaju poziv kad se prijave.</p>
                    <PersonPicker
                      people={candidates}
                      busy={busy}
                      placeholder="Upiši ime kolege…"
                      note={(p) => (going.has(p.slug) ? '' : '📨 dobit će poziv')}
                      onPick={(p) => act(() => inviteToRide(me.slug, p.slug), () => setAdding(false))}
                    />
                    <button type="button" className="link" onClick={() => setAdding(false)}>
                      Gotovo
                    </button>
                  </div>
                ) : (
                  <p className="my-room-text">
                    Još {myDrive.free} {mjesta(myDrive.free)}.
                  </p>
                ))}
              <div className="trip-actions">
                {myDrive.free > 0 && !adding && (
                  <button type="button" className="btn-primary" onClick={() => setAdding(true)}>
                    + Dodaj kolegu
                  </button>
                )}
                <button
                  type="button"
                  className="btn-ghost danger"
                  disabled={busy}
                  onClick={() => window.confirm('Sigurno otkazuješ vožnju? Putnici će ostati bez prijevoza.') && act(() => cancelRide(me.slug))}
                >
                  Otkaži vožnju
                </button>
              </div>
            </>
          ) : myRide ? (
            <>
              <h2>Voziš se: {cityName(myRide.city)} → Zadar 🛷</h2>
              <p className="muted">Vozač: {myRide.D.name}</p>
              <RideSleigh people={myRide.all} seats={myRide.seats} />
              {myRide.when && <p className="my-room-text">Polazak: {myRide.when}</p>}
              <div className="trip-actions">
                <button
                  type="button"
                  className="btn-ghost danger"
                  disabled={busy}
                  onClick={() => window.confirm('Sigurno izlaziš iz saonica?') && act(() => leaveRide(me.slug))}
                >
                  Izađi iz saonica
                </button>
              </div>
            </>
          ) : offering ? (
            <>
              <h2>Nudim prijevoz</h2>
              <OfferForm
                me={me}
                onDone={async () => {
                  setOffering(false);
                  await load();
                  setParty(me.slug);
                }}
              />
              <button type="button" className="link" onClick={() => setOffering(false)}>
                Odustani
              </button>
            </>
          ) : (
            <>
              {incoming.map((r) => (
                <div key={r.driver} className="invite-box">
                  <Avatar person={r.D} size={56} snow={false} />
                  <p>
                    <strong>{r.D.name}</strong> te poziva u saonice: {cityName(r.city)} → Zadar! 🛷
                    {r.when && <small> Polazak: {r.when}</small>}
                  </p>
                  <div className="invite-actions">
                    <button type="button" className="btn-primary" disabled={busy} onClick={() => join(r)}>
                      Uskoči
                    </button>
                    <button type="button" className="btn-ghost" disabled={busy} onClick={() => act(() => declineRide(me.slug, r.driver))}>
                      Odbij
                    </button>
                  </div>
                </div>
              ))}
              <h2>Kako ideš u Zadar?</h2>
              <div className="trip-choice">
                <button type="button" className="choice-btn" onClick={() => setOffering(true)}>
                  <span aria-hidden="true">🚗</span>
                  <b>Imam auto</b>
                  <small>Ponudi mjesta i pozovi kolege</small>
                </button>
                <a href="#voznje" className="choice-btn">
                  <span aria-hidden="true">🙋</span>
                  <b>Trebam prijevoz</b>
                  <small>Uskoči u nečije saonice</small>
                </a>
              </div>
            </>
          )}
          {error && <p className="error">{error}</p>}
        </section>
      )}

      <section className="trip-section" id="voznje">
        <h2 className="trip-title">
          Vožnje <span className="trip-count">{list.length}</span>
        </h2>
        {rides === null ? (
          <p className="empty">Učitavam vožnje… ❄</p>
        ) : !list.length ? (
          <p className="empty">Još nitko ne nudi prijevoz. Imaš auto? Budi prvi! 🚗</p>
        ) : (
          <>
            <ul className="ride-grid">
              {list.map((r, i) => {
                const mine = myDrive === r || myRide === r;
                const canJoin = me && !myDrive && !myRide && (r.free > 0 || r.invited.includes(me.slug));
                return (
                  <motion.li
                    key={r.driver}
                    className={`ride-card ${mine ? 'mine' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i, 12) * 0.05 }}
                  >
                    <div className="ride-route">
                      <b>{cityName(r.city)}</b>
                      <span className="ride-arrow" aria-hidden="true" />
                      <b>Zadar</b>
                    </div>
                    <RideSleigh people={r.all} seats={r.seats} className="small" />
                    <p className="ride-driver">
                      Vozi <strong>{r.D.name}</strong>
                    </p>
                    {r.when && <p className="ride-meta">🕑 {r.when}</p>}
                    {r.note && <p className="ride-meta">💬 {r.note}</p>}
                    <div className="ride-foot">
                      <span className={`ride-free ${r.free ? '' : 'full'}`}>
                        {r.free ? `${r.free} ${mjesta(r.free)}` : 'Puno 🛷'}
                      </span>
                      {canJoin && (
                        <button type="button" className="btn-primary" disabled={busy} onClick={() => join(r)}>
                          Uskoči!
                        </button>
                      )}
                    </div>
                  </motion.li>
                );
              })}
            </ul>

            <div className="table-wrap">
              <table className="trip-table">
                <thead>
                  <tr>
                    <th>Vozač</th>
                    <th>Polazi iz</th>
                    <th>Polazak</th>
                    <th>Putnici</th>
                    <th>Slobodno</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((r) => (
                    <tr key={r.driver} className={myDrive === r || myRide === r ? 'mine' : ''}>
                      <td>
                        <span className="cell-person">
                          <Avatar person={r.D} size={30} snow={false} /> {r.D.name}
                        </span>
                      </td>
                      <td>{cityName(r.city)} → Zadar</td>
                      <td>{r.when || '—'}</td>
                      <td>
                        {r.P.length + r.I.length
                          ? [...r.P.map((p) => p.name), ...r.I.map((p) => `${p.name} (čeka)`)].join(', ')
                          : '—'}
                      </td>
                      <td>
                        {r.free}/{r.seats - 1}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {rides !== null && walking.length > 0 && (
          <div className="waiting-list">
            <h2>Još bez prijevoza ({walking.length})</h2>
            <div className="waiting-row">
              {walking.map((p) => (
                <span key={p.slug} className="waiting-item" title={invitedAny.has(p.slug) ? `${p.name} · ima poziv` : p.name}>
                  <Avatar person={p} size={40} snow={false} />
                </span>
              ))}
            </div>
          </div>
        )}
      </section>

      {createPortal(
        <AnimatePresence>
          {partyRide && (
            <motion.div
              key="ride-party"
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
                <div className="trip-modal-road">
                  <RideSleigh people={partyRide.all} seats={partyRide.seats} play />
                </div>
                <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.8 }}>
                  {partyRide.driver === me?.slug ? 'Saonice su spremne! 🚗' : 'Dobrodošao/la u saonice! 🛷'}
                </motion.h2>
                <motion.p className="muted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>
                  {cityName(partyRide.city)} → Zadar. Vežite pojaseve, sobovi kreću! 🦌
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
