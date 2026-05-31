/**
 * teamInsightPDF.js
 *
 * Genereert een A3 portrait poster (twee pagina's) van de team-insight als
 * deliverable. Vector-output via SVG → PDF (jsPDF + svg2pdf.js) met
 * embedded fonts.
 *
 * Output: <Team> - teaminzicht TOF.pdf
 */

import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import tofLogo from '../assets/tof-logo.png';
import {
    TOF_COLORS,
    TOF_PERSONA_COLORS,
    setupTofFonts,
} from './tofPdfBrand';

// =========================
// CONSTANTEN — A3 PORTRAIT
// =========================

// A3 portrait in mm
const PAGE_W = 297;
const PAGE_H = 420;

// Marges — proportioneel ruimer dan A5
const MARGIN = 24;

// Brand-kleuren — gedeeld met persona-kaart en team-dynamics PDFs.
// sageSoft is module-specifiek (insight-accent) en blijft lokaal.
const COLOR = {
    ...TOF_COLORS,
    sageSoft: '#C6D9C9',
};

const PERSONA_COLORS = TOF_PERSONA_COLORS;

// =========================
// PUBLIC API
// =========================

export async function generateTeamInsightPDF({
    aggregate,
    insights,
    teamName = 'Team',
    organization = '',
    mode = 'team', // 'team' | 'organization'
}) {
    const svgVoorkant = buildVoorkantSVG({ aggregate, insights, teamName, organization, mode });
    const svgAchterkant = buildAchterkantSVG({ aggregate, insights, teamName, organization, mode });

    document.body.appendChild(svgVoorkant);
    document.body.appendChild(svgAchterkant);

    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a3',
            compress: true,
        });

        // Brand-fonts (Inter + Playfair Display) — matcht persona-kaart PDF
        // en de webapp. Zonder dit valt svg2pdf terug op default fonts.
        setupTofFonts(pdf);

        await svg2pdf(svgVoorkant, pdf, {
            x: 0,
            y: 0,
            width: PAGE_W,
            height: PAGE_H,
        });

        pdf.addPage('a3', 'portrait');
        await svg2pdf(svgAchterkant, pdf, {
            x: 0,
            y: 0,
            width: PAGE_W,
            height: PAGE_H,
        });

        const safeName = (teamName || 'team')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .slice(0, 50);
        const suffix = mode === 'organization' ? 'organisatie-inzicht' : 'teaminzicht';
        const fileName = `${safeName} - ${suffix} TOF.pdf`;
        pdf.save(fileName);
    } finally {
        document.body.removeChild(svgVoorkant);
        document.body.removeChild(svgAchterkant);
    }
}

// =========================
// SVG BUILDER — VOORKANT
// =========================

function buildVoorkantSVG({ aggregate, insights, teamName, organization, mode = 'team' }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawHeader({ svg, y, teamName, organization, aggregate, mode });
    y += 12;
    y = drawHero({ svg, y, aggregate, insights, mode });
    y += 12;
    y = drawDivider({ svg, y });
    y += 10;
    y = drawDistributionAndMix({ svg, y, aggregate, mode });
    y += 10;
    y = drawDivider({ svg, y });
    y += 10;
    y = drawSignature({ svg, y, aggregate, insights, mode });
    y += 10;
    y = drawDivider({ svg, y });
    y += 10;
    drawLeeglopers({ svg, y, insights, mode });

    drawFooterHint({ svg });

    return svg;
}

// =========================
// SVG BUILDER — ACHTERKANT
// =========================

function buildAchterkantSVG({ aggregate, insights, teamName, organization, mode = 'team' }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawAchterkantHeader({ svg, y });
    y += 12;
    y = drawAchterkantTitle({ svg, y, mode });
    y += 10;
    y = drawWorkplaceCompact({ svg, y, aggregate });
    y += 10;
    drawQuickWinsCompact({ svg, y, insights });

    drawAchterkantFooter({ svg, mode });

    return svg;
}

// =========================
// SECTIES — VOORKANT
// =========================

