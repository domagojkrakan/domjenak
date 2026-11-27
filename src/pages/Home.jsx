import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import RsvpCard from '../components/RsvpCard.jsx';
import SuccessAnimation from '../components/SuccessAnimation.jsx';
import { rsvp, daysUntil } from '../api.js';

export default function Home({ attendees, onRegistered, navigate }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(null); // { person, already }
  const days = daysUntil();

  const submit = async (person) => {
    setBusy(true);
    setError('');
    try {
      const res = await rsvp(person);
      onRegistered(res.entry);
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
          <p className="eyebrow">
            <span className="dot" /> Rentlio · Božić 2026
          </p>
          <h1>
            Božićni
            <br />
            <span className="h1-accent">domjenak</span>
          </h1>
          <div className="meta">
            <span className="chip">📅 Četvrtak, 10.12.</span>
            <span className="chip">📍 Zadar · HQ ured</span>
            {days > 0 && <span className="chip chip-green">⏳ još {days} {days % 10 === 1 && days % 100 !== 11 ? 'dan' : 'dana'}</span>}
            {days === 0 && <span className="chip chip-green">✨ Danas je dan!</span>}
          </div>
          <p className="lead">
            Drage kolegice i kolege, godina je bila velika — red je da je zajedno i zaključimo! Ovaj put slavimo u
            našem uredu u Zadru, uz dobru hranu, piće i još bolje društvo. Dodatne informacije stižu uskoro, a za
            sada nam samo javi da dolaziš — da znamo koliko kolača treba ispeći. 🍪
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
            />
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {done && (
          <SuccessAnimation
            key="success"
            person={done.person}
            already={done.already}
            onShowList={() => navigate('/popis')}
            onClose={() => setDone(null)}
          />
        )}
      </AnimatePresence>
    </LayoutGroup>
  );
}
