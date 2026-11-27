import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';

// Saonice s putnicima: prvi je vozač, ostala mjesta su prazna ili zauzeta.
export default function RideSleigh({ people, seats = 4, play = false, className = '' }) {
  const slots = Array.from({ length: seats }, (_, i) => people[i] || null);
  return (
    <motion.div
      className={`ride-sleigh ${seats > 4 ? 'van' : ''} ${play ? 'play' : ''} ${className}`}
      {...(play
        ? { initial: { x: '-120%' }, animate: { x: 0 }, transition: { type: 'spring', stiffness: 70, damping: 14 } }
        : {})}
    >
      <div className="rs-seats" style={{ '--n': seats > 4 ? Math.ceil(seats / 2) : seats }}>
        {slots.map((p, i) => (
          <motion.span
            key={i}
            className={`rs-seat ${p ? '' : 'rs-open'} ${i === 0 ? 'driver' : ''}`}
            {...(play && p
              ? {
                  initial: { y: -60, opacity: 0 },
                  animate: { y: 0, opacity: 1 },
                  transition: { delay: 0.9 + i * 0.25, type: 'spring', stiffness: 300, damping: 14 },
                }
              : {})}
          >
            {p ? (
              <Avatar person={p} size={60} snow={false} className="avatar-fluid" muted={p.pending} />
            ) : (
              <span className="rs-empty">+</span>
            )}
            {p?.pending && (
              <span className="rs-pending" title="Čeka potvrdu">
                📨
              </span>
            )}
            {i === 0 && p && (
              <span className="rs-wheel" aria-label="vozač" title="Vozač">
                🚗
              </span>
            )}
          </motion.span>
        ))}
      </div>
      <svg className="rs-body" viewBox="0 0 320 110" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="rs-red" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f0444f" />
            <stop offset="1" stopColor="#b3122a" />
          </linearGradient>
        </defs>
        <path d="M10 8 H292 Q312 8 312 30 Q312 66 274 70 H34 Q10 70 10 44 Z" fill="url(#rs-red)" />
        <path d="M18 20 H300" stroke="#ffd166" strokeWidth="4" strokeLinecap="round" />
        <path d="M18 56 H292" stroke="#ffd166" strokeWidth="2.5" strokeDasharray="4 7" strokeLinecap="round" />
        <path d="M60 70 V88 M250 70 V88" stroke="#d9a63a" strokeWidth="6" strokeLinecap="round" />
        <path d="M6 92 H296 Q318 92 316 76" stroke="#ffd166" strokeWidth="7" fill="none" strokeLinecap="round" />
      </svg>
    </motion.div>
  );
}
