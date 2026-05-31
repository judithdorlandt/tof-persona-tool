/**
 * OL_Duiding.jsx — Pagina 5: Duiding & richting.
 *
 * V9-fixes:
 *  #1 ERNSTIG: Twee regels per item in 'Teams die ruimte verdienen' —
 *      naam op regel 1, "slechts X respondenten" op regel 2 (geen overlap).
 *  #2: Oker accent → neutraal (textMuted). Persona-kleuren zijn identifiers.
 *  #3: Drie kaarten gelijke hoogte (alle gefixeerd op cardH).
 *  #4: Quote-balk in eigen sectie met 40px boven + 24px onder.
 *  #5: Ondertekst onder quote krijgt 18px (md) spacing.
 */

import { PAGE_W, PAGE_H, MARGIN, USABLE_W } from './constants';
import { TYPE_V9, COLOR_FAMILIES, SPACING, RHYTHM } from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, line, circle,
} from './svgPrimitives';
import { drawPageHeader, drawPageFooter, CONTENT_TOP } from './OL_Chrome';
import {
    buildLeadershipDirections,
    buildEnvironmentDirections,
    buildAttentionTeams,
} from './organisatieAggregation';

const C = COLOR_FAMILIES.neutral;

export function buildDuidingSVG({ data, copy }) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    drawPageHeader(svg, { date: data.date, pageTitle: 'Duiding' });
    let y = CONTENT_TOP;
    y = drawTitleBlock(svg, y, copy);
    y += SPACING.lg;
    drawThreeCards(svg, y, data, copy);
    drawClosingZone(svg, data, copy);
    drawPageFooter(svg, { pageNum: 5 });
    return svg;
}

function drawTitleBlock(svg, y, copy) {
    // V14: Playfair Regular 28pt
    const titleSize = TYPE_V9.h2.size;
    const titleBaseline = y + titleSize;
    svg.appendChild(text({
        x: MARGIN, y: titleBaseline,
        content: copy.duiding.title,
        ...TYPE_V9.h2,
    }));
    const subBaseline = titleBaseline + 2.82 + TYPE_V9.bodySoft.size;
    svg.appendChild(text({
        x: MARGIN, y: subBaseline,
        content: copy.duiding.subtitle,
        ...TYPE_V9.bodySoft,
    }));
    return subBaseline;
}

// Fix #3: drie kaarten gelijke hoogte
function drawThreeCards(svg, y, data, copy) {
    const gap = SPACING.lg;
    const cardW = (USABLE_W - 2 * gap) / 3;
    const cardH = 95;        // alle kaarten exact gelijk

    drawCard({
        svg, x: MARGIN, y, w: cardW, h: cardH,
        title: copy.duiding.leadership.title,
        subtitle: copy.duiding.leadership.subtitle,
        items: buildLeadershipDirections(data),
        emptyFallback: copy.duiding.leadership.empty,
        // V14: sage — leiderschap = richting/advies, geen frictie.
        accent: COLOR_FAMILIES.accent.rust,
        bulletColor: COLOR_FAMILIES.accent.rust,
    });

    drawCard({
        svg, x: MARGIN + cardW + gap, y, w: cardW, h: cardH,
        title: copy.duiding.environment.title,
        subtitle: copy.duiding.environment.subtitle,
        items: buildEnvironmentDirections(data),
        emptyFallback: copy.duiding.environment.empty,
        accent: COLOR_FAMILIES.accent.rust,
        bulletColor: COLOR_FAMILIES.accent.rust,
    });

    // Fix #2: neutral accent — geen oker (presteerder-persona-kleur)
    drawAttentionCard({
        svg, x: MARGIN + 2 * (cardW + gap), y, w: cardW, h: cardH,
        title: copy.duiding.attention.title,
        subtitle: copy.duiding.attention.subtitle,
        teams: buildAttentionTeams(data),
        emptyFallback: copy.duiding.attention.empty,
    });
}

function drawCard({ svg, x, y, w, h, title, subtitle, items, emptyFallback, accent, bulletColor }) {
    // V12 consistentie: zelfde stijl als hero-cards op pagina 2.
    // 1pt border, 4pt sage indicator links, géén dikke gekleurde topbalk.
    svg.appendChild(rect(x, y, w, h, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1.2,
    }));
    svg.appendChild(rect(x, y, 1.4, h, COLOR_FAMILIES.accent.rust));

    svg.appendChild(text({
        x: x + SPACING.md, y: y + SPACING.md + 2,
        content: title.toUpperCase(),
        ...TYPE_V9.eyebrow,
        color: accent || C.textMuted,
    }));
    const subtitleY = y + SPACING.md + SPACING.sm + 4;
    svg.appendChild(text({
        x: x + SPACING.md, y: subtitleY,
        content: subtitle,
        ...TYPE_V9.bodySoft,
        size: 3, lineHeight: 4,
    }));

    // Fix: minimaal 8pt (2.12mm) tussen subtitle baseline en eerste bullet.
    // Subtitle font 3mm → bottom van tekst ≈ subtitleY + 0.6. Eerste baseline
    // bullet moet dus op subtitleY + 0.6 + SPACING.sm + caps (~2.6) = +5.3.
    let ly = subtitleY + 6;
    if (items.length === 0) {
        svg.appendChild(text({
            x: x + SPACING.md, y: ly + 4,
            content: emptyFallback,
            ...TYPE_V9.bodySoft,
        }));
        return;
    }
    // V13: vaste tab-stop — alle bullets en tekst-blokken beginnen op
    // dezelfde x-coördinaat, ongeacht eerdere wrap-regels.
    const indicatorW = 1.4;
    const bulletX = x + indicatorW + SPACING.md;
    const textX = bulletX + 5;
    const textW = (x + w) - textX - SPACING.md;

    items.forEach((it) => {
        if (ly > y + h - 6) return;
        svg.appendChild(circle(bulletX + 1.3, ly - 2.4, 1.3, bulletColor || C.text));
        const endY = drawWrapped({
            svg, x: textX, y: ly,
            maxWidth: textW,
            content: it,
            font: 'Inter', weight: 500, size: 3.6, color: C.text,
            lineHeight: 5,
        });
        ly = endY + SPACING.sm;
    });
}

