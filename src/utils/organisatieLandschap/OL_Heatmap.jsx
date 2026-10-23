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
    PERSONA_COLORS, ARCHETYPE_ORDER, getArchetypeName,
} from './constants';
import {
    TYPE_V9, COLOR_FAMILIES, SPACING,
} from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, circle, wrapTextLines,
} from './svgPrimitives';
import { drawPageHeader } from './OL_Chrome';

const C = COLOR_FAMILIES.neutral;
const SAGE = COLOR_FAMILIES.accent.rust;

// Voetnoot-geometrie — onderaan verankerd, boven de footer-lijn (PAGE_H-MARGIN+2).
// Gedeeld door de tabel-layout (drawHeatmap) en het tekenen (drawHeatmapFootnote)
// zodat beide exact dezelfde onderkant respecteren → geen overlap mogelijk.
const FN_LINE_H = 3.8;
const FN_SIZE = 3.18;
// V24: ruimer boven de footer-lijn (PAGE_H-MARGIN+2) zodat de voetnoten
// het paginanummer/logo nooit raken.
const FN_BOTTOM_BASELINE = PAGE_H - MARGIN - 6;

export function buildHeatmapSVG({ data, copy, lang = 'nl' }) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    // V12: pageTitle weglaten — anders staat hij identiek aan de H2.
    let y = drawPageHeader(svg, { date: data.date, pageTitle: null, copy });

    // V24: legenda uitgelijnd met de titel-bovenkant (hoger), zodat de tabel
    // eerder kan beginnen. Pre-tabel-gap verkleind van lg → sm.
    const titleTopY = y;
    y = drawTitleBlock(svg, y, copy);
    drawLegendTopRight(svg, titleTopY, copy);
    y += SPACING.sm;
    drawHeatmap(svg, y, data, copy, lang);
    drawHeatmapFootnote(svg, data, copy);
    // Footer wordt centraal door de orchestrator getekend (dynamische nummering).
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
    const subBaseline = titleBaseline + 4 + TYPE_V9.bodySoft.size;
    drawWrapped({
        svg, x: MARGIN, y: subBaseline,
        maxWidth: USABLE_W * 0.60,
        content: copy.heatmap.subtitle,
        ...TYPE_V9.bodySoft,
    });
    return subBaseline + SPACING.md;
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
    // Swatches volgen exact dezelfde lineaire schaal als de cellen (0%→1.0):
    // 0.12 + (pct/100) * 0.88 op 0/25/50/75/100%.
    [0.12, 0.34, 0.56, 0.78, 1].forEach((op, i) => {
        const sx = legX + i * (sw + 1.5);
        // Grijswaarde — neutraal, niet persona-gekleurd
        svg.appendChild(rect(sx, legY + 3, sw, sh, '#5C544B', { opacity: op }));
    });
    svg.appendChild(text({
        x: legX, y: legY + 11.5,
        content: copy.heatmap.legend.scaleLow,
        ...TYPE_V9.footer,
    }));
    svg.appendChild(text({
        x: legX + 5 * (sw + 1.5) - 1.5, y: legY + 11.5,
        content: copy.heatmap.legend.scaleHigh,
        ...TYPE_V9.footer, anchor: 'end',
    }));
    // Uitleg-regel
    svg.appendChild(text({
        x: legX + (5 * (sw + 1.5)) / 2, y: legY + 17,
        content: copy.heatmap.legend.explanation,
        ...TYPE_V9.footer, anchor: 'middle',
    }));
}