function drawHeader({ svg, y, teamName, organization, aggregate, mode = 'team' }) {
    const pillW = mode === 'organization' ? 110 : 80;
    const pillH = 12;
    const pillY = y;

    const pill = createRect(MARGIN, pillY, pillW, pillH, COLOR.sage);
    pill.setAttribute('rx', '6');
    pill.setAttribute('ry', '6');
    svg.appendChild(pill);

    svg.appendChild(createCircle(MARGIN + 6, pillY + pillH / 2, 1.4, '#FFFFFF'));

    svg.appendChild(createText({
        x: MARGIN + 11,
        y: pillY + pillH / 2 + 2,
        text: mode === 'organization' ? 'ORGANISATIE-INZICHT' : 'TEAMINZICHT',
        font: 'Inter',
        weight: 700,
        size: 5.2,
        color: '#FFFFFF',
        letterSpacing: 0.6,
    }));

    drawTOFMark(svg, PAGE_W - MARGIN - 12, pillY + 2, 10);

    const metaY = pillY + pillH + 16;
    const metaText = `${teamName}${organization ? ' · ' + organization : ''}`;
    svg.appendChild(createText({
        x: MARGIN,
        y: metaY,
        text: metaText,
        font: 'Inter',
        weight: 400,
        size: 6,
        color: COLOR.textMuted,
    }));

    const today = new Date();
    const dateText = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: metaY,
        text: dateText,
        font: 'Inter',
        weight: 400,
        size: 6,
        color: COLOR.textMuted,
        anchor: 'end',
    }));

    return metaY;
}

function drawHero({ svg, y, aggregate, insights, mode = 'team' }) {
    const isOrg = mode === 'organization';
    // Gebruik personasByPrimary (= sortering op aantal mensen primair),
    // niet sortedPersonas (= gewogen energie-sortering). Anders kan de
    // "dominante werkstijl" iets anders aanwijzen dan het hoogste
    // percentage in de verdelingstabel — dat leest als bug.
    const top = aggregate?.personasByPrimary?.[0] || aggregate?.sortedPersonas?.[0];
    if (!top) return y;

    const teamCount = aggregate?.teamCount || 0;
    const personaColor = PERSONA_COLORS[top.id] || COLOR.text;

    const fontSize = 16;
    const lineH = 18;

    const titleY = y + 22;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: isOrg ? 'Dominante werkstijl in de organisatie:' : 'Jouw dominante teamwerkstijl is:',
        font: 'Playfair Display',
        weight: 500,
        size: fontSize,
        color: COLOR.text,
    }));

    const line2Y = titleY + lineH;
    svg.appendChild(createText({
        x: MARGIN,
        y: line2Y,
        text: top.name,
        font: 'Playfair Display',
        weight: 500,
        size: fontSize,
        color: personaColor,
        italic: true,
    }));

    const subY = line2Y + 14;
    const headline = insights?.headline || `${isOrg ? 'De organisatie' : 'Het team'} werkt vanuit ${top.name.toLowerCase()}.`;
    drawWrappedText({
        svg,
        x: MARGIN,
        y: subY,
        maxWidth: PAGE_W - MARGIN * 2,
        text: headline,
        font: 'Inter',
        weight: 400,
        size: 6.4,
        color: COLOR.textSoft,
        lineHeight: 8.8,
    });

    const headlineLines = wrapText(headline, PAGE_W - MARGIN * 2, 6.4, 'Inter');
    const metaY = subY + headlineLines.length * 8.8 + 6;
    const reliability = buildReliabilityLabel(teamCount);
    const metaLine = `${teamCount} respons${teamCount === 1 ? '' : 'en'}${reliability ? ' · ' + reliability : ''}`;
    svg.appendChild(createText({
        x: MARGIN,
        y: metaY,
        text: metaLine,
        font: 'Inter',
        weight: 400,
        size: 5.2,
        color: COLOR.textMuted,
    }));

    return metaY;
}

