# Rentlio božićni domjenak — upute za Claude Code

RSVP stranica za božićni domjenak (10.12.2026., Zadar). Prijava na domjenak, odabir cimera (/smjestaj)
i dijeljenje prijevoza do Zadra (/prijevoz). Sav tekst u sučelju je **na hrvatskom** — novi tekst piši
na hrvatskom, u istom razigranom tonu (saonice, Djed Božićnjak, 🎄🛷).

## Naredbe

- `npm install` — jednom
- `npm run dev` — Vite dev server (http://localhost:5173), API se poslužuje kroz Vite middleware (`vite.config.js`)
- `npm run build` — build u `dist/`
- `npm start` — produkcijski server (`server.js`) koji poslužuje `dist/` i API; varijable `PORT`, `HOST`, `DATA_DIR`
- `bash scripts/pack-hosting.sh` — `release/domjenak-hosting.zip` spreman za upload na hosting (bez `npm install`)
- `npm run people` — iz slika u `Ljudi/` generira `lib/people.json` i male fotografije u `public/ljudi/`

Nema testova ni lintera. Promjene provjeri buildom, ručno kroz `npm run dev` i curl pozivima na API.

## Arhitektura

- **Frontend:** React 18 + Vite 5 + framer-motion. Bez routera: `src/App.jsx` bira stranicu po `location.pathname`
  (`/`, `/popis`, `/smjestaj`, `/prijevoz`). Pozivi API-ja su u `src/api.js`.
- „Tko sam ja” se pamti u `localStorage['domjenak-me']` (`src/me.js`); nema prijave lozinkom — ovo je interna, povjerljiva stranica.
- Osvježavanje podataka ide kroz `src/usePoll.js` (45–60 s, samo dok je kartica vidljiva). **Ne skraćuj interval**
  i ne dodaji nove `setInterval` pozive za API — svaki otvoreni tab radi zahtjeve.
- Potvrde: `ask({ title, text, ok, cancel, danger, icon })` iz `src/components/ConfirmHost.jsx`. Ne koristi `window.confirm/alert`.
- **API:** `api/rsvp.js`, `api/rooms.js`, `api/rides.js` su obični `(req, res)` handleri. Isti kod radi u `server.js`,
  u Vite dev serveru i kao Vercel funkcije. Greške bacaj s `fail(status, 'poruka za korisnika')` (vidi `lib/trips.js`).
- **Poslovna pravila:** `lib/trips.js` (sobe, vožnje, pozivi, „trebam prijevoz”, „ne trebam smještaj”), `lib/store.js` (prijave).
  Otkazivanje dolaska (`DELETE /api/rsvp`) zove `removePersonEverywhere` — kad dodaješ novu vrstu podatka o osobi,
  dodaj i njeno brisanje tamo.

## Podaci (nema baze)

- `lib/kv.js` je jednostavno key-value spremište: `listKeys(prefix)`, `readKey`, `putKey`, `delKeys`.
  Ključevi nose podatke u imenu (npr. `room/<a>--<b>.json`, `seat/<vozač>--<putnik>.json`) — popis je na vrhu `lib/trips.js` i u README-u.
- Bez `BLOB_READ_WRITE_TOKEN` (normalno): sve ide u `<DATA_DIR>/kv.json` i `<DATA_DIR>/rsvp.json` (`lib/datadir.js`, atomski upis).
- `server.js` obrađuje sve POST/DELETE zahtjeve **jedan po jedan** (red čekanja), pa read-modify-write na JSON datotekama
  nema utrka. Ako dodaješ novi API endpoint, dodaj ga u `API` mapu u `server.js` i u `vite.config.js`.
- `DATA_DIR` na produkciji drži izvan mape aplikacije. `.data/` je u `.gitignore` — **nikad ne commitaj podatke**.

## Hosting

- Preporučeno: vlastiti Node hosting (`server.js`, Node 18+, bez ovisnosti u produkciji). Upute u README-u.
- Vercel (`vercel.json`) i dalje radi uz Vercel Blob, ali besplatni Blob ima 2.000 naprednih operacija mjesečno
  (`list`/`put`); kad se potroše, store se blokira na 30 dana. Zato se Vercel više ne koristi za produkciju.

## Stil koda

- Funkcijske React komponente, CSS u jednoj datoteci `src/styles.css` (sekcije s komentarom na hrvatskom).
- Komentari u kodu su na hrvatskom. Imena varijabli/funkcija na engleskom.
- Mobilni prikaz je bitan (većina ljudi otvara s mobitela) — provjeri i ~390 px širinu.
