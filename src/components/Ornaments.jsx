// Božićne kuglice koje vise s vrha ekrana i lagano se njišu.
const LEFT = [
  { x: 3, len: 120, size: 46, c: '#009FE3' },
  { x: 8.5, len: 70, size: 34, c: '#ff5d6c' },
  { x: 13, len: 150, size: 40, c: '#A9CF3A' },
  { x: 18, len: 46, size: 26, c: '#ffd24a' },
];
const RIGHT = [
  { x: 82, len: 56, size: 28, c: '#ff9ad5' },
  { x: 87, len: 140, size: 44, c: '#ffd24a' },
  { x: 92, len: 84, size: 34, c: '#009FE3' },
  { x: 96.5, len: 160, size: 38, c: '#ff5d6c' },
];

function Bauble({ x, len, size, c, i }) {
  return (
    <div className="ornament" style={{ left: `${x}%`, '--len': `${len}px`, '--size': `${size}px`, '--c': c, animationDelay: `${i * -0.7}s` }}>
      <span className="ornament-string" />
      <span className="ornament-cap" />
      <span className="ornament-ball" />
    </div>
  );
}

export default function Ornaments() {
  return (
    <div className="ornaments" aria-hidden="true">
      {[...LEFT, ...RIGHT].map((o, i) => (
        <Bauble key={i} {...o} i={i} />
      ))}
    </div>
  );
}
