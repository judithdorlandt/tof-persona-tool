// dienstenmix.js
// Diensten-mix voor "Wat dit team naar kantoor trekt" (dienstenprofiel).
// Naast werkplekmix.js, zelfde patroon: per persona een score per diensttype.
//
// Bron: tof-marketingteam/toetsen/2026-11-04-ID-001-dienstenprofiel-v2.md,
// punt 4 (diensttypen) en punt 5 (matrix v2). Besloten door Judith, 4 nov 2026.
//
// Schaal 1–3, expertoordeel — niet gemeten.
//
// Taalonafhankelijk: alleen ids, volgorde en getallen. Alle zichtbare tekst
// staat in i18n/copy/{nl,en}/servicesProfile.js.

// --- 8 diensttypen, in de volgorde van de lijst (punt 4) ---
// `volgorde` beslist bij een gelijke stand in de rangorde.
// `wie`: wie het regelt — 'team' (spreek je als team af), 'organisatie'
// (regelt de organisatie) of 'beide' (deels het team, deels de organisatie).
// `inRangorde: false`: IT staat als vaste voetregel onder de laag en telt
// niet mee in de rangorde. De cijfers blijven bewaard, voor het geval de
// voetregel later per team moet verschillen.
export const DIENSTTYPEN = [
  { id: 'ontvangst', volgorde: 1, wie: 'organisatie', inRangorde: true },
  { id: 'eten', volgorde: 2, wie: 'organisatie', inRangorde: true },
  { id: 'ontmoeting', volgorde: 3, wie: 'team', inRangorde: true },
  { id: 'focus', volgorde: 4, wie: 'team', inRangorde: true },
  { id: 'it', volgorde: 5, wie: 'organisatie', inRangorde: false },
  { id: 'leren', volgorde: 6, wie: 'team', inRangorde: true },
  { id: 'welzijn', volgorde: 7, wie: 'beide', inRangorde: true },
  { id: 'gemak', volgorde: 8, wie: 'organisatie', inRangorde: true },
];

// --- Matrix v2: per persona een score per diensttype ---
// Dezelfde persona-ids als PERSONA_WERKPLEKMIX in werkplekmix.js.
export const PERSONA_DIENSTENMIX = [
  {
    id: 'maker',
    mix: { ontvangst: 1, eten: 2, ontmoeting: 2, focus: 2, leren: 1, welzijn: 1, gemak: 2, it: 3 },
  },
  {
    id: 'groeier',
    mix: { ontvangst: 1, eten: 1, ontmoeting: 2, focus: 2, leren: 3, welzijn: 2, gemak: 1, it: 2 },
  },
  {
    id: 'presteerder',
    mix: { ontvangst: 2, eten: 2, ontmoeting: 1, focus: 3, leren: 1, welzijn: 1, gemak: 3, it: 3 },
  },
  {
    id: 'denker',
    mix: { ontvangst: 1, eten: 1, ontmoeting: 2, focus: 3, leren: 2, welzijn: 3, gemak: 2, it: 3 },
  },
  {
    id: 'verbinder',
    mix: { ontvangst: 3, eten: 3, ontmoeting: 3, focus: 1, leren: 2, welzijn: 2, gemak: 1, it: 1 },
  },
  {
    id: 'teamspeler',
    mix: { ontvangst: 2, eten: 3, ontmoeting: 3, focus: 1, leren: 1, welzijn: 1, gemak: 2, it: 2 },
  },
  {
    id: 'zekerzoeker',
    mix: { ontvangst: 2, eten: 1, ontmoeting: 1, focus: 3, leren: 2, welzijn: 2, gemak: 3, it: 3 },
  },
  {
    id: 'vernieuwer',
    mix: { ontvangst: 2, eten: 2, ontmoeting: 3, focus: 1, leren: 3, welzijn: 1, gemak: 1, it: 2 },
  },
];

// Opgetelde score per diensttype over de aanwezige persona's (zelfde telling
// als berekenTeamWerkplekmix). `aantallen` = { personaId: aantalLeden }.
export function berekenTeamDienstenmix(aantallen) {
  const totaal = {};
  DIENSTTYPEN.forEach((d) => { totaal[d.id] = 0; });
  PERSONA_DIENSTENMIX.forEach((p) => {
    const n = Number(aantallen?.[p.id]) || 0;
    if (!n) return;
    Object.entries(p.mix).forEach(([dienstId, score]) => {
      totaal[dienstId] += score * n;
    });
  });
  return totaal;
}
