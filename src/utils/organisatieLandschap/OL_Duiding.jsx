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
import { TYPE_V9, COLOR_FAMILIES, SPACING } from './OL_styles';
import {
    createCanvas, rect, text, drawWrapped, line, circle, wrapTextLines,
} from './svgPrimitives';
import { drawPageHeader, CONTENT_TOP } from './OL_Chrome';
import {
    buildLeadershipDirections,
    buildEnvironmentDirections,
    buildAttentionTeams,
} from './organisatieAggregation';

const C = COLOR_FAMILIES.neutral;

export function buildDuidingSVG({ data, copy }) {
    const pages = [];

    // ── Pagina 1: titel + drie kaarten.
    const svg1 = createCanvas();
    svg1.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));
    drawPageHeader(svg1, { date: data.date, pageTitle: 'Duiding' });
    let y = CONTENT_TOP;
    y = drawTitleBlock(svg1, y, copy.duiding.title, copy.duiding.subtitle);
    y += SPACING.lg;
    const overflowTeams = drawThreeCards(svg1, y, data, copy);

    if (overflowTeams.length === 0) {
        // Alles past op één pagina — sluit-quote onderaan.
        drawClosingZone(svg1, data, copy);
        pages.push(svg1);
        return pages;
    }

    // Teams pasten niet allemaal in de kaart → vervolgpagina met de rest,
    // gevolgd door de sluit-quote (geen "+N meer"-afkapping meer).
    pages.push(svg1);

    const svg2 = createCanvas();
    svg2.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));
    drawPageHeader(svg2, { date: data.date, pageTitle: 'Duiding' });
    let y2 = CONTENT_TOP;
    y2 = drawTitleBlock(svg2, y2, copy.duiding.attention.title, copy.duiding.continuationSubtitle);
    y2 += SPACING.lg;
    drawAttentionContinuation(svg2, y2, overflowTeams);
    drawClosingZone(svg2, data, copy);
    pages.push(svg2);

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
    let h = 16.35;                           // titel + subtitel tot eerste bullet
    if (!items || items.length === 0) return h + 8;
    items.forEach((it) => {
        const lines = Math.max(1, wrapTextLines(it, textW, 3.6, 'Inter').length);
        h += lines * 5 + SPACING.sm;
    });
    return h + 6;
}

function measureAttentionCardH(teams, w) {
    const textW = w - 14.36;                 // zie drawAttentionCard
    let h = 16.35;
    if (!teams || teams.length === 0) return h + 8;
    teams.forEach((t) => {
        const lines = Math.max(1, wrapTextLines(t.name, textW, 3.18, 'Inter').length);
        h += lines * 4.2 + 7.5;              // naam + meta-regel + inter-team-gap
    });
    return h + 6;
}

