/**
 * quizTestData.js — de structuur van de vragenlijst.
 *
 * Verkorte set uit het analysestuk "Korter afnemen, scherper prijzen":
 *   - 9 basisvragen (Bijlage A)
 *   - 5 verdiepingsvragen (Bijlage B), pas aangeboden ná het profiel
 *
 * SINDS DE TWEETALIGHEID staat hier alleen nog de LOGICA: het vaste
 * antwoordpatroon (`pick`), de werkplek-ids en de tekenlimiet. Alle vraag- en
 * antwoordteksten staan in src/i18n/copy/{nl,en}/quizData.js.
 *
 * De antwoordopties staan in de VASTE volgorde van de acht archetypen:
 *   0 maker · 1 groeier · 2 presteerder · 3 denker
 *   4 verbinder · 5 teamspeler · 6 zekerzoeker · 7 vernieuwer
 * (identiek aan de volgorde van ARCHETYPES in src/data.js). In de UI worden ze
 * geschud; de scoring gebruikt de index → archetype-mapping.
 *
 * Vast antwoordpatroon (Bijlage A): vraag 1, 2, 6 en 8 = twee antwoorden in
 * volgorde; de overige vijf = één antwoord. Zo is elk profiel gelijk opgebouwd.
 *
 * GEBRUIK
 *   import { getQuizData } from './quizTestData';
 *   const { BASIS_VRAGEN, DRUK_VRAAG, ... } = getQuizData(lang);
 * De losse named exports (BASIS_VRAGEN, DRUK_VRAAG, …) blijven bestaan en zijn
 * de Nederlandse variant — zo blijven bestaande aanroepers werken.
 */
import { getCopy } from '../../i18n/copy';
import nlQuizData from '../../i18n/copy/nl/quizData';
import enQuizData from '../../i18n/copy/en/quizData';

// Directe fallback: zolang de namespace nog niet in copy/{nl,en}/index.js is
// geregistreerd blijft de vragenlijst gewoon werken.
const FALLBACK_TEXTS = { nl: nlQuizData, en: enQuizData };

function quizTexts(lang) {
  const registered = getCopy(lang);
  return (registered && registered.quizData) || FALLBACK_TEXTS[lang] || FALLBACK_TEXTS.nl;
}

/** Vaste index → archetype-mapping van elke antwoordrij. */
export const ARCHETYPE_VOLGORDE = [
  'maker',
  'groeier',
  'presteerder',
  'denker',
  'verbinder',
  'teamspeler',
  'zekerzoeker',
  'vernieuwer',
];

/** Aantal te kiezen antwoorden per basisvraag (Bijlage A) — dit is logica. */
export const BASIS_PICKS = [2, 2, 1, 1, 1, 2, 1, 2, 1];

/** Data-ids van de negen werkplektypen — nooit vertalen. */
export const WERKPLEK_IDS = [
  'focus',
  'work',
  'hybride',
  'meeting',
  'project',
  'team',
  'learning',
  'retreat',
  'social',
];

/** Tekenlimiet van de open vraag (V5). */
export const OPEN_VRAAG_MAX_LENGTH = 200;

/**
 * getQuizData(lang) — bouwt de volledige vragenlijst in één taal.
 *
 * Geeft exact dezelfde vormen terug als de oude named exports:
 *   { BASIS_VRAGEN, DRUK_VRAAG, WERKPLEK_TYPES, OPEN_VRAAG,
 *     VERDIEPING_INTRO, DUEL_ESSENTIE, DUEL_INTRO }
 */
export function getQuizData(lang = 'nl') {
  const t = quizTexts(lang);

  return {
    BASIS_VRAGEN: t.basis.map((vraag, index) => ({
      q: vraag.q,
      pick: BASIS_PICKS[index],
      a: vraag.a,
    })),
    DRUK_VRAAG: { q: t.druk.q, a: t.druk.a },
    WERKPLEK_TYPES: WERKPLEK_IDS.map((id) => ({ id, label: t.werkplek[id] })),
    OPEN_VRAAG: { q: t.open.q, maxLength: OPEN_VRAAG_MAX_LENGTH },
    VERDIEPING_INTRO: t.verdiepingIntro,
    DUEL_ESSENTIE: { ...t.duelEssentie },
    DUEL_INTRO: t.duelIntro,
  };
}

// ── Nederlandse standaard — houdt bestaande imports werkend ─────────────────
const NL = getQuizData('nl');

/** Basis — 9 vragen. */
export const BASIS_VRAGEN = NL.BASIS_VRAGEN;

/** Verdieping — V3: onder druk. Eén antwoord, telt mee in de score. */
export const DRUK_VRAAG = NL.DRUK_VRAAG;

/**
 * Verdieping — V4: werkplekgebruik. Twee keer drie keuzes uit dezelfde negen
 * plektypen. Niet gescoord op archetype; het verschil tussen "gebruik nu" en
 * "mis" is de kern van het huisvestingsadvies.
 */
export const WERKPLEK_TYPES = NL.WERKPLEK_TYPES;

/** Verdieping — V5: open vraag. */
export const OPEN_VRAAG = NL.OPEN_VRAAG;

export const VERDIEPING_INTRO = NL.VERDIEPING_INTRO;

/**
 * Verdieping — V1/V2: duels. Twee keuzes tussen precies de twee archetypen die
 * bij deze deelnemer het dichtst bij elkaar liggen. Eén klik beslecht het
 * gelijkspel. Per archetype één korte, herkenbare ik-zin als keuze-optie.
 */
export const DUEL_ESSENTIE = NL.DUEL_ESSENTIE;

export const DUEL_INTRO = NL.DUEL_INTRO;
