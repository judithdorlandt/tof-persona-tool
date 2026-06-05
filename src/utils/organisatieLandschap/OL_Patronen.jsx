/**
 * OL_Patronen.jsx — Pagina 4 (kwantitatief) + Pagina 5 (kwalitatief).
 *
 * V24-herstructurering:
 *  Pagina 4 — Patronen (gemeten):
 *    LINKS  = staafgrafiek "Wat de werkomgeving vraagt" (% direct na de staaf,
 *             eerlijke 0–100 as behouden).
 *    RECHTS = "Waar de organisatie op leegloopt" — rode bullets (data).
 *    Onder  = korte methodologische noot (alleen kwantitatieve herkomst).
 *
 *  Pagina 5 — Kwalitatief beeld (observatie & gesprek):
 *    LINKS  = "Wat werkt goed" — groene bullets (positief).
 *    RECHTS = "Kwalitatieve signalen" — rode bullets (aandacht).
 *    Onder  = voorbehoud: signalen duiden, ze bewijzen niet.
 *
 * Bullet-systeem (organisatiebreed): groen gevuld = positief, rood gevuld =
 * aandacht. Geen open/witte ringen meer. Bullets optisch gecentreerd op de
 * eerste regel.
 */

import { PAGE_W, PAGE_H, MARGIN, USABLE_W } from './constants';
import { TYPE_V9, COLOR_FAMILIES, SPACING } from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, line, circle, wrapTextLines,
} from './svgPrimitives';
import { drawPageHeader } from './OL_Chrome';

const C = COLOR_FAMILIES.neutral;
const SAGE = COLOR_FAMILIES.accent.rust;     // groen — positief
const ROSE = COLOR_FAMILIES.accent.frictie;  // rood — aandacht

export function buildPatronenSVG({ data, copy }) {
    return [buildQuantPage(data, copy), buildQualPage(data, copy)];
}

// ── PAGINA 4 — kwantitatief: grafiek (links) + leegloopt (rechts).
function buildQuantPage(data, copy) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    let y = drawPageHeader(svg, { date: data.date, pageTitle: null });
    y = drawTitleBlock(svg, y, copy.patronen.title, copy.patronen.subtitle);
    y += SPACING.lg;

    // Methodologische noot vast onderaan → bepaalt de vloer voor de kolommen.
    const noteBoxTop = drawMethodNoteFramed(svg, copy);
    const floor = noteBoxTop - SPACING.md;

    const gap = SPACING.xl;
    const leftW = USABLE_W * 0.50;            // grafiek
    const rightW = USABLE_W - leftW - gap;     // leegloopt
    const rightX = MARGIN + leftW + gap;

    // LINKS — staafgrafiek werkomgeving.
    drawWerkomgevingColumn({
        svg, x: MARGIN, y, w: leftW, floor,
        needs: data.workplaceNeeds, spread: data.workplaceSpread, copy,
    });

    // RECHTS — waar de organisatie op leegloopt (rode bullets).
    drawBulletList({
        svg, x: rightX, y, w: rightW, floor,
        eyebrow: copy.patronen.cols.leegloopt.title.toUpperCase(),
        subtitle: copy.patronen.cols.leegloopt.subtitle,
        items: data.leeglopers,
        bulletColor: ROSE,
    });

    return svg;
}

// ── PAGINA 5 — kwalitatief: wat werkt goed (links) + signalen (rechts).
function buildQualPage(data, copy) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    let y = drawPageHeader(svg, { date: data.date, pageTitle: null });
    y = drawTitleBlock(svg, y, copy.patronen.qualTitle, copy.patronen.qualSubtitle);
    y += SPACING.lg;

    // Voorbehoud onderaan → bepaalt de vloer voor de kolommen.
    const caveatTop = drawCaveat(svg, copy);
    const floor = caveatTop - SPACING.md;

    const gap = SPACING.xl;
    const colW = (USABLE_W - gap) / 2;
    const rightX = MARGIN + colW + gap;

    const werktItems = (data.werktGoedObservations || []).length > 0
        ? data.werktGoedObservations : null;

    // LINKS — wat werkt goed (groene bullets, positief).
    drawBulletList({
        svg, x: MARGIN, y, w: colW, floor,
        eyebrow: copy.patronen.cols.werkt.title.toUpperCase(),
        subtitle: copy.patronen.cols.werkt.subtitle,
        items: werktItems,
        emptyText: copy.patronen.cols.werkt.empty,
        bulletColor: SAGE,
    });

    // RECHTS — kwalitatieve signalen (rode bullets, aandacht).
    drawBulletList({
        svg, x: rightX, y, w: colW, floor,
        eyebrow: copy.patronen.signalsBlock.eyebrow.toUpperCase(),
        subtitle: copy.patronen.signalsBlock.source,
        items: data.leegloperObservations,
        emptyText: copy.patronen.cols.werkt.empty,
        bulletColor: ROSE,
    });

    return svg;
}

