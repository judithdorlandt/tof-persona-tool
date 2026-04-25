/**
 * TOF Design Tokens
 *
 * Centraal point voor alle design-constants. Géén eigen maten in
 * componenten — altijd terugrefereren naar deze file.
 *
 * Kleuren zitten als CSS variables in index.css (--tof-*). Daar niet mee
 * dubbelen. Hier alleen non-kleur tokens.
 */

import { useEffect, useState } from 'react';

// =========================
// SPACING
// =========================
export const SPACING = {
    xs: 4,   // chip-gap, binnen-padding
    sm: 8,   // icon-tekst, kleine verticale ruimte
    md: 12,  // standaard gap in grids
    lg: 16,  // kaart padding inner, tussen items
    xl: 20,  // kaart padding outer
    '2xl': 24, // tussen pagina-secties
    '3xl': 40, // onder hero, voor content-start
};

// =========================
// RADIUS
// =========================
export const RADIUS = {
    sm: 8,   // buttons, pill-chips
    md: 10,  // form inputs, kleine kaartjes, InteractiveRow
    lg: 14,  // middelgrote strook/notification
    xl: 18,  // standaard kaart (SectionCard)
    '2xl': 32, // hero-highlight kaart (Results profielkaart)
    pill: 999,
};

// =========================
// TYPE SCALE
// =========================
// Gebruik deze als inline style objects:
//   <h1 style={TYPE.display}>...</h1>
//
// Responsive — clamp werkt automatisch tussen mobile en desktop.

export const TYPE = {
    display: {
        fontFamily: 'var(--tof-font-heading)',
        fontWeight: 500,
        fontSize: 'clamp(34px, 5vw, 62px)',
        lineHeight: 1.04,
        color: 'var(--tof-text)',
        margin: 0,
    },
    heading: {
        fontFamily: 'var(--tof-font-heading)',
        fontWeight: 500,
        fontSize: 'clamp(20px, 2.4vw, 30px)',
        lineHeight: 1.08,
        color: 'var(--tof-text)',
        margin: 0,
    },
    subhead: {
        fontFamily: 'var(--tof-font-heading)',
        fontWeight: 500,
        fontSize: 22,
        lineHeight: 1.12,
        color: 'var(--tof-text)',
        margin: 0,
    },
    bodyLarge: {
        fontFamily: 'var(--tof-font-body)',
        fontSize: 16,
        lineHeight: 1.7,
        color: 'var(--tof-text-soft)',
        margin: 0,
    },
    body: {
        fontFamily: 'var(--tof-font-body)',
        fontSize: 15,
        lineHeight: 1.6,
        color: 'var(--tof-text-soft)',
        margin: 0,
    },
    bodySmall: {
        fontFamily: 'var(--tof-font-body)',
        fontSize: 13,
        lineHeight: 1.55,
        color: 'var(--tof-text-soft)',
        margin: 0,
    },
    eyebrow: {
        fontFamily: 'var(--tof-font-body)',
        fontSize: 11,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 1.8,
        color: 'var(--tof-text-muted)',
        margin: 0,
    },
    meta: {
        // Small label, not uppercase — voor badge-tekst, meta-info
        fontFamily: 'var(--tof-font-body)',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--tof-text-muted)',
        margin: 0,
    },
};

// =========================
// MODULE ACCENTS
// =========================
// Helperfunctie om het juiste accent per module te krijgen.

export const MODULE = {
    persona: {
        accent: 'var(--tof-accent-rose)',
        soft: 'var(--tof-rose-soft)',
    },
    insight: {
        accent: 'var(--tof-accent-sage)',
        soft: 'var(--tof-sage-soft)',
    },
    dynamics: {
        accent: 'var(--tof-accent-rose)',
        soft: 'var(--tof-rose-soft)',
    },
    strategic: {
        accent: 'var(--tof-text)',
        soft: 'var(--tof-surface-soft)',
    },
};

// =========================
// SHADOW & TRANSITIONS
// =========================
export const SHADOW = {
    soft: 'var(--tof-shadow)',                           // standaard kaart
    hover: '0 16px 32px rgba(70, 45, 35, 0.10)',         // hover op klikbare kaart
    strong: '0 20px 52px rgba(70, 45, 35, 0.07)',        // hero-highlight kaart
};

export const EASE = 'var(--tof-ease)';

// =========================
// BREAKPOINTS
// =========================
export const BREAKPOINT_MOBILE = 900;

/**
 * Gebruik:
 *   const isMobile = useIsMobile();
 * in plaats van per component een eigen state.
 */

export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(
        typeof window !== 'undefined' ? window.innerWidth < BREAKPOINT_MOBILE : false
    );

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < BREAKPOINT_MOBILE);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    return isMobile;
}