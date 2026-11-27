import { useEffect, useRef, useState } from 'react';
import { audio, playMusic, useMusic } from '../music.js';
import {
  BAR,
  HOOK_LINES,
  RAP_LINES,
  WARMUP_LINES,
  beatAt,
  parseLrc,
  sectionAt,
  vocalAt,
} from '../rap.js';

const WALK_MS = 5200;
const MAX_WORDS = 14;
const rot = (el, deg) => el && (el.style.transform = `rotate(${deg}deg)`);

// Reper Djed Božićnjak: ušeće s desne strane, zagrijava se dok traje uvod,
// a kad krene vokal repa po pjesmi — usta prate vokal, glava ritam, a riječi izlijeću iz njega.
export default function RapSanta() {
  const { muted, playing } = useMusic();
  const live = playing && !muted;
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [arrived, setArrived] = useState(reduced);
  const [walking, setWalking] = useState(false);
  const [bubble, setBubble] = useState('');
  const [words, setWords] = useState([]);
  const lyrics = useRef([]);
  const parts = useRef({});
  const r = (name) => (el) => (parts.current[name] = el);

  // stihovi (ako ih netko upiše u .lrc)
  useEffect(() => {
    fetch('/audio/bozicna.lrc')
      .then((res) => (res.ok ? res.text() : ''))
      .then((txt) => (lyrics.current = parseLrc(txt).filter((l) => l.text)))
      .catch(() => {});
  }, []);

  // ulazak u ekran
  useEffect(() => {
    if (reduced) return;
    const a = setTimeout(() => setWalking(true), 700);
    const b = setTimeout(() => setArrived(true), 700 + WALK_MS);
    return () => {
      clearTimeout(a);
      clearTimeout(b);
    };
  }, [reduced]);

  // glavna petlja animacije
  useEffect(() => {
    if (reduced) return;
    let raf;
    let amp = 0;
    let lastBubble = '';
    let lastSpawn = '';
    let wid = 0;
    const t0 = performance.now();

    const say = (txt) => {
      if (txt !== lastBubble) {
        lastBubble = txt;
        setBubble(txt);
      }
    };
    const spawn = (key, text) => {
      if (key === lastSpawn || !text) return;
      lastSpawn = key;
      const id = ++wid;
      const w = {
        id,
        text,
        dx: -(70 + Math.random() * 150),
        dy: -(70 + Math.random() * 120),
        rot: Math.random() * 30 - 18,
        hue: Math.floor(Math.random() * 4),
      };
      setWords((ws) => [...ws.slice(-(MAX_WORDS - 1)), w]);
      setTimeout(() => setWords((ws) => ws.filter((x) => x.id !== id)), 2600);
    };

    // tekst za takt: stih iz .lrc ako postoji, inače upadica
    const lineFor = (t, bar, list) => {
      const ls = lyrics.current;
      for (let i = ls.length - 1; i >= 0; i--) {
        if (ls[i].t <= t) {
          const end = Math.min(ls[i + 1]?.t ?? Infinity, ls[i].t + BAR * 1.5);
          if (t < end) return { text: ls[i].text, from: ls[i].t, dur: end - ls[i].t, key: `l${i}` };
          break;
        }
      }
      return null;
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = parts.current;
      const clock = (performance.now() - t0) / 1000;
      const isLive = audio && !audio.paused;
      const t = isLive ? audio.currentTime : 0;
      const sec = isLive ? sectionAt(t).name : 'wait';
      const { index: beat, phase, bar } = beatAt(t);
      const walkingNow = p.root?.classList.contains('walking') && !p.root?.classList.contains('arrived');

      let head = 0, headY = 0, torso = 0, torsoY = 0, armFree = -8, armMic = 0, legL = 0, legR = 0;
      let target = 0;

      if (walkingNow) {
        const s = Math.sin(clock * Math.PI * 3.2);
        legL = s * 20;
        legR = -s * 20;
        torsoY = -Math.abs(s) * 4;
        armFree = -10 - s * 14;
        head = s * 2;
        say('');
      } else if (sec === 'wait') {
        torso = Math.sin(clock * 1.3) * 2;
        head = Math.sin(clock * 1.3 + 0.6) * 4;
        armFree = -12 + Math.sin(clock * 1.3) * 4;
        say(p.root?.classList.contains('arrived') ? 'Pusti beat! 🎧' : '');
      } else {
        const hit = Math.pow(1 - phase, 3);
        if (sec === 'intro') {
          // priprema: kimanje u ritmu, ramena, provjera mikrofona
          headY = hit * 4;
          head = Math.sin(beat * Math.PI * 0.5) * 3;
          torso = Math.sin((beat + phase) * Math.PI * 0.25) * 3;
          armFree = bar % 4 === 3 ? -95 - Math.sin(phase * Math.PI) * 25 : -25 - hit * 10;
          say(WARMUP_LINES[Math.floor(bar / 2) % WARMUP_LINES.length]);
        } else if (sec === 'rap') {
          target = vocalAt(t);
          headY = hit * 6;
          head = (beat % 2 ? -1 : 1) * (2 + hit * 3);
          torsoY = hit * 3;
          armFree = (beat % 2 ? -100 : -45) + hit * 18;
          armMic = -hit * 4;
          say('');
          const line = lineFor(t, bar);
          const text = line ? line.text : RAP_LINES[bar % RAP_LINES.length];
          const from = line ? line.from : bar * BAR + 0.175;
          const dur = line ? line.dur : BAR;
          const list = text.split(/\s+/);
          const wi = Math.min(list.length - 1, Math.floor(((t - from) / dur) * list.length));
          if (wi >= 0) spawn(`${line ? line.key : 'b' + bar}-${wi}`, list[wi]);
        } else if (sec === 'hook') {
          target = vocalAt(t) * 0.8;
          const sway = Math.sin((beat + phase) * Math.PI * 0.5);
          torso = sway * 6;
          head = sway * 6;
          headY = hit * 3;
          armFree = -140 + Math.sin((beat + phase) * Math.PI) * 22;
          say('');
          const line = lineFor(t, bar);
          if (line) {
            const list = line.text.split(/\s+/);
            const wi = Math.min(list.length - 1, Math.floor(((t - line.from) / line.dur) * list.length));
            if (wi >= 0) spawn(`${line.key}-${wi}`, list[wi]);
          } else if (beat % 4 === 0) {
            spawn(`h${beat}`, HOOK_LINES[(beat / 4) % HOOK_LINES.length]);
          }
        } else {
          // outro: mahanje
          armFree = -150 + Math.sin(clock * 9) * 16;
          head = Math.sin(clock * 2) * 4;
          headY = hit * 2;
          say('Vidimo se 10.12.! ✌️');
        }
      }

      amp += (target - amp) * 0.45;
      if (p.mouth) p.mouth.style.transform = `scaleY(${0.12 + amp * 0.95})`;
      if (p.head) p.head.style.transform = `translateY(${headY}px) rotate(${head}deg)`;
      if (p.torso) p.torso.style.transform = `translateY(${torsoY}px) rotate(${torso}deg)`;
      rot(p.armFree, armFree);
      rot(p.armMic, armMic);
      rot(p.legL, legL);
      rot(p.legR, legR);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  const waiting = arrived && !live;

  return (
    <div
      ref={r('root')}
      className={`rap-santa ${walking ? 'walking' : ''} ${arrived ? 'arrived' : ''} ${live ? 'live' : ''}`}
      aria-hidden={!waiting}
    >
      <div className="rap-words" aria-hidden="true">
        {words.map((w) => (
          <span
            key={w.id}
            className={`rap-word c${w.hue}`}
            style={{ '--dx': `${w.dx}px`, '--dy': `${w.dy}px`, '--rot': `${w.rot}deg` }}
          >
            {w.text}
          </span>
        ))}
      </div>

      {bubble &&
        (waiting ? (
          <button type="button" className="rap-bubble clickable" onClick={playMusic}>
            {bubble}
          </button>
        ) : (
          <span className="rap-bubble" key={bubble}>
            {bubble}
          </span>
        ))}

      <svg className="rap-svg" viewBox="0 0 200 300" aria-hidden="true">
        <defs>
          <linearGradient id="rs-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE58A" />
            <stop offset=".55" stopColor="#F5B728" />
            <stop offset="1" stopColor="#B87514" />
          </linearGradient>
          <linearGradient id="rs-key" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#A8CE3A" />
            <stop offset="1" stopColor="#1A9DD8" />
          </linearGradient>
          <linearGradient id="rs-coat" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#E3304A" />
            <stop offset="1" stopColor="#B71C31" />
          </linearGradient>
        </defs>

        <ellipse cx="100" cy="292" rx="56" ry="7" fill="rgba(5,10,40,.35)" />

        {/* noge */}
        <g ref={r('legL')} className="rs-part" style={{ transformOrigin: '86px 206px' }}>
          <path d="M71 204h29l-3 68H74z" fill="#1d2a5c" />
          <path d="M73 238h25" stroke="#16214d" strokeWidth="2" />
          <path d="M64 274q0-6 8-6h26q4 0 4 6v10H62z" fill="#fff" />
          <path d="M70 276q12 2 24-4" stroke="#E2263A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="60" y="283" width="44" height="6" rx="3" fill="#c7cfdc" />
        </g>
        <g ref={r('legR')} className="rs-part" style={{ transformOrigin: '114px 206px' }}>
          <path d="M100 204h29l-3 68h-23z" fill="#22306a" />
          <path d="M102 238h25" stroke="#16214d" strokeWidth="2" />
          <path d="M98 274q0-6 8-6h26q4 0 4 6v10H96z" fill="#fff" />
          <path d="M104 276q12 2 24-4" stroke="#E2263A" strokeWidth="3" fill="none" strokeLinecap="round" />
          <rect x="96" y="283" width="44" height="6" rx="3" fill="#c7cfdc" />
        </g>

        <g ref={r('torso')} className="rs-part" style={{ transformOrigin: '100px 210px' }}>
          {/* slobodna ruka (iza tijela) */}
          <g ref={r('armFree')} className="rs-part" style={{ transformOrigin: '134px 148px' }}>
            <path d="M134 148q20 20 16 42" stroke="url(#rs-coat)" strokeWidth="17" strokeLinecap="round" fill="none" />
            <circle cx="150" cy="192" r="8.5" fill="#fff" />
            <circle cx="151" cy="200" r="7.5" fill="#1f1f24" />
            <path d="M147 196l-2-7M151 195v-8" stroke="#1f1f24" strokeWidth="4" strokeLinecap="round" />
          </g>

          {/* hoodica */}
          <path d="M60 142q40-22 80 0l10 58q-50 18-100 0z" fill="url(#rs-coat)" />
          <path d="M74 138q26 16 52 0q-6-12-26-12t-26 12z" fill="#a3182b" />
          <path d="M78 176h44l-6 18H84z" fill="#a3182b" />
          <path d="M100 150v44" stroke="#a3182b" strokeWidth="2" />
          <rect x="50" y="196" width="100" height="15" rx="7.5" fill="#fff" />
          <circle cx="62" cy="203" r="3" fill="#e8eef7" />
          <circle cx="90" cy="205" r="3" fill="#e8eef7" />
          <circle cx="122" cy="202" r="3" fill="#e8eef7" />
          {/* zlatni lanac s Rentlio ključanicom */}
          <path d="M80 140q20 40 40 0" stroke="url(#rs-gold)" strokeWidth="3.4" strokeDasharray="3.5 1.8" fill="none" />
          <circle cx="100" cy="168" r="10" fill="url(#rs-gold)" stroke="#9a5f10" strokeWidth="1.2" />
          <circle cx="100" cy="165" r="3.4" fill="url(#rs-key)" />
          <path d="M98.2 166.5h3.6l1.2 6.5h-6z" fill="url(#rs-key)" />

          {/* glava */}
          <g ref={r('head')} className="rs-part" style={{ transformOrigin: '100px 134px' }}>
            <circle cx="75" cy="96" r="5.5" fill="#efb995" />
            <circle cx="125" cy="96" r="5.5" fill="#efb995" />
            <circle cx="100" cy="93" r="25" fill="#F6C9A4" />
            <circle cx="84" cy="104" r="5" fill="#f4a3a0" opacity=".6" />
            <circle cx="116" cy="104" r="5" fill="#f4a3a0" opacity=".6" />
            {/* brada */}
            <path d="M71 96q-4 38 29 52q33-14 29-52q-8 18-29 18T71 96z" fill="#fff" />
            <path d="M80 128q20 16 40 0" stroke="#e3e9f3" strokeWidth="2" fill="none" />
            {/* usta (pomiču se po vokalu) */}
            <g ref={r('mouth')} className="rs-mouth" style={{ transformOrigin: '100px 114px' }}>
              <ellipse cx="100" cy="117" rx="8.5" ry="6" fill="#5a1520" />
              <ellipse cx="100" cy="120.5" rx="5" ry="2.4" fill="#e2585f" />
            </g>
            {/* brkovi i nos */}
            <path d="M100 109q-10-9-21-1q9 8 21 3q12 5 21-3q-11-8-21 1z" fill="#fff" stroke="#e3e9f3" strokeWidth="1" />
            <circle cx="100" cy="102" r="5.2" fill="#E86A6A" />
            <circle cx="98.5" cy="100.5" r="1.6" fill="#fff" opacity=".6" />
            {/* sunčane naočale */}
            <path d="M81 82q7-5 15 0M104 82q7-5 15 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" fill="none" />
            <rect x="78" y="85" width="20" height="11" rx="4.5" fill="#111320" />
            <rect x="102" y="85" width="20" height="11" rx="4.5" fill="#111320" />
            <path d="M98 89h4M78 88l-5-2M122 88l5-2" stroke="#111320" strokeWidth="2.2" />
            <path d="M81 88l5-2M105 88l5-2" stroke="#fff" strokeWidth="1.6" opacity=".55" strokeLinecap="round" />
            {/* kapa nakrivo */}
            <g transform="rotate(-14 100 70)">
              <path d="M73 68q14-48 64-38q14 6 10 22q-14-10-20 16z" fill="#D7263D" />
              <path d="M110 40q14-4 26 2" stroke="#b71c31" strokeWidth="2.4" fill="none" />
              <rect x="69" y="62" width="64" height="14" rx="7" fill="#fff" />
              <circle cx="148" cy="52" r="8.5" fill="#fff" />
            </g>
          </g>

          {/* ruka s mikrofonom (ispred) */}
          <g ref={r('armMic')} className="rs-part" style={{ transformOrigin: '64px 148px' }}>
            <path d="M64 148q-16 20-6 38" stroke="url(#rs-coat)" strokeWidth="17" strokeLinecap="round" fill="none" />
            <path d="M58 186q2-30 16-50" stroke="url(#rs-coat)" strokeWidth="15" strokeLinecap="round" fill="none" />
            <circle cx="74" cy="138" r="8.5" fill="#fff" />
            <path d="M78 130l6-14" stroke="#2b2f3a" strokeWidth="6" strokeLinecap="round" />
            <circle cx="86" cy="111" r="7" fill="#aab3bf" stroke="#6b7482" strokeWidth="1.2" />
            <path d="M81 109h10M81 113h10M86 105v12" stroke="#6b7482" strokeWidth=".9" />
            <circle cx="76" cy="131" r="7.5" fill="#1f1f24" />
          </g>
        </g>
      </svg>
    </div>
  );
}
