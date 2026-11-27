import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Sleigh from './Sleigh.jsx';
import Avatar from './Avatar.jsx';
import { jingle } from '../sound.js';
import { firstName } from '../api.js';

// Faze: spot -> arrive -> ho -> pickup -> away -> done
const TIMELINE = [
  ['arrive', 500],
  ['ho', 2300],
  ['pickup', 3700],
  ['away', 4700],
  ['done', 6300],
];

const RIG = {
  spot: { x: '-115vw', y: '-55vh', rotate: -16, scale: 0.55 },
  arrive: { x: 0, y: '-10vh', rotate: 0, scale: 1, transition: { duration: 1.8, ease: [0.16, 0.84, 0.3, 1] } },
  ho: { x: 0, y: '-10vh', rotate: 0, scale: 1 },
  pickup: { x: 0, y: '-10vh', rotate: 0, scale: 1 },
  away: { x: '120vw', y: '-85vh', rotate: -14, scale: 0.5, transition: { duration: 1.7, ease: [0.55, 0, 0.8, 0.4] } },
  done: { x: '120vw', y: '-85vh', rotate: -14, scale: 0.5 },
};

const at = (phase, list) => list.includes(phase);

export default function SuccessAnimation({ person, already, onShowList, onClose }) {
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = useState(reduced ? 'done' : 'spot');

  useEffect(() => {
    if (reduced) return;
    const timers = TIMELINE.map(([p, ms]) => setTimeout(() => setPhase(p), ms));
    timers.push(setTimeout(() => jingle(1.4), 600));
    return () => timers.forEach(clearTimeout);
  }, [reduced]);

  useEffect(() => {
    if (phase === 'ho') jingle(0.8);
  }, [phase]);

  const inSleigh = at(phase, ['pickup', 'away', 'done']);
  const name = firstName(person.name);

  return (
    <motion.div className="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="success-dim" />

      {/* osoba čeka na sredini */}
      <AnimatePresence>
        {!inSleigh && (
          <motion.div
            className="waiting"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
          >
            <div className="waiting-glow" />
            <motion.div layoutId="picked-avatar" className="waiting-avatar" transition={{ duration: 0.9, ease: [0.3, 0.9, 0.3, 1] }}>
              <Avatar person={person} size={120} />
            </motion.div>
            <p className="waiting-name">{person.name}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* saonice */}
      <motion.div className="rig" initial={RIG.spot} animate={RIG[phase]}>
        <div className="rig-bob">
          <div className={`trail ${at(phase, ['arrive', 'away']) ? 'on' : ''}`} aria-hidden="true">
            {Array.from({ length: 16 }, (_, i) => (
              <span key={i} style={{ '--i': i }} />
            ))}
          </div>
          <Sleigh
            className="sleigh-big"
            passenger={
              inSleigh ? (
                <motion.div layoutId="picked-avatar" transition={{ duration: 0.9, ease: [0.3, 0.9, 0.3, 1] }}>
                  <Avatar person={person} size={64} className="avatar-fluid" />
                </motion.div>
              ) : null
            }
          />
          <AnimatePresence>
            {at(phase, ['ho', 'pickup']) && (
              <motion.div
                className="ho-bubble"
                initial={{ opacity: 0, scale: 0.3, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -4 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ type: 'spring', stiffness: 320, damping: 14 }}
              >
                {['Ho', 'ho', 'ho!'].map((w, i) => (
                  <motion.span key={i} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.15 + i * 0.22, type: 'spring', stiffness: 400, damping: 12 }}>
                    {w}
                  </motion.span>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* završna poruka */}
      <AnimatePresence>
        {phase === 'done' && (
          <motion.div
            className="done-card"
            initial={{ opacity: 0, y: 40, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 160, damping: 18 }}
            role="dialog"
            aria-live="polite"
          >
            <div className="card-snow" aria-hidden="true" />
            <div className="done-avatar">
              <Avatar person={person} size={96} />
              <span className="done-hat" aria-hidden="true">
                🎅
              </span>
            </div>
            <p className="ho-title">Ho ho ho!</p>
            <h2>Vidimo se na božićnom domjenku, {name}!</h2>
            <p className="done-text">
              {already ? 'Već si na popisu, ali dvaput je još bolje! ' : 'Drago nam je da dolaziš. '}
              Djed Božićnjak te upisao na popis. 🎄
            </p>
            <div className="done-meta">
              <span>📅 Četvrtak, 10. prosinca</span>
              <span>📍 Zadar · HQ ured</span>
            </div>
            <p className="done-small">Sve dodatne informacije stižu uskoro.</p>
            <div className="done-actions">
              <button className="btn-primary" onClick={onShowList}>
                Pogledaj tko sve dolazi →
              </button>
              <button className="btn-ghost" onClick={onClose}>
                Zatvori
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {phase !== 'done' && (
        <button className="skip" onClick={() => setPhase('done')}>
          Preskoči
        </button>
      )}
    </motion.div>
  );
}
