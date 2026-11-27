import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';

const BULBS = ['#E2263A', '#F5B728', '#3FA34D', '#1A9DD8', '#E2263A', '#F5B728', '#3FA34D', '#1A9DD8', '#E2263A'];
const SNOW = [
  [40, 150], [86, 166], [132, 148], [178, 168], [224, 150], [262, 170], [62, 178], [156, 182], [244, 184],
];

// Bračni krevet s dvoje cimera na jastucima. `play` = animacija (padnu na jastuke, navuče se deka).
export default function Bed({ a, b, play = false, pending = false, className = '' }) {
  const drop = (i) =>
    play
      ? {
          initial: { y: '-160%', opacity: 0, rotate: i ? 14 : -14 },
          animate: { y: 0, opacity: 1, rotate: 0 },
          transition: { delay: 0.35 + i * 0.45, type: 'spring', stiffness: 260, damping: 13 },
        }
      : {};
  const blanket = play
    ? {
        initial: { y: '42%' },
        animate: { y: 0 },
        transition: { delay: 1.6, duration: 0.9, ease: [0.3, 0.9, 0.3, 1] },
      }
    : {};

  return (
    <div className={`bed ${play ? 'bed-play' : ''} ${className}`}>
      {/* stražnji dio: uzglavlje, madrac, jastuci */}
      <svg className="bed-back" viewBox="0 0 300 200" aria-hidden="true">
        <defs>
          <linearGradient id="bed-wood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#9b6a45" />
            <stop offset="1" stopColor="#6b4129" />
          </linearGradient>
        </defs>
        <rect x="22" y="8" width="256" height="96" rx="26" fill="url(#bed-wood)" />
        <rect x="38" y="22" width="224" height="70" rx="18" fill="#a9774f" opacity=".55" />
        <path d="M30 16 Q90 36 150 18 T270 16" stroke="#2f8a3d" strokeWidth="7" fill="none" strokeLinecap="round" />
        {BULBS.map((c, i) => (
          <circle key={i} cx={38 + i * 28} cy={22 + (i % 2) * 6} r="4.5" fill={c} className="bed-bulb" style={{ '--i': i }} />
        ))}
        <rect x="12" y="84" width="276" height="104" rx="18" fill="#eef3ff" />
        <rect x="44" y="76" width="96" height="42" rx="18" fill="#fff" stroke="#dfe6f5" strokeWidth="2" />
        <rect x="160" y="76" width="96" height="42" rx="18" fill="#fff" stroke="#dfe6f5" strokeWidth="2" />
      </svg>

      {/* cimeri na jastucima */}
      <motion.div className="bed-head left" {...drop(0)}>
        {a && <Avatar person={a} size={80} snow={false} className="avatar-fluid" />}
      </motion.div>
      <motion.div className="bed-head right" {...drop(1)}>
        {b && <Avatar person={b} size={80} snow={false} className="avatar-fluid" muted={pending} />}
        {b && pending && (
          <span className="bed-pending" title="Čeka potvrdu">
            📨
          </span>
        )}
      </motion.div>

      {/* prednji dio: deka */}
      <div className="bed-blanket-clip">
        <motion.svg className="bed-front" viewBox="0 0 300 200" aria-hidden="true" {...blanket}>
          <path d="M8 120 Q150 104 292 120 L292 186 Q150 196 8 186 Z" fill="#d7263d" />
          <path d="M8 120 Q150 104 292 120 L292 134 Q150 118 8 134 Z" fill="#fff" />
          <path d="M8 180 Q150 190 292 180" stroke="#fff" strokeWidth="5" strokeDasharray="10 8" fill="none" opacity=".8" />
          {SNOW.map(([x, y], i) => (
            <g key={i} transform={`translate(${x} ${y})`} stroke="#fff" strokeWidth="1.8" strokeLinecap="round" opacity=".85">
              <path d="M0-6V6M-5.2-3L5.2 3M-5.2 3L5.2-3" />
            </g>
          ))}
        </motion.svg>
      </div>

      {play && (
        <div className="bed-zzz" aria-hidden="true">
          <span>z</span>
          <span>z</span>
          <span>Z</span>
        </div>
      )}
    </div>
  );
}
