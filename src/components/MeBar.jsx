import { useState } from 'react';
import Avatar from './Avatar.jsx';
import PersonPicker from './PersonPicker.jsx';
import { setMe, useMe } from '../me.js';
import { firstName } from '../api.js';

// "Ti si: …" — tko koristi stranicu. Bira se samo među prijavljenima.
export default function MeBar({ attendees, navigate }) {
  const me = useMe();
  const [choosing, setChoosing] = useState(false);
  const going = me && attendees.some((a) => a.slug === me.slug);

  if (going && !choosing) {
    return (
      <div className="me-bar">
        <Avatar person={me} size={44} snow={false} />
        <span>
          Bok, <strong>{firstName(me.name)}</strong>!
        </span>
        <button type="button" className="link" onClick={() => setChoosing(true)}>
          Nisi ti?
        </button>
      </div>
    );
  }

  return (
    <div className="me-pick card">
      <div className="card-snow" aria-hidden="true" />
      <h2>Tko si ti?</h2>
      {attendees.length ? (
        <>
          <p className="muted">Odaberi sebe. Ovdje su samo oni koji su potvrdili dolazak.</p>
          <PersonPicker
            people={attendees}
            placeholder="Upiši svoje ime…"
            onPick={(p) => {
              setMe(p);
              setChoosing(false);
            }}
          />
        </>
      ) : (
        <p className="muted">Još se nitko nije prijavio.</p>
      )}
      <button type="button" className="btn-ghost" onClick={() => navigate('/')}>
        Nisi na popisu? Prvo se prijavi →
      </button>
      {going && (
        <button type="button" className="link" onClick={() => setChoosing(false)}>
          Odustani
        </button>
      )}
    </div>
  );
}

export function useGoingMe(attendees) {
  const me = useMe();
  return me && attendees.some((a) => a.slug === me.slug) ? attendees.find((a) => a.slug === me.slug) : null;
}
