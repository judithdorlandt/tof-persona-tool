/**
 * OL_Heatmap.jsx — Pagina 3: Werkstijl per team.
 *
 * V9-fixes:
 *  #1: ≥-teken correct via embedded Inter/Playfair TTF + UTF-8 string.
 *  #2: Legenda toont grijswaarde-gradient (0→100%) + uitleg "hoe sterker
 *      de kleur, hoe groter het aandeel" i.p.v. één paarse persona-kleur.
 *  #3: Betrouwbaarheidspillen → dot + tekst op één baseline, geen padding.
 *  #4: Team-naam font 12px (Inter Regular) + breder kolom (75mm) → geen wraps.
 *  #5: Footer-noot: "Rij-totalen kunnen door afronding optellen tot 99–101%".
 *  #6: ORGANISATIE-rij betrouwbaarheid → "n.v.t." in muted i.p.v. zwakke em-dash.
 */

import {
    PAGE_W, PAGE_H, MARGIN, USABLE_W,
    PERSONA_COLORS, ARCHETYPE_ORDER, ARCHETYPE_NAME,
} from './constants';
import {
    TYPE_V9, COLOR_FAMILIES, SPACING, RHYTHM,
    reliabilityDotFor,
} from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, line, circle,
} from './svgPrimitives';
import { drawPageHeader, drawPageFooter, CONTENT_TOP } from './OL_Chrome';

const C = COLOR_FAMILIES.neutral;
const SAGE = COLOR_FAMILIES.accent.rust;

export function buildHeatmapSVG({ data, copy }) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    // V12: pageTitle weglaten — anders staat hij identiek aan de H2.
    let y = drawPageHeader(svg, { date: data.date, pageTitle: null });

    y = drawTitleBlock(svg, y, copy);
    drawLegendTopRight(svg, y - 14, copy);
    y += SPACING.lg;
    drawHeatmap(svg, y, data, copy);
    drawHeatmapFootnote(svg, copy);
    drawPageFooter(svg, { pageNum: 3 });
    return svg;
}

function drawTitleBlock(svg, y, copy) {
    // V14: Playfair Regular 28pt — matcht web-app.
    const titleSize = TYPE_V9.h2.size;
    const titleBaseline = y + titleSize;
    svg.appendChild(text({
        x: MARGIN, y: titleBaseline,
        content: copy.heatmap.title,
        ...TYPE_V9.h2,
    }));
    // Subtekst max 60% van pagina-breedte (anders botst hij met de
    // KLEURINTENSITEIT-legenda rechtsboven).
    const subBaseline = titleBaseline + 2.82 + TYPE_V9.bodySoft.size;
    drawWrapped({
        svg, x: MARGIN, y: subBaseline,
        maxWidth: USABLE_W * 0.60,
        content: copy.heatmap.subtitle,
        ...TYPE_V9.bodySoft,
    });
    return subBaseline + SPACING.lg;
}

// Fix #2: grijswaarde-schaal met uitleg
function drawLegendTopRight(svg, y, copy) {
    const legW = 70;
    const legX = PAGE_W - MARGIN - legW;
    const legY = y + 5;

    svg.appendChild(text({
        x: legX, y: legY,
        content: copy.heatmap.legend.label,
        ...TYPE_V9.eyebrow,
    }));

    const sw = 13;
    const sh = 4;
    [0.12, 0.30, 0.50, 0.72, 1].forEach((op, i) => {
        const sx = legX + i * (sw + 1.5);
        // Grijswaarde — neutraal, niet persona-gekleurd
        svg.appendChild(rect(sx, legY + 3, sw, sh, '#5C544B', { opacity: op }));
    });
    svg.appendChild(text({
        x: legX, y: legY + 11.5,
        content: copy.heatmap.legend.scaleLow,
        ...TYPE_V9.footer, size: 2.6,
    }));
    svg.appendChild(text({
        x: legX + 5 * (sw + 1.5) - 1.5, y: legY + 11.5,
        content: copy.heatmap.legend.scaleHigh,
        ...TYPE_V9.footer, size: 2.6, anchor: 'end',
    }));
    // Uitleg-regel
    svg.appendChild(text({
        x: legX + (5 * (sw + 1.5)) / 2, y: legY + 17,
        content: copy.heatmap.legend.explanation,
        ...TYPE_V9.footer, size: 2.5, italic: true, anchor: 'middle',
    }));
}

