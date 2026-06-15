/**
 * werkplekProfielLogic.js — EXPERIMENTEEL
 *
 * Pure, taalonafhankelijke logica voor het werkplekbehoefte- en gebruiksprofiel
 * van een team. Vertaalt de persona-samenstelling (primaire archetype-telling)
 * naar een relatieve nadruk per werkplektype en signaleert balans-/gedragsrisico's.
 *
 * SCOPE — bewust ALLEEN behoefte, gebruik en gedrag:
 *   - GEEN vierkante meters, oppervlaktes of afmetingen.
 *   - GEEN aantallen of percentages van plekken.
 *   - GEEN inrichtings-, capaciteits- of vastgoedadvies.
 *   - RUIMTEBOEK_BENCHMARK wordt NIET gebruikt.
 *
 * Geen zichtbare tekst hier — alleen ids en getallen. Labels staan in
 * werkplekProfielCopy.nl.js (i18n-klaar).
 */

import { WERKPLEKTYPEN, berekenTeamWerkplekmix } from './werkplekmix';

// Band-ids (taalonafhankelijk). De mix kent per persona niveau 3/2/1
// (kern/steun/aanvullend). Op teamniveau drukken we dezelfde drie banden uit
// op het GEWOGEN GEMIDDELDE niveau dat de aanwezige persona's aan een type geven.
export const BAND = {
    KERN: 'kern',
    STEUN: 'steun',
    AANVULLEND: 'aanvullend',
};

// Drempels op het gewogen gemiddelde niveau (loopt tussen 1 en 3).
// Geen percentages naar buiten — puur intern om de band te bepalen.
const KERN_DREMPEL = 2.34;
const STEUN_DREMPEL = 1.67;

// Voor gedragssignalen: wanneer telt een type als "veel" of "weinig" nadruk.
const HOOG_DREMPEL = 2.2;
const LAAG_DREMPEL = 1.6;

function bandVoorNiveau(gemiddeld) {
    if (gemiddeld >= KERN_DREMPEL) return BAND.KERN;
    if (gemiddeld >= STEUN_DREMPEL) return BAND.STEUN;
    return BAND.AANVULLEND;
}

/**
 * Bouwt aantallen-object { personaId: aantalLeden } uit een team-aggregate.
 * Gebruikt de PRIMAIRE archetype-telling (personasByPrimary) — "wie zit er in
 * dit team", niet de energie-sortering.
 */
export function aantallenUitAggregate(aggregate) {
    const aantallen = {};
    const lijst = aggregate?.personasByPrimary || [];
    lijst.forEach((p) => {
        if (p?.id) aantallen[p.id] = Number(p.count || 0);
    });
    return aantallen;
}

/**
 * Bouwt het werkplekprofiel: per type een relatieve nadruk + band, gesorteerd
 * op behoefte (hoogste nadruk eerst).
 *
 * @param {{ [personaId: string]: number }} aantallen
 * @returns {{ totaalLeden: number, typen: Array, heeftData: boolean }}
 */
export function buildWerkplekProfiel(aantallen) {
    const veiligeAantallen = aantallen && typeof aantallen === 'object' ? aantallen : {};
    const totaalLeden = Object.values(veiligeAantallen).reduce(
        (sum, n) => sum + (Number(n) || 0),
        0
    );

    const scores = berekenTeamWerkplekmix(veiligeAantallen);

    const typen = WERKPLEKTYPEN.map((t) => {
        const score = Number(scores[t.id] || 0);
        // Gewogen gemiddeld niveau (1..3) dat de aanwezige persona's aan dit type geven.
        const gemiddeld = totaalLeden > 0 ? score / totaalLeden : 0;
        return {
            id: t.id,
            label: t.label,
            voorbeeldplekken: t.voorbeeldplekken,
            score,
            gemiddeld,
            band: bandVoorNiveau(gemiddeld),
        };
    }).sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

    return { totaalLeden, typen, heeftData: totaalLeden > 0 };
}

/**
 * Leidt gedragssignalen af waar de balans scheef staat. Geeft alleen signal-ids
 * terug; de begeleidende tekst staat in de copy. Signalen zijn GEDRAGS-duidingen
 * (waar leunt het team op, wat dreigt te verschralen), nooit ruimtetekorten.
 *
 * @param {Array} typen — output van buildWerkplekProfiel().typen
 * @returns {string[]} signal-ids
 */
export function buildGedragssignalen(typen) {
    const byId = {};
    (typen || []).forEach((t) => { byId[t.id] = t; });
    const g = (id) => byId[id]?.gemiddeld || 0;
    const hoog = (id) => g(id) >= HOOG_DREMPEL;
    const laag = (id) => g(id) < LAAG_DREMPEL;

    const signalen = [];

    // Veel concentratie én overleg, weinig rust → schakelen zonder herstel.
    if (hoog('concentratie') && hoog('overleg') && laag('rust')) {
        signalen.push('uitputting');
    }

    // Veel afstemmen/samen/sociaal, weinig concentratie → focus wordt verdrongen.
    if ((hoog('overleg') || hoog('samenwerk') || hoog('informeel')) && laag('concentratie')) {
        signalen.push('focus_verdrongen');
    }

    // Veel overleg én hybride, weinig rust → continu "aan", weinig ademruimte.
    if (hoog('overleg') && hoog('hybride') && laag('rust')) {
        signalen.push('altijd_aan');
    }

    // Veel concentratie/rust, weinig sociaal/samen → onderlinge afstemming verschraalt.
    if ((hoog('concentratie') || hoog('rust')) && laag('informeel') && laag('samenwerk')) {
        signalen.push('weinig_ontmoeting');
    }

    return signalen;
}
