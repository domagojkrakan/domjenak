import { ENVELOPE, FPS } from './rapEnvelope.js';

// Ritam pjesme (izmjereno iz snimke): ~89.9 BPM, prvi udarac na 0.175 s.
export const BEAT = 60 / 89.875;
export const BAR = BEAT * 4;
export const FIRST_BEAT = 0.175;
export const barStart = (k) => FIRST_BEAT + k * BAR;

// Dijelovi pjesme (u sekundama skraćene snimke).
export const SECTIONS = [
  { name: 'intro', from: 0, to: barStart(3) },
  { name: 'rap', from: barStart(3), to: barStart(27) },
  { name: 'hook', from: barStart(27), to: barStart(35) },
  { name: 'rap', from: barStart(35), to: barStart(61) },
  { name: 'hook', from: barStart(61), to: barStart(75) },
  { name: 'rap', from: barStart(75), to: barStart(77) },
  { name: 'outro', from: barStart(77), to: Infinity },
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

export const HOOK_START = barStart(27);
export const BABA_ENTERS = barStart(5); // Baba dolazi rano da sprda Djeda

// Djed komentira dok Baba pjeva refren.
export const SANTA_JOKES = [
  'Ajme, ona pjeva bolje od mene 😅',
  'Tko je pustio Babu na mikrofon?!',
  'Sobovi, snimajte ovo! 📸',
  'Ovo ide na TikTok 🎬',
  'Bako, ne tako visoko! 🙉',
  'Ja samo mrdam bradom 🧔',
  'Rudolfe, ugasi nos, blješti mi! 🔴',
  'Tko je pojeo sve kolače? 🍪',
  'Nisam pjevač, ja sam dostavljač 📦',
  'Ok, priznajem, ovo je hit 🔥',
  'Ne gledajte mene, gledajte nju 👉',
];

// Baba komentira dok Djed repa.
export const BABA_JOKES = [
  'Opet repa o sebi 🙄',
  'Djede, ritam! RITAM! 🥁',
  'Moja kolica imaju više konja od tvojih sobova 🏎️',
  'Volim te, stari, ali nemoj pjevat 😂',
  'Lanac sam kupila na Black Friday 💅',
  'Tko je pustio Djeda na karaoke?',
  'Pahuljica je od pravog zlata. Valjda ❄️',
  'Ja vozim doma, on je pio kuhano vino 🍷',
  'Djede, bradom u ritam!',
  'Gdje je after party? 🎉',
  'Prijavite se, da ne plešem sama! 💃',
  'Pogledajte ovaj okret! 🌀',
  'Djede, to nije rap, to je čitanje popisa 📜',
  'Brada ti je na playbacku 🎙️',
  'Sobovi traže da ih ne spominješ 🦌',
  'Ajde, pjevaj, ja snimam… za ucjenu 📱',
  'Ove godine šibu dobivaš ti 🪵',
  'Zadnji hit mu je bio 1824. 🕰️',
  'Zbog ovoga ljudi zatvaraju dimnjake 🏠',
  'Tko je Djedu rekao da zna repat?',
  'Stari, dišeš li? 😮‍💨',
  'Ja ću refren, ti se odmori 😇',
];

// Poruka za takt: svaka 2 takta nova, vidi se takt i pol pa kratka pauza.
export function jokeAt(list, bar, beat) {
  if (bar % 2 === 1 && beat % 4 >= 2) return '';
  return list[Math.floor(bar / 2) % list.length];
}
