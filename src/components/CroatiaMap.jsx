import { CITIES, CITY_BY_ID, DESTINATION } from '../../lib/cities.js';

// Ilustrirana (pojednostavljena) karta Hrvatske. Koordinate su približne.
const X = (lon) => (lon - 13.3) * 72;
const Y = (lat) => (46.65 - lat) * 100;
const pt = ([lon, lat]) => `${X(lon).toFixed(1)},${Y(lat).toFixed(1)}`;
const poly = (list) => `M${list.map(pt).join('L')}Z`;

const MAINLAND = [
  [13.49, 45.49], [13.62, 45.47], [13.9, 45.47], [14.1, 45.48], [14.33, 45.47], [14.55, 45.62], [14.85, 45.5],
  [15.18, 45.45], [15.3, 45.72], [15.55, 45.83], [15.68, 45.84], [15.65, 46.05], [15.62, 46.22], [15.95, 46.3],
  [16.25, 46.42], [16.55, 46.5], [16.85, 46.38], [17.1, 46.2], [17.3, 46.05], [17.65, 45.93], [18.1, 45.78],
  [18.5, 45.78], [18.85, 45.9], [19.02, 45.65], [19.0, 45.45], [19.42, 45.23], [19.15, 45.05], [18.95, 44.88],
  [18.65, 45.05], [18.4, 45.1], [18.0, 45.14], [17.6, 45.12], [17.25, 45.15], [16.95, 45.25], [16.7, 45.2],
  [16.5, 45.22], [16.3, 45.0], [15.95, 45.18], [15.75, 44.98], [15.68, 44.82], [16.05, 44.55], [16.25, 44.2],
  [16.55, 43.95], [16.8, 43.8], [17.15, 43.5], [17.35, 43.25], [17.6, 43.08], [17.62, 42.97], [17.55, 42.93],
  [17.45, 43.03], [17.2, 43.2], [17.02, 43.3], [16.7, 43.44], [16.44, 43.5], [16.25, 43.52], [16.05, 43.5],
  [15.92, 43.57], [15.9, 43.73], [15.65, 43.82], [15.44, 43.94], [15.22, 44.12], [15.15, 44.25], [15.25, 44.32],
  [15.05, 44.55], [14.95, 44.8], [14.9, 45.0], [14.7, 45.17], [14.55, 45.27], [14.44, 45.33], [14.3, 45.3],
  [14.22, 45.1], [14.08, 44.98], [13.92, 44.77], [13.84, 44.87], [13.7, 44.98], [13.63, 45.08], [13.59, 45.23],
  [13.52, 45.38],
];
const DUBROVNIK = [
  [17.66, 42.92], [17.85, 42.85], [18.1, 42.73], [18.3, 42.6], [18.55, 42.42], [18.45, 42.45], [18.25, 42.57],
  [18.09, 42.64], [17.95, 42.72], [17.75, 42.8], [17.7, 42.85],
];
const PELJESAC = [[17.7, 42.86], [17.4, 42.97], [17.05, 43.03], [17.1, 42.98], [17.45, 42.9], [17.7, 42.82]];
// otoci: [lon, lat] jednog kraja, [lon, lat] drugog kraja, širina
const ISLANDS = [
  [[14.45, 45.13], [14.78, 44.98], 9], [[14.35, 45.15], [14.45, 44.65], 6], [[14.42, 44.65], [14.5, 44.5], 4],
  [[14.68, 44.83], [14.82, 44.7], 5], [[14.72, 44.65], [15.18, 44.33], 5], [[14.85, 44.1], [15.2, 43.88], 3.5],
  [[15.05, 44.15], [15.45, 43.9], 4], [[16.4, 43.38], [16.95, 43.28], 9], [[16.3, 43.18], [17.2, 43.12], 5],
  [[16.65, 42.97], [17.2, 42.93], 5], [[16.05, 43.07], [16.25, 43.03], 6], [[17.3, 42.8], [17.75, 42.7], 4],
  [[16.8, 42.77], [16.95, 42.74], 4],
];

const DEST = { x: X(DESTINATION.lon), y: Y(DESTINATION.lat) };

