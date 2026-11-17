/**
 * prikkelUitkomst.js — de regel voor het teamsignaal "Geluid en werkomgeving",
 * als pure functie.
 *
 * Het scherm gebruikt deze functie NIET: de uitkomst komt uit SQL
 * (public.prikkel_voor_code, supabase/011_prikkel_antwoorden.sql), zodat de
 * aantallen de server nooit verlaten. Dit bestand bestaat om de regel te
 * documenteren en te testen, en rekent precies hetzelfde als
 * private.prikkel_uitkomst: in gehele getallen, dus zonder afrondingsverschil.
 *
 * Alleen stil, geroezemoes en reuring tellen; 'maakt niet uit' niet.
 */

/** Het minimum aantal antwoorden met een voorkeur voor een signaal. */
export const PRIKKEL_DREMPEL = 5;

/** De vier mogelijke signalen; null = te weinig voorkeuren. */
export const PRIKKEL_UITKOMSTEN = ['gemengd', 'stil', 'reuring', 'zonder_uitersten'];

export function isPrikkelUitkomst(waarde) {
    return typeof waarde === 'string' && PRIKKEL_UITKOMSTEN.includes(waarde);
}

export function prikkelUitkomst({ stil = 0, geroezemoes = 0, reuring = 0 } = {}) {
    const n = stil + geroezemoes + reuring;
    if (n < PRIKKEL_DREMPEL) return null;
    if (stil * 10 >= n * 3 && reuring * 10 >= n * 3) return 'gemengd';
    if (stil * 2 >= n) return 'stil';
    if (reuring * 2 >= n) return 'reuring';
    return 'zonder_uitersten';
}
