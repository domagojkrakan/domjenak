import { useEffect, useRef, useState } from 'react';
import { audio } from '../music.js';
import { BABA_JOKES, HOOK_START, beatAt, jokeAt, sectionAt, vocalAt } from '../rap.js';

const ROLL = 2.6; // sekunde dok se dokotrlja
const ENTER_AT = HOOK_START - ROLL - 0.3; // stigne točno kad krene refren

// Baba Mraz, reperica u kolicima: dokotrlja se slijeva pred prvi refren, pjeva refren,
// a dok Djed repa dalje — ostaje, đuska, kima glavom i vrti se u kolicima.
export default function BabaMraz() {
  const parts = useRef({});
  const r = (name) => (el) => (parts.current[name] = el);
  const [bubble, setBubble] = useState('');

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf;
    let amp = 0;
    let inside = false;
    let enteredAt = -1;
    let wheel = 0;
    let last = performance.now();
    let lastBubble = '';
    const say = (txt) => {
      if (txt !== lastBubble) {
        lastBubble = txt;
        setBubble(txt);
      }
    };

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const p = parts.current;
      const now = performance.now();
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      const clock = now / 1000;

      const isLive = audio && !audio.paused;
      const t = isLive ? audio.currentTime : 0;
      const want = isLive && t >= ENTER_AT;
      if (want !== inside) {
        inside = want;
        enteredAt = clock;
        p.root?.classList.toggle('in', inside);
      }
      const moving = clock - enteredAt < ROLL;

      const sec = sectionAt(t).name;
      const { index: beat, phase, bar } = beatAt(t);
      const hit = Math.pow(1 - phase, 3);

      let head = 0, headY = 0, body = 0, wheelie = 0, spin = 1, armMic = 0, armFree = -10, target = 0, finger = 0;
      let line = '';

      if (moving) {
        wheel += (inside ? 1 : -1) * 260 * dt;
        body = -4;
        armFree = 85 + Math.sin(clock * 8) * 20; // maše dok ulazi
      } else if (!inside) {
        // izvan ekrana
      } else if (sec === 'hook') {
        // pjeva refren
        target = vocalAt(t);
        headY = hit * 5;
        head = Math.sin((beat + phase) * Math.PI * 0.5) * 6;
        body = Math.sin((beat + phase) * Math.PI * 0.5) * 3;
        armFree = 135 + Math.sin((beat + phase) * Math.PI) * 15;
        armMic = -hit * 5;
      } else if (sec === 'rap') {
        // đuska dok Djed repa: kimanje, wheelie na udarac, okret svaka 4 takta
        headY = hit * 7;
        head = (beat % 2 ? -1 : 1) * (4 + hit * 6);
        wheelie = -hit * 7 - (beat % 4 === 2 ? Math.sin(phase * Math.PI) * 6 : 0);
        armFree = (beat % 2 ? 135 : 100) - hit * 15;
        armMic = Math.sin((beat + phase) * Math.PI) * 10;
        line = jokeAt(BABA_JOKES, bar, beat);
        const cycle = beat % 16;
        if (bar % 10 === 3 && beat % 4 >= 1 && beat % 4 <= 2) {
          // rijetko: srednji prst Djedu
          armFree = 140;
          finger = 1;
        } else if (cycle >= 14) {
          const s = (cycle - 14 + phase) / 2; // dva udarca za cijeli okret
          spin = Math.cos(s * Math.PI * 2);
          wheel += 300 * dt;
        }
      } else {
        // outro: maše
        armFree = 135 + Math.sin(clock * 9) * 15;
        head = Math.sin(clock * 2) * 5;
        headY = hit * 2;
        line = 'Ne kasnite na domjenak! 💃';
      }
      say(inside && !moving ? line : '');

      amp += (target - amp) * 0.45;
      if (p.mouth) p.mouth.style.transform = `scaleY(${0.12 + amp * 0.95})`;
      if (p.head) p.head.style.transform = `translateY(${headY}px) rotate(${head}deg)`;
      if (p.body) p.body.style.transform = `rotate(${body}deg)`;
      if (p.chair) p.chair.style.transform = `rotate(${wheelie}deg)`;
      if (p.spin) p.spin.style.transform = `scaleX(${Math.abs(spin) < 0.04 ? 0.04 : spin})`;
      if (p.wheel) p.wheel.style.transform = `rotate(${wheel}deg)`;
      if (p.caster) p.caster.style.transform = `rotate(${wheel * 3}deg)`;
      if (p.armMic) p.armMic.style.transform = `rotate(${armMic}deg)`;
      if (p.armFree) p.armFree.style.transform = `rotate(${armFree}deg)`;
      if (p.finger) p.finger.style.opacity = finger;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div ref={r('root')} className="baba-mraz" aria-hidden="true">
      {bubble && (
        <span className="rap-bubble baba-bubble" key={bubble}>
          {bubble}
        </span>
      )}
      <svg className="baba-svg" viewBox="0 0 240 270">
        <defs>
          <linearGradient id="bm-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FFE58A" />
            <stop offset=".55" stopColor="#F5B728" />
            <stop offset="1" stopColor="#B87514" />
          </linearGradient>
          <linearGradient id="bm-coat" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#B71C31" />
            <stop offset="1" stopColor="#E3304A" />
          </linearGradient>
          <linearGradient id="bm-chrome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e9eef5" />
            <stop offset="1" stopColor="#8b95a5" />
          </linearGradient>
        </defs>

        <ellipse cx="120" cy="262" rx="88" ry="7" fill="rgba(5,10,40,.35)" />

        <g ref={r('spin')} className="bm-part" style={{ transformOrigin: '120px 200px' }}>
          <g ref={r('chair')} className="bm-part" style={{ transformOrigin: '92px 258px' }}>
            {/* okvir kolica */}
            <path d="M68 112l-6-28h-14" stroke="url(#bm-chrome)" strokeWidth="6" strokeLinecap="round" fill="none" />
            <path d="M68 112l10 64h82l22 52" stroke="url(#bm-chrome)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M172 230h26" stroke="url(#bm-chrome)" strokeWidth="7" strokeLinecap="round" />
            <path d="M160 176l24 62" stroke="url(#bm-chrome)" strokeWidth="5" strokeLinecap="round" />
            <path d="M84 140h56" stroke="url(#bm-chrome)" strokeWidth="5" strokeLinecap="round" />
            <path d="M66 114l14 62" stroke="#1d2a5c" strokeWidth="12" strokeLinecap="round" />

            {/* Baba */}
            <g ref={r('body')} className="bm-part" style={{ transformOrigin: '110px 172px' }}>
              {/* noge */}
              <path d="M104 170h50" stroke="#1d2a5c" strokeWidth="22" strokeLinecap="round" />
              <path d="M154 170l14 46" stroke="#1d2a5c" strokeWidth="18" strokeLinecap="round" />
              <path d="M160 214q0-8 10-8h16q10 0 12 10v8h-38z" fill="#fff" />
              <path d="M166 218q12 2 26-4" stroke="#F5B728" strokeWidth="3" fill="none" strokeLinecap="round" />
              <rect x="158" y="223" width="42" height="6" rx="3" fill="#c7cfdc" />

              {/* slobodna ruka (iza) */}
              <g ref={r('armFree')} className="bm-part" style={{ transformOrigin: '96px 112px' }}>
                <path d="M96 112q-6 22 6 38" stroke="url(#bm-coat)" strokeWidth="15" strokeLinecap="round" fill="none" />
                <circle cx="103" cy="152" r="7.5" fill="#fff" />
                <circle cx="104" cy="160" r="6.5" fill="#F3C3A0" />
                <path ref={r('finger')} d="M104.5 165l2 11" stroke="#F3C3A0" strokeWidth="4" strokeLinecap="round" style={{ opacity: 0 }} />
              </g>

              {/* tijelo: crvena hoodica s krznom */}
              <path d="M84 106q26-16 50 0l8 66H78z" fill="url(#bm-coat)" />
              <path d="M76 164h68q4 8 0 14H76q-4-6 0-14z" fill="#fff" />
              <path d="M92 104q17 12 34 0" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" />
              {/* zlatna lančuga s pahuljicom */}
              <path d="M94 106q15 30 30 0" stroke="url(#bm-gold)" strokeWidth="3.2" strokeDasharray="3.2 1.6" fill="none" />
              <g transform="translate(109 132)">
                <circle r="11" fill="url(#bm-gold)" opacity=".25" />
                <g stroke="url(#bm-gold)" strokeWidth="2.6" strokeLinecap="round">
                  <path d="M0-9V9M-7.8-4.5L7.8 4.5M-7.8 4.5L7.8-4.5" />
                  <path d="M-2.5-6.5L0-4l2.5-2.5M-2.5 6.5L0 4l2.5 2.5" />
                </g>
                <circle r="2.2" fill="#FFE58A" />
              </g>

              {/* glava */}
              <g ref={r('head')} className="bm-part" style={{ transformOrigin: '108px 100px' }}>
                {/* kosa */}
                <circle cx="96" cy="58" r="22" fill="#eef2f8" />
                <circle cx="88" cy="74" r="14" fill="#eef2f8" />
                <circle cx="128" cy="70" r="12" fill="#eef2f8" />
                <circle cx="108" cy="72" r="22" fill="#F6C9A4" />
                <circle cx="98" cy="80" r="4.5" fill="#f4a3a0" opacity=".7" />
                <circle cx="120" cy="80" r="4.5" fill="#f4a3a0" opacity=".7" />
                {/* naušnice */}
                <circle cx="88" cy="84" r="5.5" fill="none" stroke="url(#bm-gold)" strokeWidth="2.4" />
                <circle cx="129" cy="84" r="5.5" fill="none" stroke="url(#bm-gold)" strokeWidth="2.4" />
                {/* usta */}
                <g ref={r('mouth')} className="bm-part" style={{ transformOrigin: '111px 86px' }}>
                  <ellipse cx="111" cy="88" rx="6.5" ry="5" fill="#7a1426" />
                  <ellipse cx="111" cy="90.5" rx="3.8" ry="1.9" fill="#ef6f78" />
                </g>
                <path d="M104 84q7-3 14 0" stroke="#d2334a" strokeWidth="2.4" fill="none" strokeLinecap="round" />
                {/* zlatne mačje naočale */}
                <path d="M94 64q6-3 11 0M112 64q6-3 11 0" stroke="#eef2f8" strokeWidth="2.6" strokeLinecap="round" fill="none" />
                <path d="M92 68q6-3 14 0v6q-7 5-14 0z" fill="#2a1430" stroke="url(#bm-gold)" strokeWidth="2" />
                <path d="M111 68q8-3 15 0v6q-7 5-15 0z" fill="#2a1430" stroke="url(#bm-gold)" strokeWidth="2" />
                <path d="M106 70h5M92 69l-4-3M126 69l4-3" stroke="url(#bm-gold)" strokeWidth="2" />
                <path d="M95 70l4-1M114 70l4-1" stroke="#fff" strokeWidth="1.4" opacity=".6" strokeLinecap="round" />
                <circle cx="109" cy="78" r="2.8" fill="#e98b7a" />
                {/* kapa */}
                <g transform="rotate(10 108 52)">
                  <path d="M84 54q18-40 50-20q10 8 4 20q-10-8-14 6z" fill="#D7263D" />
                  <rect x="82" y="48" width="56" height="12" rx="6" fill="#fff" />
                  <circle cx="140" cy="54" r="7.5" fill="#fff" />
                </g>
              </g>

              {/* ruka s mikrofonom (ispred) */}
              <g ref={r('armMic')} className="bm-part" style={{ transformOrigin: '122px 112px' }}>
                <path d="M122 112q14 20 6 30" stroke="url(#bm-coat)" strokeWidth="15" strokeLinecap="round" fill="none" />
                <path d="M128 142q8-24 0-40" stroke="url(#bm-coat)" strokeWidth="13" strokeLinecap="round" fill="none" />
                <circle cx="128" cy="104" r="7" fill="#fff" />
                <path d="M129 98l-2-12" stroke="url(#bm-gold)" strokeWidth="5.5" strokeLinecap="round" />
                <circle cx="126" cy="83" r="6" fill="url(#bm-gold)" stroke="#9a5f10" strokeWidth="1" />
                <circle cx="129" cy="97" r="6" fill="#F3C3A0" />
              </g>
            </g>

            {/* kotači (ispred Babe) */}
            <g ref={r('wheel')} className="bm-part" style={{ transformOrigin: '92px 210px' }}>
              <circle cx="92" cy="210" r="47" fill="none" stroke="#2b2f3a" strokeWidth="8" />
              <circle cx="92" cy="210" r="40" fill="none" stroke="url(#bm-chrome)" strokeWidth="3" />
              <g stroke="#c9d1dd" strokeWidth="1.6">
                <path d="M92 170v80M52 210h80M64 182l56 56M120 182l-56 56" />
              </g>
              <circle cx="92" cy="210" r="7" fill="url(#bm-gold)" />
              <circle cx="92" cy="170" r="3" fill="#E2263A" />
              <circle cx="132" cy="210" r="3" fill="#3FA34D" />
              <circle cx="92" cy="250" r="3" fill="#F5B728" />
              <circle cx="52" cy="210" r="3" fill="#1A9DD8" />
            </g>
            <g ref={r('caster')} className="bm-part" style={{ transformOrigin: '186px 246px' }}>
              <circle cx="186" cy="246" r="12" fill="#2b2f3a" />
              <circle cx="186" cy="246" r="4" fill="url(#bm-chrome)" />
              <path d="M186 236v20" stroke="#8b95a5" strokeWidth="1.5" />
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
