// Gradovi iz kojih se kreće prema Zadru (koordinate: geografska duljina, širina).
export const DESTINATION = { id: 'zadar', name: 'Zadar', lon: 15.23, lat: 44.12 };

export const CITIES = [
  { id: 'zagreb', name: 'Zagreb', lon: 15.98, lat: 45.81, major: true },
  { id: 'split', name: 'Split', lon: 16.44, lat: 43.51, major: true },
  { id: 'rijeka', name: 'Rijeka', lon: 14.44, lat: 45.33, major: true },
  { id: 'osijek', name: 'Osijek', lon: 18.69, lat: 45.55, major: true },
  { id: 'dubrovnik', name: 'Dubrovnik', lon: 18.09, lat: 42.65, major: true },
  { id: 'pula', name: 'Pula', lon: 13.85, lat: 44.87, major: true },
  { id: 'varazdin', name: 'Varaždin', lon: 16.34, lat: 46.3, major: true },
  { id: 'sibenik', name: 'Šibenik', lon: 15.89, lat: 43.73, major: true },
  { id: 'karlovac', name: 'Karlovac', lon: 15.55, lat: 45.49 },
  { id: 'slavonski-brod', name: 'Slavonski Brod', lon: 18.01, lat: 45.16 },
  { id: 'vukovar', name: 'Vukovar', lon: 19.0, lat: 45.35 },
  { id: 'sisak', name: 'Sisak', lon: 16.37, lat: 45.48 },
  { id: 'cakovec', name: 'Čakovec', lon: 16.43, lat: 46.38 },
  { id: 'koprivnica', name: 'Koprivnica', lon: 16.83, lat: 46.16 },
  { id: 'bjelovar', name: 'Bjelovar', lon: 16.84, lat: 45.9 },
  { id: 'pozega', name: 'Požega', lon: 17.68, lat: 45.34 },
  { id: 'velika-gorica', name: 'Velika Gorica', lon: 16.07, lat: 45.71 },
  { id: 'gospic', name: 'Gospić', lon: 15.37, lat: 44.55 },
  { id: 'knin', name: 'Knin', lon: 16.2, lat: 44.04 },
  { id: 'makarska', name: 'Makarska', lon: 17.02, lat: 43.3 },
  { id: 'trogir', name: 'Trogir', lon: 16.25, lat: 43.52 },
  { id: 'porec', name: 'Poreč', lon: 13.59, lat: 45.23 },
  { id: 'rovinj', name: 'Rovinj', lon: 13.64, lat: 45.08 },
  { id: 'biograd', name: 'Biograd na Moru', lon: 15.44, lat: 43.94 },
  { id: 'nin', name: 'Nin', lon: 15.18, lat: 44.24 },
];

export const CITY_BY_ID = new Map(CITIES.map((c) => [c.id, c]));