// Fix #3: drie kaarten gelijke hoogte — inhoud-gestuurd, begrensd door de
// ruimte boven de sluit-quote. Geeft de teams terug die niet in de
// aandacht-kaart pasten (→ vervolgpagina), i.p.v. "+N meer".
function drawThreeCards(svg, y, data, copy) {
    const gap = SPACING.lg;
    const cardW = (USABLE_W - 2 * gap) / 3;

    const leadership = buildLeadershipDirections(data);
    const environment = buildEnvironmentDirections(data);
    const teams = buildAttentionTeams(data);

    // Gelijke hoogte = de grootste benodigde hoogte, begrensd zodat de kaarten
    // niet de sluit-quote raken (max) en niet onnodig leeg ogen (min).
    const needed = Math.max(
        measureBulletCardH(leadership, cardW),
        measureBulletCardH(environment, cardW),
        measureAttentionCardH(teams, cardW),
    );
    const cardFloor = PAGE_H - MARGIN - 36;           // vloer boven de sluit-quote
    const maxCardH = cardFloor - y;
    const cardH = Math.max(62, Math.min(maxCardH, needed));

    drawCard({
        svg, x: MARGIN, y, w: cardW, h: cardH,
        title: copy.duiding.leadership.title,
        subtitle: copy.duiding.leadership.subtitle,
        items: leadership,
        emptyFallback: copy.duiding.leadership.empty,
        // V14: sage — leiderschap = richting/advies, geen frictie.
        accent: COLOR_FAMILIES.accent.rust,
        bulletColor: COLOR_FAMILIES.accent.rust,
    });

    drawCard({
        svg, x: MARGIN + cardW + gap, y, w: cardW, h: cardH,
        title: copy.duiding.environment.title,
        subtitle: copy.duiding.environment.subtitle,
        items: environment,
        emptyFallback: copy.duiding.environment.empty,
        accent: COLOR_FAMILIES.accent.rust,
        bulletColor: COLOR_FAMILIES.accent.rust,
    });

    // Fix #2: neutral accent — geen oker (presteerder-persona-kleur)
    return drawAttentionCard({
        svg, x: MARGIN + 2 * (cardW + gap), y, w: cardW, h: cardH,
        title: copy.duiding.attention.title,
        subtitle: copy.duiding.attention.subtitle,
        teams,
        emptyFallback: copy.duiding.attention.empty,
        copy,
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

// Fix #1: twee regels per item (naam boven, meta onder) — geen overlap.
// Retour: array met teams die niet in de kaart pasten (→ vervolgpagina).
function drawAttentionCard({ svg, x, y, w, h, title, subtitle, teams, emptyFallback, copy }) {
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
        return [];
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

    // Reserveer onderaan ruimte voor de "zie volgende pagina"-verwijzing wanneer
    // er teams overlopen; zo botst die verwijzing nooit met het laatste team.
    const teamReserveY = y + h - 6;
    let shown = 0;

    for (const t of teams) {
        // Pre-check: zou deze entry volledig binnen kaart passen?
        if (ly + 14 > teamReserveY) break;

        // Optisch gecentreerd op de eerste (naam)regel.
        svg.appendChild(circle(bulletX + 1, ly - nameSize * 0.35, 0.9, C.textMuted));

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

    const overflow = teams.slice(shown);
    if (overflow.length > 0) {
        svg.appendChild(text({
            x: textX, y: y + h - 3,
            content: copy.duiding.attention.moreOnNext(overflow.length),
            font: 'Inter', weight: 500, size: 2.65, color: COLOR_FAMILIES.accent.rust,
            italic: false,
        }));
    }
    return overflow;
}

// Vervolgpagina: de resterende aandacht-teams in maximaal drie kolommen,
// zodat álle teams zichtbaar én leesbaar zijn (geen afkapping).
function drawAttentionContinuation(svg, y, teams) {
    const cols = 3;
    const colGap = SPACING.xl;
    const colW = (USABLE_W - colGap * (cols - 1)) / cols;
    const floor = PAGE_H - MARGIN - 34;          // laat ruimte voor de sluit-quote
    const nameSize = 3.4;
    const nameLh = 4.6;
    const metaSize = 2.8;
    const interTeamGap = 5;

    let col = 0;
    let ly = y;
    for (const t of teams) {
        const nameLines = Math.max(1, wrapTextLines(t.name, colW - 5, nameSize, 'Inter').length);
        const entryH = nameLines * nameLh + metaSize + interTeamGap;
        if (ly + entryH > floor) {
            col += 1;
            ly = y;
            if (col >= cols) break;             // veiligheid: meer dan past
        }
        const cx = MARGIN + col * (colW + colGap);
        svg.appendChild(circle(cx + 1, ly - nameSize * 0.35, 0.9, C.textMuted));
        const nameEndY = drawWrapped({
            svg, x: cx + 5, y: ly,
            maxWidth: colW - 5,
            content: t.name,
            font: 'Inter', weight: 500, size: nameSize, color: C.text,
            lineHeight: nameLh,
        });
        const metaY = nameEndY - nameLh + nameSize + 0.6;
        svg.appendChild(text({
            x: cx + 5, y: metaY,
            content: t.why,
            font: 'Inter', weight: 400, size: metaSize, color: C.textMuted,
            italic: true,
        }));
        ly = metaY + interTeamGap;
    }
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

