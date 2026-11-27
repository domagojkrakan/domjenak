import Avatar from './Avatar.jsx';

const SETS = [
  ['#ff4d5e', '#ffd166', '#4cc9ff'],
  ['#7ee06a', '#ff8fd8', '#ffd166'],
  ['#4cc9ff', '#ff4d5e', '#7ee06a'],
];

// Osoba koja "visi u zraku" na balonima dok čeka prijevoz.
export default function Floater({ person, city, note, index = 0, children }) {
  const [a, b, c] = SETS[index % SETS.length];
  return (
    <div className="floater" style={{ '--d': `${(index % 5) * -0.7}s` }}>
      <div className="floater-body">
        <svg className="floater-balloons" viewBox="0 0 120 120" aria-hidden="true">
          <path d="M60 118 L34 52 M60 118 L60 40 M60 118 L86 52" stroke="rgba(255,255,255,.7)" strokeWidth="1.2" fill="none" />
          {[
            [34, 34, a, -8],
            [86, 34, c, 8],
            [60, 22, b, 0],
          ].map(([x, y, col, r], i) => (
            <g key={i} transform={`rotate(${r} ${x} ${y + 18})`}>
              <ellipse cx={x} cy={y} rx="17" ry="21" fill={col} />
              <ellipse cx={x - 6} cy={y - 8} rx="4" ry="7" fill="#fff" opacity=".45" />
              <path d={`M${x - 3} ${y + 21} L${x + 3} ${y + 21} L${x} ${y + 25} Z`} fill={col} />
            </g>
          ))}
        </svg>
        <Avatar person={person} size={72} snow={false} />
      </div>
      <p className="floater-name">{person.name}</p>
      <span className="floater-city">📍 {city}</span>
      {note && <p className="floater-note">„{note}”</p>}
      {children}
    </div>
  );
}