function drawHeatmap(svg, y, data, copy) {
    // Fix #4: team-kolom breder (75mm), font kleiner (12px = 3.18mm)
    const teamColW = 75;
    const nColW = 9;
    const relColW = 22;
    const personaAreaX = MARGIN + teamColW + nColW + relColW;
    const personaAreaW = USABLE_W - teamColW - nColW - relColW;
    const cellW = personaAreaW / ARCHETYPE_ORDER.length;

    // Layout
    const headerH = 12;
    const footerReserved = 28;
    const heatmapTop = y + headerH;
    const heatmapBottom = PAGE_H - MARGIN - footerReserved;
    const rows = data.teamRows;
    const orgGap = SPACING.md;
    const rowCount = rows.length + 1;
    const availH = heatmapBottom - heatmapTop - orgGap;
    const rowH = Math.max(7, Math.min(11, availH / rowCount));

    drawColumnHeaders(svg, y, teamColW, nColW, relColW, cellW, copy);

    let cursorY = heatmapTop;
    rows.forEach((row, ri) => {
        drawDataRow(svg, {
            x: MARGIN, y: cursorY, h: rowH,
            teamColW, nColW, relColW, cellW,
            row, isOrg: false, zebra: ri % 2 === 0,
        });
        cursorY += rowH;
    });

    // Org-rij — totaalrij krijgt eigen sage-band in drawDataRow.
    cursorY += orgGap;
    drawDataRow(svg, {
        x: MARGIN, y: cursorY, h: rowH * 1.2,
        teamColW, nColW, relColW, cellW,
        row: data.orgRow, isOrg: true, zebra: false, copy,
    });
}

function drawColumnHeaders(svg, y, teamColW, nColW, relColW, cellW, copy) {
    const yBase = y + 8;
    svg.appendChild(text({
        x: MARGIN, y: yBase,
        content: copy.heatmap.cols.team,
        ...TYPE_V9.eyebrow,
    }));
    svg.appendChild(text({
        x: MARGIN + teamColW + nColW / 2, y: yBase,
        content: copy.heatmap.cols.n,
        ...TYPE_V9.eyebrow,
        anchor: 'middle',
    }));
    svg.appendChild(text({
        x: MARGIN + teamColW + nColW + relColW / 2, y: yBase,
        content: copy.heatmap.cols.reliability,
        ...TYPE_V9.eyebrow,
        anchor: 'middle',
    }));
    // Persona-kolomheaders — geen kleurpuntje (kleurintensiteit in cellen
    // draagt al de betekenis; extra dot is decoratie).
    ARCHETYPE_ORDER.forEach((id, ci) => {
        const cx = MARGIN + teamColW + nColW + relColW + ci * cellW + cellW / 2;
        svg.appendChild(text({
            x: cx, y: yBase,
            content: ARCHETYPE_NAME[id],
            font: 'Inter', weight: 600, size: 3, color: C.text,
            anchor: 'middle',
        }));
    });
}

