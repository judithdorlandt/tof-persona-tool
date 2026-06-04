/**
 * OL_Patronen.jsx — Pagina 4: Patronen organisatiebreed.
 *
 * V9-fixes:
 *  #1: Typo 'resevering' → 'reservering' via sanitizeUserText in aggregation.
 *  #2: Hoofdletter-consistentie via sanitizeUserText (eerste letter altijd kap).
 *  #3: Bullets — gevulde dot (hard data) vs open dot (kwalitatief), niet vierkanten.
 *  #4: Bars op échte 0–100% schaal (lengte = pct van availW, niet relatief).
 *  #5: 'Wat werkt goed' kolom smaller (25% vs middenkolom 45%), bars krijgt meer ruimte.
 *  #6: Methodologische noot in eigen kader met eyebrow-label + hairline-rand.
 */

import { PAGE_W, PAGE_H, MARGIN, USABLE_W } from './constants';
import { TYPE_V9, COLOR_FAMILIES, SPACING, RHYTHM } from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, line, circle,
} from './svgPrimitives';
import { drawPageHeader, drawPageFooter, CONTENT_TOP } from './OL_Chrome';

const C = COLOR_FAMILIES.neutral;

export function buildPatronenSVG({ data, copy }) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    // V14: pageTitle weg — herhaalt 'Patronen in de organisatie' titel.
    let y = drawPageHeader(svg, { date: data.date, pageTitle: null });
    y = drawTitleBlock(svg, y, copy);
    y += SPACING.lg;
    drawThreeColumns(svg, y, data, copy);
    drawMethodNoteFramed(svg, copy);
    drawPageFooter(svg, { pageNum: 4 });
    return svg;
}

function drawTitleBlock(svg, y, copy) {
    // V14: Playfair Regular 28pt — matcht web-app heading.
    const titleSize = TYPE_V9.h2.size;
    const titleBaseline = y + titleSize;
    svg.appendChild(text({
        x: MARGIN, y: titleBaseline,
        content: copy.patronen.title,
        ...TYPE_V9.h2,
    }));
    const subBaseline = titleBaseline + 4 + TYPE_V9.bodySoft.size;
    svg.appendChild(text({
        x: MARGIN, y: subBaseline,
        content: copy.patronen.subtitle,
        ...TYPE_V9.bodySoft,
    }));
    return subBaseline;
}

// V13: 2-koloms layout. Links (40%) bevat 3 secties stacked:
// leegloopt → kwalitatieve signalen → werkt goed. Rechts (55%) de staafgrafiek.
function drawThreeColumns(svg, y, data, copy) {
    const gap = SPACING.lg;
    const leftRatio = 0.40;
    const rightRatio = 0.55;
    const leftW = USABLE_W * leftRatio;
    const rightW = USABLE_W * rightRatio;
    const rightX = MARGIN + USABLE_W - rightW;

    // Linker kolom: drie secties stacked, elk met eigen ly-cursor.
    drawLeftStack({
        svg, x: MARGIN, y, w: leftW,
        leeglopers: data.leeglopers,
        observations: data.leegloperObservations,
        werktGoed: data.werktGoedObservations,
        copy,
    });

    // Rechter kolom: staafgrafiek werkomgeving
    drawWerkomgevingColumn({
        svg, x: rightX, y, w: rightW,
        needs: data.workplaceNeeds,
        spread: data.workplaceSpread,
        copy,
    });
}

