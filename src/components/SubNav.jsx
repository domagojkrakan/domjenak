// Kartice na podstranicama: Tko dolazi? · Smještaj · Prijevoz
const TABS = [
  ['/popis', '🎄', 'Tko dolazi?'],
  ['/smjestaj', '🛏️', 'Smještaj'],
  ['/prijevoz', '🛷', 'Prijevoz'],
];

export default function SubNav({ path, navigate }) {
  return (
    <nav className="subnav" aria-label="Domjenak">
      {TABS.map(([href, icon, label]) => (
        <a
          key={href}
          href={href}
          className={path.startsWith(href) ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate(href);
          }}
        >
          <span aria-hidden="true">{icon}</span> {label}
        </a>
      ))}
    </nav>
  );
}
