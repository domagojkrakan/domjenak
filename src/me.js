import { useSyncExternalStore } from 'react';

// Tko sam ja: pamti se nakon prijave (ili kad se odabereš na stranici smještaja/prijevoza).
const KEY = 'domjenak-me';
const read = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
};

let me = read();
const subs = new Set();

export function setMe(person) {
  me = person ? { slug: person.slug, name: person.name, photo: person.photo } : null;
  try {
    if (me) localStorage.setItem(KEY, JSON.stringify(me));
    else localStorage.removeItem(KEY);
  } catch {}
  subs.forEach((f) => f());
}

export function useMe() {
  return useSyncExternalStore(
    (f) => {
      subs.add(f);
      return () => subs.delete(f);
    },
    () => me
  );
}

export const getMe = () => me;