function drawLeftStack({ svg, x, y, w, leeglopers, observations, werktGoed, copy }) {
    // V14: vergrendel "Wat werkt goed" boven de methodologische noot.
    // B3-fix: hoogte schaalt mee met het aantal punten, zodat álle observaties
    // zichtbaar zijn (voorheen vielen punt 5–6 onder de pagina weg).
    const methodNoteTop = PAGE_H - MARGIN - 16 - 6;       // = methodNoteBoxY
    const werktGoedCount = (werktGoed && werktGoed.length) || 1;
    const werktGoedHeaderH = 13;                          // eyebrow + subtitel
    const werktGoedItemH = 5.6;                           // compacte regel + gap
    const werktGoedH = Math.max(35, werktGoedHeaderH + werktGoedCount * werktGoedItemH);
    const werktGoedY = methodNoteTop - SPACING.md - werktGoedH;

    let ly = y;
    // 1. WAAR DE ORGANISATIE OP LEEGLOOPT
    ly = drawSectionWithBullets({
        svg, x, y: ly, w,
        eyebrow: copy.patronen.cols.leegloopt.title.toUpperCase(),
        subtitle: copy.patronen.cols.leegloopt.subtitle,
        items: leeglopers,
        bulletStyle: 'filled-rose',
    });
    ly += SPACING.lg;

    // 2. KWALITATIEVE SIGNALEN — beperk hoogte zodat 't werkt-goed niet duwt
    if (observations.length > 0) {
        const maxObsItems = Math.max(2, Math.floor((werktGoedY - ly - 14) / 7));
        const obsToShow = observations.slice(0, maxObsItems);
        ly = drawSectionWithBullets({
            svg, x, y: ly, w,
            eyebrow: copy.patronen.signalsBlock.eyebrow,
            subtitle: copy.patronen.signalsBlock.source,
            items: obsToShow,
            bulletStyle: 'open-ring',
        });
    }

    // 3. WAT WERKT GOED — vaste Y boven methodologische noot, álle punten zichtbaar
    drawSectionWithBullets({
        svg, x, y: werktGoedY, w,
        eyebrow: copy.patronen.cols.werkt.title.toUpperCase(),
        subtitle: copy.patronen.cols.werkt.subtitle,
        items: werktGoed.length > 0 ? werktGoed : null,
        emptyText: copy.patronen.cols.werkt.empty,
        bulletStyle: 'filled-sage',
        compact: true,
    });
}

function drawSectionWithBullets({
    svg, x, y, w, eyebrow, subtitle, items, emptyText, bulletStyle, compact = false,
}) {
    const SAGE = COLOR_FAMILIES.accent.rust;
    const ROSE = COLOR_FAMILIES.accent.frictie;
    const itemLineHeight = compact ? 4.6 : 5.4;
    const itemGap = compact ? SPACING.xs : SPACING.sm;

    svg.appendChild(text({
        x, y, content: eyebrow,
        ...TYPE_V9.eyebrow,
    }));
    let ly = y + SPACING.md;
    svg.appendChild(text({
        x, y: ly,
        content: subtitle,
        ...TYPE_V9.bodySoft, size: 3, lineHeight: 4.2,
    }));
    ly += SPACING.md + 3;

    if (!items || items.length === 0) {
        svg.appendChild(text({
            x, y: ly,
            content: emptyText || '—',
            ...TYPE_V9.bodySoft, italic: true,
        }));
        return ly + SPACING.md;
    }

    items.forEach((tekst) => {
        // Bullet op de baseline van de tekst.
        if (bulletStyle === 'filled-rose') {
            svg.appendChild(circle(x + 1.3, ly - 2.4, 1.3, ROSE));
        } else if (bulletStyle === 'filled-sage') {
            svg.appendChild(circle(x + 1.3, ly - 2.4, 1.3, SAGE));
        } else if (bulletStyle === 'open-ring') {
            const ring = circle(x + 1.3, ly - 2.4, 1.3, '#FFFFFF');
            ring.setAttribute('stroke', SAGE);
            ring.setAttribute('stroke-width', 0.45);
            svg.appendChild(ring);
        }
        const endY = drawWrapped({
            svg, x: x + 6, y: ly,
            maxWidth: w - 7,
            content: capitalizeFirst(tekst),
            ...TYPE_V9.body,
            lineHeight: itemLineHeight,
        });
        ly = endY + itemGap;
    });
    return ly;
}

