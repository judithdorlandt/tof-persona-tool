/**
 * resultDerivations.js — alle afleidingen van een testuitslag, op één plek.
 *
 * Pure functies zonder React en zonder tekst: labels en kopjes komen als
 * argument mee uit de i18n-laag. Zo rekenen het webresultaat, de PDF-kaart en
 * het app-profielscherm gegarandeerd hetzelfde.
 *
 * De scoringslogica zelf (data.js/helpers.js) blijft ongemoeid; dit is
 * uitsluitend presentatie-afleiding.
 */

/** Persona-kleuren uit de huisstijl. */
export const PERSONA_COLORS = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

export const DEFAULT_PERSONA_COLOR = PERSONA_COLORS.maker;

/**
 * Leesbare tekstkleur op een vlak in de persona-kleur.
 *
 * De acht kleuren lopen van donkerrood tot zandgeel; op de lichte varianten is
 * wit onleesbaar. Boven een luminantie van 0,62 wordt de tekst dus donker.
 */
export function getReadableTextOnColor(hexColor) {
    const hex = String(hexColor || '').replace('#', '');
    if (hex.length !== 6) return '#2F2521';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? '#2F2521' : '#F7F3EE';
}

/** Gewichten voor de werkplekmix: primair telt vol, daarna steeds minder. */
const MIX_WEIGHTS = [1, 0.7, 0.45];

/**
 * De acht werkplektypen uit het bricks-profiel.
 *
 * "Hybride" stond hier ook, maar is geen plek — het is een manier van werken.
 * Je kunt een concentratieplek aanwijzen, een hybride plek niet. In de acht
 * persona's kwam het dan ook nergens boven een 2 uit, waardoor het precies één
 * keer in beeld verscheen: bij de Zekerzoeker, en daar alleen omdat het in de
 * lijst nét vóór twee even hoge types stond. Een sorteertoeval, geen inzicht.
 */
const BRICKS_KEYS = [
    'focus',
    'work',
    'meeting',
    'project',
    'team',
    'learning',
    'retreat',
    'social',
];

/**
 * De verdeling over de acht persona's, hoog naar laag.
 *
 * Het percentage is een **aandeel van het totaal**: elke score gedeeld door de
 * som van alle scores. Daardoor tellen de acht balken samen op tot 100%, zoals
 * je van een verdeling verwacht. (Eerder werd er door de hoogste score
 * gedeeld; dan stond de winnaar altijd op 100% en telde het geheel nergens
 * op — verwarrend, en onvergelijkbaar tussen twee testen.)
 *
 * Afronden per balk kan 99 of 101 opleveren; het grootste restje krijgt het
 * verschil, zodat de som altijd exact 100 is.
 */
export function buildScoreDistribution(scores, archetypes = []) {
    const entries = Object.entries(scores || {})
        .map(([id, value]) => [id, Number(value) || 0])
        .sort((a, b) => b[1] - a[1]);

    const total = entries.reduce((sum, [, value]) => sum + value, 0);

    const withShare = entries.map(([id, value]) => {
        const archetype = archetypes.find((a) => a.id === id);
        const exact = total > 0 ? (value / total) * 100 : 0;
        return {
            id,
            name: archetype?.name || id,
            value,
            exact,
            percentage: Math.floor(exact),
            color: PERSONA_COLORS[id] || DEFAULT_PERSONA_COLOR,
            opacity: 1,
        };
    });

    // Restzetels verdelen: de grootste afrondingsresten krijgen elk 1 punt,
    // tot de som 100 is.
    const assigned = withShare.reduce((sum, item) => sum + item.percentage, 0);
    const remainder = total > 0 ? 100 - assigned : 0;
    withShare
        .map((item, index) => ({ index, rest: item.exact - item.percentage }))
        .sort((a, b) => b.rest - a.rest)
        .slice(0, Math.max(remainder, 0))
        .forEach(({ index }) => {
            withShare[index].percentage += 1;
        });

    // `barWidth` is puur de tekening: de hoogste balk vult de breedte, de rest
    // staat daar in verhouding toe. Een aandeel van het totaal blijft bij acht
    // persona's rond de 20% steken; als balkbreedte leest dat als "bijna niks",
    // terwijl het label de échte verhouding vertelt.
    const topShare = withShare[0]?.exact || 0;
    return withShare.map(({ exact, ...item }) => ({
        ...item,
        barWidth: topShare > 0 ? Math.max(Math.round((exact / topShare) * 100), 6) : 0,
    }));
}

