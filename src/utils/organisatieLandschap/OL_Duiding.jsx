/**
 * OL_Duiding.jsx — Pagina 5: Duiding & richting.
 *
 * V9-fixes:
 *  'Teams die ruimte verdienen' noemt sinds opdracht L1 (23 okt 2026) alleen
 *      hoeveel teams nog geen eigen beeld hebben: geen namen, geen aantallen.
 *  #2: Oker accent → neutraal (textMuted). Persona-kleuren zijn identifiers.
 *  #3: Drie kaarten gelijke hoogte (alle gefixeerd op cardH).
 *  #4: Quote-balk in eigen sectie met 40px boven + 24px onder.
 *  #5: Ondertekst onder quote krijgt 18px (md) spacing.
 */

import { PAGE_W, PAGE_H, MARGIN, USABLE_W } from './constants';
import { TYPE_V9, COLOR_FAMILIES, SPACING, RHYTHM } from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, line, circle, wrapTextLines,
} from './svgPrimitives';
import { drawPageHeader, CONTENT_TOP } from './OL_Chrome';
import {
    buildLeadershipDirections,
    buildEnvironmentDirections,
    buildAttentionSummary,
} from './organisatieAggregation';

const C = COLOR_FAMILIES.neutral;

export function buildDuidingSVG({ data, copy }) {
    const pages = [];

    // ── Pagina 1: titel + drie kaarten.
    const svg1 = createCanvas();
    svg1.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));
    drawPageHeader(svg1, { date: data.date, pageTitle: copy.duiding.pageTitle, copy });
    let y = CONTENT_TOP;
    y = drawTitleBlock(svg1, y, copy.duiding.title, copy.duiding.subtitle);
    // Eyebrow van de kaarten 14 mm onder de ondertitel (ronde 2, groep 4).
    y += RHYTHM.subToContent - CARD_EYEBROW;
    drawThreeCards(svg1, y, data, copy);
    drawClosingZone(svg1, data, copy);
    pages.push(svg1);
    return pages;
}

function drawTitleBlock(svg, y, title, subtitle) {
    // V14: Playfair Regular 28pt
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

// Inschatting van benodigde kaarthoogte op basis van werkelijke wrap-regels —
// zo schalen de (gelijke) kaarten mee met de inhoud en blijft er onderaan geen
// grote leegte staan. Errt bewust naar iets ruimer (geen afkapping).
function measureBulletCardH(items, w) {
    const textW = w - 14.86;                 // zie drawCard: indicator + paddings + bullet
    let h = CARD_FIRST_LINE;                 // kaarttop tot eerste bullet
    if (!items || items.length === 0) return h + 8;
    items.forEach((it) => {
        const lines = Math.max(1, wrapTextLines(it, textW, 3.6, 'Inter').length);
        h += lines * 5 + SPACING.sm;
    });
    return h + 6;
}

// Fix #3: kaarten van gelijke hoogte — inhoud-gestuurd, begrensd door de
// ruimte boven de sluit-quote. De kaart "Teams zonder eigen rij" staat er
// alleen als er zulke teams zijn (ronde 2); anders worden de andere twee
// kaarten breder.
function drawThreeCards(svg, y, data, copy) {
    const gap = SPACING.lg;
    const attention = buildAttentionSummary(data, copy);
    const cards = [
        {
            title: copy.duiding.leadership.title,
            items: buildLeadershipDirections(data, copy),
            emptyFallback: copy.duiding.leadership.empty,
        },
        {
            title: copy.duiding.environment.title,
            items: buildEnvironmentDirections(data, copy),
            emptyFallback: copy.duiding.environment.empty,
        },
    ];
    if (attention.length > 0) {
        cards.push({
            title: copy.duiding.attention.title,
            items: attention,
            emptyFallback: copy.duiding.attention.empty,
        });
    }
    const cardW = (USABLE_W - (cards.length - 1) * gap) / cards.length;

    // Gelijke hoogte = de grootste benodigde hoogte, begrensd zodat de kaarten
    // niet de sluit-quote raken (max) en niet onnodig leeg ogen (min).
    const needed = Math.max(...cards.map((c) => measureBulletCardH(c.items, cardW)));
    const cardFloor = PAGE_H - MARGIN - 36;           // vloer boven de sluit-quote
    const maxCardH = cardFloor - y;
    // Op de hoogte van de inhoud, minimaal 40 mm (ronde 2, grafisch punt 13).
    const cardH = Math.max(40, Math.min(maxCardH, needed));

    cards.forEach((c, i) => {
        drawCard({
            svg, x: MARGIN + i * (cardW + gap), y, w: cardW, h: cardH,
            ...c,
            accent: COLOR_FAMILIES.accent.rust,
            bulletColor: COLOR_FAMILIES.accent.rust,
        });
    });
}

// Geen cursieve sub-eyebrow meer onder de kaarttitel (ronde 2, groep 4).
const CARD_EYEBROW = SPACING.md + 2;                         // kaarttop → eyebrow
const CARD_FIRST_LINE = CARD_EYEBROW + SPACING.lg + SPACING.sm; // → eerste regel

function drawCard({ svg, x, y, w, h, title, items, emptyFallback, accent, bulletColor }) {
    // V12 consistentie: zelfde stijl als hero-cards op pagina 2.
    // 1pt border, 4pt sage indicator links, géén dikke gekleurde topbalk.
    svg.appendChild(rect(x, y, w, h, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1.2,
    }));
    svg.appendChild(rect(x, y, 1.4, h, COLOR_FAMILIES.accent.rust));

    svg.appendChild(text({
        x: x + SPACING.md, y: y + CARD_EYEBROW,
        content: title.toUpperCase(),
        ...TYPE_V9.eyebrow,
        color: accent || C.textSoft,
    }));

    let ly = y + CARD_FIRST_LINE;
    if (items.length === 0) {
        // Binnen de kaart afbreken: als één regel liep hij over de rand.
        drawWrapped({
            svg, x: x + SPACING.md, y: ly,
            maxWidth: w - SPACING.md * 2 - 1.4,
            content: emptyFallback,
            ...TYPE_V9.bodyQuiet,
        });
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
        // Optisch gecentreerd op de eerste regel: cap-midden ≈ baseline − size·0.35.
        svg.appendChild(circle(bulletX + 1.3, ly - 3.6 * 0.35, 1.3, bulletColor || C.text));
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

// Quote in eigen ademzone — V13: 30pt lager t.o.v. v12 voor meer adem
// tussen kaarten en quote.
function drawClosingZone(svg, data, copy) {
    const quoteMargin = 8;                            // V24: iets hoger — meer adem
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
        // Slotzin van The Office Factory, zonder aanhalingstekens (besluit J4).
        content: copy.duiding.tagline,
        font: 'Playfair Display', weight: 400, size: quoteFontSize,
        color: C.textSoft, italic: true, anchor: 'middle',
    }));
    svg.appendChild(text({
        x: PAGE_W / 2, y: quoteY + SPACING.md + 2,
        content: data.signatureSentence,
        font: 'Inter', weight: 500, size: 3.4, color: C.textSoft,
        anchor: 'middle',
    }));
}

