# 🎄 Rentlio božićni domjenak

Landing stranica za prijavu na božićni domjenak — **četvrtak, 10. prosinca 2026., Zadar, HQ ured**.

- Ilustrirani zimski Zadar u sumrak (Sv. Donat, zvonik Sv. Stošije, Velebit, riva) sa snijegom i saonicama koje lete nebom.
- Zaposlenik počne upisivati ime → iskoči padajući izbornik s okruglim fotografijama (sa snijegom na vrhu) → odabere sebe → klikne **„Dolazim!”**.
- Djed Božićnjak doleti saonicama, viče „Ho ho ho!”, pokupi osobu u saonice i odleti, a zatim se prikaže poruka „Vidimo se na božićnom domjenku!”.
- Stranica **/popis** („Tko dolazi?”) prikazuje sve prijavljene, ukupan broj i tko se još nije javio. Gumb je uvijek gore desno.
- Tko nije na popisu, može upisati ime i prezime ručno.
- Dolazak se može otkazati klikom na svoje ime na popisu (ili „Ipak ne mogu doći” na početnoj) — uz poruku „Žao nam je!”.
- **/smjestaj** — prijavljeni biraju cimera (po dvoje u sobi). Nakon odabira oboje „padnu” na jastuke bračnog kreveta i navuče se deka. Cimer može biti i netko tko se još nije prijavio: on dobiva zahtjev za sobu čim se prijavi (prihvati / odbij). Tko spava doma ili je sam sredio smještaj klikne **🏠 Ne trebam smještaj** (može se predomisliti). Ispod su kartice soba, tablica „tko je s kim” sa statusom, popis onih koji još nemaju cimera i onih koji ne trebaju smještaj.
- **/prijevoz** — tko ima auto, ponudi vožnju (grad polaska, koliko kolega može povesti — autom 1–4, a uz gumb 🚐 Kombi do 7, vrijeme, napomena) i može dodati kolege; prijavljeni odmah sjedaju, a neprijavljeni dobivaju poziv kad se prijave. Ostali „uskoče u saonice” ili kliknu **Trebam prijevoz**: odaberu grad u kojem su i dodaju napomenu, pa „vise u zraku” na balonima dok ih netko ne pokupi. Vozač vidi tko treba prijevoz (prvo oni iz njegovog grada) i povede ih jednim klikom (**Povezi 🛷**). Ispod je tablica svih vožnji.
- Kad pozvana osoba otvori stranicu nakon prijave, dolje iskoči obavijest „X te poziva…” s gumbom do sobe/prijevoza.
- Stranica pamti tko si (nakon prijave ili odabirom „Tko si ti?”). Kad netko otkaže dolazak, automatski se makne iz sobe, iz vožnji (ako vozi, vožnja se otkazuje), iz poziva, zahtjeva za prijevoz i popisa „ne treba smještaj”.
- Potvrde (otkaži vožnju, raskini sobu…) su prozori u stilu stranice, ne preglednikovi.

## Za developera — ukratko

- **Nema baze podataka.** Svi podaci su u dvije JSON datoteke u mapi `DATA_DIR` (zadano `.data/`, nije u gitu):
  `rsvp.json` (prijave) i `kv.json` (sobe, vožnje, pozivi…). Kod koji ih čita/piše je u `lib/kv.js` i `lib/store.js`.
  (Ako postoji varijabla `BLOB_READ_WRITE_TOKEN`, isti kod umjesto datoteka koristi Vercel Blob — vidi dolje zašto to ne preporučujemo.)