function drawDistributionAndMix({ svg, y, aggregate, mode = 'team' }) {
    const isOrg = mode === 'organization';
    // Org-mode heeft veel meer namen → kleinere tekst zodat het past.
    const nameFontSize = isOrg ? 4 : 5.2;
    const nameLineH = isOrg ? 5 : 7;
    const totalWidth = PAGE_W - MARGIN * 2;
    const gap = 24;
    const colWidth = (totalWidth - gap) / 2;
    const colLeftX = MARGIN;
    const colRightX = MARGIN + colWidth + gap;

    svg.appendChild(createText({
        x: colLeftX,
        y: y + 6,
        text: 'VERDELING',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    svg.appendChild(createText({
        x: colRightX,
        y: y + 6,
        text: isOrg ? 'ORGANISATIE-MIX' : 'JOUW TEAM-MIX',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const teamCount = aggregate?.teamCount || 0;
    const ARCHETYPE_ORDER = ['maker', 'groeier', 'presteerder', 'denker', 'verbinder', 'teamspeler', 'zekerzoeker', 'vernieuwer'];
    const personasMap = {};
    (aggregate?.sortedPersonas || []).forEach((p) => {
        personasMap[p.id] = p;
    });

    let lineY = y + 16;
    const lineHeight = 12;

    ARCHETYPE_ORDER.forEach((id) => {
        const p = personasMap[id];
        if (!p) return;
        const pct = teamCount > 0 ? Math.round((p.count / teamCount) * 100) : 0;
        const color = PERSONA_COLORS[id];

        svg.appendChild(createText({
            x: colLeftX,
            y: lineY,
            text: p.name,
            font: 'Inter',
            weight: 600,
            size: 5.6,
            color: pct === 0 ? COLOR.textMuted : COLOR.text,
        }));

        svg.appendChild(createText({
            x: colLeftX + colWidth,
            y: lineY,
            text: `${pct}%`,
            font: 'Inter',
            weight: 600,
            size: 5.6,
            color: COLOR.textMuted,
            anchor: 'end',
        }));

        const barY = lineY + 2.4;
        const barH = 2;
        const barTrackW = colWidth;

        svg.appendChild(createRect(colLeftX, barY, barTrackW, barH, '#EADFD4'));
        if (pct > 0) {
            svg.appendChild(createRect(colLeftX, barY, barTrackW * (pct / 100), barH, color));
        }

        lineY += lineHeight;
    });

    // Alle primair-aanwezige archetypes tonen, gesorteerd op aantal
    // mensen primair (= personasByPrimary). Eerder werd sortedPersonas
    // (energie) gebruikt — daardoor stond bv. Denker met 1 persoon
    // boven Groeier met 4 als hun energie hoger lag. Verwarrend.
    const topPresent = aggregate?.personasByPrimary || [];
    const members = aggregate?.members || [];

    // Bij >4 archetypes splitsen we de rechter kolom in twee sub-kolommen,
    // anders loopt de mix-kolom veel verder naar beneden dan de verdeling
    // en krijg je een onevenwichtige pagina ("halve pagina"-effect).
    const useTwoSubCols = topPresent.length > 4;
    const subGap = useTwoSubCols ? 14 : 0;
    const subColWidth = useTwoSubCols ? (colWidth - subGap) / 2 : colWidth;
    const subColRightX = colRightX + subColWidth + subGap;
    const splitIdx = useTwoSubCols
        ? Math.ceil(topPresent.length / 2)
        : topPresent.length;

    let mixY1 = y + 16;
    let mixY2 = y + 16;

    topPresent.forEach((p, idx) => {
        const color = PERSONA_COLORS[p.id];
        const inLeftSubCol = idx < splitIdx;
        const xPos = inLeftSubCol ? colRightX : subColRightX;
        const curY = inLeftSubCol ? mixY1 : mixY2;

        svg.appendChild(createText({
            x: xPos,
            y: curY,
            text: p.name,
            font: 'Playfair Display',
            weight: 500,
            size: 7.2,
            color: color,
        }));

        // Echte namen apart van anoniemen tellen. Anders zou dedup
        // meerdere "Anoniem"-respondenten samenvouwen tot één label.
        const membersForArchetype = members.filter((m) => m.primary === p.id);
        const realNames = membersForArchetype
            .filter((m) => !m.isAnonymous)
            .map((m) => firstName(m.name))
            .filter((n) => n && n !== 'Onbekend')
            .filter((n, i, arr) => arr.indexOf(n) === i);
        const anonymousCount = membersForArchetype.filter((m) => m.isAnonymous).length;

        const nameParts = [...realNames];
        if (anonymousCount === 1) nameParts.push('Anoniem');
        else if (anonymousCount > 1) nameParts.push(`${anonymousCount} anoniem`);

        const namesText = formatNamesNatural(nameParts);

        let advance;
        if (namesText) {
            const namesLines = wrapText(namesText, subColWidth, nameFontSize, 'Inter');
            namesLines.forEach((line, i) => {
                svg.appendChild(createText({
                    x: xPos,
                    y: curY + 8 + i * nameLineH,
                    text: line,
                    font: 'Inter',
                    weight: 400,
                    size: nameFontSize,
                    color: COLOR.textSoft,
                }));
            });
            advance = 8 + namesLines.length * nameLineH + 6;
        } else {
            advance = 16;
        }

        if (inLeftSubCol) mixY1 += advance;
        else mixY2 += advance;
    });

    return Math.max(lineY, mixY1, mixY2);
}

function drawSignature({ svg, y, aggregate, insights, mode = 'team' }) {
    const isOrg = mode === 'organization';
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: isOrg ? 'WAT DEZE ORGANISATIE IN BEWEGING BRENGT' : 'WAT DIT TEAM IN BEWEGING BRENGT',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const signatureSentence = buildSignatureSentence(aggregate, mode);

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 18,
        text: signatureSentence,
        font: 'Playfair Display',
        weight: 500,
        size: 8,
        color: COLOR.text,
        italic: true,
    }));

    return y + 18 + 12;
}

function buildSignatureSentence(aggregate, mode = 'team') {
    // Volg dezelfde sortering als hero en mix: aantal mensen primair,
    // niet gewogen energie. Zo blijft het hele PDF-verhaal coherent.
    const top = aggregate?.personasByPrimary || [];
    const isOrg = mode === 'organization';
    const subject = isOrg ? 'deze organisatie' : 'dit team';
    const subjectShort = isOrg ? 'Een organisatie' : 'Een team';

    const PERSONA_DRIVE = {
        maker: 'maken',
        groeier: 'ontwikkeling',
        presteerder: 'resultaat',
        denker: 'diepgang',
        verbinder: 'verbinding',
        teamspeler: 'verbondenheid',
        zekerzoeker: 'stabiliteit',
        vernieuwer: 'vernieuwing',
    };

    if (top.length === 0) return `${subjectShort} in beweging.`;

    if (top.length === 1) {
        const drive = PERSONA_DRIVE[top[0].id] || top[0].name.toLowerCase();
        return `${capitalize(drive)} — daar bouwt ${subject} op.`;
    }

    const drive1 = PERSONA_DRIVE[top[0].id] || top[0].name.toLowerCase();
    const drive2 = PERSONA_DRIVE[top[1].id] || top[1].name.toLowerCase();
    return `${capitalize(drive1)} en ${drive2} — daar bouwt ${subject} op.`;
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function drawLeeglopers({ svg, y, insights, mode = 'team' }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: mode === 'organization' ? 'WAAR DE ORGANISATIE OP LEEGLOOPT' : 'WAAR HET TEAM OP LEEGLOOPT',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const leeglopers = buildLeeglopers(insights, mode);

    let lineY = y + 18;
    leeglopers.forEach((tekst) => {
        svg.appendChild(createCircle(MARGIN + 2, lineY - 2, 1, COLOR.rose));

        svg.appendChild(createText({
            x: MARGIN + 8,
            y: lineY,
            text: tekst,
            font: 'Inter',
            weight: 400,
            size: 6,
            color: COLOR.text,
        }));

        lineY += 11;
    });
}

function drawFooterHint({ svg }) {
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: PAGE_H - 12,
        text: 'ZIE ACHTERKANT',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
        anchor: 'end',
    }));
}

// =========================
// SECTIES — ACHTERKANT
// =========================

function drawAchterkantHeader({ svg, y }) {
    const pillW = 120;
    const pillH = 12;

    const pill = createRect(MARGIN, y, pillW, pillH, COLOR.sage);
    pill.setAttribute('rx', '6');
    pill.setAttribute('ry', '6');
    svg.appendChild(pill);

    svg.appendChild(createCircle(MARGIN + 6, y + pillH / 2, 1.4, '#FFFFFF'));

    svg.appendChild(createText({
        x: MARGIN + 11,
        y: y + pillH / 2 + 2,
        text: 'JOUW IDEALE WERKPLEKMIX',
        font: 'Inter',
        weight: 700,
        size: 5.2,
        color: '#FFFFFF',
        letterSpacing: 0.6,
    }));

    drawTOFMark(svg, PAGE_W - MARGIN - 12, y + 2, 10);

    return y + pillH;
}

function drawAchterkantTitle({ svg, y, mode = 'team' }) {
    const titleY = y + 16;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: mode === 'organization'
            ? 'Wat deze organisatie vraagt van de werkomgeving'
            : 'Wat dit team vraagt van de werkomgeving',
        font: 'Playfair Display',
        weight: 500,
        size: 12,
        color: COLOR.text,
    }));
    return titleY;
}