// LEGACY: vervangen door drawLeftStack — niet meer aangeroepen.
// eslint-disable-next-line no-unused-vars
function _unused_drawLeegloperColumn({ svg, x, y, w, leeglopers, observations, copy }) {
    svg.appendChild(text({
        x, y, content: copy.patronen.cols.leegloopt.title.toUpperCase(),
        ...TYPE_V9.eyebrow,
    }));
    svg.appendChild(text({
        x, y: y + SPACING.sm + 2,
        content: copy.patronen.cols.leegloopt.subtitle,
        ...TYPE_V9.bodySoft,
        size: 3, lineHeight: 4.2,
    }));

    let ly = y + SPACING.md + 7;
    leeglopers.forEach((tekst) => {
        // Fix #3: gevulde dot ● voor harde data
        svg.appendChild(circle(x + 1.5, ly - 2.4, 1.3, COLOR_FAMILIES.accent.frictie));
        const endY = drawWrapped({
            svg, x: x + 6, y: ly,
            maxWidth: w - 7,
            content: capitalizeFirst(tekst),
            ...TYPE_V9.body,
            size: 3.7, lineHeight: 5.2,
        });
        ly = endY + SPACING.sm;
    });

    if (observations.length > 0) {
        ly += SPACING.sm;
        svg.appendChild(line(x, ly, x + w, ly, C.border, 0.3));
        ly += SPACING.sm + 2;
        svg.appendChild(text({
            x, y: ly,
            content: copy.patronen.signalsBlock.eyebrow,
            ...TYPE_V9.eyebrow,
        }));
        ly += SPACING.sm + 2;
        svg.appendChild(text({
            x, y: ly,
            content: copy.patronen.signalsBlock.source,
            ...TYPE_V9.footer,
            italic: true,
        }));
        ly += SPACING.md;
        observations.forEach((tekst) => {
            // Fix #3: open dot ○ voor kwalitatief — niet outline-vierkant (lijkt op checkbox)
            svg.appendChild(circle(x + 1.5, ly - 2.4, 1.3, 'none', {
                opacity: 1,
            }));
            const ring = circle(x + 1.5, ly - 2.4, 1.3, C.surface);
            ring.setAttribute('stroke', COLOR_FAMILIES.accent.rust);
            ring.setAttribute('stroke-width', 0.5);
            svg.appendChild(ring);
            const endY = drawWrapped({
                svg, x: x + 6, y: ly,
                maxWidth: w - 7,
                content: capitalizeFirst(tekst),
                ...TYPE_V9.body,
                size: 3.7, lineHeight: 5.2,
            });
            ly = endY + SPACING.sm;
        });
    }
}

