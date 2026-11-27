import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { osoba } from '../api.js';

const BULBS = ['#E2263A', '#F5B728', '#3FA34D', '#1A9DD8', '#E2263A', '#F5B728', '#3FA34D', '#1A9DD8', '#E2263A', '#F5B728', '#3FA34D', '#1A9DD8', '#E2263A', '#F5B728'];

// Velik, božićno ukrašen gumb ispod prijave: tko sve dolazi.
export default function GuestsButton({ attendees, onClick }) {
  const n = attendees.length;
  const faces = attendees.slice(-5).reverse();

  return (
    <motion.button
      type="button"
      className="guests-btn"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
    >
      {/* lampice uz gornji rub */}
      <span className="guests-lights" aria-hidden="true">
        <svg viewBox="0 0 560 30" preserveAspectRatio="none">
          <path d="M0 6 Q40 22 80 8 T160 8 T240 8 T320 8 T400 8 T480 8 T560 6" fill="none" stroke="#1f5130" strokeWidth="2" />
        </svg>
        {BULBS.map((c, i) => (
          <i key={i} style={{ '--c': c, '--i': i, left: `${(i + 0.5) * (100 / BULBS.length)}%` }} />
        ))}
      </span>

      {/* božikovina u kutovima */}
      <svg className="guests-holly left" viewBox="0 0 40 30" aria-hidden="true">
        <path d="M20 18 C12 4 2 8 4 16 C8 14 10 20 6 22 C14 26 18 22 20 18z" fill="#3FA34D" />
        <path d="M20 18 C28 4 38 8 36 16 C32 14 30 20 34 22 C26 26 22 22 20 18z" fill="#2f8a3d" />
        <circle cx="17" cy="18" r="3.4" fill="#E2263A" />
        <circle cx="23" cy="19" r="3.4" fill="#c81d31" />
        <circle cx="20" cy="14" r="3.4" fill="#E2263A" />
      </svg>
      <svg className="guests-holly right" viewBox="0 0 40 30" aria-hidden="true">
        <path d="M20 18 C12 4 2 8 4 16 C8 14 10 20 6 22 C14 26 18 22 20 18z" fill="#3FA34D" />
        <path d="M20 18 C28 4 38 8 36 16 C32 14 30 20 34 22 C26 26 22 22 20 18z" fill="#2f8a3d" />
        <circle cx="17" cy="18" r="3.4" fill="#E2263A" />
        <circle cx="23" cy="19" r="3.4" fill="#c81d31" />
        <circle cx="20" cy="14" r="3.4" fill="#E2263A" />
      </svg>

      <span className="guests-body">
        <span className="guests-faces" aria-hidden="true">
          {faces.length ? (
            faces.map((p) => <Avatar key={p.slug} person={p} size={40} snow={false} />)
          ) : (
            <span className="guests-tree">🎄</span>
          )}
        </span>
        <span className="guests-text">
          <strong>Tko dolazi?</strong>
          <span>
            {n ? (
              <>
                <b>{n}</b> {osoba(n)} na domjenak
              </>
            ) : (
              'Još nitko — budi prvi!'
            )}
          </span>
        </span>
        <span className="guests-arrow" aria-hidden="true">
          →
        </span>
      </span>
    </motion.button>
  );
}
