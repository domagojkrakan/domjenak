import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PEOPLE } from '../people.js';
import { normalize, firstName } from '../api.js';
import Avatar from './Avatar.jsx';

function slugify(s) {
  return normalize(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export default function RsvpCard({ attendees, onSubmit, busy, error, onShowList, onCancel }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(null);
  const inputRef = useRef(null);

  const going = useMemo(() => new Set(attendees.map((a) => a.slug)), [attendees]);

  const options = useMemo(() => {
    const q = normalize(query);
    if (!q) return [];
    const words = q.split(/\s+/);
    const matches = PEOPLE.filter((p) => {
      const n = normalize(p.name);
      const parts = n.split(/\s+/);
      return words.every((w) => parts.some((part) => part.startsWith(w)) || n.includes(w));
    }).slice(0, 6);
    const clean = query.replace(/\s+/g, ' ').trim();
    if (!matches.length && clean.split(' ').length >= 2 && clean.length >= 4) {
      return [{ slug: slugify(clean), name: clean.replace(/(^|\s)\S/g, (c) => c.toUpperCase()), photo: false, custom: true }];
    }
    return matches;
  }, [query]);

  const pick = (p) => {
    setSelected(p);
    setQuery('');
    setOpen(false);
  };

  const onKey = (e) => {
    if (!options.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (a + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => (a - 1 + options.length) % options.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      pick(options[active] || options[0]);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const already = selected && going.has(selected.slug);

  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95, transition: { duration: 0.35 } }}
      transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: 0.15 }}
    >
      <div className="card-snow" aria-hidden="true" />

      <AnimatePresence mode="wait" initial={false}>
        {!selected ? (
          <motion.div key="search" className="search" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="search-input">
              <span className="search-icon" aria-hidden="true">
                ❄
              </span>
              <input
                id="who"
                aria-label="Upiši svoje ime i prezime"
                ref={inputRef}
                autoComplete="off"
                placeholder="Počni upisivati ime i prezime…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setOpen(true);
                  setActive(0);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => setTimeout(() => setOpen(false), 150)}
                onKeyDown={onKey}
                role="combobox"
                aria-expanded={open && options.length > 0}
                aria-controls="who-list"
                aria-autocomplete="list"
              />
            </div>
            <AnimatePresence>
              {open && options.length > 0 && (
                <motion.ul
                  id="who-list"
                  role="listbox"
                  className="dropdown"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {options.map((p, i) => (
                    <li
                      key={p.slug}
                      role="option"
                      aria-selected={i === active}
                      className={i === active ? 'active' : ''}
                      onMouseEnter={() => setActive(i)}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pick(p);
                      }}
                    >
                      <Avatar person={p} size={44} />
                      <span className="opt-name">
                        {p.custom ? (
                          <>
                            Dodaj „{p.name}”<small>Nisam na popisu</small>
                          </>
                        ) : (
                          p.name
                        )}
                      </span>
                      {going.has(p.slug) && <span className="badge">✓ dolazi</span>}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </motion.div>
        ) : (
          <motion.div
            key="selected"
            className="selected"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          >
            <div className="selected-avatar">
              <Avatar person={selected} size={92} />
            </div>
            <div className="selected-text">
              <strong>{selected.name}</strong>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setSelected(null);
                  setTimeout(() => inputRef.current?.focus(), 50);
                }}
              >
                Nisi ti? Promijeni
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {already ? (
        <div className="already">
          <p>
            🎉 {firstName(selected.name)}, već si na popisu! Vidimo se 10.12.
          </p>
          <div className="already-actions">
            <button type="button" className="btn-ghost" onClick={onShowList}>
              Pogledaj tko sve dolazi →
            </button>
            <button type="button" className="btn-cancel-link" onClick={() => onCancel(selected)}>
              Ipak ne mogu doći
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className="gift-btn" disabled={!selected || busy} onClick={() => onSubmit(selected)}>
          <span className="gift-bow" aria-hidden="true">
            <svg viewBox="0 0 80 40">
              <path d="M40 30 Q18 2 8 12 Q0 24 40 30 Z" fill="#A9CF3A" />
              <path d="M40 30 Q62 2 72 12 Q80 24 40 30 Z" fill="#A9CF3A" />
              <path d="M40 30 Q22 10 13 15" stroke="#7fa324" strokeWidth="2" fill="none" />
              <path d="M40 30 Q58 10 67 15" stroke="#7fa324" strokeWidth="2" fill="none" />
              <circle cx="40" cy="30" r="7" fill="#8fbb2a" />
            </svg>
          </span>
          <span className="gift-ribbon" aria-hidden="true" />
          <span className="gift-label">{busy ? 'Šaljem sobove…' : 'Dolazim!'}</span>
        </button>
      )}

      {!selected && <p className="hint">Odaberi sebe s popisa pa klikni „Dolazim!”</p>}
      {error && <p className="error">{error}</p>}
    </motion.div>
  );
}
