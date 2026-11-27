import { createRoot } from 'react-dom/client';
import '../styles.css';
import './og.css';
import ZadarScene from '../components/ZadarScene.jsx';
import TitleLights from '../components/TitleLights.jsx';
import RapSanta from '../components/RapSanta.jsx';
import Logo from '../components/Logo.jsx';
import BabaMraz from '../components/BabaMraz.jsx';

// fiksne pahulje (bez slučajnosti, da slika uvijek izgleda isto)
const FLAKES = Array.from({ length: 70 }, (_, i) => ({
  x: (i * 173.3) % 1200,
  y: (i * 97.7 + (i % 7) * 41) % 600,
  r: 1.4 + ((i * 37) % 10) / 4,
  o: 0.45 + ((i * 53) % 10) / 20,
}));
const NOTES = [
  { x: -8, y: 30, s: 50, c: '#ffd166', r: -12, two: true },
  { x: -14, y: 50, s: 38, c: '#ffffff', r: 10 },
  { x: -4, y: 64, s: 40, c: '#7ee06a', r: -6, two: true },
];

// nota (ili dvije spojene) kao SVG, da boja uvijek bude ista
function Note({ c, two }) {
  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%">
      <g fill={c} stroke="rgba(5,10,40,.35)" strokeWidth="1">
        {two ? (
          <>
            <ellipse cx="9" cy="31" rx="6.5" ry="5" transform="rotate(-20 9 31)" />
            <ellipse cx="29" cy="27" rx="6.5" ry="5" transform="rotate(-20 29 27)" />
            <rect x="13.5" y="6" width="3" height="25" />
            <rect x="33.5" y="2" width="3" height="25" />
            <path d="M13.5 6 L36.5 2 L36.5 8 L13.5 12 Z" />
          </>
        ) : (
          <>
            <ellipse cx="15" cy="31" rx="7" ry="5.4" transform="rotate(-20 15 31)" />
            <rect x="20" y="4" width="3" height="27" />
            <path d="M23 4 Q33 9 30 20 Q29 12 23 11 Z" />
          </>
        )}
      </g>
    </svg>
  );
}

// Slika za dijeljenje linka (Open Graph), 1200×630.
// Sav tekst je u središnjem kvadratu 630×630 (x 285–915), jer ga neke aplikacije režu na kvadrat;
// Djed i Baba Mraz su ukras sa strane.
function OgImage() {
  return (
    <div className="og">
      <div className="og-scene">
        <ZadarScene />
      </div>
      <div className="og-shade" />
      <svg className="og-snow" viewBox="0 0 1200 630" aria-hidden="true">
        {FLAKES.map((f, i) => (
          <circle key={i} cx={f.x} cy={f.y} r={f.r} fill="#fff" opacity={f.o} />
        ))}
      </svg>

      <div className="og-baba">
        <BabaMraz />
      </div>

      <div className="og-center">
        <div className="og-brand brand">
          <Logo className="brand-logo" />
          <span className="brand-sub">božićni domjenak</span>
        </div>
        <h1 className="xmas-title og-title">
          <TitleLights />
          <span className="xmas-title-text">
            Božićni
            <br />
            domjenak
          </span>
        </h1>
        <div className="meta og-meta">
          <span className="chip chip-red">📅 Četvrtak, 10.12.</span>
          <span className="chip chip-green">📍 Zadar</span>
        </div>
        <p className="og-lead">Prijavi se i uskoči u saonice! 🛷</p>
      </div>

      <div className="og-santa">
        <span className="og-bubble">Yo yo yo! 🎤</span>
        {NOTES.map((n, i) => (
          <span
            key={i}
            className="og-note"
            style={{ left: `${n.x}%`, top: `${n.y}%`, width: n.s, height: n.s, transform: `rotate(${n.r}deg)` }}
          >
            <Note c={n.c} two={n.two} />
          </span>
        ))}
        <RapSanta />
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<OgImage />);
