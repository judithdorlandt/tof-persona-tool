/**
 * featureFlag.js — EXPERIMENTEEL
 *
 * Het werkplekbehoefteprofiel stond hier ook achter een schakelaar; sinds
 * 22 okt 2026 staat het vast aan en woont het in src/team/werkplek/.
 */

/**
 * QUIZTEST — EXPERIMENTEEL
 *
 * Verkorte testvariant van de vragenlijst (9 basisvragen + optionele
 * verdieping), gebaseerd op het analysestuk "Korter afnemen, scherper prijzen".
 * Staat volledig los van de live 16-vragenquiz. Uit = geen route/link/UI.
 *
 * Aan-/uitzetten:
 *   - Snel: zet QUIZTEST_DEFAULT hieronder op false.
 *   - Via build/env: REACT_APP_QUIZTEST = '1' (aan) of '0' (uit).
 */
// Uit sinds 21 okt 2026: /quiz-test was een achterdeur naar de vragenlijst in
// de browser, terwijl de vrije test in de app zit. Lokaal aanzetten kan met
// REACT_APP_QUIZTEST=1.
const QUIZTEST_DEFAULT = false;

const quizTestEnvFlag = process.env.REACT_APP_QUIZTEST;

export const QUIZTEST_ENABLED =
    quizTestEnvFlag !== undefined
        ? quizTestEnvFlag === '1' || quizTestEnvFlag === 'true'
        : QUIZTEST_DEFAULT;

/**
 * DIENSTENPROFIEL — "Wat dit team naar kantoor trekt"
 *
 * Een tweede laag in het Werkplek-paneel van het teamdashboard (onder "Let op
 * de balans") en één zin in de Werkplek-sectie van het persoonlijke profiel.
 * Het werkplekprofiel zelf hangt NIET aan deze schakelaar.
 *
 * Aan sinds 4 nov 2026, na Judiths review in de preview.
 * Uitzetten:
 *   - Snel: zet DIENSTENPROFIEL_DEFAULT hieronder op false.
 *   - Via build/env: REACT_APP_DIENSTENPROFIEL = '1' (aan) of '0' (uit).
 */
const DIENSTENPROFIEL_DEFAULT = true;

const dienstenprofielEnvFlag = process.env.REACT_APP_DIENSTENPROFIEL;

export const DIENSTENPROFIEL_ENABLED =
    dienstenprofielEnvFlag !== undefined
        ? dienstenprofielEnvFlag === '1' || dienstenprofielEnvFlag === 'true'
        : DIENSTENPROFIEL_DEFAULT;

/**
 * PRIKKEL — "Geluid en werkomgeving" (prikkelbehoefte)
 *
 * Eén vraag na de negen basisvragen: hoeveel geluid heb je nodig om goed te
 * werken? Telt mee in de teller ("10 / 10"), niet in de score. Daarnaast een
 * regel in het eigen profiel bij een antwoord tegen de werkstijl in, en het
 * antwoord gaat mee in de link naar het team (`pk`, lib/profileHandoff.js).
 * Opdracht: tof-marketingteam/content/opdracht-app-prikkelbehoefte.md.
 *
 * Uit totdat Judith de preview heeft gezien.
 * Aanzetten:
 *   - Snel: zet PRIKKEL_DEFAULT hieronder op true.
 *   - Via build/env: REACT_APP_PRIKKEL = '1' (aan) of '0' (uit).
 */
const PRIKKEL_DEFAULT = false;

const prikkelEnvFlag = process.env.REACT_APP_PRIKKEL;

export const PRIKKEL_ENABLED =
    prikkelEnvFlag !== undefined
        ? prikkelEnvFlag === '1' || prikkelEnvFlag === 'true'
        : PRIKKEL_DEFAULT;