function drawHeatmap(svg, y, data, copy, lang) {
    // Fix #4: team-kolom breder (75mm), font kleiner (12px = 3.18mm)
    // Betrouwbaarheid toont sinds L4 de labels van getConfidence() ("Opkomend
    // patroon", "Betrouwbaar beeld"): langer dan Laag/Midden/Hoog, dus een
    // bredere kolom ten koste van de ruime teamnaamkolom.
    const teamColW = 60;
    const nColW = 9;
    const relColW = 37;
    const personaAreaW = USABLE_W - teamColW - nColW - relColW;
    const cellW = personaAreaW / ARCHETYPE_ORDER.length;

    const headerH = 12;
    const heatmapTop = y + headerH;
    const rows = data.teamRows;
    const orgGap = SPACING.md;

    // Het footnote-blok is ONDERAAN verankerd (boven de footer). De tabel-band
    // loopt tot SPACING.lg bóven dat blok. Daardoor staan de ORGANISATIE-
    // totaalrij en de voetnoten altijd gescheiden en vrij — ongeacht het aantal
    // teams of voetnootregels. De rijhoogte schaalt mee zodat alles past.
    // V24: ruimere scheiding (xl) tussen de ORGANISATIE-totaalrij en het
    // voetnoot-blok — totaalrij vrij, dan voetnoten, dan footer.
    const fnLines = buildFootnoteLines(data, copy);
    const bandBottom = footnoteBlockTop(fnLines.length) - SPACING.xl;

    // Row-units: teamrijen (1 elk) + org-totaalrij (1.2× zwaarder). Zo klopt
    // de hoogte-reservering exact. Niet-gekoppelde profielen hebben geen
    // eigen rij meer: ze zitten in "Overige" (zie organisatieAggregation).
    const orgUnits = 1.2;
    const units = rows.length + orgUnits;
    const availH = bandBottom - heatmapTop - orgGap;
    const rowH = Math.max(5.0, Math.min(11, availH / units));

    drawColumnHeaders(svg, y, teamColW, nColW, relColW, cellW, copy, lang);

    let cursorY = heatmapTop;
    rows.forEach((row, ri) => {
        drawDataRow(svg, {
            x: MARGIN, y: cursorY, h: rowH,
            teamColW, nColW, relColW, cellW,
            row, isOrg: false, zebra: ri % 2 === 0, copy,
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

function drawColumnHeaders(svg, y, teamColW, nColW, relColW, cellW, copy, lang) {
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
            content: getArchetypeName(id, lang),
            font: 'Inter', weight: 600, size: 3, color: C.text,
            anchor: 'middle',
        }));
    });
}

