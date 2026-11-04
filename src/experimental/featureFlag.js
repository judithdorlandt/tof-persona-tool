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
 * Uit totdat Judith het in de preview heeft gezien (opdracht 4 nov 2026).
 * Aanzetten:
 *   - Snel: zet DIENSTENPROFIEL_DEFAULT hieronder op true.
 *   - Via build/env: REACT_APP_DIENSTENPROFIEL = '1' (aan) of '0' (uit).
 */
const DIENSTENPROFIEL_DEFAULT = false;

const dienstenprofielEnvFlag = process.env.REACT_APP_DIENSTENPROFIEL;

export const DIENSTENPROFIEL_ENABLED =
    dienstenprofielEnvFlag !== undefined
        ? dienstenprofielEnvFlag === '1' || dienstenprofielEnvFlag === 'true'
        : DIENSTENPROFIEL_DEFAULT;
