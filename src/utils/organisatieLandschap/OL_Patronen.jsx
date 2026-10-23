/**
 * OL_Patronen.jsx — Pagina 4 (kwantitatief) + Pagina 5 (kwalitatief).
 *
 * V24-herstructurering:
 *  Pagina 4 — Patronen (gemeten):
 *    LINKS  = "Wat de werkomgeving vraagt": het werkplekprofiel (kern, steun,
 *             beperkt nodig), zoals Teaminzicht — geen percentages (L3).
 *    RECHTS = "Check in het kantoor" — vragen, geen beweringen (L3).
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
import { TYPE_V9, COLOR_FAMILIES, SPACING, RHYTHM } from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, circle,
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

    let y = drawPageHeader(svg, { date: data.date, pageTitle: null, copy });
    y = drawTitleBlock(svg, y, copy.patronen.title, copy.patronen.subtitle);
    // Eerste eyebrow 14 mm onder de ondertitel, links en rechts op dezelfde
    // basislijn (ronde 2, groep 4).
    y += RHYTHM.subToContent;

    // Methodologische noot vast onderaan.
    drawMethodNoteFramed(svg, copy);

    const gap = SPACING.xl;
    const leftW = USABLE_W * 0.50;            // werkplekprofiel
    const rightW = USABLE_W - leftW - gap;     // check in het kantoor
    const rightX = MARGIN + leftW + gap;

    // LINKS — werkplekprofiel van de organisatie.
    drawWerkomgevingColumn({
        svg, x: MARGIN, y, w: leftW, workplace: data.workplace, copy,
    });

    // RECHTS — check in het kantoor (vragen).
    drawBulletList({
        svg, x: rightX, y, w: rightW,
        eyebrow: copy.patronen.cols.officeCheck.title.toUpperCase(),
        items: data.officeCheck,
        bulletColor: ROSE,
    });

    return svg;
}

// ── PAGINA 5 — kwalitatief: wat werkt goed (links) + signalen (rechts).
function buildQualPage(data, copy) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    let y = drawPageHeader(svg, { date: data.date, pageTitle: null, copy });
    y = drawTitleBlock(svg, y, copy.patronen.qualTitle, copy.patronen.qualSubtitle);
    y += RHYTHM.subToContent;

    // Voorbehoud onderaan.
    drawCaveat(svg, copy);

    const gap = SPACING.xl;
    const colW = (USABLE_W - gap) / 2;
    const rightX = MARGIN + colW + gap;

    const werktItems = (data.werktGoedObservations || []).length > 0
        ? data.werktGoedObservations : null;

    // LINKS — wat werkt goed (groene bullets, positief).
    drawBulletList({
        svg, x: MARGIN, y, w: colW,
        eyebrow: copy.patronen.cols.werkt.title.toUpperCase(),
        items: werktItems,
        emptyText: copy.patronen.cols.werkt.empty,
        bulletColor: SAGE,
    });

    // RECHTS — kwalitatieve signalen (rode bullets, aandacht).
    drawBulletList({
        svg, x: rightX, y, w: colW,
        eyebrow: copy.patronen.signalsBlock.eyebrow.toUpperCase(),
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

// ── Bullet-lijst met kop. Bullets optisch gecentreerd op de eerste regel
// van elk item. Geen cursieve sub-eyebrow meer (ronde 2, groep 4: zevende
// tekstmaat, valt in print weg); de lijst staat bovenaan, op de basislijn
// van de kolom ernaast.
const HEADER_OFFSET = SPACING.lg + SPACING.sm;   // eyebrow → eerste regel

function drawBulletList({ svg, x, y, eyebrow, items, emptyText, bulletColor, w }) {
    const itemSize = TYPE_V9.body.size;
    const itemLineHeight = 5.2;
    const baseGap = SPACING.md;
    const headerOffset = HEADER_OFFSET;

    const drawHeader = (hy) => {
        svg.appendChild(text({
            x, y: hy, content: eyebrow,
            ...TYPE_V9.eyebrow,
        }));
    };

    if (!items || items.length === 0) {
        drawHeader(y);
        svg.appendChild(text({
            x, y: y + headerOffset,
            content: emptyText || '—',
            ...TYPE_V9.bodyQuiet,
        }));
        return y + headerOffset + SPACING.sm;
    }

    const headerY = y;
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

// ── "Wat de werkomgeving vraagt": het werkplekprofiel per band, zoals het
// Werkplek-paneel in Teaminzicht. Alleen rangorde en band, geen percentages.
const BANDS = ['kern', 'steun', 'aanvullend'];
const KERN_SIZE = 5.2;
const KERN_LH = 7;
const ROW_LH = 5.4;
const BAND_HEAD = SPACING.sm + 3;

function drawWerkomgevingColumn({ svg, x, y, w, workplace, copy }) {
    // Bovenaan, op dezelfde basislijn als de kolom rechts (grafisch punt 10).
    svg.appendChild(text({
        x, y, content: copy.patronen.cols.vraagt.title.toUpperCase(),
        ...TYPE_V9.eyebrow,
    }));
    let ly = y + HEADER_OFFSET;
    if (!workplace?.hasData) return ly;

    BANDS.forEach((band) => {
        const labels = workplace.bands[band] || [];
        if (labels.length === 0) return;
        svg.appendChild(text({
            x, y: ly,
            content: String(workplace.bandLabels[band]).toUpperCase(),
            ...TYPE_V9.eyebrow,
            color: band === 'kern' ? SAGE : C.textSoft,
        }));
        ly += BAND_HEAD;
        labels.forEach((label) => {
            svg.appendChild(circle(x + 1.3, ly - TYPE_V9.body.size * 0.35, 1.1,
                band === 'kern' ? SAGE : C.textMuted));
            const endY = drawWrapped({
                svg, x: x + 6, y: ly,
                maxWidth: w - 7,
                content: label,
                ...TYPE_V9.body,
                font: band === 'kern' ? 'Playfair Display' : 'Inter',
                size: band === 'kern' ? KERN_SIZE : TYPE_V9.body.size,
                lineHeight: band === 'kern' ? KERN_LH : ROW_LH,
            });
            ly = endY + SPACING.xs + 1;
        });
        ly += SPACING.md;
    });
    return ly;
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
