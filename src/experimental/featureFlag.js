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
