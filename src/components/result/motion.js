/**
 * motion.js — de beweging van het resultaatscherm, op één plek.
 *
 * Twee dingen bewegen: de blokken komen één voor één in beeld, en de balken
 * van de verdeling groeien van niets naar hun waarde. Beide gebeuren één keer,
 * bij het eerste tonen — een CSS-animatie start niet opnieuw bij een re-render
 * van hetzelfde element, dus daar is geen extra state voor nodig.
 *
 * Wie in het systeem minder beweging heeft gevraagd, ziet meteen de
 * eindtoestand. Dat wordt op twee manieren afgedekt: `prefersReducedMotion()`
 * hieronder slaat het groeien van de balken over, en een
 * `prefers-reduced-motion`-blok in index.css kort elke animatie en overgang af
 * (met `!important`, want deze stijlen staan inline).
 */

/** Blokken: 400 ms infaden, 12 px omhoog, 60 ms tussen twee blokken. */
export const RISE_DURATION = 400;
export const RISE_STAGGER = 60;

/** Balken: 600 ms groeien, 40 ms tussen twee balken. */
export const BAR_DURATION = 600;
export const BAR_STAGGER = 40;

/**
 * Inline-stijl voor het `index`-de blok dat in beeld komt.
 *
 * `both` als fill-mode is essentieel: zonder dat staat een blok tijdens zijn
 * wachttijd al zichtbaar op zijn plek en klapt het daarna terug naar
 * onzichtbaar.
 *
 * De vertraging staat IN de shorthand (tweede tijdswaarde), niet als losse
 * `animationDelay`. Zet je beide, dan wist React de shorthand: in het
 * style-attribuut blijven `animation-duration` en `animation-name` leeg achter
 * en beweegt er niets meer. Dezelfde valkuil als bij `border` naast
 * `borderLeft`.
 */
export function riseIn(index) {
    return {
        animation: `tofRiseIn ${RISE_DURATION}ms var(--tof-ease) ${index * RISE_STAGGER}ms both`,
    };
}

/** Vraagt het toestel of het minder beweging wil. */
export function prefersReducedMotion() {
    return (
        typeof window !== 'undefined'
        && typeof window.matchMedia === 'function'
        && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
}