- **Repozitorij sadrži sve što treba** — kod, fotografije zaposlenika (`Ljudi/` → `public/ljudi/`), glazbu. Nema tajnih ključeva ni `.env` datoteka.
- **Razvoj:** `npm install` pa `npm run dev` (Vite na http://localhost:5173, API radi kroz isti server).
- **Produkcija:** `npm install && npm run build && npm start` (ili gotov zip — vidi „Vlastiti hosting”).
- **Prijenos na drugi server** = kopiraj kod + mapu s podacima (`DATA_DIR`). Ništa drugo ne treba.
- Za Claude Code je u repozitoriju `CLAUDE.md` s opisom arhitekture i pravila.


## Pokretanje lokalno

```bash
npm install
npm run dev
```

Lokalno se prijave spremaju u `.data/rsvp.json` (nije u gitu).

## Vlastiti hosting (Node.js) — preporučeno

Stranica radi kao jedan mali Node server (`server.js`, Node 18+, bez dodatnih paketa) koji poslužuje
izgrađenu stranicu i API, a podatke sprema u JSON datoteke. Nema vanjske baze ni limita.

**Najlakše — gotov paket:** `bash scripts/pack-hosting.sh` napravi `release/domjenak-hosting.zip`
(izgrađena stranica + server + postojeće prijave). Na hostingu:

```bash
unzip domjenak-hosting.zip && cd domjenak-hosting
PORT=3000 node server.js
```

U cPanelu („Setup Node.js App”): *Application root* = mapa gdje je raspakirano, *Startup file* = `server.js`,
Node 18 ili noviji, pa **Start**. Port postavlja sam hosting (varijabla `PORT`), domenu povežeš u istom ekranu.
Na VPS-u server drži upaljen npr. `pm2 start server.js --name domjenak` iza nginxa (proxy na port 3000).

**Iz repozitorija:** `npm install && npm run build && npm start`.

Varijable:

- `PORT` — port (zadano 3000), `HOST` — adresa (zadano 0.0.0.0)
- `DATA_DIR` — mapa s podacima (zadano `./.data`). Postavi je izvan mape aplikacije
  (npr. `/home/korisnik/domjenak-data`) da nova verzija ne pregazi prijave. Za sigurnosnu kopiju dovoljno je kopirati tu mapu.

Podaci: `rsvp.json` (prijave) i `kv.json` (sobe, vožnje, pozivi, zahtjevi za prijevoz — isti ključevi kao dolje).
Izmjene se obrađuju jedna po jedna, pa istovremene prijave ne mogu pregaziti jedna drugu.
Prijave s Vercela prebaciš s `node scripts/import-live.mjs https://rentlio-domjenak-chi.vercel.app`.

Stranice osvježavaju podatke svakih 45–60 s i samo dok je kartica otvorena.

## Objava na Vercel

> Besplatni Vercel Blob ima 2.000 „naprednih” operacija mjesečno (upis i listanje). Kad se potroše,
> Vercel blokira store na 30 dana i prijave prestanu raditi — zato je vlastiti hosting bolji izbor.

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
- `noroom/<osoba>.json` — osoba ne treba smještaj

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
- `src/components/ConfirmHost.jsx` — potvrde u stilu stranice (`ask({...})` umjesto `window.confirm`)
- `src/usePoll.js` — osvježavanje podataka (samo dok je kartica vidljiva)
- `api/rsvp.js`, `api/rooms.js`, `api/rides.js` — API handleri (isti kod radi u `server.js`, u Vite dev serveru i kao Vercel funkcije)
- `lib/trips.js` — pravila za sobe i vožnje; `lib/store.js` — prijave; `lib/kv.js` + `lib/datadir.js` — spremanje podataka
- `server.js` — produkcijski Node server; `scripts/pack-hosting.sh` — zip za hosting; `scripts/import-live.mjs` — prijenos prijava sa stare adrese

## Glazba i reper Djed Božićnjak

- Pjesma je u `public/audio/bozicna.m4a` (uvod je skraćen na ~8 s, s fade-inom) i vrti se u krug. Zvonce gore desno je utišava i pali.
- Djed ušeće u ekran, zagrijava se dok traje uvod, a od 0:08 repa. Usta mu prate vokal (`src/rapEnvelope.js`, izračunato iz snimke), glava ritam (~90 BPM), a dijelovi pjesme (strofe, refreni) su u `src/rap.js`.
- Baba Mraz se u kolicima dokotrlja slijeva već na ~0:14 i sprda Djeda, pjeva refren (1:12 i 2:43), a dok Djed repa dalje, đuska i komentira.