function drawWorkplaceCompact({ svg, y, aggregate }) {
    const items = (aggregate?.sortedWorkplaceNeeds || []).slice();
    if (items.length === 0) return y;

    const total = items.reduce((sum, item) => sum + Number(item.value || item.count || 0), 0);
    const enriched = items.map((item) => {
        const value = Number(item.value || item.count || 0);
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
        return { ...item, percentage };
    });

    const averagePct = enriched.length > 0 ? 100 / enriched.length : 0;

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 8,
        text: 'WERKPLEKBEHOEFTE',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const totalWidth = PAGE_W - MARGIN * 2;
    const gap = 16;
    const colWidth = (totalWidth - gap) / 2;
    const colLeftX = MARGIN;
    const colRightX = MARGIN + colWidth + gap;

    const lineHeight = 12;
    const startY = y + 20;

    const halfPoint = Math.ceil(enriched.length / 2);
    const leftItems = enriched.slice(0, halfPoint);
    const rightItems = enriched.slice(halfPoint);

    function drawColumn(items, x, w) {
        let lineY = startY;
        items.forEach((item) => {
            const isAbove = item.percentage >= averagePct;
            const accent = isAbove ? COLOR.sage : COLOR.rose;

            svg.appendChild(createText({
                x: x,
                y: lineY,
                text: item.label,
                font: 'Inter',
                weight: 500,
                size: 5.6,
                color: COLOR.text,
            }));

            svg.appendChild(createText({
                x: x + w,
                y: lineY,
                text: `${item.percentage}%`,
                font: 'Inter',
                weight: 600,
                size: 5.6,
                color: COLOR.textMuted,
                anchor: 'end',
            }));

            const barY = lineY + 2.6;
            const barH = 1.4;

            svg.appendChild(createRect(x, barY, w, barH, '#EADFD4'));
            if (item.percentage > 0) {
                svg.appendChild(createRect(x, barY, w * (item.percentage / 100), barH, accent));
            }

            lineY += lineHeight;
        });
        return lineY;
    }

    const leftEnd = drawColumn(leftItems, colLeftX, colWidth);
    const rightEnd = drawColumn(rightItems, colRightX, colWidth);

    return Math.max(leftEnd, rightEnd);
}

