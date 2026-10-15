/**
 * data.js — taal-onafhankelijke structuur van de persona's.
 *
 * De teksten staan in `src/i18n/copy/<taal>/archetypes.js`. Hier blijft alleen
 * wat logica of data is: de id's (zoals opgeslagen in de database), de vaste
 * volgorde, het cluster en het numerieke bricksProfile.
 *
 * Gebruik `getArchetypes(lang)` of `useArchetypes()` uit `src/i18n/archetypes`
 * om structuur en teksten samen te krijgen.
 */

/**
 * Vaste volgorde van de persona's. Scoring-code mapt op INDEX (de
 * antwoordopties per vraag staan in deze volgorde), dus deze volgorde is
 * load-bearing en mag niet wijzigen.
 */
export const ARCHETYPE_ORDER = [
  'maker',
  'groeier',
  'presteerder',
  'denker',
  'verbinder',
  'teamspeler',
  'zekerzoeker',
  'vernieuwer',
];

/** Niet-vertaalbare eigenschappen per persona. `id` = de waarde in de database. */
export const ARCHETYPE_STRUCTURE = {
  maker: {
    id: 'maker',
    cluster: 'creatie',
    bricksProfile: {
      focus: 1,
      work: 2,
      meeting: 2,
      project: 4,
      team: 3,
      learning: 2,
      retreat: 1,
      social: 3,
    },
  },
  groeier: {
    id: 'groeier',
    cluster: 'creatie',
    bricksProfile: {
      focus: 2,
      work: 3,
      meeting: 2,
      project: 3,
      team: 2,
      learning: 4,
      retreat: 1,
      social: 2,
    },
  },
  presteerder: {
    id: 'presteerder',
    cluster: 'executie',
    bricksProfile: {
      focus: 4,
      work: 2,
      meeting: 1,
      project: 3,
      team: 1,
      learning: 1,
      retreat: 1,
      social: 1,
    },
  },
  denker: {
    id: 'denker',
    cluster: 'reflectie',
    bricksProfile: {
      focus: 4,
      work: 3,
      meeting: 1,
      project: 1,
      team: 1,
      learning: 2,
      retreat: 3,
      social: 1,
    },
  },
  verbinder: {
    id: 'verbinder',
    cluster: 'verbinding',
    bricksProfile: {
      focus: 1,
      work: 1,
      meeting: 3,
      project: 2,
      team: 3,
      learning: 1,
      retreat: 1,
      social: 4,
    },
  },
  teamspeler: {
    id: 'teamspeler',
    cluster: 'verbinding',
    bricksProfile: {
      focus: 1,
      work: 3,
      meeting: 3,
      project: 1,
      team: 4,
      learning: 1,
      retreat: 1,
      social: 2,
    },
  },
  zekerzoeker: {
    id: 'zekerzoeker',
    cluster: 'structuur',
    bricksProfile: {
      focus: 3,
      work: 4,
      meeting: 1,
      project: 1,
      team: 2,
      learning: 1,
      retreat: 2,
      social: 1,
    },
  },
  vernieuwer: {
    id: 'vernieuwer',
    cluster: 'creatie',
    bricksProfile: {
      focus: 1,
      work: 1,
      meeting: 2,
      project: 4,
      team: 3,
      learning: 3,
      retreat: 1,
      social: 2,
    },
  },
};
