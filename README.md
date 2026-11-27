# 🎄 Rentlio božićni domjenak

Landing stranica za prijavu na božićni domjenak — **četvrtak, 10. prosinca 2026., Zadar, HQ ured**.

- Ilustrirani zimski Zadar u sumrak (Sv. Donat, zvonik Sv. Stošije, Velebit, riva) sa snijegom i saonicama koje lete nebom.
- Zaposlenik počne upisivati ime → iskoči padajući izbornik s okruglim fotografijama (sa snijegom na vrhu) → odabere sebe → klikne **„Dolazim!”**.
- Djed Božićnjak doleti saonicama, viče „Ho ho ho!”, pokupi osobu u saonice i odleti, a zatim se prikaže poruka „Vidimo se na božićnom domjenku!”.
- Stranica **/popis** („Tko dolazi?”) prikazuje sve prijavljene, ukupan broj i tko se još nije javio. Gumb je uvijek gore desno.
- Tko nije na popisu, može upisati ime i prezime ručno.
- Dolazak se može otkazati klikom na svoje ime na popisu (ili „Ipak ne mogu doći” na početnoj) — uz poruku „Žao nam je!”.
- **/smjestaj** — prijavljeni biraju cimera (po dvoje u sobi). Nakon odabira oboje „padnu” na jastuke bračnog kreveta i navuče se deka. Cimer može biti i netko tko se još nije prijavio: on dobiva zahtjev za sobu čim se prijavi (prihvati / odbij). Ispod su kartice soba, tablica „tko je s kim” sa statusom i popis onih koji još nemaju cimera.
- **/prijevoz** — tko ima auto, ponudi vožnju (grad polaska, 2–8 osoba s vozačem — auto 4, kombi 7+1, vrijeme, napomena) i može dodati kolege; prijavljeni odmah sjedaju, a neprijavljeni dobivaju poziv kad se prijave. Ostali „uskoče u saonice” ili kliknu **Trebam prijevoz**: odaberu grad u kojem su i dodaju napomenu, pa „vise u zraku” na balonima dok ih netko ne pokupi. Vozač vidi tko treba prijevoz (prvo oni iz njegovog grada) i povede ih jednim klikom (**Poveži 🛷**). Ispod je tablica svih vožnji.
- Kad pozvana osoba otvori stranicu nakon prijave, dolje iskoči obavijest „X te poziva…” s gumbom do sobe/prijevoza.
- Stranica pamti tko si (nakon prijave ili odabirom „Tko si ti?”). Kad netko otkaže dolazak, automatski se makne iz sobe i iz vožnji.

## Pokretanje lokalno

```bash
npm install
npm run dev
```

Lokalno se prijave spremaju u `.data/rsvp.json` (nije u gitu).

## Objava na Vercel

1. Importaj repozitorij na [vercel.com](https://vercel.com/new) (framework se prepozna kao Vite).
2. U projektu: **Storage → Create → Blob** i poveži store s projektom — Vercel sam doda `BLOB_READ_WRITE_TOKEN`.
3. Redeploy. Prijave se spremaju kao `rsvp/<ime-prezime>.json` u Blob storeu.

Prijavu brišeš tako da u Vercel → Storage → Blob obrišeš datoteku `rsvp/<ime-prezime>.json`.

Smještaj i prijevoz su u istom Blob storeu:

- `room/<cimer1>--<cimer2>.json` — jedna soba
- `ride/<vozač>--<id>.json` — ponuđena vožnja
- `seat/<vozač>--<putnik>.json` — putnik u vožnji
- `need/<osoba>--<id>.json` — zahtjev „trebam prijevoz” { city, note } (briše se kad osoba sjedne u vožnju ili ponudi svoju)
- `invite-room/<od>--<za>.json`, `invite-ride/<vozač>--<za>.json` — pozivi koji čekaju potvrdu

Lokalno se sve sprema u `.data/`.

## Dodavanje novih ljudi

Ubaci fotografiju u folder `Ljudi/` (ime datoteke = „Ime Prezime.png”) i pokreni:

```bash
npm run people
```

## Struktura

- `src/components/ZadarScene.jsx` — SVG ilustracija Zadra
- `src/components/Sleigh.jsx` — Djed Božićnjak i sobovi
- `src/components/RsvpCard.jsx` — pretraga i odabir osobe
- `src/components/SuccessAnimation.jsx` — animacija nakon prijave
- `src/pages/Attendees.jsx` — popis „Tko dolazi?”
- `src/pages/Smjestaj.jsx` + `src/components/Bed.jsx` — sobe i animacija kreveta
- `src/pages/Prijevoz.jsx` + `src/components/RideSleigh.jsx` — vožnje i saonice; `src/components/Floater.jsx` — osoba na balonima koja čeka prijevoz
- `src/components/InviteToast.jsx` — obavijest o pozivu za sobu/vožnju
- `api/rsvp.js`, `api/rooms.js`, `api/rides.js` + `lib/` — API (Vercel funkcije; lokalno ih poslužuje Vite)

## Glazba i reper Djed Božićnjak

- Pjesma je u `public/audio/bozicna.m4a` (uvod je skraćen na ~8 s, s fade-inom) i vrti se u krug. Zvonce gore desno je utišava i pali.
- Djed ušeće u ekran, zagrijava se dok traje uvod, a od 0:08 repa. Usta mu prate vokal (`src/rapEnvelope.js`, izračunato iz snimke), glava ritam (~90 BPM), a dijelovi pjesme (strofe, refreni) su u `src/rap.js`.
- Baba Mraz se u kolicima dokotrlja slijeva već na ~0:14 i sprda Djeda, pjeva refren (1:12 i 2:43), a dok Djed repa dalje, đuska i komentira.
