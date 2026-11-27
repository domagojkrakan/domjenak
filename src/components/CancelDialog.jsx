import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { cancelRsvp, firstName } from '../api.js';
import { getMe, setMe } from '../me.js';

// Otkazivanje dolaska: potvrda -> "Žao nam je".
export default function CancelDialog({ person, onCancelled, onClose }) {
  const [stage, setStage] = useState('confirm'); // confirm | done
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const name = firstName(person.name);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onClose]);

  const confirm = async () => {
    setBusy(true);
    setError('');
    try {
      await cancelRsvp(person.slug);
      onCancelled(person.slug);
      if (getMe()?.slug === person.slug) setMe(null);
      setStage('done');
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      className="modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => e.target === e.currentTarget && !busy && onClose()}
    >
      <motion.div
        className="done-card cancel-card"
        role="dialog"
        aria-modal="true"
        initial={{ opacity: 0, y: 30, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      >
        <div className="card-snow" aria-hidden="true" />
        <AnimatePresence mode="wait" initial={false}>
          {stage === 'confirm' ? (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Avatar person={person} size={96} />
              <h2>Ipak ne možeš doći, {name}?</h2>
              <p className="done-text">Maknut ćemo te s popisa dolazaka na božićni domjenak.</p>
              {error && <p className="error">{error}</p>}
              <div className="done-actions">
                <button className="btn-danger" onClick={confirm} disabled={busy}>
                  {busy ? 'Otkazujem…' : 'Da, otkaži dolazak'}
                </button>
                <button className="btn-primary" onClick={onClose} disabled={busy}>
                  Ne, ipak dolazim! 🎄
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="done" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <div className="sad-avatar">
                <Avatar person={person} size={96} className="melting" />
                <span className="sad-tear" aria-hidden="true">
                  💧
                </span>
              </div>
              <p className="ho-title sad-title">Žao nam je!</p>
              <h2>Falit ćeš nam, {name}! 😢</h2>
              <p className="done-text">
                Otkazali smo tvoj dolazak. Ako se predomisliš, Djed Božićnjak uvijek ima mjesta u saonicama — samo se
                ponovno prijavi.
              </p>
              <div className="done-actions">
                <button className="btn-ghost" onClick={onClose}>
                  Zatvori
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
