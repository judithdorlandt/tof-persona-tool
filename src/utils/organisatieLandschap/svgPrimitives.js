/**
 * svgPrimitives.js — SVG bouwstenen voor Organisatie-Landschap PDF.
 *
 * Self-contained — geen import van teamInsightPDF, want dat module hardcodet
 * portrait A3-dimensies. Hier bouwen we landscape A4 (297×210mm) primitives.
 *
 * Lost op:
 *  - Voorkomt mix van portrait/landscape canvas (oriëntatie-regel).
 *  - drawWrappedText respecteert exact lineHeight (gaf overlap in oude versie).
 */

import { PAGE_W, PAGE_H } from './constants';

const SVG_NS = 'http://www.w3.org/2000/svg';

/** Maakt een A4-landscape SVG canvas die we later via svg2pdf renderen. */
export function createCanvas() {
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('width', `${PAGE_W}mm`);
    svg.setAttribute('height', `${PAGE_H}mm`);
    svg.setAttribute('viewBox', `0 0 ${PAGE_W} ${PAGE_H}`);
    svg.style.position = 'fixed';
    svg.style.top = '-99999px';
    svg.style.left = '-99999px';
    return svg;
}

/** Rect — optioneel met stroke voor "kader"-stijl (gebruikt op cover). */
export function rect(x, y, w, h, fill, opts = {}) {
    const r = document.createElementNS(SVG_NS, 'rect');
    r.setAttribute('x', x);
    r.setAttribute('y', y);
    r.setAttribute('width', w);
    r.setAttribute('height', h);
    r.setAttribute('fill', fill);
    if (opts.stroke) {
        r.setAttribute('stroke', opts.stroke);
        r.setAttribute('stroke-width', opts.strokeWidth || 0.4);
    }
    if (opts.opacity != null) r.setAttribute('opacity', opts.opacity);
    if (opts.rx) r.setAttribute('rx', opts.rx);
    return r;
}

export function circle(cx, cy, r, fill, opts = {}) {
    const c = document.createElementNS(SVG_NS, 'circle');
    c.setAttribute('cx', cx);
    c.setAttribute('cy', cy);
    c.setAttribute('r', r);
    c.setAttribute('fill', fill);
    if (opts.opacity != null) c.setAttribute('opacity', opts.opacity);
    return c;
}

export function line(x1, y1, x2, y2, stroke, strokeWidth = 0.4) {
    const l = document.createElementNS(SVG_NS, 'line');
    l.setAttribute('x1', x1);
    l.setAttribute('y1', y1);
    l.setAttribute('x2', x2);
    l.setAttribute('y2', y2);
    l.setAttribute('stroke', stroke);
    l.setAttribute('stroke-width', strokeWidth);
    return l;
}

export function text({
    x, y, content,
    font = 'Inter', weight = 400, size = 3.5, color = '#000',
    anchor = 'start', italic = false, letterSpacing = 0, opacity,
}) {
    const t = document.createElementNS(SVG_NS, 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('font-family', font + ', serif');
    t.setAttribute('font-size', size);
    t.setAttribute('font-weight', weight);
    t.setAttribute('fill', color);
    t.setAttribute('text-anchor', anchor);
    if (italic) t.setAttribute('font-style', 'italic');
    // V14: ALTIJD letter-spacing zetten (ook 0). Anders erft het van
    // omliggende defaults en kun je het niet uit-zetten — was de bron
    // van de hardnekkige "Rij-totalen" tracking-bug.
    t.setAttribute('letter-spacing', letterSpacing);
    if (opacity != null) t.setAttribute('opacity', opacity);
    t.textContent = content;
    return t;
}

/** Helper: voeg een TYPE-token toe op (x,y) — minder boilerplate in pagina's. */
export function textToken({ x, y, content, token, anchor = 'start', overrides = {} }) {
    return text({
        x, y, content,
        ...token,
        anchor,
        ...overrides,
    });
}

/** Verticale divider — vol scheidt secties zonder visueel gewicht. */
export function divider(svg, y, color, x1, x2) {
    svg.appendChild(line(x1, y, x2, y, color, 0.3));
    return y;
}

// ── Tekst-wrap met respect voor lineHeight (geen overlap meer).
export function wrapTextLines(content, maxWidth, fontSize, font = 'Inter') {
    if (!content) return [];
    const avgCharW = fontSize * (font.includes('Playfair') ? 0.52 : 0.48);
    const maxChars = Math.max(1, Math.floor(maxWidth / avgCharW));
    const words = String(content).split(/\s+/);
    const lines = [];
    let current = '';
    for (const w of words) {
        const candidate = current ? `${current} ${w}` : w;
        if (candidate.length <= maxChars) {
            current = candidate;
        } else {
            if (current) lines.push(current);
            // Hard-break heel lange woorden zodat ze niet de marge breken.
            if (w.length > maxChars) {
                let chunk = w;
                while (chunk.length > maxChars) {
                    lines.push(chunk.slice(0, maxChars));
                    chunk = chunk.slice(maxChars);
                }
                current = chunk;
            } else {
                current = w;
            }
        }
    }
    if (current) lines.push(current);
    return lines;
}

export function drawWrapped({
    svg, x, y, maxWidth, content, font, weight, size, color, italic,
    lineHeight, anchor = 'start', maxLines, ellipsis = true,
}) {
    let lines = wrapTextLines(content, maxWidth, size, font);
    if (maxLines && lines.length > maxLines) {
        lines = lines.slice(0, maxLines);
        if (ellipsis && lines.length > 0) {
            const last = lines[lines.length - 1];
            lines[lines.length - 1] = last.length > 1 ? last.slice(0, -1) + '…' : last;
        }
    }
    const lh = lineHeight || size * 1.4;
    lines.forEach((ln, i) => {
        svg.appendChild(text({
            x, y: y + i * lh, content: ln,
            font, weight, size, color, italic, anchor,
        }));
    });
    // Return de y NA de gerenderde tekst — niet de laatste baseline.
    // Caller doet `ly = endY + SPACING.sm` → krijgt zo altijd minstens
    // één regel ruimte tussen bullets, ongeacht of de bullet 1 of n regels was.
    return y + lines.length * lh;
}

/** Hulp: serialize getallen netjes (geen 0.123456). */
export function num(n, decimals = 1) {
    if (!Number.isFinite(n)) return '0';
    return n.toFixed(decimals).replace(/\.0+$/, '');
}
