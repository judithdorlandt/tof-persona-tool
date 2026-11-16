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