function drawTitleBlock(svg, y, title, subtitle) {
    const titleSize = TYPE_V9.h2.size;
    const titleBaseline = y + titleSize;
    svg.appendChild(text({
        x: MARGIN, y: titleBaseline,
        content: title,
        ...TYPE_V9.h2,
    }));
    const subBaseline = titleBaseline + 4 + TYPE_V9.bodySoft.size;
    svg.appendChild(text({
        x: MARGIN, y: subBaseline,
        content: subtitle,
        ...TYPE_V9.bodySoft,
    }));
    return subBaseline;
}

// ── Bullet-lijst met kop + subtitel. Bullets optisch gecentreerd op de
// eerste regel van elk item. De lijst wordt verticaal verdeeld over de
// beschikbare ruimte (tot `floor`) zodat de pagina niet topzwaar wordt.
function drawBulletList({ svg, x, y, w, floor, eyebrow, subtitle, items, emptyText, bulletColor }) {
    const itemSize = TYPE_V9.body.size;
    const itemLineHeight = 5.2;
    const baseGap = SPACING.md;
    // Afstand van de eyebrow-baseline tot het eerste datapunt (kop + subtitel).
    const headerOffset = SPACING.md * 2 + SPACING.lg;

    const drawHeader = (hy) => {
        svg.appendChild(text({
            x, y: hy, content: eyebrow,
            ...TYPE_V9.eyebrow,
        }));
        svg.appendChild(text({
            x, y: hy + SPACING.md,
            content: subtitle,
            ...TYPE_V9.bodySoft, size: 3, lineHeight: 4.2,
        }));
    };

    if (!items || items.length === 0) {
        drawHeader(y);
        svg.appendChild(text({
            x, y: y + headerOffset,
            content: emptyText || '—',
            ...TYPE_V9.bodySoft, italic: true,
        }));
        return y + headerOffset + SPACING.sm;
    }

    // Voor-meet de itemhoogtes om het blok als geheel te kunnen positioneren.
    const lineCounts = items.map((it) => Math.max(1, wrapTextLines(
        capitalizeFirst(it), w - 7, itemSize, 'Inter').length));
    const naturalTotal = lineCounts.reduce((sum, l) => sum + l * itemLineHeight, 0)
        + baseGap * (items.length - 1);

    // De kop + subtitel + bullets vormen ÉÉN blok dat als geheel optisch
    // gecentreerd naar beneden schuift. Zo blijft de kop dicht tegen de bullets
    // staan i.p.v. losgekoppeld bovenaan de kolom te hangen.
    const blockTotal = headerOffset + naturalTotal;
    const available = floor - y;
    const topPad = available > blockTotal ? (available - blockTotal) * 0.5 : 0;
    const headerY = y + topPad;

    drawHeader(headerY);

    let ly = headerY + headerOffset;
    for (let i = 0; i < items.length; i++) {
        // Optisch gecentreerd op de eerste regel: cap-midden ≈ baseline − size·0.35.
        svg.appendChild(circle(x + 1.3, ly - itemSize * 0.35, 1.3, bulletColor));
        const endY = drawWrapped({
            svg, x: x + 6, y: ly,
            maxWidth: w - 7,
            content: capitalizeFirst(items[i]),
            ...TYPE_V9.body,
            lineHeight: itemLineHeight,
        });
        ly = endY + baseGap;
    }
    return ly - baseGap;
}