function drawQuickWinsCompact({ svg, y, insights }) {
    const wins = insights?.quickWins || [];
    if (wins.length === 0) return y;

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 8,
        text: `${wins.length === 1 ? 'EÉN ACTIE' : wins.length + ' ACTIES'} VOOR MORGEN`,
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const SOURCE_LABELS = {
        werkstijlen: 'UIT WERKSTIJLEN',
        werkplek: 'UIT WERKPLEK',
        spanning: 'UIT SPANNING',
        minderheid: 'UIT MINDERHEID',
        ontbrekend: 'UIT ONTBREKEND',
        reflectie: 'REFLECTIE',
    };

    let lineY = y + 20;
    const numberColW = 16;
    const usableW = PAGE_W - MARGIN * 2 - numberColW;

    wins.forEach((win, index) => {
        const item = typeof win === 'string'
            ? { source: 'reflectie', action: win }
            : win;
        const label = SOURCE_LABELS[item.source] || 'REFLECTIE';

        svg.appendChild(createText({
            x: MARGIN,
            y: lineY + 1,
            text: String(index + 1).padStart(2, '0'),
            font: 'Playfair Display',
            weight: 500,
            size: 8,
            color: COLOR.sage,
        }));

        svg.appendChild(createText({
            x: MARGIN + numberColW,
            y: lineY,
            text: label,
            font: 'Inter',
            weight: 700,
            size: 4.4,
            color: COLOR.sage,
            letterSpacing: 0.8,
        }));

        const actionLines = wrapText(item.action, usableW, 5.6, 'Inter');
        actionLines.forEach((line, i) => {
            svg.appendChild(createText({
                x: MARGIN + numberColW,
                y: lineY + 7 + i * 7,
                text: line,
                font: 'Inter',
                weight: 400,
                size: 5.6,
                color: COLOR.text,
            }));
        });

        lineY += 7 + actionLines.length * 7 + 4;
    });

    return lineY;
}

