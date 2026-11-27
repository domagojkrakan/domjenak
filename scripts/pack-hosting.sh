#!/usr/bin/env bash
# Napravi release/domjenak-hosting.zip za vlastiti Node hosting (bez npm install na serveru).
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
OUT=release/domjenak-hosting
rm -rf "$OUT" "$OUT.zip"
mkdir -p "$OUT/scripts"
cp -R dist api lib server.js "$OUT/"
cp scripts/import-live.mjs "$OUT/scripts/"
node -e "const p=require('./package.json');require('fs').writeFileSync('$OUT/package.json',JSON.stringify({name:p.name,private:true,version:p.version,type:'module',scripts:{start:'node server.js'},engines:p.engines},null,2)+'\n')"
# postojeće prijave s Vercela (ako je stranica dostupna)
DATA_DIR="$OUT/.data" node scripts/import-live.mjs "${1:-https://rentlio-domjenak-chi.vercel.app}" || echo "Upozorenje: prijave nisu preuzete."
(cd release && zip -qr domjenak-hosting.zip domjenak-hosting)
echo "Gotovo: release/domjenak-hosting.zip"
