// Ponovno generira popis zaposlenika i male fotografije iz foldera Ljudi/.
// Ime datoteke = ime i prezime (npr. "Ana Anić.png"). Pokreni: npm run people
// Koristi macOS alat `sips` za smanjivanje slika.
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const SRC = 'Ljudi';
const OUT = 'public/ljudi';

const slug = (s) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[Đđ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

fs.mkdirSync(OUT, { recursive: true });
const people = [];
for (const f of fs.readdirSync(SRC)) {
  if (!/\.(png|jpe?g|webp|heic)$/i.test(f)) continue;
  const name = f.normalize('NFC').replace(/\.[^.]+$/, '').trim();
  const s = slug(name);
  execFileSync('sips', ['-s', 'format', 'jpeg', '-s', 'formatOptions', '82', '-Z', '240', path.join(SRC, f), '--out', `${OUT}/${s}.jpg`], {
    stdio: 'ignore',
  });
  people.push({ slug: s, name });
}
people.sort((a, b) => a.name.localeCompare(b.name, 'hr'));

fs.writeFileSync('src/people.js', '// Automatski generirano iz foldera Ljudi/\nexport const PEOPLE = ' + JSON.stringify(people, null, 2) + ';\n');
fs.writeFileSync('lib/people.json', JSON.stringify(people, null, 2));
console.log(`✓ ${people.length} osoba`);