// ── Staafgrafiek "Wat de werkomgeving vraagt".
// Eerlijke 0–100 as behouden (verschillen zijn klein), maar het percentage
// staat direct ná de gevulde staaf voor leesbaarheid.
function drawWerkomgevingColumn({ svg, x, y, w, floor, needs, spread, copy }) {
    const PT = 0.353;
    const barH = 9 * PT;
    const gapLabelToBar = 4 * PT;
    const labelSize = 3.7;
    const rowFixed = labelSize + gapLabelToBar + barH;   // label + staaf, zonder gap

    svg.appendChild(text({
        x, y, content: copy.patronen.cols.vraagt.title.toUpperCase(),
        ...TYPE_V9.eyebrow,
    }));
    svg.appendChild(text({
        x, y: y + SPACING.sm + 2,
        content: copy.patronen.cols.vraagt.subtitle,
        ...TYPE_V9.bodySoft, size: 3, lineHeight: 4.2,
    }));

    // Extra ruimte tussen kop/subtitel en de eerste staaf (consistent met de
    // bullet-kolommen) en de staven verticaal verdeeld tot de vloer.
    const firstLabelY = y + SPACING.md * 2 + SPACING.lg;
    const n = needs.length;
    // Ruimte onder de laatste staaf voor as + schaal-label + spread-noot.
    const axisBlockH = 24;
    const targetAxisY = (floor || PAGE_H) - axisBlockH;
    // gap tussen staven zo dat de laatste staaf net boven targetAxisY eindigt.
    const rawGap = n > 1
        ? (targetAxisY - 4 * PT - firstLabelY - n * rowFixed) / (n - 1)
        : 13 * PT;
    const gapBarToNext = Math.max(13 * PT, Math.min(16, rawGap));
    const rowAdvance = rowFixed + gapBarToNext;

    let ly = firstLabelY;

    needs.forEach((it) => {
        // Regel 1: label links.
        svg.appendChild(text({
            x, y: ly,
            content: capitalizeFirst(it.label),
            font: 'Inter', weight: 500, size: labelSize, color: C.text,
        }));

        // Regel 2: volledige 0–100 track + gevulde staaf.
        const barY = ly + gapLabelToBar;
        svg.appendChild(rect(x, barY, w, barH, C.border));
        const fillW = it.pct > 0 ? w * (it.pct / 100) : 0;
        if (fillW > 0) svg.appendChild(rect(x, barY, fillW, barH, SAGE));

        // Percentage direct na de staaf (verticaal gecentreerd op de staaf).
        const pctBaseline = barY + barH / 2 + 1;
        const pctText = `${it.pct}%`;
        const estW = pctText.length * labelSize * 0.55;
        const afterX = x + fillW + 1.6;
        if (afterX + estW <= x + w) {
            // Past rechts van de staaf — buiten, textSoft.
            svg.appendChild(text({
                x: afterX, y: pctBaseline,
                content: pctText,
                font: 'Inter', weight: 600, size: labelSize, color: C.textSoft,
            }));
        } else {
            // Zou over de rand vallen — zet binnen het uiteinde, wit.
            svg.appendChild(text({
                x: x + fillW - 1.6, y: pctBaseline,
                content: pctText,
                font: 'Inter', weight: 600, size: labelSize, color: '#FFFFFF',
                anchor: 'end',
            }));
        }
        ly += rowAdvance;
    });

    // X-as: 0—50—100 onder alle staven (eerlijke schaal).
    const axisY = ly - gapBarToNext + 4 * PT;
    svg.appendChild(line(x, axisY, x + w, axisY, C.textMuted, 0.5));
    ['0', '50', '100'].forEach((t, i) => {
        const tx = x + (i / 2) * w;
        svg.appendChild(line(tx, axisY - 0.8, tx, axisY + 0.8, C.textMuted, 0.5));
        svg.appendChild(text({
            x: tx, y: axisY + 4,
            content: t,
            font: 'Inter', weight: 500, size: 2.6, color: C.textMuted,
            anchor: i === 0 ? 'start' : (i === 2 ? 'end' : 'middle'),
        }));
    });
    svg.appendChild(text({
        x: x + w / 2, y: axisY + 9,
        content: copy.patronen.cols.vraagt.scaleLabel,
        font: 'Inter', weight: 400, size: 2.6, color: C.textMuted,
        anchor: 'middle',
    }));

    if (spread && spread.close) {
        drawWrapped({
            svg, x, y: axisY + 14,
            maxWidth: w,
            content: copy.patronen.cols.vraagt.spreadNote,
            font: 'Inter', weight: 400, size: 2.7, color: C.textMuted,
            lineHeight: 3.8, maxLines: 2,
        });
    }
}

// Methodologische noot (kwantitatief) in eigen kader onderaan pagina 4.
// Retourneert de bovenkant van het kader → vloer voor de kolommen.
function drawMethodNoteFramed(svg, copy) {
    const boxH = 14;
    const boxY = PAGE_H - MARGIN - boxH - 4;
    svg.appendChild(rect(MARGIN, boxY, USABLE_W, boxH, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1,
    }));
    svg.appendChild(rect(MARGIN, boxY, USABLE_W, 0.7, SAGE));

    svg.appendChild(text({
        x: MARGIN + SPACING.md, y: boxY + SPACING.sm + 2,
        content: copy.patronen.methodNoteEyebrow,
        ...TYPE_V9.eyebrow,
        color: SAGE,
    }));
    drawWrapped({
        svg, x: MARGIN + SPACING.md, y: boxY + SPACING.md + 4,
        maxWidth: USABLE_W - SPACING.md * 2,
        content: copy.patronen.methodNote,
        font: 'Inter', weight: 400, size: 3.18, color: C.textSoft,
        lineHeight: 4.6, maxLines: 2,
    });
    return boxY;
}

// Voorbehoud onderaan pagina 5. Retourneert de bovenkant → vloer voor kolommen.
function drawCaveat(svg, copy) {
    const boxH = 12;
    const boxY = PAGE_H - MARGIN - boxH - 4;
    svg.appendChild(rect(MARGIN, boxY, USABLE_W, boxH, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1,
    }));
    svg.appendChild(rect(MARGIN, boxY, USABLE_W, 0.7, ROSE));
    drawWrapped({
        svg, x: MARGIN + SPACING.md, y: boxY + SPACING.md + 1,
        maxWidth: USABLE_W - SPACING.md * 2,
        content: copy.patronen.qualCaveat,
        font: 'Inter', weight: 400, size: 3.18, color: C.textSoft,
        lineHeight: 4.6, maxLines: 2,
    });
    return boxY;
}

function capitalizeFirst(s) {
    if (!s) return '';
    return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}
