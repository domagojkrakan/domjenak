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

// Upadice koje izlijeću iz Djeda dok repa (kad nema stihova u .lrc datoteci).
export const RAP_LINES = [
  'Yo! Djed na mikrofonu 🎤',
  'Sobovi drže beat 🦌',
  'Zadar, ruke gore!',
  'Rentlio ekipa u kući',
  'Ho-ho-ho, idemo!',
  'Četvrtak, deseti dvanaesti',
  'HQ ured, budi tu',
  'Snijeg pada, bas udara ❄️',
  'Saonice parkirane vani',
  'Kolači i kuhano vino 🍷',
  'Prijavi se, ne kasni',
  'Poklon za svakog 🎁',
  'Lampice gore, glazba jače',
  'Djed ne preskače nikog',
  'Riva, orgulje, pozdrav suncu',
  'Jedan, dva — mikrofon radi',
  'Laponija → Zadar ✈️',
  'Ruke gore za kolege 🙌',
];
export const HOOK_LINES = ['Ho-ho-ho! 🎅', 'Ruke gore! 🙌', 'Sretan Božić! 🎄', 'Svi zajedno! ✨', '🎁 ❄️ 🎄', 'Jingle, jingle 🔔'];
export const WARMUP_LINES = ['Mic check… 1, 2 🎤', 'Ej, Zadar! 👋', 'Zagrijavam se… 🧣', 'Sobovi, dajte beat! 🦌', 'Jel se čujem? 🎧', 'Spreman sam! 🔥'];

// Stihovi iz public/audio/bozicna.lrc: redovi oblika "[mm:ss.xx] tekst".
export function parseLrc(text) {
  const out = [];
  for (const raw of String(text).split(/\r?\n/)) {
    const m = raw.match(/^\s*\[(\d+):(\d+(?:\.\d+)?)\]\s*(.*)$/);
    if (m) out.push({ t: Number(m[1]) * 60 + Number(m[2]), text: m[3].trim() });
  }
  return out.sort((a, b) => a.t - b.t);
}
