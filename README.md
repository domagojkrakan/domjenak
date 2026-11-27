# 🎄 Rentlio božićni domjenak

Landing stranica za prijavu na božićni domjenak — **četvrtak, 10. prosinca 2026., Zadar, HQ ured**.

- Ilustrirani zimski Zadar u sumrak (Sv. Donat, zvonik Sv. Stošije, Velebit, Pozdrav suncu, riva) sa snijegom i saonicama koje lete nebom.
- Zaposlenik počne upisivati ime → iskoči padajući izbornik s okruglim fotografijama (sa snijegom na vrhu) → odabere sebe → klikne **„Dolazim!”**.
- Djed Božićnjak doleti saonicama, viče „Ho ho ho!”, pokupi osobu u saonice i odleti, a zatim se prikaže poruka „Vidimo se na božićnom domjenku!”.
- Stranica **/popis** („Tko dolazi?”) prikazuje sve prijavljene, ukupan broj i tko se još nije javio. Gumb je uvijek gore desno.
- Tko nije na popisu, može upisati ime i prezime ručno.
- Dolazak se može otkazati klikom na svoje ime na popisu (ili „Ipak ne mogu doći” na početnoj) — uz poruku „Žao nam je!”.

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
- `api/rsvp.js` + `lib/store.js` — API (Vercel funkcija; lokalno ga poslužuje Vite)

## Glazba i reper Djed Božićnjak

- Pjesma je u `public/audio/bozicna.m4a` (uvod sa zvončićima je izrezan) i vrti se u krug. Zvonce gore desno je utišava i pali.
- Djed ušeće u ekran, zagrijava se dok traje uvod, a od 0:27 repa. Usta mu prate vokal (`src/rapEnvelope.js`, izračunato iz snimke), glava ritam (~90 BPM), a dijelovi pjesme (strofe, refreni) su u `src/rap.js`.
- Na refrenu (1:31 i 3:02) slijeva se dokotrlja Baba Mraz u kolicima i pjeva refren; dok Djed repa dalje, ona ostaje i đuska.
