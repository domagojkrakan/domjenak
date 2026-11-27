import { useMemo, useState } from 'react';
import Avatar from './Avatar.jsx';
import { normalize } from '../api.js';

// Mreža osoba s tražilicom — za "tko si ti" i za izbor cimera.
export default function PersonPicker({ people, onPick, placeholder = 'Upiši ime…', empty = 'Nema nikoga za odabrati.', busy }) {
  const [q, setQ] = useState('');
  const shown = useMemo(() => {
    const words = normalize(q).split(/\s+/).filter(Boolean);
    if (!words.length) return people;
    return people.filter((p) => {
      const n = normalize(p.name);
      return words.every((w) => n.split(/\s+/).some((part) => part.startsWith(w)) || n.includes(w));
    });
  }, [people, q]);

  return (
    <div className="picker">
      {people.length > 6 && (
        <div className="search-input picker-search">
          <span className="search-icon" aria-hidden="true">
            ❄
          </span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={placeholder} />
        </div>
      )}
      {shown.length ? (
        <ul className="picker-grid">
          {shown.map((p) => (
            <li key={p.slug}>
              <button type="button" className="picker-item" onClick={() => onPick(p)} disabled={busy}>
                <Avatar person={p} size={64} snow={false} />
                <span>{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="picker-empty">{q ? 'Nitko s tim imenom. 🤷' : empty}</p>
      )}
    </div>
  );
}