function drawAchterkantFooter({ svg, mode = 'team' }) {
    const footerY = PAGE_H - 56;
    const isOrg = mode === 'organization';

    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY,
        text: isOrg
            ? '"Een organisatie die zichzelf herkent, beweegt sneller."'
            : '"Een team dat zichzelf herkent, beweegt sneller."',
        font: 'Playfair Display',
        weight: 500,
        size: 7,
        color: COLOR.textSoft,
        anchor: 'middle',
        italic: true,
    }));

    const logoSize = 16;
    drawTOFMark(svg, PAGE_W / 2 - logoSize / 2, footerY + 10, logoSize);

    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY + 36,
        text: isOrg
            ? 'Helping organisations understand their workplace through insight, design and movement.'
            : 'Helping teams understand their workplace through insight, design and movement.',
        font: 'Inter',
        weight: 400,
        size: 4.8,
        color: COLOR.textMuted,
        anchor: 'middle',
    }));
}

// =========================
// LEEGLOPER LOGICA
// =========================

function buildLeeglopers(insights, mode = 'team') {
    const t = insights?.workplaceTension || {};
    const out = [];

    if (t.underserved && t.underserved.length > 0) {
        out.push(`Te weinig ${t.underserved[0].label.toLowerCase()}`);
    }

    if (t.oversupplied && t.oversupplied.length > 0) {
        out.push(`Te veel ${t.oversupplied[0].label.toLowerCase()}`);
    }

    const personas = [
        ...(t.impactSummary?.dominant || []),
        ...(t.impactSummary?.middle || []),
    ];
    const personaIds = personas.map((p) => p.id);

    const TENSION_PAIRS = [
        ['presteerder', 'denker', 'tempo en zorgvuldigheid'],
        ['presteerder', 'verbinder', 'resultaat en verbinding'],
        ['maker', 'zekerzoeker', 'vrijheid en zekerheid'],
        ['vernieuwer', 'zekerzoeker', 'vernieuwing en continuïteit'],
        ['groeier', 'zekerzoeker', 'ontwikkeling en stabiliteit'],
        ['teamspeler', 'maker', 'loyaliteit en autonomie'],
    ];

    for (const [a, b, label] of TENSION_PAIRS) {
        if (personaIds.includes(a) && personaIds.includes(b)) {
            out.push(`Spanning tussen ${label}`);
            break;
        }
    }

    while (out.length < 3) {
        out.push(mode === 'organization'
            ? 'Werkplek die niet aansluit bij behoefte van de organisatie'
            : 'Werkplek die niet aansluit bij teambehoefte');
    }

    return out.slice(0, 3);
}

