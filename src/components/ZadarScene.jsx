import { useEffect, useMemo, useState } from 'react';

// Ilustrirani zimski Zadar u sumrak (sunce je taman zašlo): Velebit obasjan
// ružičastim, stari grad sa Sv. Donatom i zvonikom Sv. Stošije, lampice,
// more, Pozdrav suncu i Morske orgulje na rivi.

function rng(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const lerp = (a, b, t) => a + (b - a) * t;
const BULBS = ['#ff5d6c', '#ffd24a', '#A9CF3A', '#4cd2ff', '#ff9ad5', '#ffffff'];
const FACADES = ['#4a5fae', '#5568b8', '#3f53a0', '#6a6fc0', '#4b6cb5', '#5b5aa8', '#3d5aa6'];
const ROOFS = ['#d2604a', '#c0503e', '#e07a55'];

function ridge(points) {
  return 'M' + points.map((p) => p.join(',')).join(' L') + ' Z';
}

function snowCaps(points) {
  const caps = [];
  for (let i = 1; i < points.length - 3; i++) {
    const [px, py] = points[i];
    const [ax, ay] = points[i - 1];
    const [bx, by] = points[i + 1];
    if (py < ay && py < by) {
      const l = [lerp(px, ax, 0.45), lerp(py, ay, 0.45)];
      const r = [lerp(px, bx, 0.45), lerp(py, by, 0.45)];
      const low = Math.max(l[1], r[1]);
      caps.push(
        [[px, py], r, [lerp(px, r[0], 0.55), low + 7], [px + 4, low - 2], [lerp(px, l[0], 0.5), low + 9], l]
          .map((p) => p.join(','))
          .join(' ')
      );
    }
  }
  return caps;
}

const BACK = [[0, 520], [0, 470], [90, 450], [180, 405], [270, 440], [350, 385], [440, 425], [530, 360], [620, 410], [710, 390], [800, 430], [890, 372], [990, 420], [1090, 355], [1190, 405], [1290, 378], [1390, 425], [1490, 388], [1600, 430], [1600, 520]];
const FRONT = [[0, 560], [0, 500], [120, 470], [230, 492], [330, 455], [450, 488], [560, 450], [680, 482], [790, 458], [900, 494], [1010, 462], [1120, 490], [1230, 470], [1350, 496], [1460, 468], [1600, 490], [1600, 560]];

// lampice koje vise u lukovima (x1, x2, y, provjes)
const STRINGS = [
  [0, 230, 470, 26], [230, 470, 478, 30], [470, 720, 468, 28], [720, 960, 476, 26],
  [960, 1100, 470, 22], [1100, 1215, 462, 18], [1310, 1362, 452, 10], [1414, 1440, 470, 8],
  [1546, 1600, 468, 10],
];

function usePortrait() {
  const [p, setP] = useState(() => typeof window !== 'undefined' && window.innerWidth / window.innerHeight < 0.9);
  useEffect(() => {
    const on = () => setP(window.innerWidth / window.innerHeight < 0.9);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return p;
}

export default function ZadarScene() {
  const portrait = usePortrait();

  const data = useMemo(() => {
    const r = rng(1210);
    const stars = Array.from({ length: 80 }, () => {
      const y = r() * 240;
      return { x: r() * 1600, y, s: 0.6 + r() * 1.5, d: r() * 4, o: 1 - y / 270 };
    });

    const houses = [];
    let x = -20;
    while (x < 1640) {
      const w = 44 + r() * 46;
      const inLandmark = x > 1190 && x < 1560;
      const h = inLandmark ? 40 + r() * 30 : 55 + r() * 85;
      const windows = [];
      const cols = Math.max(1, Math.floor((w - 14) / 16));
      const rows = Math.max(1, Math.floor((h - 26) / 22));
      for (let c = 0; c < cols; c++)
        for (let k = 0; k < rows; k++)
          windows.push({
            x: x + 9 + c * ((w - 18) / cols) + ((w - 18) / cols - 7) / 2,
            y: 600 - h + 14 + k * 22,
            lit: r() > 0.3,
            d: r() * 6,
          });
      houses.push({
        x,
        w,
        h,
        roof: r() > 0.2,
        windows,
        facade: FACADES[Math.floor(r() * FACADES.length)],
        roofC: ROOFS[Math.floor(r() * ROOFS.length)],
        wreath: r() > 0.55,
      });
      x += w - 2;
    }

    const reflections = Array.from({ length: 90 }, () => ({
      x: r() * 1600,
      y: 612 + r() * 190,
      w: 10 + r() * 50,
      d: r() * 5,
      o: 0.15 + r() * 0.4,
      c: r() > 0.7 ? '#ffb0c8' : '#ffd27a',
    }));

    const strings = STRINGS.flatMap(([x1, x2, y, sag], si) => {
      const n = Math.max(4, Math.round((x2 - x1) / 18));
      return Array.from({ length: n + 1 }, (_, i) => {
        const t = i / n;
        return { x: lerp(x1, x2, t), y: y + Math.sin(Math.PI * t) * sag, c: BULBS[(i + si) % BULBS.length], d: r() * 3, si };
      });
    });

    const garland = [];
    for (let gx = 0; gx < 1600; gx += 150) {
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        garland.push({ x: gx + t * 150, y: 566 + Math.sin(Math.PI * t) * 14, c: BULBS[(gx / 150 + i) % BULBS.length], d: r() * 3 });
      }
    }
    return { stars, houses, reflections, strings, garland, backCaps: snowCaps(BACK), frontCaps: snowCaps(FRONT) };
  }, []);

  return (
    <svg className="scene" viewBox="0 0 1600 900" preserveAspectRatio={portrait ? 'xMaxYMax slice' : 'xMidYMax slice'} aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#16205e" />
          <stop offset="0.13" stopColor="#273c94" />
          <stop offset="0.23" stopColor="#4a5cb6" />
          <stop offset="0.31" stopColor="#8b6cbc" />
          <stop offset="0.37" stopColor="#df7fa8" />
          <stop offset="0.42" stopColor="#ffa58a" />
          <stop offset="0.5" stopColor="#ffd0a0" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8e73b8" />
          <stop offset="0.25" stopColor="#5a5fae" />
          <stop offset="0.7" stopColor="#2f3f8c" />
          <stop offset="1" stopColor="#1b2766" />
        </linearGradient>
        <radialGradient id="sunGlow" cx="0.5" cy="1" r="0.6">
          <stop offset="0" stopColor="#ffd6a0" stopOpacity="0.95" />
          <stop offset="0.4" stopColor="#ff9f8a" stopOpacity="0.5" />
          <stop offset="1" stopColor="#ff9f8a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#fff6e0" stopOpacity="0.5" />
          <stop offset="1" stopColor="#fff6e0" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampGlow">
          <stop offset="0" stopColor="#ffd58a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ffd58a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="treeGlow">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.7" />
          <stop offset="1" stopColor="#ffe3a0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4cd2ff" />
          <stop offset="0.25" stopColor="#A9CF3A" />
          <stop offset="0.5" stopColor="#ffd24a" />
          <stop offset="0.75" stopColor="#ff5d9e" />
          <stop offset="1" stopColor="#8a6bff" />
        </linearGradient>
        <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#5a6cb0" />
          <stop offset="1" stopColor="#36458a" />
        </linearGradient>
        <linearGradient id="donat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4a5fa8" />
          <stop offset="0.45" stopColor="#7184c8" />
          <stop offset="1" stopColor="#3b4f98" />
        </linearGradient>
        <linearGradient id="ridgeBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9a77b8" />
          <stop offset="1" stopColor="#6d68b0" />
        </linearGradient>
        <linearGradient id="ridgeFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#6a64ad" />
          <stop offset="1" stopColor="#4c58a4" />
        </linearGradient>
        <mask id="crescent">
          <circle cx="1440" cy="120" r="34" fill="#fff" />
          <circle cx="1456" cy="110" r="30" fill="#000" />
        </mask>
      </defs>

      {/* nebo u sumrak */}
      <rect width="1600" height="900" fill="url(#sky)" />
      <ellipse cx="760" cy="430" rx="1100" ry="200" fill="url(#sunGlow)" />
      {data.stars.map((s, i) => (
        <circle key={i} className="twinkle" cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} style={{ animationDelay: `${s.d}s` }} />
      ))}
      <circle cx="300" cy="150" r="2.8" fill="#fff" className="evening-star" />

      {/* mjesec (polumjesec) */}
      <circle cx="1440" cy="120" r="110" fill="url(#moonGlow)" />
      <rect x="1390" y="70" width="110" height="110" fill="#fff7e6" mask="url(#crescent)" />

      {/* oblaci obasjani zalazom */}
      <g className="clouds" opacity="0.85">
        <path d="M80 300 q60 -26 130 -8 q50 -20 110 4 q40 0 30 14 h-290 q-20 -4 20 -10 Z" fill="#f7a6b4" opacity="0.55" />
        <path d="M560 250 q70 -30 150 -6 q60 -18 120 8 q30 6 10 14 h-300 q-10 -8 20 -16 Z" fill="#ffc2b0" opacity="0.45" />
        <path d="M1010 310 q60 -22 120 -4 q50 -16 100 6 q30 6 10 12 h-240 q-14 -6 10 -14 Z" fill="#f5a0c0" opacity="0.5" />
        <path d="M300 345 h260 q-30 -16 -80 -10 q-40 -14 -90 2 q-60 -4 -90 8 Z" fill="#ffd0a8" opacity="0.5" />
      </g>

      {/* Velebit u alpskom žaru */}
      <path d={ridge(BACK)} fill="url(#ridgeBack)" />
      {data.backCaps.map((p, i) => (
        <polygon key={i} points={p} fill="#ffe4ea" />
      ))}
      <path d={ridge(FRONT)} fill="url(#ridgeFront)" />
      {data.frontCaps.map((p, i) => (
        <polygon key={i} points={p} fill="#fff1f5" opacity="0.9" />
      ))}

      {/* kuće */}
      {data.houses.map((h, i) => {
        const top = 600 - h.h;
        return (
          <g key={i}>
            <rect x={h.x} y={top} width={h.w} height={h.h} fill={h.facade} />
            <rect x={h.x} y={top} width={h.w * 0.18} height={h.h} fill="#000" opacity="0.08" />
            {h.roof ? (
              <>
                <polygon points={`${h.x - 4},${top} ${h.x + h.w / 2},${top - 20} ${h.x + h.w + 4},${top}`} fill={h.roofC} />
                <polygon
                  points={`${h.x - 5},${top + 1} ${h.x + h.w / 2},${top - 21} ${h.x + h.w + 5},${top + 1} ${h.x + h.w * 0.8},${top - 4} ${h.x + h.w * 0.62},${top - 1} ${h.x + h.w * 0.4},${top - 6} ${h.x + h.w * 0.18},${top - 1}`}
                  fill="#fff6f8"
                />
              </>
            ) : (
              <rect x={h.x - 2} y={top - 5} width={h.w + 4} height="7" rx="3" fill="#fff6f8" />
            )}
            {h.windows.map((w, k) => (
              <rect
                key={k}
                x={w.x}
                y={w.y}
                width="7"
                height="10"
                rx="1.5"
                fill={w.lit ? '#ffd27a' : '#2b3a7a'}
                className={w.lit ? 'window-lit' : undefined}
                style={w.lit ? { animationDelay: `${w.d}s` } : undefined}
              />
            ))}
            {h.wreath && h.h > 70 && (
              <g transform={`translate(${h.x + h.w / 2} ${top + h.h - 22})`}>
                <circle r="6" fill="none" stroke="#2f8f4e" strokeWidth="3.5" />
                <circle cx="0" cy="5" r="1.8" fill="#ff5d6c" />
              </g>
            )}
          </g>
        );
      })}

      {/* lampice preko grada */}
      {STRINGS.map(([x1, x2, y, sag], i) => (
        <path key={i} d={`M${x1} ${y} Q${(x1 + x2) / 2} ${y + sag * 2} ${x2} ${y}`} stroke="#1f2a5e" strokeWidth="1.2" fill="none" opacity="0.7" />
      ))}
      {data.strings.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="3" fill={b.c} className="bulb glow" style={{ animationDelay: `${b.d}s` }} />
      ))}

      {/* božićno drvce */}
      <g transform="translate(1135 420)">
        <circle cx="0" cy="80" r="120" fill="url(#treeGlow)" />
        <polygon points="0,-16 -34,40 -18,40 -48,92 -28,92 -62,160 62,160 28,92 48,92 18,40 34,40" fill="#2a8a4c" />
        <polygon points="0,-16 -34,40 -18,40 -48,92 -28,92 -62,160 0,160" fill="#000" opacity="0.08" />
        <path d="M-30 42 Q0 58 30 40 M-44 94 Q0 114 44 92 M-60 160 Q0 178 60 160" stroke="#fff6f8" strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M-22 24 Q4 40 26 30 M-38 70 Q2 92 40 72 M-52 128 Q4 152 54 130" stroke="#ffd24a" strokeWidth="2.4" fill="none" />
        {[[-12, 30], [14, 50], [-24, 72], [20, 80], [-8, 100], [30, 118], [-36, 128], [6, 136], [-14, 60], [36, 146], [-44, 148], [0, 76], [-26, 108]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r={i % 3 ? 4 : 5.5} fill={BULBS[i % BULBS.length]} className="twinkle glow" style={{ animationDelay: `${i * 0.31}s` }} />
        ))}
        <polygon className="star-top" points="0,-36 6,-21 22,-21 9,-11 14,4 0,-5 -14,4 -9,-11 -22,-21 -6,-21" fill="#ffd24a" />
        <rect x="-38" y="160" width="20" height="16" rx="2" fill="#4cd2ff" />
        <rect x="-30" y="160" width="4" height="16" fill="#fff" />
        <rect x="10" y="158" width="24" height="18" rx="2" fill="#ff5d6c" />
        <rect x="20" y="158" width="4" height="18" fill="#ffd24a" />
      </g>

      {/* Sv. Donat */}
      <g>
        <rect x="1212" y="452" width="98" height="150" fill="url(#donat)" />
        <path d="M1206 452 Q1261 432 1316 452 Z" fill="#fff6f8" />
        <rect x="1236" y="405" width="50" height="50" fill="url(#donat)" />
        <path d="M1230 408 Q1261 380 1292 408 L1286 410 Q1261 398 1236 410 Z" fill="#fff6f8" />
        <path d="M1246 404 Q1261 388 1276 404 Q1266 398 1261 400 Q1255 398 1246 404 Z" fill="#fff6f8" />
        {[1226, 1252, 1278].map((wx) => (
          <path key={wx} d={`M${wx} 520 v-26 a7 7 0 0 1 14 0 v26 Z`} fill="#ffd27a" className="window-lit" />
        ))}
        <path d="M1252 440 v-18 a5 5 0 0 1 10 0 v18 Z" fill="#ffd27a" />
        <path d="M1188 602 v-60 a24 24 0 0 1 24 -24 v84 Z" fill="#3b4f98" />
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={1216 + i * 11.5} cy={458 - Math.sin((i / 8) * Math.PI) * 10} r="2.4" fill="#ffe7a8" className="glow" />
        ))}
      </g>

      {/* zvonik Sv. Stošije s lampicama */}
      <g>
        <rect x="1362" y="330" width="52" height="272" fill="#4a62ad" />
        <rect x="1362" y="330" width="14" height="272" fill="#5a74bf" />
        {[350, 410, 470, 530].map((ty) => (
          <g key={ty}>
            <rect x="1358" y={ty - 6} width="60" height="6" fill="#fff6f8" />
            <path d={`M1372 ${ty + 40} v-22 a6 6 0 0 1 12 0 v22 Z M1392 ${ty + 40} v-22 a6 6 0 0 1 12 0 v22 Z`} fill={ty === 350 || ty === 470 ? '#ffd27a' : '#2b3a7a'} />
          </g>
        ))}
        <rect x="1370" y="290" width="36" height="40" fill="#5168b2" />
        <path d="M1378 324 v-20 a5 5 0 0 1 10 0 v20 Z M1390 324 v-20 a5 5 0 0 1 10 0 v20 Z" fill="#ffd27a" className="window-lit" />
        <polygon points="1366,292 1388,248 1410,292" fill="#6a7fc6" />
        <polygon points="1366,292 1388,248 1394,262 1386,270 1392,280 1378,286" fill="#fff6f8" />
        <line x1="1388" y1="248" x2="1388" y2="230" stroke="#ffd24a" strokeWidth="3" />
        <line x1="1381" y1="237" x2="1395" y2="237" stroke="#ffd24a" strokeWidth="3" />
        {Array.from({ length: 14 }, (_, i) => (
          <g key={i}>
            <circle cx="1362" cy={340 + i * 19} r="2.2" fill="#ffe7a8" className="bulb glow" style={{ animationDelay: `${i * 0.15}s` }} />
            <circle cx="1414" cy={340 + i * 19} r="2.2" fill="#ffe7a8" className="bulb glow" style={{ animationDelay: `${i * 0.15 + 0.5}s` }} />
          </g>
        ))}
      </g>

      {/* pročelje katedrale */}
      <g>
        <rect x="1436" y="470" width="110" height="132" fill="#4459a6" />
        <polygon points="1430,472 1491,420 1552,472" fill="#5468b4" />
        <polygon points="1428,474 1491,418 1554,474 1530,466 1512,472 1490,462 1468,470 1450,464" fill="#fff6f8" />
        <circle cx="1491" cy="500" r="18" fill="#ffd27a" className="window-lit" />
        <circle cx="1491" cy="500" r="18" fill="none" stroke="#b07a2a" strokeWidth="2" />
        <path d="M1491 482 v36 M1473 500 h36 M1478 487 l26 26 M1504 487 l-26 26" stroke="#b07a2a" strokeWidth="1.5" />
        <path d="M1478 602 v-40 a13 13 0 0 1 26 0 v40 Z" fill="#2b3a7a" />
        <g transform="translate(1491 556)">
          <circle r="9" fill="none" stroke="#2f8f4e" strokeWidth="5" />
          <path d="M-4 8 l4 -4 l4 4" stroke="#ff5d6c" strokeWidth="3" fill="none" />
        </g>
      </g>

      {/* zidine + lampice */}
      <rect x="0" y="574" width="1600" height="30" fill="#4a5ea8" />
      {Array.from({ length: 54 }, (_, i) => (
        <rect key={`c${i}`} x={i * 30} y="566" width="16" height="10" fill="#4a5ea8" />
      ))}
      {Array.from({ length: 54 }, (_, i) => (
        <rect key={`s${i}`} x={i * 30 - 1} y="563" width="18" height="5" rx="2.5" fill="#fff6f8" />
      ))}
      {data.garland.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r="3" fill={b.c} className="bulb glow" style={{ animationDelay: `${b.d}s` }} />
      ))}

      {/* more */}
      <rect x="0" y="602" width="1600" height="298" fill="url(#sea)" />
      <rect x="0" y="602" width="1600" height="3" fill="#ffc2b0" opacity="0.6" />
      <ellipse cx="760" cy="620" rx="700" ry="24" fill="#ffc2b0" opacity="0.18" />
      {data.reflections.map((f, i) => (
        <rect key={i} className="shimmer" x={f.x} y={f.y} width={f.w} height="2.4" rx="1.2" fill={f.c} opacity={f.o} style={{ animationDelay: `${f.d}s` }} />
      ))}

      {/* brodica s lampicama */}
      <g className="boat" transform="translate(1010 705)">
        <path d="M-50 0 Q-46 18 -20 20 L36 20 Q54 18 58 -2 Z" fill="#f4f6fb" />
        <path d="M-50 0 L58 -2 L56 4 L-48 6 Z" fill="#009FE3" />
        <rect x="-12" y="-14" width="26" height="14" rx="2" fill="#dde4f2" />
        <line x1="4" y1="-14" x2="4" y2="-54" stroke="#dde4f2" strokeWidth="2.5" />
        <path d="M4 -54 L-46 -2 M4 -54 L56 -4" stroke="#1f2a5e" strokeWidth="1" opacity="0.6" />
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={`l${i}`} cx={4 - (i + 1) * 8} cy={-54 + (i + 1) * 8.6} r="2.2" fill={BULBS[i % BULBS.length]} className="bulb glow" style={{ animationDelay: `${i * 0.2}s` }} />
        ))}
        {Array.from({ length: 6 }, (_, i) => (
          <circle key={`r${i}`} cx={4 + (i + 1) * 8.5} cy={-54 + (i + 1) * 8.2} r="2.2" fill={BULBS[(i + 3) % BULBS.length]} className="bulb glow" style={{ animationDelay: `${i * 0.2 + 0.3}s` }} />
        ))}
        <circle cx="4" cy="-56" r="3" fill="#ffd24a" className="glow" />
      </g>

      {/* riva */}
      <path d="M0 832 L1600 820 L1600 900 L0 900 Z" fill="url(#stone)" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${940 + i * 40} ${828 + i * 14} L1600 ${820 + i * 14}`} stroke="#7b8dcc" strokeWidth="2" />
      ))}
      <path
        d="M0 834 Q60 822 120 832 T240 830 T360 832 T480 829 T600 831 T720 828 T840 830 T960 826 T1080 828 T1200 824 T1320 826 T1440 822 T1600 822 L1600 836 L0 846 Z"
        fill="#fff6f8"
      />

      {/* Pozdrav suncu */}
      <g className="sun-greeting">
        <ellipse cx="820" cy="866" rx="160" ry="26" fill="url(#sun)" opacity="0.25" />
        <ellipse cx="820" cy="866" rx="130" ry="16" fill="url(#sun)" opacity="0.95" />
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={820 + Math.cos((i / 18) * Math.PI * 2) * 40} y1={866 + Math.sin((i / 18) * Math.PI * 2) * 5} x2={820 + Math.cos((i / 18) * Math.PI * 2) * 128} y2={866 + Math.sin((i / 18) * Math.PI * 2) * 15.5} stroke="#1f2a5e" strokeWidth="1.2" opacity="0.45" />
        ))}
      </g>

      {/* palme s lampicama i kuglicama */}
      {[[650, 836, 1], [1120, 830, -1]].map(([px, py, dir], i) => (
        <g key={i} transform={`translate(${px} ${py})`}>
          <path d={`M0 0 Q${dir * 8} -60 ${dir * 2} -120`} stroke="#7a4f37" strokeWidth="9" fill="none" strokeLinecap="round" />
          {[-150, -110, -70, -30, 10, 50].map((a, k) => (
            <path
              key={k}
              d={`M${dir * 2} -120 q${Math.cos((a * Math.PI) / 180) * 40} ${Math.sin((a * Math.PI) / 180) * 40 - 6} ${Math.cos((a * Math.PI) / 180) * 70} ${Math.sin((a * Math.PI) / 180) * 50 + 22}`}
              stroke="#2e9a5a"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {[-150, -70, 10].map((a, k) => (
            <path key={k} d={`M${dir * 2} -122 q${Math.cos((a * Math.PI) / 180) * 30} ${Math.sin((a * Math.PI) / 180) * 30 - 8} ${Math.cos((a * Math.PI) / 180) * 46} ${Math.sin((a * Math.PI) / 180) * 32 + 4}`} stroke="#fff6f8" strokeWidth="4" fill="none" strokeLinecap="round" />
          ))}
          {[-150, -110, -30, 50].map((a, k) => (
            <circle key={`o${k}`} cx={dir * 2 + Math.cos((a * Math.PI) / 180) * 70} cy={-120 + Math.sin((a * Math.PI) / 180) * 50 + 30} r="5" fill={['#ff5d6c', '#ffd24a', '#4cd2ff', '#ff9ad5'][k]} />
          ))}
          {Array.from({ length: 11 }, (_, k) => (
            <circle key={k} cx={(k % 2 ? 5 : -5) + dir * k * 0.3} cy={-8 - k * 10.5} r="2.8" fill={BULBS[k % BULBS.length]} className="bulb glow" style={{ animationDelay: `${k * 0.3}s` }} />
          ))}
        </g>
      ))}

      {/* lampe na rivi */}
      {[880, 1300, 1560].map((lx) => (
        <g key={lx}>
          <circle cx={lx} cy="754" r="50" fill="url(#lampGlow)" />
          <rect x={lx - 2.5} y="756" width="5" height="76" fill="#1f2a5e" />
          <rect x={lx - 8} y="744" width="16" height="16" rx="3" fill="#ffe2a0" />
          <path d={`M${lx - 11} 744 Q${lx} 734 ${lx + 11} 744 Z`} fill="#fff6f8" />
          <path d={`M${lx - 2} 770 q-12 6 -10 16 M${lx + 2} 770 q12 6 10 16`} stroke="#2f8f4e" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx={lx} cy="772" r="3" fill="#ff5d6c" />
        </g>
      ))}
    </svg>
  );
}