function drawDataRow(svg, {
    x, y, h, teamColW, nColW, relColW, cellW, row, isOrg, zebra, copy,
}) {
    const rowOpacity = !isOrg && row.reliability?.id === 'laag' ? 0.65 : 1;

    if (zebra) svg.appendChild(rect(x, y, USABLE_W, h - 0.8, '#F2EBE0'));
    if (isOrg) {
        // Echte totaalrij: 1.5pt sage bovenrand + 8% sage achtergrond + bold body.
        svg.appendChild(rect(x, y, USABLE_W, h - 0.8, SAGE, { opacity: 0.08 }));
        svg.appendChild(rect(x, y, USABLE_W, 0.5, SAGE));
    }

    // Team-naam: body Inter, ORG-totaal in Playfair SemiBold-ish (Regular 12pt voor balans).
    drawWrapped({
        svg, x: x + (isOrg ? 4 : 2), y: y + h / 2 + 1,
        maxWidth: teamColW - (isOrg ? 6 : 4),
        content: row.name,
        font: isOrg ? 'Playfair Display' : 'Inter',
        weight: isOrg ? 500 : 500,
        size: isOrg ? 4.23 : 3.18,
        color: isOrg ? SAGE : C.text,
        lineHeight: isOrg ? 4.5 : 3.6, maxLines: 1, ellipsis: true,
    });

    // n
    svg.appendChild(text({
        x: x + teamColW + nColW / 2, y: y + h / 2 + 1,
        content: String(row.n),
        font: 'Inter', weight: isOrg ? 700 : 500, size: 3.3,
        color: isOrg ? SAGE : C.textSoft,
        anchor: 'middle',
        opacity: rowOpacity < 1 ? rowOpacity : null,
    }));

    // V14: dot uniform muted (label draagt al de betekenis), 4pt diameter (~0.7mm radius).
    if (!isOrg && row.reliability) {
        const cx = x + teamColW + nColW + 4;
        const cy = y + h / 2 + 0.4;
        const dot = reliabilityDotFor(row.n);
        svg.appendChild(circle(cx, cy, 0.7, C.textMuted, {
            opacity: rowOpacity < 1 ? rowOpacity : 1,
        }));
        svg.appendChild(text({
            x: cx + 2.5, y: cy + 1.1,
            content: dot.label,
            font: 'Inter', weight: 500, size: 3, color: C.textSoft,
            opacity: rowOpacity < 1 ? rowOpacity : null,
        }));
    } else if (isOrg) {
        // Fix #6: 'n.v.t.' i.p.v. zachte em-dash
        svg.appendChild(text({
            x: x + teamColW + nColW + relColW / 2, y: y + h / 2 + 1,
            content: copy.heatmap.orgRowReliability,
            font: 'Inter', weight: 500, size: 3, color: C.textMuted,
            anchor: 'middle', italic: true,
        }));
    }

    // Cellen
    const personaX0 = x + teamColW + nColW + relColW;
    row.cells.forEach((c, ci) => {
        const cx = personaX0 + ci * cellW;
        drawCell(svg, {
            x: cx + 1, y: y + 0.8, w: cellW - 2, h: h - 2.4,
            pct: c.pct, color: PERSONA_COLORS[ARCHETYPE_ORDER[ci]],
            isOrg, opacity: rowOpacity,
        });
    });
}

function drawCell(svg, { x, y, w, h, pct, color, isOrg, opacity }) {
    if (pct === null || pct === undefined) return;
    if (pct === 0) {
        svg.appendChild(rect(x, y, w, h, C.cellZero, {
            opacity: opacity != null ? opacity * 0.7 : 0.7,
        }));
        svg.appendChild(text({
            x: x + w / 2, y: y + h / 2 + 1.2,
            content: '—',
            font: 'Inter', weight: 500, size: 3, color: C.textMuted,
            anchor: 'middle',
            opacity: opacity != null && opacity < 1 ? opacity : null,
        }));
        return;
    }
    const op = Math.max(0.18, Math.min(0.95, pct / 100));
    svg.appendChild(rect(x, y, w, h, color, {
        opacity: opacity != null ? op * opacity : op,
    }));
    const labelColor = pct >= 55 ? '#fff' : C.text;
    svg.appendChild(text({
        x: x + w / 2, y: y + h / 2 + 1.2,
        content: `${pct}`,
        font: 'Inter', weight: isOrg ? 700 : 600, size: 3.1,
        color: labelColor, anchor: 'middle',
        opacity: opacity != null && opacity < 1 ? opacity : null,
    }));
}

function drawHeatmapFootnote(svg, copy) {
    // Noot boven de footer-chrome — standaard tracking, geen letter-spacing,
    // enkelvoudige spaties rond '·' zodat hij niet uitgespateerd oogt.
    const noteY = PAGE_H - MARGIN - 10;
    svg.appendChild(text({
        x: MARGIN, y: noteY,
        content: `${copy.heatmap.roundingNote} · ${copy.heatmap.reliabilityHelp}`,
        font: 'Inter', weight: 400, size: 2.9, color: C.textMuted,
        italic: true, letterSpacing: 0,
    }));
}
