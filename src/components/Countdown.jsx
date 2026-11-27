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
          <span className="cd-num" key={i === 3 ? v : undefined}>
            {v}
          </span>
          <span className="cd-label">{label}</span>
        </div>
      ))}
    </div>
  );
}
