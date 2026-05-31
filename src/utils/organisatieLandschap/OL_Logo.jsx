/**
 * OL_Logo.jsx — TOF logo: open cirkel met getypeerde 'F' erin.
 *
 * V2: terug naar het echte merk-anker — ronde "F"-typografie in een cirkel.
 * Geen geconstrueerde balken (die kwamen niet overeen met de referentie).
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * Tekent het TOF-logo op (cx, cy) met diameter `diameter` (in mm).
 * Cirkel-lijndikte schaalt mee (1/30e van diameter, conform referentie).
 */
export function drawTOFLogo(svg, { cx, cy, diameter, color = '#B05252' }) {
    const r = diameter / 2;
    const strokeW = diameter / 30;

    // ── Open ring
    const ring = document.createElementNS(SVG_NS, 'circle');
    ring.setAttribute('cx', cx);
    ring.setAttribute('cy', cy);
    ring.setAttribute('r', r - strokeW / 2);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', color);
    ring.setAttribute('stroke-width', strokeW);
    svg.appendChild(ring);

    // ── F-glyph centraal in de ring
    // Inter Regular, hoogte ≈ 55% van diameter zodat hij ruim binnen de cirkel valt.
    const fSize = diameter * 0.62;
    // Baseline ligt bij Inter ongeveer 0.78 * em vanaf de top — voor middencentrering
    // op cy moet baseline ≈ cy + fSize * 0.28 staan.
    const fBaseline = cy + fSize * 0.28;

    const f = document.createElementNS(SVG_NS, 'text');
    f.setAttribute('x', cx);
    f.setAttribute('y', fBaseline);
    f.setAttribute('font-family', 'Inter, serif');
    f.setAttribute('font-size', fSize);
    f.setAttribute('font-weight', 400);
    f.setAttribute('fill', color);
    f.setAttribute('text-anchor', 'middle');
    f.textContent = 'F';
    svg.appendChild(f);
}
