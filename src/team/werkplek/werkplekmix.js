// werkplekmix.js
// Persona-werkplekmix voor de TOF Persona Tool.
// Brug tussen Behaviour (8 persona's) en Bricks (8 werkplektypen) in het BBB-model.
//
// SCOPE: deze versie gaat uitsluitend over BEHOEFTE en GEBRUIK.
// Bewust GEEN vierkante meters, afmetingen, aantallen of inrichtingsverhoudingen.
// De voorbeeldplekken (illustratie van het SOORT plek) staan alleen in de
// teksten: i18n/copy/{nl,en}/workplaceProfile.js. Eén bron, voor scherm én PDF.
//
// Tweetaligheid: alle LOGICA (ids, niveaus, koppelingen) is taalonafhankelijk.
// Alle ZICHTBARE TEKST staat in losse label-/tekstvelden en kan later naar een
// vertaalbestand verhuizen zonder de logica te raken.
//
// Niveaus in de mix:
//   3 = kern       — hier zit de energie van deze persona; onderbelichting = friction
//   2 = steun      — regelmatig nodig, ondersteunend
//   1 = aanvullend — beperkt nodig; afwezigheid is zelden een probleem

// --- 8 werkplektypen ---
// Hybride staat er bewust niet in: dat is een manier van werken, geen plek
// (zelfde besluit als het persoonlijke profiel, d66f8ff, 30 sep 2026).
export const WERKPLEKTYPEN = [
  {
    id: 'standaard',
    label: 'Standaard werkplekken',
  },
  {
    id: 'concentratie',
    label: 'Concentratieplekken',
  },
  {
    id: 'overleg',
    label: 'Overlegplekken',
  },
  {
    id: 'samenwerk',
    label: 'Samenwerkplekken',
  },
  {
    id: 'creatief',
    label: 'Creatieve plekken',
  },
  {
    id: 'informeel',
    label: 'Informele plekken',
  },
  {
    id: 'rust',
    label: 'Rustplekken',
  },
  {
    id: 'leer',
    label: 'Leerplekken',
  },
];

// --- 8 persona's met hun werkplekmix over alle 8 typen ---
// Per persona: een volledige mix (matrixrij) plus de valkuil als friction-signaal.
// Maker en Presteerder zijn op 22 okt 2026 gelijkgetrokken met de personateksten
// en de persoonlijke kaart (bricksProfile in data.js).
export const PERSONA_WERKPLEKMIX = [
  {
    id: 'maker',
    label: 'Maker',
    kernwoorden: 'doen, bouwen, leveren',
    valkuil: 'Onderschat reflectie- en rustruimte; verzandt zonder pauze.',
    mix: { creatief: 3, samenwerk: 3, standaard: 2, concentratie: 2, overleg: 2, informeel: 1, leer: 1, rust: 1 },
  },
  {
    id: 'groeier',
    label: 'Groeier',
    kernwoorden: 'leren, ontwikkelen, verdiepen',
    valkuil: 'Zonder duidelijke oplevermomenten blijft de behoefte open.',
    mix: { leer: 3, concentratie: 3, rust: 3, informeel: 2, creatief: 2, overleg: 1, samenwerk: 1, standaard: 1 },
  },
  {
    id: 'presteerder',
    label: 'Presteerder',
    kernwoorden: 'doelen, voortgang, impact',
    valkuil: 'Tempo verdringt verdieping; rustplek wordt overgeslagen.',
    mix: { concentratie: 3, standaard: 3, samenwerk: 3, overleg: 2, informeel: 1, creatief: 1, leer: 1, rust: 1 },
  },
  {
    id: 'denker',
    label: 'Denker',
    kernwoorden: 'analyse, structuur, helderheid',
    valkuil: 'Te ver weg van het sociale veld; lijkt afstandelijk.',
    mix: { concentratie: 3, rust: 3, standaard: 3, overleg: 2, leer: 2, samenwerk: 1, creatief: 1, informeel: 1 },
  },
  {
    id: 'verbinder',
    label: 'Verbinder',
    kernwoorden: 'mensen, relaties, vertrouwen',
    valkuil: 'Eigen concentratiebehoefte sneeuwt onder.',
    mix: { informeel: 3, samenwerk: 3, overleg: 3, rust: 2, standaard: 1, creatief: 1, leer: 1, concentratie: 1 },
  },
  {
    id: 'teamspeler',
    label: 'Teamspeler',
    kernwoorden: 'samen, ritme, structuur',
    valkuil: 'Heeft juist een eigen focusplek nodig om niet op te gaan in het team.',
    mix: { samenwerk: 3, overleg: 3, standaard: 3, informeel: 2, concentratie: 1, creatief: 1, leer: 1, rust: 1 },
  },
  {
    id: 'zekerzoeker',
    label: 'Zekerzoeker',
    kernwoorden: 'kwaliteit, zorgvuldigheid, controle',
    valkuil: 'Wisselende en ambigue settings remmen het tempo.',
    mix: { concentratie: 3, standaard: 3, overleg: 2, leer: 2, rust: 2, samenwerk: 1, informeel: 1, creatief: 1 },
  },
  {
    id: 'vernieuwer',
    label: 'Vernieuwer',
    kernwoorden: 'mogelijkheden, experiment, verandering',
    valkuil: 'Heeft een ankerplek nodig om ideeën ook af te maken.',
    mix: { creatief: 3, informeel: 3, samenwerk: 3, leer: 2, overleg: 1, standaard: 1, concentratie: 1, rust: 1 },
  },
];

// --- Hulpfuncties ---
export const NIVEAU_LABEL = { 3: 'kern', 2: 'steun', 1: 'aanvullend' };

// Geaggregeerde teambehoefte: telt de niveaus per werkplektype op over de aanwezige
// persona's. `aantallen` = { personaId: aantalLeden }. Geeft per type een gewogen
// behoeftescore terug — bedoeld om relatieve nadruk te tonen, niet als absolute hoeveelheid.
export function berekenTeamWerkplekmix(aantallen) {
  const totaal = {};
  WERKPLEKTYPEN.forEach((t) => { totaal[t.id] = 0; });
  PERSONA_WERKPLEKMIX.forEach((p) => {
    const n = aantallen[p.id] || 0;
    if (!n) return;
    Object.entries(p.mix).forEach(([typeId, niveau]) => {
      totaal[typeId] += niveau * n;
    });
  });
  return totaal;
}
