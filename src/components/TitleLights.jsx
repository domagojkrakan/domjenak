// Niz božićnih lampica koji visi preko naslova.
const W = 1000;
const NAILS = [0, 200, 400, 600, 800, 1000];
const TOP = 14;
const SAG = 58;
const COLORS = ['#ff4d5e', '#ffd166', '#7ee06a', '#4cc9ff', '#ff8fd8'];

const swags = NAILS.slice(0, -1).map((x0, i) => {
  const x1 = NAILS[i + 1];
  return { x0, x1, cx: (x0 + x1) / 2, cy: TOP + SAG * 2 };
});
const point = (s, t) => ({
  x: (1 - t) ** 2 * s.x0 + 2 * (1 - t) * t * s.cx + t * t * s.x1,
  y: (1 - t) ** 2 * TOP + 2 * (1 - t) * t * s.cy + t * t * TOP,
  // nagib žice, da lampica visi okomito na nju
  a:
    (Math.atan2(2 * (1 - t) * (s.cy - TOP) + 2 * t * (TOP - s.cy), 2 * (1 - t) * (s.cx - s.x0) + 2 * t * (s.x1 - s.cx)) * 180) /
    Math.PI,
});
const BULBS = swags.flatMap((s, i) => [0.17, 0.39, 0.61, 0.83].map((t, j) => ({ ...point(s, t), c: COLORS[(i * 4 + j) % COLORS.length] })));
const WIRE = `M0 ${TOP} ${swags.map((s) => `Q${s.cx} ${s.cy} ${s.x1} ${TOP}`).join(' ')}`;

export default function TitleLights() {
  return (
    <svg className="title-lights" viewBox={`-20 -6 ${W + 40} 150`} aria-hidden="true">
      <path d={WIRE} fill="none" stroke="#1f5a2a" strokeWidth="4" strokeLinecap="round" />
      <path d={WIRE} fill="none" stroke="#3c8a3f" strokeWidth="1.6" strokeLinecap="round" opacity=".8" />
      {NAILS.map((x) => (
        <g key={x} transform={`translate(${x} ${TOP})`}>
          <path d="M-12 -4 Q0 -14 12 -4 Q0 6 -12 -4Z" fill="#2f8a3d" />
          <circle cx="-4" cy="1" r="3.5" fill="#e5383b" />
          <circle cx="3" cy="2" r="3.5" fill="#e5383b" />
        </g>
      ))}
      {BULBS.map((b, i) => (
        <g key={i} transform={`translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.a.toFixed(1)})`}>
          <g className="tl-bulb" style={{ '--c': b.c, '--i': i }}>
            <rect x="-5" y="1" width="10" height="9" rx="2" fill="#2c3a2c" />
            <path d="M-8 12 Q-11 24 0 34 Q11 24 8 12 Z" fill={b.c} />
            <ellipse cx="-3" cy="18" rx="2.2" ry="5" fill="#fff" opacity=".55" />
          </g>
        </g>
      ))}
    </svg>
  );
}
