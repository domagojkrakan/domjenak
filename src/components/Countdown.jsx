import { useEffect, useState } from 'react';
import { EVENT_DATE } from '../api.js';

const pad = (n) => String(n).padStart(2, '0');

function parts(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function dana(n) {
  return n % 10 === 1 && n % 100 !== 11 ? 'dan' : 'dana';
}

export default function Countdown() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const left = EVENT_DATE.getTime() - now;
  if (left <= 0) {
    return <div className="countdown-done">✨ Domjenak je danas — vidimo se! ✨</div>;
  }
  const { d, h, m, s } = parts(left);
  const cells = [
    [d, dana(d)],
    [pad(h), 'sati'],
    [pad(m), 'min'],
    [pad(s), 'sek'],
  ];
  return (
    <div className="countdown" role="timer" aria-label={`Još ${d} ${dana(d)} do domjenka`}>
      {cells.map(([v, label], i) => (
        <div key={label} className="cd-cell">
          <svg className="cd-bow" viewBox="0 0 60 26" aria-hidden="true">
            <path d="M30 20 Q14 0 6 8 Q0 18 30 20 Z" fill="#FFD45E" />
            <path d="M30 20 Q46 0 54 8 Q60 18 30 20 Z" fill="#FFD45E" />
            <path d="M30 20 Q18 6 11 10M30 20 Q42 6 49 10" stroke="#C9821A" strokeWidth="1.6" fill="none" />
            <circle cx="30" cy="19" r="5" fill="#F5B728" stroke="#C9821A" strokeWidth="1.2" />
          </svg>
          <span className="cd-num" key={i === 3 ? v : undefined}>
            {v}
          </span>
          <span className="cd-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
