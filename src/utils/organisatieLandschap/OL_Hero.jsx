/**
 * OL_Hero.jsx — Pagina 2: Kerncijfers in één oogopslag.
 *
 * Layout:
 *   - Lead-zin (Playfair, italic, kort)
 *   - 3 KPI-kaarten naast elkaar: respondenten, dominante werkstijl, grootste werkplekvraag
 *   - Banner onderaan: "Teams zonder respons" (info-bar, geen 4e kaart)
 *
 * Designkeuzes:
 *   - Subtiele 1pt top-border per kaart in border-grijs, géén dikke gekleurde balk.
 *   - Sage als kaart-accent (4pt linker indicator) — uniforme kleur.
 *   - Big-number 36pt Playfair voor visueel zwaartepunt.
 *   - Label klein, uppercase, tracking; textMuted kleur.
 */

import { PAGE_W, PAGE_H, MARGIN, USABLE_W } from './constants';
import { COLOR_FAMILIES, TYPE_V9, SPACING } from './OL_styles';
import { createCanvas, rect, text, drawWrapped } from './svgPrimitives';
import { drawPageHeader, drawPageFooter, CONTENT_TOP } from './OL_Chrome';

const C = COLOR_FAMILIES.neutral;
const SAGE = COLOR_FAMILIES.accent.rust;
const ROSE = COLOR_FAMILIES.accent.frictie;

export function buildHeroSVG({ data, copy }) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    // V13: eyebrow weg ("Kerncijfers" wordt prominente h2).
    let y = drawPageHeader(svg, { date: data.date, pageTitle: null });
    y = drawH2(svg, y, 'Kerncijfers');
    y = drawLead(svg, y, data, copy);
    y += SPACING.lg;
    y = drawThreeKpiCards(svg, y, data, copy);
    y += SPACING.lg;
    drawTeamsBanner(svg, y, data, copy);

    drawPageFooter(svg, { pageNum: 2 });
    return svg;
}

function drawH2(svg, y, title) {
    // V14: Playfair Regular 28pt (matcht web-app heading).
    const size = TYPE_V9.h2.size;
    const baseline = y + size;
    svg.appendChild(text({
        x: MARGIN, y: baseline,
        content: title,
        ...TYPE_V9.h2,
    }));
    // B2-fix: de eyebrow "WAT ZIE JE" wordt op de teruggegeven y getekend en
    // zijn glyphs lopen ~2.8mm omhóóg. De h2-descender zit ~2mm ónder de baseline.
    // Met +2.12 overlapte de eyebrow de titel. Geef een ruime, schone tussenruimte.
    return baseline + 6.5;
}

function drawLead(svg, y, data, copy) {
    svg.appendChild(text({
        x: MARGIN, y,
        content: 'WAT ZIE JE',
        ...TYPE_V9.eyebrow,
    }));
    const leadText = data.totalRespondents > 0 && data.dominantStyle.name !== '—'
        ? copy.cover.leadOneSentence(
            data.organizationName, data.dominantStyle.name, data.totalRespondents,
        )
        : copy.cover.leadFallback;
    // V12: duidende intro, geen quote → Inter regular ~16pt, niet Playfair italic.
    const endY = drawWrapped({
        svg, x: MARGIN, y: y + SPACING.md + 2,
        maxWidth: USABLE_W * 0.82,
        content: leadText,
        font: 'Inter', weight: 400, size: 4.5, color: C.textSoft,
        lineHeight: 6.4,
    });
    return endY;
}

function drawThreeKpiCards(svg, y, data, copy) {
    const gap = SPACING.md;
    const cardW = (USABLE_W - 2 * gap) / 3;
    const cardH = 38;                              // -30% t.o.v. v12

    // Eén accent (sage) voor alle drie. Rose alleen als KPI op spanning duidt.
    drawKpiCard(svg, {
        x: MARGIN, y, w: cardW, h: cardH,
        label: copy.cover.kpiLabels.respondents,
        big: String(data.totalRespondents),
        unit: copy.cover.kpiUnits.respondents(data.totalRespondents),
        accent: SAGE,
    });
    drawKpiCard(svg, {
        x: MARGIN + cardW + gap, y, w: cardW, h: cardH,
        label: copy.cover.kpiLabels.dominantStyle,
        big: data.dominantStyle.name,
        unit: copy.cover.kpiUnits.dominantStyle(data.dominantStyle.count),
        accent: SAGE,
    });
    drawKpiCard(svg, {
        x: MARGIN + 2 * (cardW + gap), y, w: cardW, h: cardH,
        label: copy.cover.kpiLabels.topNeed,
        big: data.topNeed.label,
        unit: copy.cover.kpiUnits.topNeed(data.topNeed.pct),
        accent: SAGE,
    });
    return y + cardH;
}

