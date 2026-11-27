import { useEffect, useMemo, useState } from 'react';
import { animate, motion } from 'framer-motion';
import { PEOPLE } from '../people.js';
import Avatar from '../components/Avatar.jsx';
import { osoba } from '../api.js';

function Counter({ value }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const c = animate(0, value, { duration: 1.4, ease: [0.2, 0.8, 0.2, 1], onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [value]);
  return <span>{n}</span>;
}


export default function Attendees({ attendees, loading, navigate, onCancel, subnav }) {
  const sorted = useMemo(() => [...attendees].sort((a, b) => a.name.localeCompare(b.name, 'hr')), [attendees]);
  const going = useMemo(() => new Set(attendees.map((a) => a.slug)), [attendees]);
  const waiting = PEOPLE.filter((p) => !going.has(p.slug));
  const total = PEOPLE.length;
  const pct = Math.min(100, Math.round((attendees.filter((a) => a.photo).length / total) * 100));

  return (
    <main className="list-page">
      {subnav}
      <motion.header
        className="list-head"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
      >
        <p className="eyebrow">
          <span className="dot" /> Božićni domjenak · 10.12. · Zadar
        </p>
        <h1>Tko dolazi?</h1>
        <div className="big-count">
          <span className="big-num">
            <Counter value={attendees.length} />
          </span>
          <span className="big-label">
            {osoba(attendees.length)}
            <small>od {total} kolega na popisu</small>
          </span>
        </div>
        <p className="list-hint">Ipak ne možeš doći? Klikni na svoje ime i otkaži dolazak.</p>
        <div className="garland" aria-hidden="true">
          <div className="garland-fill" style={{ width: `${pct}%` }} />
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className={`g-bulb ${(i + 0.5) / 24 <= pct / 100 ? 'on' : ''}`} style={{ '--i': i }} />
          ))}
        </div>
      </motion.header>

      {loading && !attendees.length ? (
        <p className="empty">Učitavam popis… ❄</p>
      ) : !attendees.length ? (
        <div className="empty">
          <p>Još nitko nije potvrdio dolazak. Budi prvi! 🎅</p>
          <button className="btn-primary" onClick={() => navigate('/')}>
            Prijavi se
          </button>
        </div>
      ) : (
        <ul className="people-grid">
          {sorted.map((a, i) => (
            <motion.li
              key={a.slug}
              layout
              initial={{ opacity: 0, y: 24, scale: 0.85 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.25 + Math.min(i, 30) * 0.04, type: 'spring', stiffness: 220, damping: 18 }}
            >
              <button type="button" className="person" onClick={() => onCancel(a)} title="Klikni za otkazivanje dolaska">
                <Avatar person={a} size={96} />
                <span className="person-name">{a.name}</span>
                <span className="person-cancel">Otkaži dolazak</span>
              </button>
            </motion.li>
          ))}
        </ul>
      )}

      {attendees.length > 0 && waiting.length > 0 && (
        <section className="waiting-list">
          <h2>Još čekamo da se jave ({waiting.length})</h2>
          <div className="waiting-row">
            {waiting.map((p) => (
              <span key={p.slug} className="waiting-item" title={p.name}>
                <Avatar person={p} size={40} snow={false} muted />
              </span>
            ))}
          </div>
          <button className="btn-ghost" onClick={() => navigate('/')}>
            Još nisi na popisu? Prijavi se →
          </button>
        </section>
      )}
    </main>
  );
}
