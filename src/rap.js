import { ENVELOPE, FPS } from './rapEnvelope.js';

// Ritam pjesme (izmjereno iz snimke): ~89.9 BPM, prvi udarac na 0.175 s.
export const BEAT = 60 / 89.875;
export const BAR = BEAT * 4;
export const FIRST_BEAT = 0.175;
export const barStart = (k) => FIRST_BEAT + k * BAR;

// Dijelovi pjesme (u sekundama skraćene snimke).
export const SECTIONS = [
  { name: 'intro', from: 0, to: barStart(10) },
  { name: 'rap', from: barStart(10), to: barStart(34) },
  { name: 'hook', from: barStart(34), to: barStart(42) },
  { name: 'rap', from: barStart(42), to: barStart(68) },
  { name: 'hook', from: barStart(68), to: barStart(82) },
  { name: 'rap', from: barStart(82), to: barStart(84) },
  { name: 'outro', from: barStart(84), to: Infinity },
];

export function sectionAt(t) {
  return SECTIONS.find((s) => t >= s.from && t < s.to) || SECTIONS[0];
}

export function beatAt(t) {
  const b = (t - FIRST_BEAT) / BEAT;
  const index = Math.floor(b);
  return { index, phase: b - index, bar: Math.floor(index / 4) };
}

// Glasnoća vokala 0–1 u trenutku t.
export function vocalAt(t) {
  const c = ENVELOPE[Math.floor(t * FPS)];
  return c ? parseInt(c, 36) / 35 : 0;
}

// Što Djed govori dok se zagrijava (prije nego krene vokal).
export const WARMUP_LINES = ['Mic check… 1, 2 🎤', 'Ej, Zadar! 👋', 'Zagrijavam se… 🧣', 'Sobovi, dajte beat! 🦌', 'Jel se čujem? 🎧', 'Spreman sam! 🔥'];

export const HOOK_START = barStart(34);