function drawKpiCard(svg, { x, y, w, h, label, big, unit, accent }) {
    // Subtiele 1pt top-border (border-grijs), géén dikke gekleurde balk.
    svg.appendChild(rect(x, y, w, h, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1.2,
    }));
    // 4pt sage indicator links — verticaal accent zonder zwaar te worden.
    svg.appendChild(rect(x, y, 1.4, h, accent));

    // Label klein, uppercase, tracking — top-padding 16pt (5.65mm).
    const topPad = 5.65;
    svg.appendChild(text({
        x: x + SPACING.md, y: y + topPad,
        content: String(label).toUpperCase(),
        font: 'Inter', weight: 600, size: 2.82, color: C.textMuted,
        letterSpacing: 0.45,
    }));

    // Big-number 36pt Inter Bold (≈12.7mm). Bij overflow: schaal omlaag,
    // bij extreme overflow wrap naar 2 regels.
    const padding = SPACING.md;
    const availW = w - padding * 2;
    const defaultBig = 12.7;
    const bigSize = fitBigNumberSize(big, availW, defaultBig);
    const bigBaseline = y + topPad + SPACING.sm + bigSize;

    if (bigSize >= 7) {
        // Past in 1 regel op gepaste grootte.
        svg.appendChild(text({
            x: x + padding, y: bigBaseline,
            content: big,
            font: 'Playfair Display', weight: 400, size: bigSize, color: C.text,
        }));
    } else {
        // Te krap voor 1 regel — wrap naar 2 regels op grotere size.
        drawWrapped({
            svg, x: x + padding, y: bigBaseline,
            maxWidth: availW,
            content: big,
            font: 'Playfair Display', weight: 400, size: 9, color: C.text,
            lineHeight: 9.5, maxLines: 2,
        });
    }

    // Eenheid direct onder cijfer (4px / xs spacing) — als cijfer wrapt:
    // unit komt onder de wrap (2 regels = ~9.5mm extra ruimte).
    const unitOffsetY = bigSize >= 7 ? 0 : 9.5;
    svg.appendChild(text({
        x: x + padding, y: bigBaseline + unitOffsetY + SPACING.xs + TYPE_V9.bigNumberUnit.size,
        content: unit,
        ...TYPE_V9.bigNumberUnit,
    }));
}

function fitBigNumberSize(content, availW, defaultSize) {
    // Playfair Regular caps zijn breed (vooral S in "Samenwerkplekken").
    const ratio = 0.62;
    const required = String(content).length * defaultSize * ratio;
    if (required <= availW) return defaultSize;
    const minSize = 6;
    const scaled = defaultSize * (availW / required);
    return Math.max(minSize, scaled);
}

// ── Informatieve banner (neutraal, geen 4e kaart).
// V12 fixes: geen rose accent (info ≠ spanning), namen volledig zichtbaar
// (geen ellipsis), banner hoog genoeg voor 2 regels.
function drawTeamsBanner(svg, y, data, copy) {
    const bannerH = 32;                          // hoog genoeg voor 2 regels namen
    const isEmpty = data.inactiveTeamCount === 0;

    // 1pt border, géén kleur-accent — info is neutraal.
    svg.appendChild(rect(MARGIN, y, USABLE_W, bannerH, C.surface, {
        stroke: C.border, strokeWidth: 0.4, rx: 1.2,
    }));

    // Klein info-cirkeltje links bij de eyebrow (◯), in textMuted.
    const eyebrowY = y + SPACING.md;
    const dotX = MARGIN + SPACING.md;
    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', dotX + 1.4);
    ring.setAttribute('cy', eyebrowY - 1.6);
    ring.setAttribute('r', 1.2);
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', C.textMuted);
    ring.setAttribute('stroke-width', 0.35);
    svg.appendChild(ring);

    svg.appendChild(text({
        x: dotX + 5, y: eyebrowY,
        content: copy.cover.teamsWithoutResponses.eyebrow,
        ...TYPE_V9.eyebrow,
        color: C.textMuted,
    }));

    const headline = isEmpty
        ? copy.cover.teamsWithoutResponses.empty
        : copy.cover.teamsWithoutResponses.note(data.inactiveTeamCount);

    // Headline — 2 regels toegestaan (geen ellipsis-afkapping).
    const headlineEndY = drawWrapped({
        svg, x: MARGIN + SPACING.md, y: eyebrowY + 5,
        maxWidth: USABLE_W * 0.95,
        content: headline,
        font: 'Inter', weight: 500, size: 3.6, color: C.text,
        lineHeight: 5, maxLines: 2,
    });

    // Lijst van teams onder de headline — wrap volledig, geen ellipsis.
    if (!isEmpty && data.inactiveTeams.length > 0) {
        drawWrapped({
            svg, x: MARGIN + SPACING.md, y: headlineEndY + 1,
            maxWidth: USABLE_W - SPACING.md * 2,
            content: data.inactiveTeams.join(' · '),
            font: 'Inter', weight: 400, size: 3.2, color: C.textSoft,
            italic: true, lineHeight: 4.6, maxLines: 2,
        });
    }
}