// =========================
// DIVIDER + PRIMITIVES
// =========================

function drawDivider({ svg, y }) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', MARGIN);
    line.setAttribute('y1', y);
    line.setAttribute('x2', PAGE_W - MARGIN);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', COLOR.border);
    line.setAttribute('stroke-width', '0.4');
    svg.appendChild(line);
    return y;
}

function createSVGCanvas() {
    const SVG_NS = 'http://www.w3.org/2000/svg';
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

function createRect(x, y, w, h, fill) {
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', w);
    rect.setAttribute('height', h);
    rect.setAttribute('fill', fill);
    return rect;
}

function createCircle(cx, cy, r, fill) {
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', cx);
    c.setAttribute('cy', cy);
    c.setAttribute('r', r);
    c.setAttribute('fill', fill);
    return c;
}

function createText({ x, y, text, font = 'Inter', weight = 400, size = 6, color = '#000', anchor = 'start', italic = false, letterSpacing = 0 }) {
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', x);
    t.setAttribute('y', y);
    t.setAttribute('font-family', font + ', serif');
    t.setAttribute('font-size', size);
    t.setAttribute('font-weight', weight);
    t.setAttribute('fill', color);
    t.setAttribute('text-anchor', anchor);
    if (italic) t.setAttribute('font-style', 'italic');
    if (letterSpacing) t.setAttribute('letter-spacing', letterSpacing);
    t.textContent = text;
    return t;
}

function drawTOFMark(svg, x, y, size) {
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttribute('x', x);
    img.setAttribute('y', y);
    img.setAttribute('width', size);
    img.setAttribute('height', size);
    img.setAttributeNS('http://www.w3.org/1999/xlink', 'href', tofLogo);
    img.setAttribute('href', tofLogo);
    svg.appendChild(img);
}

function drawWrappedText({ svg, x, y, maxWidth, text, font, weight, size, color, italic, lineHeight, anchor = 'start' }) {
    const lines = wrapText(text, maxWidth, size, font);
    lines.forEach((line, i) => {
        svg.appendChild(createText({
            x,
            y: y + i * lineHeight,
            text: line,
            font,
            weight,
            size,
            color,
            italic,
            anchor,
        }));
    });
    return y + lines.length * lineHeight;
}

function wrapText(text, maxWidth, fontSize, font) {
    const charWidth = (font.includes('Playfair') ? 0.50 : 0.55) * fontSize;
    const charsPerLine = Math.max(10, Math.floor(maxWidth / charWidth));

    const words = String(text || '').split(' ');
    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
        if ((currentLine + (currentLine ? ' ' : '') + word).length <= charsPerLine) {
            currentLine = currentLine ? currentLine + ' ' + word : word;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) lines.push(currentLine);

    return lines;
}

// =========================
// HELPERS
// =========================

function firstName(fullName) {
    if (!fullName) return '';
    return String(fullName).trim().split(/\s+/)[0];
}

function formatNamesNatural(names) {
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} en ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
}

function buildReliabilityLabel(count) {
    if (count === null || count === undefined) return '';
    if (count < 3) return 'Indicatief';
    if (count < 6) return 'Groeiend';
    return 'Sterk beeld';
}

// =========================
// SHARED EXPORTS — voor organizationInsightPDF.js etc.
// =========================
export {
    PAGE_W as PDF_PAGE_W,
    PAGE_H as PDF_PAGE_H,
    MARGIN as PDF_MARGIN,
    COLOR as PDF_COLOR,
    PERSONA_COLORS as PDF_PERSONA_COLORS,
    createSVGCanvas,
    createRect,
    createCircle,
    createText,
    drawTOFMark,
    drawWrappedText,
    wrapText,
    firstName,
    formatNamesNatural,
    buildReliabilityLabel,
    drawDivider,
    drawAchterkantHeader,
    buildLeeglopers,
};