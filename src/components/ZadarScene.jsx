import { useEffect, useMemo, useState } from 'react';

// Ilustrirani zimski Zadar: Velebit, stari grad sa Sv. Donatom i zvonikom
// Sv. Stošije, more, Pozdrav suncu i Morske orgulje na rivi.

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
const BULBS = ['#ff5d5d', '#ffd24a', '#A9CF3A', '#4cc3ff', '#ff9ad5'];

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
      const l = [lerp(px, ax, 0.42), lerp(py, ay, 0.42)];
      const r = [lerp(px, bx, 0.42), lerp(py, by, 0.42)];
      const low = Math.max(l[1], r[1]);
      caps.push(
        [
          [px, py],
          r,
          [lerp(px, r[0], 0.55), low + 6],
          [px + 4, low - 2],
          [lerp(px, l[0], 0.5), low + 8],
          l,
        ]
          .map((p) => p.join(','))
          .join(' ')
      );
    }
  }
  return caps;
}

const BACK = [[0, 520], [0, 470], [90, 450], [180, 405], [270, 440], [350, 385], [440, 425], [530, 360], [620, 410], [710, 390], [800, 430], [890, 372], [990, 420], [1090, 355], [1190, 405], [1290, 378], [1390, 425], [1490, 388], [1600, 430], [1600, 520]];
const FRONT = [[0, 560], [0, 500], [120, 470], [230, 492], [330, 455], [450, 488], [560, 450], [680, 482], [790, 458], [900, 494], [1010, 462], [1120, 490], [1230, 470], [1350, 496], [1460, 468], [1600, 490], [1600, 560]];

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
    const stars = Array.from({ length: 110 }, () => ({
      x: r() * 1600,
      y: r() * 400,
      s: 0.6 + r() * 1.6,
      d: r() * 4,
    }));

    // kuće starog grada
    const houses = [];
    let x = -20;
    while (x < 1640) {
      const w = 44 + r() * 46;
      const inLandmark = x > 1190 && x < 1560;
      const h = inLandmark ? 40 + r() * 30 : 55 + r() * 85;
      const roof = r() > 0.25;
      const windows = [];
      const cols = Math.max(1, Math.floor((w - 14) / 16));
      const rows = Math.max(1, Math.floor((h - 26) / 22));
      for (let c = 0; c < cols; c++)
        for (let k = 0; k < rows; k++)
          windows.push({
            x: x + 9 + c * ((w - 18) / cols) + ((w - 18) / cols - 7) / 2,
            y: 600 - h + 14 + k * 22,
            lit: r() > 0.45,
            d: r() * 6,
          });
      houses.push({ x, w, h, roof, windows, tone: r() });
      x += w - 2;
    }

    const reflections = Array.from({ length: 70 }, () => {
      const hx = r() * 1600;
      return { x: hx, y: 612 + r() * 190, w: 10 + r() * 46, d: r() * 5, o: 0.12 + r() * 0.35 };
    });

    // lampice duž zidina
    const garland = [];
    for (let gx = 0; gx < 1600; gx += 150) {
      for (let i = 0; i <= 8; i++) {
        const t = i / 8;
        garland.push({
          x: gx + t * 150,
          y: 566 + Math.sin(Math.PI * t) * 14,
          c: BULBS[(gx / 150 + i) % BULBS.length],
          d: r() * 3,
        });
      }
    }
    return { stars, houses, reflections, garland, backCaps: snowCaps(BACK), frontCaps: snowCaps(FRONT) };
  }, []);

  return (
    <svg
      className="scene"
      viewBox="0 0 1600 900"
      preserveAspectRatio={portrait ? 'xMaxYMax slice' : 'xMidYMax slice'}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#040f26" />
          <stop offset="0.45" stopColor="#0a2447" />
          <stop offset="0.75" stopColor="#164a79" />
          <stop offset="1" stopColor="#2a6a9c" />
        </linearGradient>
        <linearGradient id="sea" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0f3a63" />
          <stop offset="1" stopColor="#051631" />
        </linearGradient>
        <radialGradient id="moonGlow">
          <stop offset="0" stopColor="#fff6d8" stopOpacity="0.55" />
          <stop offset="1" stopColor="#fff6d8" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="lampGlow">
          <stop offset="0" stopColor="#ffd58a" stopOpacity="0.85" />
          <stop offset="1" stopColor="#ffd58a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="horizonGlow" cx="0.5" cy="1" r="0.7">
          <stop offset="0" stopColor="#009FE3" stopOpacity="0.35" />
          <stop offset="1" stopColor="#009FE3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sun" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#4cc3ff" />
          <stop offset="0.25" stopColor="#A9CF3A" />
          <stop offset="0.5" stopColor="#ffd24a" />
          <stop offset="0.75" stopColor="#ff5d9e" />
          <stop offset="1" stopColor="#8a6bff" />
        </linearGradient>
        <linearGradient id="stone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#355a80" />
          <stop offset="1" stopColor="#1d3a5c" />
        </linearGradient>
        <linearGradient id="donat" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#173a60" />
          <stop offset="0.45" stopColor="#2b5885" />
          <stop offset="1" stopColor="#12304f" />
        </linearGradient>
      </defs>

      {/* nebo */}
      <rect width="1600" height="900" fill="url(#sky)" />
      <ellipse cx="800" cy="560" rx="900" ry="260" fill="url(#horizonGlow)" />
      {data.stars.map((s, i) => (
        <circle key={i} className="twinkle" cx={s.x} cy={s.y} r={s.s} fill="#fff" style={{ animationDelay: `${s.d}s` }} />
      ))}

      {/* mjesec */}
      <circle cx="1440" cy="125" r="140" fill="url(#moonGlow)" />
      <circle cx="1440" cy="125" r="48" fill="#fff7df" />
      <circle cx="1424" cy="112" r="9" fill="#efe3c2" />
      <circle cx="1456" cy="140" r="6" fill="#efe3c2" />
      <circle cx="1452" cy="108" r="4" fill="#efe3c2" />

      {/* Velebit */}
      <path d={ridge(BACK)} fill="#1f4670" />
      {data.backCaps.map((p, i) => (
        <polygon key={i} points={p} fill="#dfeeff" opacity="0.85" />
      ))}
      <path d={ridge(FRONT)} fill="#173a5f" />
      {data.frontCaps.map((p, i) => (
        <polygon key={i} points={p} fill="#e9f3ff" opacity="0.7" />
      ))}

      {/* kuće */}
      {data.houses.map((h, i) => {
        const top = 600 - h.h;
        const body = h.tone > 0.6 ? '#16385d' : h.tone > 0.3 ? '#12304f' : '#1a4069';
        return (
          <g key={i}>
            <rect x={h.x} y={top} width={h.w} height={h.h} fill={body} />
            {h.roof ? (
              <>
                <polygon points={`${h.x - 4},${top} ${h.x + h.w / 2},${top - 20} ${h.x + h.w + 4},${top}`} fill="#7b3a30" />
                <polygon
                  points={`${h.x - 5},${top + 1} ${h.x + h.w / 2},${top - 21} ${h.x + h.w + 5},${top + 1} ${h.x + h.w * 0.8},${top - 4} ${h.x + h.w * 0.62},${top - 1} ${h.x + h.w * 0.4},${top - 6} ${h.x + h.w * 0.18},${top - 1}`}
                  fill="#f4f9ff"
                />
              </>
            ) : (
              <rect x={h.x - 2} y={top - 5} width={h.w + 4} height="7" rx="3" fill="#f4f9ff" />
            )}
            {h.windows.map((w, k) => (
              <rect
                key={k}
                x={w.x}
                y={w.y}
                width="7"
                height="10"
                rx="1.5"
                fill={w.lit ? '#ffcf6e' : '#0c2440'}
                className={w.lit ? 'window-lit' : undefined}
                style={w.lit ? { animationDelay: `${w.d}s` } : undefined}
              />
            ))}
          </g>
        );
      })}

      {/* božićno drvce na trgu */}
      <g transform="translate(1135 430)">
        <circle cx="0" cy="70" r="90" fill="url(#lampGlow)" opacity="0.5" />
        <polygon points="0,-12 -32,40 -18,40 -46,90 -26,90 -58,150 58,150 26,90 46,90 18,40 32,40" fill="#1f6b3a" />
        <path d="M-30 42 Q0 58 30 40 M-44 92 Q0 112 44 90 M-56 150 Q0 168 56 150" stroke="#f4f9ff" strokeWidth="5" fill="none" strokeLinecap="round" />
        {[[-12, 30], [14, 50], [-24, 72], [20, 80], [-8, 100], [30, 118], [-36, 128], [6, 136], [-14, 60]].map(([bx, by], i) => (
          <circle key={i} cx={bx} cy={by} r="4" fill={BULBS[i % BULBS.length]} className="twinkle" style={{ animationDelay: `${i * 0.37}s` }} />
        ))}
        <polygon className="star-top" points="0,-30 5,-17 19,-17 8,-9 12,4 0,-4 -12,4 -8,-9 -19,-17 -5,-17" fill="#ffd24a" />
      </g>

      {/* Sv. Donat */}
      <g>
        <rect x="1212" y="452" width="98" height="150" fill="url(#donat)" />
        <path d="M1206 452 Q1261 432 1316 452 Z" fill="#f4f9ff" />
        <rect x="1236" y="405" width="50" height="50" fill="url(#donat)" />
        <path d="M1230 408 Q1261 380 1292 408 L1286 410 Q1261 398 1236 410 Z" fill="#f4f9ff" />
        <path d="M1234 406 Q1261 386 1288 406" fill="#2a5582" />
        <path d="M1246 404 Q1261 388 1276 404 Q1266 398 1261 400 Q1255 398 1246 404 Z" fill="#f4f9ff" />
        {[1226, 1252, 1278].map((wx) => (
          <path key={wx} d={`M${wx} 520 v-26 a7 7 0 0 1 14 0 v26 Z`} fill="#ffcf6e" className="window-lit" />
        ))}
        <path d="M1252 440 v-18 a5 5 0 0 1 10 0 v18 Z" fill="#ffcf6e" />
        <path d="M1188 602 v-60 a24 24 0 0 1 24 -24 v84 Z" fill="#14324f" />
      </g>

      {/* zvonik Sv. Stošije */}
      <g>
        <rect x="1362" y="330" width="52" height="272" fill="#1b4169" />
        <rect x="1362" y="330" width="14" height="272" fill="#204b78" />
        {[350, 410, 470, 530].map((ty) => (
          <g key={ty}>
            <rect x="1358" y={ty - 6} width="60" height="6" fill="#f4f9ff" />
            <path d={`M1372 ${ty + 40} v-22 a6 6 0 0 1 12 0 v22 Z M1392 ${ty + 40} v-22 a6 6 0 0 1 12 0 v22 Z`} fill={ty === 350 ? '#ffcf6e' : '#0c2440'} />
          </g>
        ))}
        <rect x="1370" y="290" width="36" height="40" fill="#1e4670" />
        <path d="M1378 324 v-20 a5 5 0 0 1 10 0 v20 Z M1390 324 v-20 a5 5 0 0 1 10 0 v20 Z" fill="#ffcf6e" className="window-lit" />
        <polygon points="1366,292 1388,248 1410,292" fill="#2a5582" />
        <polygon points="1366,292 1388,248 1394,262 1386,270 1392,280 1378,286" fill="#f4f9ff" />
        <line x1="1388" y1="248" x2="1388" y2="232" stroke="#ffd24a" strokeWidth="3" />
        <line x1="1381" y1="238" x2="1395" y2="238" stroke="#ffd24a" strokeWidth="3" />
      </g>

      {/* pročelje katedrale */}
      <g>
        <rect x="1436" y="470" width="110" height="132" fill="#173b62" />
        <polygon points="1430,472 1491,420 1552,472" fill="#1d4670" />
        <polygon points="1428,474 1491,418 1554,474 1530,466 1512,472 1490,462 1468,470 1450,464" fill="#f4f9ff" />
        <circle cx="1491" cy="500" r="18" fill="#ffcf6e" className="window-lit" />
        <circle cx="1491" cy="500" r="18" fill="none" stroke="#b07a2a" strokeWidth="2" />
        <path d="M1491 482 v36 M1473 500 h36 M1478 487 l26 26 M1504 487 l-26 26" stroke="#b07a2a" strokeWidth="1.5" />
        <path d="M1478 602 v-40 a13 13 0 0 1 26 0 v40 Z" fill="#0c2440" />
      </g>

      {/* zidine + lampice */}
      <rect x="0" y="574" width="1600" height="30" fill="#1c4168" />
      {Array.from({ length: 54 }, (_, i) => (
        <rect key={i} x={i * 30} y="566" width="16" height="10" fill="#1c4168" />
      ))}
      {Array.from({ length: 54 }, (_, i) => (
        <rect key={i} x={i * 30 - 1} y="563" width="18" height="5" rx="2.5" fill="#f4f9ff" />
      ))}
      {data.garland.map((b, i) => (
        <g key={i}>
          <circle cx={b.x} cy={b.y} r="2.8" fill={b.c} className="bulb" style={{ animationDelay: `${b.d}s` }} />
        </g>
      ))}

      {/* more */}
      <rect x="0" y="602" width="1600" height="298" fill="url(#sea)" />
      <rect x="0" y="602" width="1600" height="3" fill="#2a6a9c" opacity="0.6" />
      {data.reflections.map((f, i) => (
        <rect key={i} className="shimmer" x={f.x} y={f.y} width={f.w} height="2.4" rx="1.2" fill="#ffcf6e" opacity={f.o} style={{ animationDelay: `${f.d}s` }} />
      ))}

      {/* brodica */}
      <g className="boat" transform="translate(1010 705)">
        <path d="M-50 0 Q-46 18 -20 20 L36 20 Q54 18 58 -2 Z" fill="#e9eef4" />
        <path d="M-50 0 L58 -2 L56 4 L-48 6 Z" fill="#009FE3" />
        <rect x="-12" y="-14" width="26" height="14" rx="2" fill="#cdd8e4" />
        <line x1="4" y1="-14" x2="4" y2="-50" stroke="#cdd8e4" strokeWidth="2.5" />
        <circle cx="4" cy="-52" r="16" fill="url(#lampGlow)" />
        <circle cx="4" cy="-52" r="3.5" fill="#ffe2a0" />
        <path d="M-40 -4 Q-30 -10 -18 -6" stroke="#f4f9ff" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* riva */}
      <path d="M0 832 L1600 820 L1600 900 L0 900 Z" fill="url(#stone)" />
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M${940 + i * 40} ${828 - i * 0.3 + i * 14} L1600 ${820 + i * 14}`} stroke="#4a729a" strokeWidth="2" />
      ))}
      <path
        d="M0 834 Q60 822 120 832 T240 830 T360 832 T480 829 T600 831 T720 828 T840 830 T960 826 T1080 828 T1200 824 T1320 826 T1440 822 T1600 822 L1600 836 L0 846 Z"
        fill="#f4f9ff"
      />

      {/* Pozdrav suncu */}
      <g className="sun-greeting">
        <ellipse cx="820" cy="866" rx="130" ry="16" fill="url(#sun)" opacity="0.9" />
        <ellipse cx="820" cy="866" rx="160" ry="26" fill="url(#sun)" opacity="0.18" />
        {Array.from({ length: 18 }, (_, i) => (
          <line key={i} x1={820 + Math.cos((i / 18) * Math.PI * 2) * 40} y1={866 + Math.sin((i / 18) * Math.PI * 2) * 5} x2={820 + Math.cos((i / 18) * Math.PI * 2) * 128} y2={866 + Math.sin((i / 18) * Math.PI * 2) * 15.5} stroke="#071A3B" strokeWidth="1.2" opacity="0.5" />
        ))}
      </g>

      {/* palme s lampicama */}
      {[[650, 836, 1], [1120, 830, -1]].map(([px, py, dir], i) => (
        <g key={i} transform={`translate(${px} ${py})`}>
          <path d={`M0 0 Q${dir * 8} -60 ${dir * 2} -120`} stroke="#5a3d2b" strokeWidth="9" fill="none" strokeLinecap="round" />
          {[-150, -110, -70, -30, 10, 50].map((a, k) => (
            <path
              key={k}
              d={`M${dir * 2} -120 q${Math.cos((a * Math.PI) / 180) * 40} ${Math.sin((a * Math.PI) / 180) * 40 - 6} ${Math.cos((a * Math.PI) / 180) * 70} ${Math.sin((a * Math.PI) / 180) * 50 + 22}`}
              stroke="#2d7a4a"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
            />
          ))}
          {[-150, -70, 10].map((a, k) => (
            <path key={k} d={`M${dir * 2} -122 q${Math.cos((a * Math.PI) / 180) * 30} ${Math.sin((a * Math.PI) / 180) * 30 - 8} ${Math.cos((a * Math.PI) / 180) * 46} ${Math.sin((a * Math.PI) / 180) * 32 + 4}`} stroke="#f4f9ff" strokeWidth="4" fill="none" strokeLinecap="round" />
          ))}
          {Array.from({ length: 9 }, (_, k) => (
            <circle key={k} cx={(k % 2 ? 5 : -5) + dir * k * 0.3} cy={-12 - k * 12} r="2.6" fill={BULBS[k % BULBS.length]} className="bulb" style={{ animationDelay: `${k * 0.3}s` }} />
          ))}
        </g>
      ))}

      {/* lampe na rivi */}
      {[880, 1300, 1560].map((lx) => (
        <g key={lx}>
          <circle cx={lx} cy="754" r="44" fill="url(#lampGlow)" opacity="0.8" />
          <rect x={lx - 2.5} y="756" width="5" height="76" fill="#0d2440" />
          <rect x={lx - 8} y="744" width="16" height="16" rx="3" fill="#ffe2a0" />
          <path d={`M${lx - 11} 744 Q${lx} 734 ${lx + 11} 744 Z`} fill="#f4f9ff" />
        </g>
      ))}
    </svg>
  );
}