// ── KOLOM 2: Werkomgeving — herontworpen staafgrafiek (v12 kritieke fix).
// Layout per rij:
//   [Label, links]                                     [Percentage, rechts]
//   [Staaf, volle breedte, sage-gevuld, 8pt hoog]
//   [12pt witruimte vóór volgende rij]
// Onder alle rijen: 0—50—100 x-as in textMuted, 0.5pt lijn.
function drawWerkomgevingColumn({ svg, x, y, w, needs, spread, copy }) {
    const SAGE = COLOR_FAMILIES.accent.rust;
    const PT = 0.353;
    const barH = 8 * PT;                       // 8pt = 2.82mm
    const gapLabelToBar = 4 * PT;              // 4pt onder label-baseline
    const gapBarToNext = 12 * PT;              // 12pt witruimte
    const labelSize = 3.7;
    const rowAdvance = labelSize + gapLabelToBar + barH + gapBarToNext;

    svg.appendChild(text({
        x, y, content: copy.patronen.cols.vraagt.title.toUpperCase(),
        ...TYPE_V9.eyebrow,
    }));
    svg.appendChild(text({
        x, y: y + SPACING.sm + 2,
        content: copy.patronen.cols.vraagt.subtitle,
        ...TYPE_V9.bodySoft, size: 3, lineHeight: 4.2,
    }));

    let ly = y + SPACING.md + 7;

    needs.forEach((it) => {
        // Regel 1: label + percentage op één baseline
        svg.appendChild(text({
            x, y: ly,
            content: capitalizeFirst(it.label),
            font: 'Inter', weight: 500, size: labelSize, color: C.text,
        }));
        svg.appendChild(text({
            x: x + w, y: ly,
            content: `${it.pct}%`,
            font: 'Inter', weight: 600, size: labelSize, color: C.textSoft,
            anchor: 'end',
        }));

        // Regel 2: staaf, volledige kolombreedte, 8pt hoog, sage
        const barY = ly + gapLabelToBar;
        svg.appendChild(rect(x, barY, w, barH, C.border));
        if (it.pct > 0) {
            svg.appendChild(rect(x, barY, w * (it.pct / 100), barH, SAGE));
        }
        ly += rowAdvance;
    });

    // ── X-as: 0—50—100 onder alle staven
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
    // V14: schaal-label gecentreerd onder x-as i.p.v. rechts-aligned.
    svg.appendChild(text({
        x: x + w / 2, y: axisY + 9,
        content: copy.patronen.cols.vraagt.scaleLabel,
        font: 'Inter', weight: 400, size: 2.6, color: C.textMuted,
        italic: false, anchor: 'middle',
    }));

    // C1: als de top-5 dicht bij elkaar ligt, lees het als brede behoefte —
    // geen "winnaar". Eerlijk benoemen i.p.v. één type uitvergroten.
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

// LEGACY: vervangen door drawLeftStack — niet meer aangeroepen.
// eslint-disable-next-line no-unused-vars
function _unused_drawWerktGoedColumn({ svg, x, y, w, items, copy }) {
    svg.appendChild(text({
        x, y, content: copy.patronen.cols.werkt.title.toUpperCase(),
        ...TYPE_V9.eyebrow,
    }));
    svg.appendChild(text({
        x, y: y + SPACING.sm + 2,
        content: copy.patronen.cols.werkt.subtitle,
        ...TYPE_V9.bodySoft, size: 3, lineHeight: 4.2,
    }));

    if (items.length === 0) {
        svg.appendChild(text({
            x, y: y + SPACING.md + 7,
            content: copy.patronen.cols.werkt.empty,
            ...TYPE_V9.bodySoft,
        }));
        return;
    }

    let ly = y + SPACING.md + 7;
    items.forEach((tekst) => {
        // Fix #3: gevulde sage-dot voor positief hard signaal
        svg.appendChild(circle(x + 1.5, ly - 2.4, 1.3, COLOR_FAMILIES.accent.rust));
        const endY = drawWrapped({
            svg, x: x + 6, y: ly,
            maxWidth: w - 7,
            content: capitalizeFirst(tekst),
            ...TYPE_V9.body,
            size: 3.7, lineHeight: 5.2,
        });
        ly = endY + SPACING.sm;
    });
}

// Fix #6: methodologische noot in eigen kader
function drawMethodNoteFramed(svg, copy) {
    const boxH = 18;
    const boxY = PAGE_H - MARGIN - boxH - 6;
    svg.appendChild(rect(MARGIN, boxY, USABLE_W, boxH, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1,
    }));
    // Sage border-top (spec: "lichte sage border-top")
    svg.appendChild(rect(MARGIN, boxY, USABLE_W, 0.7, COLOR_FAMILIES.accent.rust));

    svg.appendChild(text({
        x: MARGIN + SPACING.md, y: boxY + SPACING.sm + 2,
        content: copy.patronen.methodNoteEyebrow,
        ...TYPE_V9.eyebrow,
        color: COLOR_FAMILIES.accent.rust,
    }));
    drawWrapped({
        svg, x: MARGIN + SPACING.md, y: boxY + SPACING.md + 4,
        maxWidth: USABLE_W - SPACING.md * 2,
        content: copy.patronen.methodNote,
        font: 'Inter', weight: 400, size: 3.18, color: C.textSoft,
        lineHeight: 4.6,
        italic: false,
        maxLines: 2,
    });
}

function capitalizeFirst(s) {
    if (!s) return '';
    return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}
