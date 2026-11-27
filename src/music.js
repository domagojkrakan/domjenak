import { useSyncExternalStore } from 'react';

// Jedna pjesma za cijelu stranicu. Kreće čim se stranica otvori i vrti se u krug.
// Preglednici često blokiraju zvuk prije prve interakcije — tada krene na prvi klik/tipku.
const SRC = '/audio/bozicna.m4a';
const KEY = 'domjenak-music-muted';

export const audio = typeof Audio !== 'undefined' ? new Audio(SRC) : null;

function readMuted() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

let state = { muted: readMuted(), playing: false };
const subs = new Set();
const set = (patch) => {
  state = { ...state, ...patch };
  subs.forEach((f) => f());
};

if (audio) {
  audio.loop = true;
  audio.preload = 'auto';
  audio.volume = 0.5;
  audio.addEventListener('play', () => set({ playing: true }));
  audio.addEventListener('pause', () => set({ playing: false }));
}

const tryPlay = () => {
  if (audio && !state.muted && audio.paused) audio.play().catch(() => {});
};

let started = false;
export function startMusic() {
  if (started || !audio) return;
  started = true;
  tryPlay();
  ['pointerdown', 'keydown', 'touchstart'].forEach((ev) => window.addEventListener(ev, tryPlay, true));
}

export function toggleMusic() {
  const muted = !state.muted;
  set({ muted });
  try {
    localStorage.setItem(KEY, muted ? '1' : '0');
  } catch {}
  if (muted) audio?.pause();
  else tryPlay();
}

export function playMusic() {
  if (state.muted) toggleMusic();
  else tryPlay();
}

const subscribe = (f) => {
  subs.add(f);
  return () => subs.delete(f);
};
export function useMusic() {
  return useSyncExternalStore(subscribe, () => state);
}

if (import.meta.env?.DEV && typeof window !== 'undefined') window.__audio = audio;
