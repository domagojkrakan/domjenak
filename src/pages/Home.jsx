import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import RsvpCard from '../components/RsvpCard.jsx';
import SuccessAnimation from '../components/SuccessAnimation.jsx';
import Countdown from '../components/Countdown.jsx';
import GuestsButton from '../components/GuestsButton.jsx';
import TitleLights from '../components/TitleLights.jsx';
import { rsvp } from '../api.js';
import { setMe } from '../me.js';

export default function Home({ attendees, onRegistered, navigate, onCancel }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // { person, already }

  const submit = async (person) => {
    setBusy(true);
    setError('');
    try {
      const res = await rsvp(person);
      onRegistered(res.entry);
      setMe({ slug: res.entry.slug, name: res.entry.name, photo: res.entry.photo });
      setDone({ person: { ...person, photo: res.entry.photo }, already: res.already });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <LayoutGroup>
      <main className="home">
        <motion.section
          className="hero"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h1 className="xmas-title">
            <TitleLights />
            <span className="xmas-title-text">Božićni domjenak</span>
          </h1>
          <div className="meta">
            <span className="chip chip-red">📅 Četvrtak, 10.12.</span>
            <span className="chip chip-green">📍 Zadar · HQ ured</span>
          </div>
          <Countdown />
          <p className="lead">
            Ho-ho-ho! 🎄 Javi nam da dolaziš, a sve dodatne informacije stižu uskoro.
          </p>
        </motion.section>

        <AnimatePresence mode="wait">
          {!done && (
            <RsvpCard
              key="card"
              attendees={attendees}
              onSubmit={submit}
              busy={busy}
              error={error}
              onShowList={() => navigate('/popis')}
              onCancel={onCancel}
            />
          )}
        </AnimatePresence>

        {!done && <GuestsButton attendees={attendees} onClick={() => navigate('/popis')} />}
        {!done && (
          <div className="trip-links">
            <button type="button" className="trip-link trip-link-bed" onClick={() => navigate('/smjestaj')}>
              <span className="trip-link-icon" aria-hidden="true">🛏️</span>
              <span>
                <b>Smještaj</b>
                <small>Odaberi cimera za sobu</small>
              </span>
            </button>
            <button type="button" className="trip-link trip-link-ride" onClick={() => navigate('/prijevoz')}>
              <span className="trip-link-icon" aria-hidden="true">🛷</span>
              <span>
                <b>Prijevoz</b>
                <small>Saonice za Zadar</small>
              </span>
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {done && (
          <SuccessAnimation
            key="success"
            person={done.person}
            already={done.already}
            onShowList={() => navigate('/popis')}
            navigate={navigate}
            onClose={() => setDone(null)}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
