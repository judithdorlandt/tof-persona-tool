/**
 * constants.js — design tokens voor Organisatie-Landschap PDF.
 *
 * Eén bron voor pagina-dimensies, kleur, archetype-volgorde en
 * betrouwbaarheidsdrempels. Wordt door alle OL_*.jsx pagina-builders gedeeld.
 *
 * Lost op: voorkomt magic numbers verspreid over de bestanden — elke designkeuze
 * is hier expliciet en aanpasbaar zonder pagina-builders aan te raken.
 */

// ── A4 landscape — vaste oriëntatie voor alle 4 pagina's
export const PAGE_W = 297;
export const PAGE_H = 210;

// V24: 16mm rondom — krappere maar voldoende marges, groter inhoudsvlak.
export const MARGIN = 16;
export const USABLE_W = PAGE_W - 2 * MARGIN;
export const USABLE_H = PAGE_H - 2 * MARGIN;

// ── Kleurpalet — uit de TOF design language spec.
export const COLORS = {
    bg: '#F7F3EE',           // zand-achtergrond
    surface: '#FFFFFF',
    border: '#EADFD4',       // hairline
    text: '#1F1F1F',         // primair
    textSoft: '#4D433D',     // secundair
    textMuted: '#9A8E82',    // tertiair / labels
    rose: '#B05252',         // frictie / spanning
    sage: '#7F9A8A',         // positief / rust
    ochre: '#C7A24A',
    // Heatmap-celkleur voor "écht 0% gemeten":
    cellZero: '#F0E9DF',
};

// ── Persona-kleuren (alleen als identifier, nooit decoratief).
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

// ── Archetype-volgorde (vast, voorspelbaar) + labels.
export const ARCHETYPE_ORDER = [
    'maker',
    'groeier',
    'presteerder',
    'denker',
    'verbinder',
    'teamspeler',
    'zekerzoeker',
    'vernieuwer',
];

export const ARCHETYPE_NAME = {
    maker: 'Maker',
    groeier: 'Groeier',
    presteerder: 'Presteerder',
    denker: 'Denker',
    verbinder: 'Verbinder',
    teamspeler: 'Teamspeler',
    zekerzoeker: 'Zekerzoeker',
    vernieuwer: 'Vernieuwer',
};

// ── Drijfveren (voor signature-zinnen en duiding).
export const PERSONA_DRIVE = {
    maker: 'maken',
    groeier: 'ontwikkeling',
    presteerder: 'resultaat',
    denker: 'diepgang',
    verbinder: 'verbinding',
    teamspeler: 'verbondenheid',
    zekerzoeker: 'stabiliteit',
    vernieuwer: 'vernieuwing',
};

// ── Betrouwbaarheidsdrempels (lost fout #4 pagina 1 op).
// n<5 = laag, 5–9 = midden, ≥10 = hoog.
export const RELIABILITY_THRESHOLDS = { low: 5, mid: 10 };

export const RELIABILITY = {
    LAAG: { id: 'laag', label: 'Laag', color: COLORS.rose, opacity: 0.6 },
    MIDDEN: { id: 'midden', label: 'Midden', color: COLORS.ochre, opacity: 0.85 },
    HOOG: { id: 'hoog', label: 'Hoog', color: COLORS.sage, opacity: 1 },
};

export function reliabilityFor(n) {
    if (n < RELIABILITY_THRESHOLDS.low) return RELIABILITY.LAAG;
    if (n < RELIABILITY_THRESHOLDS.mid) return RELIABILITY.MIDDEN;
    return RELIABILITY.HOOG;
}

// ── Typografie-tokens — consistent over pagina's heen.
export const TYPE = {
    // Body & lead
    body: { font: 'Inter', weight: 400, size: 3.7, color: COLORS.text, lineHeight: 5.2 },
    bodyStrong: { font: 'Inter', weight: 600, size: 3.7, color: COLORS.text, lineHeight: 5.2 },
    lead: { font: 'Inter', weight: 400, size: 4.6, color: COLORS.textSoft, lineHeight: 6.6 },

    // Eyebrow & labels (uppercase 11px ≈ 3.1mm)
    eyebrow: {
        font: 'Inter', weight: 700, size: 3.1,
        color: COLORS.textMuted, letterSpacing: 0.45,
    },
    label: {
        font: 'Inter', weight: 600, size: 3.4, color: COLORS.text,
    },

    // Headings (Playfair Display, serif)
    h1: { font: 'Playfair Display', weight: 500, size: 14, color: COLORS.text },
    h2: { font: 'Playfair Display', weight: 500, size: 10, color: COLORS.text },
    h3: { font: 'Playfair Display', weight: 500, size: 7, color: COLORS.text },
    quote: {
        font: 'Playfair Display', weight: 400, size: 5.4,
        color: COLORS.textSoft, italic: true,
    },
};