// Fix #1: twee regels per item (naam boven, meta onder) — geen overlap
function drawAttentionCard({ svg, x, y, w, h, title, subtitle, teams, emptyFallback }) {
    // V12 consistentie: zelfde stijl als hero-cards en andere duiding-cards.
    svg.appendChild(rect(x, y, w, h, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1.2,
    }));
    svg.appendChild(rect(x, y, 1.4, h, COLOR_FAMILIES.accent.rust));

    svg.appendChild(text({
        x: x + SPACING.md, y: y + SPACING.md + 2,
        content: title.toUpperCase(),
        ...TYPE_V9.eyebrow,
    }));
    const subtitleY = y + SPACING.md + SPACING.sm + 4;
    svg.appendChild(text({
        x: x + SPACING.md, y: subtitleY,
        content: subtitle,
        ...TYPE_V9.bodySoft, size: 3, lineHeight: 4,
    }));

    let ly = subtitleY + 6;                  // 8pt-spacing tussen subtitle en eerste item
    if (teams.length === 0) {
        svg.appendChild(text({
            x: x + SPACING.md, y: ly + 4,
            content: emptyFallback,
            ...TYPE_V9.bodySoft,
        }));
        return;
    }
    // V14: vaste tab-stop, kleinere font om alle teams te tonen, en
    // duidelijke inter-team-witruimte (>12pt) zodat meta-label
    // visueel bij de juiste naam hoort.
    const indicatorW = 1.4;
    const bulletX = x + indicatorW + SPACING.md;
    const textX = bulletX + 4.5;
    const textW = (x + w) - textX - SPACING.md;
    const nameSize = 3.18;        // 9pt — compact zodat alles past
    const nameLh = 4.2;
    const metaSize = 2.65;
    const interTeamGap = 4.5;     // ~13pt tussen meta-descender en volgende bullet

    // Predictieve check: hoeveel teams passen er fysiek in de kaart?
    // Voorzichtige schatting (1.5 regels per team gemiddeld = 14mm).
    const teamReserveY = y + h - 4;
    let shown = 0;
    let truncated = 0;

    for (const t of teams) {
        // Pre-check: zou deze entry volledig binnen kaart passen?
        if (ly + 14 > teamReserveY) {
            truncated = teams.length - shown;
            break;
        }

        svg.appendChild(circle(bulletX + 1, ly - 2.2, 0.9, C.textMuted));

        const nameEndY = drawWrapped({
            svg, x: textX, y: ly,
            maxWidth: textW,
            content: t.name,
            font: 'Inter', weight: 500, size: nameSize, color: C.text,
            lineHeight: nameLh,
        });
        const metaY = nameEndY - nameLh + nameSize + 0.6;
        svg.appendChild(text({
            x: textX, y: metaY,
            content: t.why,
            font: 'Inter', weight: 400, size: metaSize, color: C.textMuted,
            italic: true,
        }));
        ly = metaY + interTeamGap;
        shown++;
    }

    if (truncated > 0) {
        svg.appendChild(text({
            x: textX, y: teamReserveY,
            content: `+${truncated} meer`,
            font: 'Inter', weight: 400, size: 2.65, color: C.textMuted,
            italic: true,
        }));
    }
}

// Quote in eigen ademzone — V13: 30pt lager t.o.v. v12 voor meer adem
// tussen kaarten en quote.
function drawClosingZone(svg, data, copy) {
    const quoteMargin = 5.3;                          // 20pt minimum
    const footerTop = PAGE_H - MARGIN - 2;            // dichter naar footer
    const subTextH = 4.5;
    const quoteFontSize = 5.8;
    const quoteY = footerTop - subTextH - SPACING.md - quoteMargin;
    // Hairline boven de quote, op ruim 20pt afstand van bovenkant card-rij.
    svg.appendChild(line(
        MARGIN + USABLE_W * 0.3, quoteY - quoteMargin - quoteFontSize,
        PAGE_W - MARGIN - USABLE_W * 0.3, quoteY - quoteMargin - quoteFontSize,
        C.border, 0.3,
    ));
    svg.appendChild(text({
        x: PAGE_W / 2, y: quoteY,
        content: `"${copy.duiding.tagline}"`,
        font: 'Playfair Display', weight: 400, size: quoteFontSize,
        color: C.textSoft, italic: true, anchor: 'middle',
    }));
    svg.appendChild(text({
        x: PAGE_W / 2, y: quoteY + SPACING.md + 2,
        content: data.signatureSentence,
        font: 'Inter', weight: 500, size: 3.4, color: C.textMuted,
        anchor: 'middle',
    }));
}