export function routePath(cityId, i = 0) {
  const c = CITY_BY_ID.get(cityId);
  if (!c) return '';
  const x = X(c.lon), y = Y(c.lat);
  const mx = (x + DEST.x) / 2, my = (y + DEST.y) / 2;
  const dx = DEST.x - x, dy = DEST.y - y;
  const len = Math.hypot(dx, dy) || 1;
  const bend = Math.min(60, len * 0.25) * (i % 2 ? -1 : 1) + i * 6;
  return `M${x.toFixed(1)},${y.toFixed(1)} Q${(mx - (dy / len) * bend).toFixed(1)},${(my + (dx / len) * bend).toFixed(1)} ${DEST.x.toFixed(1)},${DEST.y.toFixed(1)}`;
}

export default function CroatiaMap({ rides = [], active, onSelect }) {
  const used = new Set(rides.map((r) => r.city));
  const perCity = {};
  const routes = rides.map((r) => {
    const i = (perCity[r.city] = (perCity[r.city] ?? -1) + 1);
    return { ...r, d: routePath(r.city, i) };
  });

  return (
    <svg className="hr-map" viewBox="-20 -10 490 460" role="img" aria-label="Karta Hrvatske s vožnjama prema Zadru">
      <defs>
        <radialGradient id="map-sea" cx="35%" cy="70%" r="80%">
          <stop offset="0" stopColor="#2b5fb8" />
          <stop offset="1" stopColor="#16245f" />
        </radialGradient>
        <linearGradient id="map-land" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dde8fb" />
        </linearGradient>
        <filter id="map-glow">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      <rect x="-20" y="-10" width="490" height="460" rx="24" fill="url(#map-sea)" />
      {Array.from({ length: 26 }, (_, i) => (
        <circle key={i} cx={(i * 97) % 470 - 10} cy={(i * 61) % 440} r={1 + (i % 3) * 0.6} fill="#fff" opacity=".35" />
      ))}

      <g className="map-land">
        <path d={poly(MAINLAND)} fill="url(#map-land)" stroke="#9fb8e6" strokeWidth="2" strokeLinejoin="round" />
        <path d={poly(DUBROVNIK)} fill="url(#map-land)" stroke="#9fb8e6" strokeWidth="2" strokeLinejoin="round" />
        <path d={poly(PELJESAC)} fill="url(#map-land)" stroke="#9fb8e6" strokeWidth="1.5" strokeLinejoin="round" />
        {ISLANDS.map(([p, q, w], i) => {
          const x1 = X(p[0]), y1 = Y(p[1]), x2 = X(q[0]), y2 = Y(q[1]);
          const cx = (x1 + x2) / 2, cy = (y1 + y2) / 2;
          const rx = Math.hypot(x2 - x1, y2 - y1) / 2;
          const ang = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          return (
            <ellipse key={i} cx={cx} cy={cy} rx={rx} ry={w / 2} transform={`rotate(${ang} ${cx} ${cy})`} fill="url(#map-land)" stroke="#9fb8e6" strokeWidth="1.2" />
          );
        })}
      </g>

      {/* rute */}
      {routes.map((r) => (
        <g
          key={r.driver}
          className={`map-route ${active === r.driver ? 'active' : ''}`}
          onClick={() => onSelect?.(r.driver)}
          style={{ cursor: onSelect ? 'pointer' : undefined }}
        >
          <path d={r.d} className="map-route-glow" />
          <path d={r.d} className="map-route-line" />
          <text className="map-sleigh" fontSize="18" textAnchor="middle" dominantBaseline="middle">
            🛷
            <animateMotion dur={`${5 + (r.driver.length % 4)}s`} repeatCount="indefinite" path={r.d} rotate="0" />
          </text>
        </g>
      ))}

      {/* gradovi */}
      {CITIES.map((c) => {
        const on = used.has(c.id);
        if (!c.major && !on) return null;
        const x = X(c.lon), y = Y(c.lat);
        return (
          <g key={c.id} className={`map-city ${on ? 'on' : ''}`}>
            <circle cx={x} cy={y} r={on ? 6 : 3.5} />
            <text x={x + 8} y={y + 4}>{c.name}</text>
          </g>
        );
      })}

      {/* Zadar */}
      <g className="map-dest">
        <circle cx={DEST.x} cy={DEST.y} r="18" fill="#F5B728" opacity=".35" filter="url(#map-glow)" />
        <text x={DEST.x} y={DEST.y + 2} fontSize="24" textAnchor="middle" dominantBaseline="middle">
          🎄
        </text>
        <text className="map-dest-label" x={DEST.x - 16} y={DEST.y + 4} textAnchor="end">
          Zadar
        </text>
      </g>
    </svg>
  );
}
