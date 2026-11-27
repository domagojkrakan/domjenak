import { useEffect, useRef, useState } from 'react';

const SRC = '/audio/bozicna.m4a';
const KEY = 'domjenak-music-muted';
const UNLOCK_EVENTS = ['pointerdown', 'keydown', 'touchstart'];

// Pozadinska pjesma: kreće čim se stranica otvori i vrti se u krug.
// Preglednici često blokiraju zvuk prije prve interakcije — tada krene na prvi klik/tipku.
export default function Music() {
  const audioRef = useRef(null);
  const [muted, setMuted] = useState(() => {
    try {
      return localStorage.getItem(KEY) === '1';
    } catch {
      return false;
    }
  });
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.5;
    if (muted) {
      audio.pause();
      return;
    }

    let done = false;
    const cleanup = () => UNLOCK_EVENTS.forEach((ev) => window.removeEventListener(ev, unlock, true));
    const tryPlay = () =>
      audio
        .play()
        .then(() => {
          done = true;
          cleanup();
        })
        .catch(() => {});
    function unlock() {
      if (!done) tryPlay();
    }

    tryPlay();
    UNLOCK_EVENTS.forEach((ev) => window.addEventListener(ev, unlock, true));
    return cleanup;
  }, [muted]);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    try {
      localStorage.setItem(KEY, next ? '1' : '0');
    } catch {}
  };

  const on = playing && !muted;

  return (
    <>
      <audio
        ref={audioRef}
        src={SRC}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />
      <button
        type="button"
        className={`music-btn ${on ? 'on' : ''}`}
        onClick={toggle}
        aria-pressed={!muted}
        aria-label={muted ? 'Uključi glazbu' : 'Isključi glazbu'}
        title={muted ? 'Uključi glazbu' : 'Isključi glazbu'}
      >
        <svg className="music-bell" viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="bell-gold" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#FFE58A" />
              <stop offset="0.55" stopColor="#F5B728" />
              <stop offset="1" stopColor="#C9821A" />
            </linearGradient>
          </defs>
          <g className="bell-swing">
            <path d="M32 12c-9 0-15 7-15 17v9l-5 7h40l-5-7v-9c0-10-6-17-15-17z" fill="url(#bell-gold)" stroke="#9a5f10" strokeWidth="1.5" />
            <path d="M22 24c1-5 4-8 8-9" stroke="#fff6cf" strokeWidth="3" strokeLinecap="round" fill="none" opacity=".8" />
            <rect x="12" y="44" width="40" height="4" rx="2" fill="#C9821A" />
            <circle className="bell-clapper" cx="32" cy="52" r="5" fill="#C9821A" stroke="#9a5f10" strokeWidth="1.5" />
          </g>
          {/* mašna i božikovina */}
          <path d="M32 12 C24 2 16 6 20 12 C22 15 28 14 32 12 Z" fill="#E2263A" />
          <path d="M32 12 C40 2 48 6 44 12 C42 15 36 14 32 12 Z" fill="#E2263A" />
          <path d="M26 13 l-4 9 4-2 2 4 2-10z M38 13 l4 9-4-2-2 4-2-10z" fill="#B5172A" />
          <circle cx="32" cy="12" r="3.5" fill="#B5172A" />
          <path d="M44 10 q6-4 10 0 q-5 1-4 6 q-4-3-6-6z" fill="#3FA34D" />
          <circle cx="45" cy="13" r="2.2" fill="#E2263A" />
          {muted && <path className="bell-slash" d="M10 10 L54 56" stroke="#E2263A" strokeWidth="5" strokeLinecap="round" />}
        </svg>
        {on && (
          <span className="music-notes" aria-hidden="true">
            <i>♪</i>
            <i>♫</i>
            <i>♪</i>
          </span>
        )}
        <span className="music-label">{muted ? 'Upali glazbu' : 'Utišaj'}</span>
      </button>
    </>
  );
}
