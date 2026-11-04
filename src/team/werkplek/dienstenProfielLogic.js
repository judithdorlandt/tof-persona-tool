/**
 * dienstenProfielLogic.js
 *
 * Pure, taalonafhankelijke logica voor "Wat dit team naar kantoor trekt".
 * Regel: v2 punt 6 (tof-marketingteam/toetsen/2026-11-04-ID-001-dienstenprofiel-v2.md).
 *
 *  1. Per dienst het gewogen gemiddelde over de teamleden (zelfde telling als
 *     het werkplekprofiel). IT doet niet mee.
 *  2. De zeven diensten van hoog naar laag; gelijke stand → volgorde van de lijst.
 *  3. Binnen de eerste drie plaatsen: de LAATSTE plaats waarna de volgende
 *     dienst minstens SPRONG_DREMPEL lager uitkomt.
 *  4. Tot en met die plaats → `top`; de rest → `helptOok`.
 *  5. Geen sprong → `geenUitgesproken`, en `helptOok` bevat alle zeven.
 *
 * Geen zichtbare tekst hier — alleen ids en getallen.
 */

import { DIENSTTYPEN, berekenTeamDienstenmix } from './dienstenmix';

// Besloten 4 nov 2026; na de eerste echte teams bijstellen.
export const SPRONG_DREMPEL = 0.25;

// Hoeveel plaatsen er hoogstens onder "Wat een kantoordag de moeite waard maakt" staan.
const MAX_TOP = 3;

// Kommagetallen: 2,00 − 1,75 mag niet net onder 0,25 uitkomen.
const EPSILON = 1e-9;

/**
 * @param {{ [personaId: string]: number }} aantallen — uit aantallenUitAggregate()
 * @returns {{ top: Array, helptOok: Array, geenUitgesproken: boolean,
 *             heeftData: boolean, totaalLeden: number }}
 *          items: { id, gemiddeld }
 */
export function buildDienstenProfiel(aantallen) {
    const veilig = aantallen && typeof aantallen === 'object' ? aantallen : {};
    const totaalLeden = Object.values(veilig).reduce((s, n) => s + (Number(n) || 0), 0);

    if (totaalLeden <= 0) {
        return { top: [], helptOok: [], geenUitgesproken: false, heeftData: false, totaalLeden: 0 };
    }

    const scores = berekenTeamDienstenmix(veilig);

    const rangorde = DIENSTTYPEN
        .filter((d) => d.inRangorde)
        .map((d) => ({
            id: d.id,
            volgorde: d.volgorde,
            gemiddeld: Number(scores[d.id] || 0) / totaalLeden,
        }))
        .sort((a, b) => b.gemiddeld - a.gemiddeld || a.volgorde - b.volgorde)
        .map(({ id, gemiddeld }) => ({ id, gemiddeld }));

    let grens = 0;
    for (let plaats = 1; plaats <= MAX_TOP && plaats < rangorde.length; plaats += 1) {
        const sprong = rangorde[plaats - 1].gemiddeld - rangorde[plaats].gemiddeld;
        if (sprong >= SPRONG_DREMPEL - EPSILON) grens = plaats;
    }

    if (grens === 0) {
        return { top: [], helptOok: rangorde, geenUitgesproken: true, heeftData: true, totaalLeden };
    }

    return {
        top: rangorde.slice(0, grens),
        helptOok: rangorde.slice(grens),
        geenUitgesproken: false,
        heeftData: true,
        totaalLeden,
    };
}

/**
 * Kop 1, "Waarom dit team komt": élke werkstijl die primair in het team
 * voorkomt, met de meeste mensen eerst en bij gelijke stand in de volgorde van
 * de archetypen (dezelfde volgorde als "Wie zit er in dit team").
 * Eerder alleen de dominante werkstijl(en), hoogstens drie; op verzoek van
 * Judith (4 nov 2026) nu allemaal. Alleen persona-ids — geen aantallen,
 * percentages of namen van mensen.
 */
export function waaromWerkstijlen(aggregate) {
    return (aggregate?.personasByPrimary || [])
        .filter((p) => p.count > 0)
        .map((p) => p.id);
}
