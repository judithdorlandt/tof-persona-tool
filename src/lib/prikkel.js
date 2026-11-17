/**
 * prikkel.js — de regels rond de werkomgevingsvraag (prikkelbehoefte), los
 * van elk scherm zodat ze te testen zijn.
 *
 * Opdracht: tof-marketingteam/content/opdracht-app-prikkelbehoefte.md.
 * Tabel "Wanneer de regel verschijnt": UX-uitwerking §2 in
 * tof-marketingteam/ux/2026-11-16-prikkelbehoefte-schets.md, met het besluit
 * van Judith (16 nov 2026) dat de Zekerzoeker geen regel krijgt.
 */

/** De vier antwoorden, in vaste volgorde. Data-ids: nooit vertalen. */
export const PRIKKEL_IDS = ['stil', 'geroezemoes', 'reuring', 'maakt_niet_uit'];

export function isPrikkel(waarde) {
    return typeof waarde === 'string' && PRIKKEL_IDS.includes(waarde);
}

/**
 * Bij welk antwoord een werkstijl een regel in het eigen profiel krijgt: alleen
 * bij het tegenovergestelde uiterste van wat de werkstijl doet verwachten.
 * Maker, Groeier, Teamspeler en Zekerzoeker staan er bewust niet in.
 */
const REGEL_BIJ = {
    denker: 'reuring',
    presteerder: 'reuring',
    verbinder: 'stil',
    vernieuwer: 'stil',
};

/**
 * Welke profielregel er hoort bij deze primaire werkstijl en dit antwoord:
 * 'reuringBijStil', 'stilBijLeven' of null (geen regel).
 */
export function prikkelRegelSoort(personaId, prikkel) {
    const bij = REGEL_BIJ[personaId];
    if (!bij || prikkel !== bij) return null;
    return bij === 'reuring' ? 'reuringBijStil' : 'stilBijLeven';
}

/**
 * De markering "voor dit team is al een werkomgevingsantwoord binnen" in deze
 * browser. Gezet door de losse link (/werkomgeving) en door Bijdragen als er
 * een antwoord meeging. Vangt dubbel tellen in dezelfde browser; een ander
 * toestel of een privévenster niet (besluit Judith 17 nov 2026, punt 4).
 * Bewaart niets anders dan '1': geen antwoord, geen naam.
 */
export function prikkelMarkeringSleutel(code) {
    return `tof_prikkel_${String(code || '').trim()}`;
}

export function heeftPrikkelMarkering(code) {
    if (!String(code || '').trim()) return false;
    try {
        return window.localStorage.getItem(prikkelMarkeringSleutel(code)) === '1';
    } catch {
        return false;
    }
}

export function zetPrikkelMarkering(code) {
    if (!String(code || '').trim()) return;
    try {
        window.localStorage.setItem(prikkelMarkeringSleutel(code), '1');
    } catch {
        // Geen opslag (privévenster, geblokkeerd): dan geen markering.
    }
}

/**
 * {maand} in de lege toestand van het teamblok ("wie vóór {maand} een profiel
 * invulde, kreeg hem toen nog niet"): de maand waarin het web de antwoorden
 * gaat bewaren. Eén constante, in te vullen bij de push naar main; maandnaam
 * zonder jaartal (teksten-app-prikkelbehoefte.md, "Aanvulling 17 nov").
 */
export const PRIKKEL_START_MAAND = { nl: 'november', en: 'November' };