function drawDataRow(svg, {
    x, y, h, teamColW, nColW, relColW, cellW, row, isOrg, zebra, copy,
}) {
    const lowReliability = !isOrg && row.reliability?.id === 'low';
    const rowOpacity = lowReliability ? 0.65 : 1;

    if (zebra) svg.appendChild(rect(x, y, USABLE_W, h - 0.8, '#F2EBE0'));
    if (isOrg) {
        // Echte totaalrij: 1.5pt sage bovenrand + 8% sage achtergrond + bold body.
        svg.appendChild(rect(x, y, USABLE_W, h - 0.8, SAGE, { opacity: 0.08 }));
        svg.appendChild(rect(x, y, USABLE_W, 0.5, SAGE));
    }

    // Team-naam: body Inter, ORG-totaal in Playfair. Niet afkappen met "…":
    // een lange naam loopt over meer regels, verticaal gecentreerd (L5).
    const nameSize = isOrg ? 4.23 : 3.18;
    const nameLh = isOrg ? 5.8 : 4.4;
    const nameW = teamColW - (isOrg ? 6 : 4);
    const nameFont = isOrg ? 'Playfair Display' : 'Inter';
    const nameLines = Math.max(1, wrapTextLines(row.name, nameW, nameSize, nameFont).length);
    drawWrapped({
        svg, x: x + (isOrg ? 4 : 2), y: y + h / 2 + 1 - ((nameLines - 1) * nameLh) / 2,
        maxWidth: nameW,
        content: row.name,
        font: nameFont,
        weight: 500,
        size: nameSize,
        color: isOrg ? SAGE : C.text,
        lineHeight: nameLh,
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
        svg.appendChild(circle(cx, cy, 0.7, C.textMuted, {
            opacity: rowOpacity < 1 ? rowOpacity : 1,
        }));
        svg.appendChild(text({
            x: cx + 2.5, y: cy + 1.1,
            // Label uit getConfidence(), zoals de dashboards (opdracht L4).
            content: row.reliability.label,
            font: 'Inter', weight: 500, size: 3.18, color: C.textSoft,
            opacity: rowOpacity < 1 ? rowOpacity : null,
        }));
    } else if (isOrg) {
        // Fix #6: 'n.v.t.' i.p.v. zachte em-dash
        svg.appendChild(text({
            x: x + teamColW + nColW + relColW / 2, y: y + h / 2 + 1,
            content: copy.heatmap.orgRowReliability,
            font: 'Inter', weight: 500, size: 3.18, color: C.textMuted,
            anchor: 'middle',
        }));
    }

    // Cellen
    const personaX0 = x + teamColW + nColW + relColW;
    row.cells.forEach((c, ci) => {
        const cx = personaX0 + ci * cellW;
        drawCell(svg, {
            x: cx + 1, y: y + 0.8, w: cellW - 2, h: h - 2.4,
            pct: c.pct, color: PERSONA_COLORS[ARCHETYPE_ORDER[ci]],
            isOrg, opacity: rowOpacity, lowReliability,
        });
    });
}

function drawCell(svg, { x, y, w, h, pct, color, isOrg, opacity, lowReliability }) {
    if (pct === null || pct === undefined) return;
    if (pct === 0) {
        svg.appendChild(rect(x, y, w, h, C.cellZero, {
            opacity: opacity != null ? opacity * 0.7 : 0.7,
        }));
        svg.appendChild(text({
            x: x + w / 2, y: y + h / 2 + 1.2,
            content: '—',
            font: 'Inter', weight: 500, size: 3.18, color: C.textMuted,
            anchor: 'middle',
            opacity: opacity != null && opacity < 1 ? opacity : null,
        }));
        return;
    }
    // De celintensiteit volgt EXACT dezelfde schaal als de legenda-voorbeelden:
    // 0% → opacity 0.12 (lichtste swatch), 100% → opacity 1.0 (donkerste swatch).
    // Zo komt een cel van 100% visueel overeen met de "hoog"-swatch in de legenda.
    // C2: bij lage betrouwbaarheid plafonneren we de kleurintensiteit, zodat
    // 100% uit één respondent niet net zo "hard" oogt als 100% uit een robuust
    // team. Het cijfer blijft staan; de footnote legt de demping uit.
    const rawOp = 0.12 + Math.min(1, Math.max(0, pct / 100)) * 0.88;
    const op = lowReliability ? Math.min(rawOp, 0.30) : rawOp;
    svg.appendChild(rect(x, y, w, h, color, {
        opacity: opacity != null ? op * opacity : op,
    }));
    const labelColor = (!lowReliability && pct >= 55) ? '#fff'
        : (lowReliability ? C.textMuted : C.text);
    svg.appendChild(text({
        x: x + w / 2, y: y + h / 2 + 1.2,
        content: `${pct}`,
        font: 'Inter', weight: isOrg ? 700 : 600, size: 3.18,
        color: labelColor, anchor: 'middle',
        opacity: opacity != null && opacity < 1 ? opacity : null,
    }));
}

// Voetnootregels — alleen relevante regels, onder→boven gestapeld.
function buildFootnoteLines(data, copy) {
    const lines = [`${copy.heatmap.roundingNote} · ${copy.heatmap.reliabilityHelp}`];
    return lines;
}

// Visuele bovenkant van het footnote-blok bij `noteLines` regels — de tabel-band
// stopt hierboven zodat tabel en voetnoten elkaar nooit raken.
function footnoteBlockTop(noteLines) {
    const topBaseline = FN_BOTTOM_BASELINE - (noteLines - 1) * FN_LINE_H;
    return topBaseline - FN_SIZE;
}

function drawHeatmapFootnote(svg, data, copy) {
    // Geen ≥/≤ in de strings — de gebundelde font-subsets missen die glyphs.
    // NIET italic: er is geen Inter-italic geregistreerd (zou terugvallen op een
    // WinAnsi-standaardfont). Onderaan verankerd op FN_BOTTOM_BASELINE; regels
    // stapelen van onder naar boven.
    const lines = buildFootnoteLines(data, copy);
    lines.forEach((content, i) => {
        svg.appendChild(text({
            x: MARGIN, y: FN_BOTTOM_BASELINE - i * FN_LINE_H,
            content,
            font: 'Inter', weight: 400, size: FN_SIZE, color: C.textMuted,
            letterSpacing: 0,
        }));
    });
}
