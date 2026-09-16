/**
 * featureFlag.js — EXPERIMENTEEL
 *
 * Eén schakelaar voor het experimentele werkplekbehoefteprofiel.
 * Staat het experiment uit, dan verschijnt er geen route, link of UI — de rest
 * van de app blijft volledig ongemoeid.
 *
 * Aan-/uitzetten:
 *   - Snel: zet WERKPLEKPROFIEL_DEFAULT hieronder op false.
 *   - Via build/env: REACT_APP_WERKPLEKPROFIEL = '1' (aan) of '0' (uit).
 */

const WERKPLEKPROFIEL_DEFAULT = true;

const envFlag = process.env.REACT_APP_WERKPLEKPROFIEL;

export const WERKPLEKPROFIEL_ENABLED =
    envFlag !== undefined
        ? envFlag === '1' || envFlag === 'true'
        : WERKPLEKPROFIEL_DEFAULT;

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
const QUIZTEST_DEFAULT = true;

const quizTestEnvFlag = process.env.REACT_APP_QUIZTEST;

export const QUIZTEST_ENABLED =
    quizTestEnvFlag !== undefined
        ? quizTestEnvFlag === '1' || quizTestEnvFlag === 'true'
        : QUIZTEST_DEFAULT;