/**
 * De werkplekbehoeften van de primaire persona, sterkste eerst.
 *
 * Alle acht komen mee, niet alleen de top drie: wat je wél nodig hebt is even
 * bruikbaar in een gesprek als wat je níét nodig hebt. `rank` telt vanaf 0, dus
 * wie alleen de sterkste drie wil tonen filtert op `rank < 3`.
 */
export function buildBricksItems(primary, workplaceLabels = {}) {
    if (!primary?.bricksProfile) return [];

    return Object.entries(primary.bricksProfile)
        .sort((a, b) => b[1] - a[1])
        .map(([key, value], rank) => ({
            key,
            rank,
            score: value,
            label: workplaceLabels[key] || key,
            text: primary?.bricksProfileText?.[key] || '',
        }));
}

/** De werkplekbehoefte van de hele mix: primair, secundair en tertiair samen. */
export function buildWorkplaceNeedsForMix(personas, workplaceLabels = {}) {
    const present = (personas || []).filter(Boolean);

    const totals = Object.fromEntries(BRICKS_KEYS.map((key) => [key, 0]));

    present.forEach((persona, index) => {
        const weight = MIX_WEIGHTS[index] ?? 0;
        const profile = persona?.bricksProfile || {};
        BRICKS_KEYS.forEach((key) => {
            totals[key] += Number(profile[key] || 0) * weight;
        });
    });

    return Object.entries(totals)
        .sort((a, b) => b[1] - a[1])
        .filter(([, value]) => value > 0)
        .map(([key, value]) => ({
            key,
            score: Number(value.toFixed(1)),
            label: workplaceLabels[key] || key,
            text: present.map((p) => p?.bricksProfileText?.[key]).find(Boolean) || '',
        }));
}

/** De drie leiderschapspunten die bij de primaire persona horen. */
export function buildLeadershipItems(primary) {
    return (primary?.leadership || []).slice(0, 3);
}

/**
 * Zoekt bij elk vastgeprikt `{ kind, key }`-paar de tekst die erbij hoort.
 *
 * De opslag bewaart alleen de verwijzing, niet de tekst: zo staat er in de
 * gespreksvoorbereiding altijd de formulering van vandaag, ook als de copy
 * later wordt bijgeschaafd of de taal wisselt. Verwijzingen die nergens meer
 * op slaan vallen stilzwijgend weg.
 */
export function resolvePinned(pinned, primary, workplaceLabels = {}) {
    const leadership = buildLeadershipItems(primary);
    const drains = (primary?.energycost || []).slice(0, 3);

    return (pinned || [])
        .map((pin) => {
            switch (pin.kind) {
                case 'workplace':
                    return {
                        ...pin,
                        label: workplaceLabels[pin.key] || '',
                        text: primary?.bricksProfileText?.[pin.key] || '',
                    };
                case 'leadership':
                    return { ...pin, text: leadership[Number(pin.key)] || '' };
                case 'energy':
                    return { ...pin, text: primary?.energy_from || '' };
                case 'drain':
                    return { ...pin, text: drains[Number(pin.key)] || '' };
                default:
                    return { ...pin, text: '' };
            }
        })
        // Zonder tekst is er niets te bespreken: een verwijzing die nergens
        // meer op slaat verdwijnt, in plaats van als kale sleutel te blijven
        // staan.
        .filter((item) => item.text);
}
