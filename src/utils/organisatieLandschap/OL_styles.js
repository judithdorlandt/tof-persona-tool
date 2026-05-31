/**
 * OL_styles.js — design-tokens v9 (vaste type-schaal + spacing-ritme).
 *
 * Alle waarden in mm (PDF-eenheid). Spec gaf px → omgerekend met 1px = 0.2646mm
 * (96dpi). Niet improviseren in pagina-builders — altijd via deze tokens.
 *
 * Lost spec-eis op: "te veel groottes door elkaar zonder ritme" + spacing-ritme
 * in veelvouden van 4px.
 */

// ── Pagina-marge v9: 72px = 19.05mm (was ~16mm, premium = meer ruimte).
export const MARGIN_V9 = 19;

// ── Spacing-tokens (4px-rythm in mm).
export const SPACING = {
    xs: 1.06,   //  4px — binnen-component, label↔waarde
    sm: 2.12,   //  8px — binnen-card, items in lijst
    md: 4.23,   // 16px — tussen items in een sectie
    lg: 6.35,   // 24px — tussen secties binnen een kolom
    xl: 10.58,  // 40px — tussen kolommen / hoofdblokken
    xxl: 16.93, // 64px — tussen H1 en eerste inhoud
};

// Specifieke afstanden uit spec.
export const RHYTHM = {
    h1ToH2: 3.18,        // 12px tussen H1 en H2
    h2ToBody: 10.58,     // 40px tussen H2 en eerste body
    quoteAbove: 10.58,   // 40px boven quote
    quoteBelow: 6.35,    // 24px onder quote
    quoteToSub: 4.76,    // 18px tussen quote en ondertekst (16–20px mid)
    footerAbove: 6.35,   // 24px boven footer
};

// ── Type-schaal v14 — herstel Playfair (headings + KPI) + Inter (body).
// Matcht de tool's web-typografie (index.css: --tof-font-heading Playfair,
// --tof-font-body Inter). Hiërarchie via font + size, niet via weight.
//
// Spec: 44pt → 15.5mm, 36pt → 12.7mm, 28pt → 9.88mm, 22pt → 7.76mm,
//       16pt → 5.65mm, 14pt → 4.94mm, 12pt → 4.23mm, 11pt → 3.88mm,
//       10pt → 3.53mm, 9pt → 3.18mm, 8pt → 2.82mm.
export const TYPE_V9 = {
    // Organisatienaam op cover — Playfair Regular 44pt
    h1: {
        font: 'Playfair Display', weight: 400,
        size: 15.50, lineHeight: 17.05, color: '#1F1F1F',
    },
    // Paginatitel (Kerncijfers, Werkstijl per team…) — Playfair Regular 28pt
    h2: {
        font: 'Playfair Display', weight: 400,
        size: 9.88, lineHeight: 12.35, color: '#1F1F1F',
    },
    // Kaart-titels — Inter SemiBold 14pt
    h3: {
        font: 'Inter', weight: 600,
        size: 4.94, lineHeight: 6.92, color: '#1F1F1F',
    },
    // Eyebrow — Inter SemiBold 8pt uppercase tracked
    eyebrow: {
        font: 'Inter', weight: 600,
        size: 2.82, lineHeight: 3.95, letterSpacing: 0.45,
        color: '#9A8E82', upper: true,
    },
    // Body — Inter Regular 11pt
    body: {
        font: 'Inter', weight: 400,
        size: 3.88, lineHeight: 6.60, color: '#1F1F1F',
    },
    // Body soft (subtitels, intro's) — Inter Regular Italic 12pt, textSoft
    bodySoft: {
        font: 'Inter', weight: 400,
        size: 4.23, lineHeight: 6.35, color: '#4D433D', italic: true,
    },
    // KPI-getal (103, Verbinder als naam) — Playfair Regular 36pt
    bigNumber: {
        font: 'Playfair Display', weight: 400,
        size: 12.70, lineHeight: 12.70, color: '#1F1F1F',
    },
    // KPI-waarde-tekst (Verbinder, Samenwerkplekken) — Playfair Regular 22pt
    kpiValue: {
        font: 'Playfair Display', weight: 400,
        size: 7.76, lineHeight: 8.83, color: '#1F1F1F',
    },
    bigNumberUnit: {
        font: 'Inter', weight: 400,
        size: 3.18, lineHeight: 4.47, color: '#9A8E82',
    },
    // Footnote, paginanummer — Inter Regular 9pt
    footer: {
        font: 'Inter', weight: 400,
        size: 3.18, lineHeight: 4.45, color: '#9A8E82',
    },
    // Slot-quote — Playfair Italic 16pt (visuele climax pagina 5)
    quote: {
        font: 'Playfair Display', weight: 400,
        size: 5.65, lineHeight: 7.76, color: '#4D433D', italic: true,
    },
    // Signatuurregel op cover — Inter Regular Italic 9pt textMuted
    tagline: {
        font: 'Inter', weight: 400,
        size: 3.18, lineHeight: 4.45, color: '#9A8E82', italic: true,
    },
};

// ── Kleurfamilies (kleur-discipline regel uit spec).
// Drie families — geen overlap toegestaan.
export const COLOR_FAMILIES = {
    persona: {
        // EXCLUSIEF voor persona-identificatie.
        maker: '#B05252', groeier: '#C28D6B', presteerder: '#C7A24A',
        denker: '#6F7F92', verbinder: '#7F9A8A', teamspeler: '#8B7F9A',
        zekerzoeker: '#7D8A6B', vernieuwer: '#D08C5B',
    },
    accent: {
        // Voor inhoudelijke signalering.
        frictie: '#B05252',   // rose — frictie/spanning
        rust: '#7F9A8A',      // sage — positief/rust
        // Soft varianten voor lichte signalering.
        frictieSoft: '#D08C8C',
    },
    neutral: {
        // Voor structuur, hairlines, randen, meta-tekst.
        bg: '#F7F3EE',
        surface: '#FFFFFF',
        border: '#EADFD4',
        text: '#1F1F1F',
        textSoft: '#4D433D',
        textMuted: '#9A8E82',
        cellZero: '#F0E9DF',
    },
};

// ── Reliability-dots (fix #3 pagina 3: pillen weg, dot + tekst op baseline).
export const RELIABILITY_DOT = {
    hoog: { id: 'hoog', label: 'Hoog', color: COLOR_FAMILIES.accent.rust },
    midden: { id: 'midden', label: 'Midden', color: '#C7A24A' },
    laag: { id: 'laag', label: 'Laag', color: COLOR_FAMILIES.accent.frictieSoft },
};

export function reliabilityDotFor(n) {
    if (n < 5) return RELIABILITY_DOT.laag;
    if (n < 10) return RELIABILITY_DOT.midden;
    return RELIABILITY_DOT.hoog;
}
