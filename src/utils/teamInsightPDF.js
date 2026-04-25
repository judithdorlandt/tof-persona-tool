/**
 * teamInsightPDF.js
 *
 * Genereert een A5 portrait PDF van de team-insight als deliverable.
 * Vector-output via SVG → PDF (jsPDF + svg2pdf.js) met embedded fonts.
 *
 * Output: Demo Team 3 - teaminzicht TOF.pdf
 */

import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import tofLogo from '../assets/tof-logo.png';

// =========================
// CONSTANTEN
// =========================

// A5 portrait in mm
const PAGE_W = 148;
const PAGE_H = 210;

// Marges
const MARGIN = 12;

// Kleuren (gelijk aan UI)
const COLOR = {
    bg: '#F7F3EE',
    surface: '#FFFFFF',
    border: '#E6DDD2',
    text: '#1F1F1F',
    textSoft: '#555555',
    textMuted: '#7A7A7A',
    sage: '#6E8872',
    rose: '#B05252',
    sageSoft: '#C6D9C9',
};

const PERSONA_COLORS = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

// =========================
// PUBLIC API
// =========================

/**
 * Genereer en download de team-insight PDF.
 *
 * @param {Object} args
 * @param {Object} args.aggregate    Output van buildTeamAggregate
 * @param {Object} args.insights     Output van buildTeamInsights
 * @param {string} args.teamName     Bv "Demo Team 3"
 * @param {string} args.organization Bv "TOF"
 */
export async function generateTeamInsightPDF({
    aggregate,
    insights,
    teamName = 'Team',
    organization = '',
}) {
    // 1. Bouw beide SVG's
    const svgVoorkant = buildVoorkantSVG({ aggregate, insights, teamName, organization });
    const svgAchterkant = buildAchterkantSVG({ aggregate, insights, teamName, organization });

    // Voeg tijdelijk toe aan body zodat svg2pdf het kan lezen
    document.body.appendChild(svgVoorkant);
    document.body.appendChild(svgAchterkant);

    try {
        // 2. Maak nieuwe PDF — A5 portrait, mm
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5',
            compress: true,
        });

        // 3. Voorkant
        await svg2pdf(svgVoorkant, pdf, {
            x: 0,
            y: 0,
            width: PAGE_W,
            height: PAGE_H,
        });

        // 4. Nieuwe pagina + achterkant
        pdf.addPage('a5', 'portrait');
        await svg2pdf(svgAchterkant, pdf, {
            x: 0,
            y: 0,
            width: PAGE_W,
            height: PAGE_H,
        });

        // 5. Download
        const safeName = (teamName || 'team')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .slice(0, 50);
        const fileName = `${safeName} - teaminzicht TOF.pdf`;
        pdf.save(fileName);
    } finally {
        document.body.removeChild(svgVoorkant);
        document.body.removeChild(svgAchterkant);
    }
}

// =========================
// SVG BUILDER — VOORKANT
// =========================

function buildVoorkantSVG({ aggregate, insights, teamName, organization }) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('width', `${PAGE_W}mm`);
    svg.setAttribute('height', `${PAGE_H}mm`);
    svg.setAttribute('viewBox', `0 0 ${PAGE_W} ${PAGE_H}`);
    // Verberg tijdens generatie zonder display:none (svg2pdf moet kunnen meten)
    svg.style.position = 'fixed';
    svg.style.top = '-99999px';
    svg.style.left = '-99999px';

    // Achtergrond
    const bg = createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg);
    svg.appendChild(bg);

    // Bouw secties van boven naar beneden
    let y = MARGIN;

    y = drawHeader({ svg, y, teamName, organization, aggregate });
    y += 6;
    y = drawHero({ svg, y, aggregate, insights });
    y += 6;
    y = drawDivider({ svg, y });
    y += 5;
    y = drawDistributionAndMix({ svg, y, aggregate });
    y += 5;
    y = drawDivider({ svg, y });
    y += 5;
    y = drawSignature({ svg, y, aggregate, insights });
    y += 5;
    y = drawDivider({ svg, y });
    y += 5;
    drawLeeglopers({ svg, y, insights });

    // Footer "→ ZIE ACHTERKANT"
    drawFooterHint({ svg });

    return svg;
}

// =========================
// SVG BUILDER — ACHTERKANT
// =========================

function buildAchterkantSVG({ aggregate, insights, teamName, organization }) {
    const SVG_NS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('xmlns', SVG_NS);
    svg.setAttribute('width', `${PAGE_W}mm`);
    svg.setAttribute('height', `${PAGE_H}mm`);
    svg.setAttribute('viewBox', `0 0 ${PAGE_W} ${PAGE_H}`);
    svg.style.position = 'fixed';
    svg.style.top = '-99999px';
    svg.style.left = '-99999px';

    // Achtergrond
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    // Header
    y = drawAchterkantHeader({ svg, y });
    y += 6;

    // Titel
    y = drawAchterkantTitle({ svg, y });
    y += 5;

    // Werkplekbehoefte (compacte 1-regel-stijl, alle 9)
    y = drawWorkplaceCompact({ svg, y, aggregate });
    y += 5;

    // Quick wins
    y = drawQuickWinsCompact({ svg, y, insights });

    // Footer met citaat + logo
    drawAchterkantFooter({ svg });

    return svg;
}

// Header: pill linksboven, logo rechtsboven
function drawAchterkantHeader({ svg, y }) {
    const pillW = 60;
    const pillH = 6;

    const pill = createRect(MARGIN, y, pillW, pillH, COLOR.sage);
    pill.setAttribute('rx', '3');
    pill.setAttribute('ry', '3');
    svg.appendChild(pill);

    svg.appendChild(createCircle(MARGIN + 3, y + pillH / 2, 0.7, '#FFFFFF'));

    svg.appendChild(createText({
        x: MARGIN + 5.5,
        y: y + pillH / 2 + 1,
        text: 'JOUW IDEALE WERKPLEKMIX',
        font: 'Inter',
        weight: 700,
        size: 2.6,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    }));

    drawTOFMark(svg, PAGE_W - MARGIN - 6, y + 1, 5);

    return y + pillH;
}

// Titel: "Wat dit team vraagt van de werkomgeving"
function drawAchterkantTitle({ svg, y }) {
    const titleY = y + 8;

    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: 'Wat dit team vraagt van de werkomgeving',
        font: 'Playfair Display',
        weight: 500,
        size: 6,
        color: COLOR.text,
    }));

    return titleY;
}

// Werkplekbehoefte: alle 9 in compacte 1-regel stijl
function drawWorkplaceCompact({ svg, y, aggregate }) {
    const items = (aggregate?.sortedWorkplaceNeeds || []).slice();
    if (items.length === 0) return y;

    // Bereken percentages
    const total = items.reduce((sum, item) => sum + Number(item.value || item.count || 0), 0);
    const enriched = items.map((item) => {
        const value = Number(item.value || item.count || 0);
        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
        return { ...item, percentage };
    });

    const averagePct = enriched.length > 0 ? 100 / enriched.length : 0;

    // Eyebrow
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 4,
        text: 'WERKPLEKBEHOEFTE',
        font: 'Inter',
        weight: 700,
        size: 2.4,
        color: COLOR.textMuted,
        letterSpacing: 0.4,
    }));

    // Twee-koloms layout
    const totalWidth = PAGE_W - MARGIN * 2;
    const gap = 8;
    const colWidth = (totalWidth - gap) / 2;
    const colLeftX = MARGIN;
    const colRightX = MARGIN + colWidth + gap;

    const lineHeight = 6;
    const startY = y + 9;

    // Verdeel items: linker kolom heeft helft (afgerond naar boven)
    const halfPoint = Math.ceil(enriched.length / 2);
    const leftItems = enriched.slice(0, halfPoint);
    const rightItems = enriched.slice(halfPoint);

    function drawColumn(items, x, w) {
        let lineY = startY;
        items.forEach((item) => {
            const isAbove = item.percentage >= averagePct;
            const accent = isAbove ? COLOR.sage : COLOR.rose;

            // Label
            svg.appendChild(createText({
                x: x,
                y: lineY,
                text: item.label,
                font: 'Inter',
                weight: 500,
                size: 2.8,
                color: COLOR.text,
            }));

            // Percentage rechts in kolom
            svg.appendChild(createText({
                x: x + w,
                y: lineY,
                text: `${item.percentage}%`,
                font: 'Inter',
                weight: 600,
                size: 2.8,
                color: COLOR.textMuted,
                anchor: 'end',
            }));

            // Dunne balk eronder
            const barY = lineY + 1.3;
            const barH = 0.7;

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

// Quick wins compact
function drawQuickWinsCompact({ svg, y, insights }) {
    const wins = insights?.quickWins || [];
    if (wins.length === 0) return y;

    // Eyebrow
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 4,
        text: `${wins.length === 1 ? 'EÉN ACTIE' : wins.length + ' ACTIES'} VOOR MORGEN`,
        font: 'Inter',
        weight: 700,
        size: 2.4,
        color: COLOR.textMuted,
        letterSpacing: 0.4,
    }));

    const SOURCE_LABELS = {
        werkstijlen: 'UIT WERKSTIJLEN',
        werkplek: 'UIT WERKPLEK',
        spanning: 'UIT SPANNING',
        minderheid: 'UIT MINDERHEID',
        ontbrekend: 'UIT ONTBREKEND',
        reflectie: 'REFLECTIE',
    };

    let lineY = y + 9;

    wins.forEach((win, index) => {
        const item = typeof win === 'string'
            ? { source: 'reflectie', action: win }
            : win;
        const label = SOURCE_LABELS[item.source] || 'REFLECTIE';

        // Nummer (Playfair)
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY + 0.5,
            text: String(index + 1).padStart(2, '0'),
            font: 'Playfair Display',
            weight: 500,
            size: 4,
            color: COLOR.sage,
        }));

        // Source label
        svg.appendChild(createText({
            x: MARGIN + 8,
            y: lineY,
            text: label,
            font: 'Inter',
            weight: 700,
            size: 2.2,
            color: COLOR.sage,
            letterSpacing: 0.4,
        }));

        // Actie-tekst (wrap)
        const actionLines = wrapText(item.action, PAGE_W - MARGIN * 2 - 8, 2.8, 'Inter');
        actionLines.forEach((line, i) => {
            svg.appendChild(createText({
                x: MARGIN + 8,
                y: lineY + 3.5 + i * 3.5,
                text: line,
                font: 'Inter',
                weight: 400,
                size: 2.8,
                color: COLOR.text,
            }));
        });

        lineY += 3.5 + actionLines.length * 3.5 + 2;
    });

    return lineY;
}

// Footer met citaat + logo + tagline (zoals personakaart)
function drawAchterkantFooter({ svg }) {
    const footerY = PAGE_H - 30;

    // Citaat — gecentreerd, italic Playfair
    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY,
        text: '"Een team dat zichzelf herkent, beweegt sneller."',
        font: 'Playfair Display',
        weight: 500,
        size: 3.4,
        color: COLOR.textSoft,
        anchor: 'middle',
        italic: true,
    }));

    // Logo midden — groter dan in de header
    const logoSize = 8;
    drawTOFMark(svg, PAGE_W / 2 - logoSize / 2, footerY + 5, logoSize);

    // Tagline op één regel
    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY + 18,
        text: 'Helping teams understand their workplace through insight, design and movement.',
        font: 'Inter',
        weight: 400,
        size: 2.4,
        color: COLOR.textMuted,
        anchor: 'middle',
    }));
}

// =========================
// SECTIES
// =========================

// HEADER: pill linksboven, logo rechtsboven, team-meta eronder
function drawHeader({ svg, y, teamName, organization, aggregate }) {
    const pillW = 40;
    const pillH = 6;
    const pillY = y;

    // Pill achtergrond — sage met lichte tekst
    const pill = createRect(MARGIN, pillY, pillW, pillH, COLOR.sage);
    pill.setAttribute('rx', '3');
    pill.setAttribute('ry', '3');
    svg.appendChild(pill);

    // Pill stip
    svg.appendChild(createCircle(MARGIN + 3, pillY + pillH / 2, 0.7, '#FFFFFF'));

    // Pill tekst
    svg.appendChild(createText({
        x: MARGIN + 5.5,
        y: pillY + pillH / 2 + 1,
        text: 'TEAMINZICHT',
        font: 'Inter',
        weight: 700,
        size: 2.6,
        color: '#FFFFFF',
        letterSpacing: 0.3,
    }));

    // Logo rechtsboven (TOF-mark)
    drawTOFMark(svg, PAGE_W - MARGIN - 6, pillY + 1, 5);

    // Team-meta regel
    const metaY = pillY + pillH + 8;
    const metaText = `${teamName}${organization ? ' · ' + organization : ''}`;
    svg.appendChild(createText({
        x: MARGIN,
        y: metaY,
        text: metaText,
        font: 'Inter',
        weight: 400,
        size: 3,
        color: COLOR.textMuted,
    }));

    // Datum rechts
    const today = new Date();
    const dateText = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: metaY,
        text: dateText,
        font: 'Inter',
        weight: 400,
        size: 3,
        color: COLOR.textMuted,
        anchor: 'end',
    }));

    return metaY;
}

// HERO: dominante werkstijl als statement
function drawHero({ svg, y, aggregate, insights }) {
    const top = aggregate?.sortedPersonas?.[0];
    if (!top) return y;

    const teamCount = aggregate?.teamCount || 0;
    const personaColor = PERSONA_COLORS[top.id] || COLOR.text;

    const fontSize = 8;
    const lineH = 9;

    // Regel 1: "Jouw dominante teamwerkstijl is:"
    const titleY = y + 11;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: 'Jouw dominante teamwerkstijl is:',
        font: 'Playfair Display',
        weight: 500,
        size: fontSize,
        color: COLOR.text,
    }));

    // Regel 2: alleen persona-naam in persona-kleur + italic
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

    // Headline-zin
    const subY = line2Y + 7;
    const headline = insights?.headline || `Het team werkt vanuit ${top.name.toLowerCase()}.`;
    drawWrappedText({
        svg,
        x: MARGIN,
        y: subY,
        maxWidth: PAGE_W - MARGIN * 2,
        text: headline,
        font: 'Inter',
        weight: 400,
        size: 3.2,
        color: COLOR.textSoft,
        lineHeight: 4.4,
    });

    // Meta onder lead
    const headlineLines = wrapText(headline, PAGE_W - MARGIN * 2, 3.2, 'Inter');
    const metaY = subY + headlineLines.length * 4.4 + 3;
    const reliability = buildReliabilityLabel(teamCount);
    const metaLine = `${teamCount} respons${teamCount === 1 ? '' : 'en'}${reliability ? ' · ' + reliability : ''}`;
    svg.appendChild(createText({
        x: MARGIN,
        y: metaY,
        text: metaLine,
        font: 'Inter',
        weight: 400,
        size: 2.6,
        color: COLOR.textMuted,
    }));

    return metaY;
}

// VERDELING + MIX — twee kolommen
function drawDistributionAndMix({ svg, y, aggregate }) {
    const totalWidth = PAGE_W - MARGIN * 2;
    const gap = 12;
    const colWidth = (totalWidth - gap) / 2;
    const colLeftX = MARGIN;
    const colRightX = MARGIN + colWidth + gap;

    // Eyebrows
    svg.appendChild(createText({
        x: colLeftX,
        y: y + 3,
        text: 'VERDELING',
        font: 'Inter',
        weight: 700,
        size: 2.4,
        color: COLOR.textMuted,
        letterSpacing: 0.4,
    }));

    svg.appendChild(createText({
        x: colRightX,
        y: y + 3,
        text: 'JOUW TEAM-MIX',
        font: 'Inter',
        weight: 700,
        size: 2.4,
        color: COLOR.textMuted,
        letterSpacing: 0.4,
    }));

    // Linkerkolom: alle 8 persona's met balken
    const teamCount = aggregate?.teamCount || 0;
    const ARCHETYPE_ORDER = ['maker', 'groeier', 'presteerder', 'denker', 'verbinder', 'teamspeler', 'zekerzoeker', 'vernieuwer'];
    const personasMap = {};
    (aggregate?.sortedPersonas || []).forEach((p) => {
        personasMap[p.id] = p;
    });

    let lineY = y + 8;
    const lineHeight = 6;

    ARCHETYPE_ORDER.forEach((id) => {
        const p = personasMap[id];
        if (!p) return;
        const pct = teamCount > 0 ? Math.round((p.count / teamCount) * 100) : 0;
        const color = PERSONA_COLORS[id];

        // Naam links
        svg.appendChild(createText({
            x: colLeftX,
            y: lineY,
            text: p.name,
            font: 'Inter',
            weight: 600,
            size: 2.8,
            color: pct === 0 ? COLOR.textMuted : COLOR.text,
        }));

        // Percentage rechts in kolom
        svg.appendChild(createText({
            x: colLeftX + colWidth,
            y: lineY,
            text: `${pct}%`,
            font: 'Inter',
            weight: 600,
            size: 2.8,
            color: COLOR.textMuted,
            anchor: 'end',
        }));

        // Balk eronder
        const barY = lineY + 1.2;
        const barH = 1;
        const barTrackW = colWidth;

        svg.appendChild(createRect(colLeftX, barY, barTrackW, barH, '#EADFD4'));
        if (pct > 0) {
            svg.appendChild(createRect(colLeftX, barY, barTrackW * (pct / 100), barH, color));
        }

        lineY += lineHeight;
    });

    // Rechterkolom: top 2-3 persona's met namen
    const topPresent = (aggregate?.sortedPersonas || [])
        .filter((p) => p.count > 0)
        .slice(0, 3);

    let mixY = y + 8;
    const members = aggregate?.members || [];

    topPresent.forEach((p) => {
        const color = PERSONA_COLORS[p.id];

        // Persona-naam (klein in kleur)
        svg.appendChild(createText({
            x: colRightX,
            y: mixY,
            text: p.name,
            font: 'Playfair Display',
            weight: 500,
            size: 3.6,
            color: color,
        }));

        // Voornamen
        const names = members
            .filter((m) => m.primary === p.id)
            .map((m) => firstName(m.name))
            .filter((n) => n && n !== 'Onbekend')
            .filter((n, i, arr) => arr.indexOf(n) === i);

        const namesText = formatNamesNatural(names);

        if (namesText) {
            const namesLines = wrapText(namesText, colWidth, 2.6, 'Inter');
            namesLines.forEach((line, i) => {
                svg.appendChild(createText({
                    x: colRightX,
                    y: mixY + 4 + i * 3.5,
                    text: line,
                    font: 'Inter',
                    weight: 400,
                    size: 2.6,
                    color: COLOR.textSoft,
                }));
            });
            mixY += 4 + namesLines.length * 3.5 + 3;
        } else {
            mixY += 8;
        }
    });

    return Math.max(lineY, mixY);
}

// SIGNATURE: wat dit team in beweging brengt
function drawSignature({ svg, y, aggregate, insights }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 3,
        text: 'WAT DIT TEAM IN BEWEGING BRENGT',
        font: 'Inter',
        weight: 700,
        size: 2.4,
        color: COLOR.textMuted,
        letterSpacing: 0.4,
    }));

    // Dynamische zin op basis van top-2 persona's
    const signatureSentence = buildSignatureSentence(aggregate);

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 9,
        text: signatureSentence,
        font: 'Playfair Display',
        weight: 500,
        size: 4,
        color: COLOR.text,
        italic: true,
    }));

    return y + 9 + 6;
}

// Bouw signature-zin op basis van top-2 persona's
function buildSignatureSentence(aggregate) {
    const top = (aggregate?.sortedPersonas || []).filter((p) => p.count > 0);

    // Wat brengt elke persona?
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

    if (top.length === 0) return 'Een team in beweging.';

    if (top.length === 1) {
        const drive = PERSONA_DRIVE[top[0].id] || top[0].name.toLowerCase();
        return `${capitalize(drive)} — daar bouwt dit team op.`;
    }

    const drive1 = PERSONA_DRIVE[top[0].id] || top[0].name.toLowerCase();
    const drive2 = PERSONA_DRIVE[top[1].id] || top[1].name.toLowerCase();
    return `${capitalize(drive1)} en ${drive2} — daar bouwt dit team op.`;
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// LEEGLOPERS: 3 team-specifieke triggers
function drawLeeglopers({ svg, y, insights }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 3,
        text: 'WAAR HET TEAM OP LEEGLOOPT',
        font: 'Inter',
        weight: 700,
        size: 2.4,
        color: COLOR.textMuted,
        letterSpacing: 0.4,
    }));

    const leeglopers = buildLeeglopers(insights);

    let lineY = y + 9;
    leeglopers.forEach((tekst) => {
        // Dot als bullet
        svg.appendChild(createCircle(MARGIN + 1, lineY - 1, 0.5, COLOR.rose));

        svg.appendChild(createText({
            x: MARGIN + 4,
            y: lineY,
            text: tekst,
            font: 'Inter',
            weight: 400,
            size: 3,
            color: COLOR.text,
        }));

        lineY += 5.5;
    });
}

// FOOTER: hint naar achterkant rechtsonder
function drawFooterHint({ svg }) {
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: PAGE_H - 6,
        text: 'ZIE ACHTERKANT',
        font: 'Inter',
        weight: 700,
        size: 2.4,
        color: COLOR.textMuted,
        letterSpacing: 0.4,
        anchor: 'end',
    }));
}

// DIVIDER: dunne lijn
function drawDivider({ svg, y }) {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', MARGIN);
    line.setAttribute('y1', y);
    line.setAttribute('x2', PAGE_W - MARGIN);
    line.setAttribute('y2', y);
    line.setAttribute('stroke', COLOR.border);
    line.setAttribute('stroke-width', '0.2');
    svg.appendChild(line);
    return y;
}

// =========================
// LEEGLOPER LOGICA
// =========================

function buildLeeglopers(insights) {
    const t = insights?.workplaceTension || {};
    const out = [];

    // 1. Onderbedien - eerste werkplek
    if (t.underserved && t.underserved.length > 0) {
        out.push(`Te weinig ${t.underserved[0].label.toLowerCase()}`);
    }

    // 2. Overdosis - eerste werkplek
    if (t.oversupplied && t.oversupplied.length > 0) {
        out.push(`Te veel ${t.oversupplied[0].label.toLowerCase()}`);
    }

    // 3. Persona-spanning vanuit kern + verder
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

    // Pad tot 3
    while (out.length < 3) {
        out.push('Werkplek die niet aansluit bij teambehoefte');
    }

    return out.slice(0, 3);
}

// =========================
// SVG PRIMITIVES
// =========================

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

function createText({ x, y, text, font = 'Inter', weight = 400, size = 3, color = '#000', anchor = 'start', italic = false, letterSpacing = 0 }) {
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

// TOF logo: PNG embedded via SVG <image> — gegarandeerd correct ten opzichte van origineel
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

// Wrap-tekst over meerdere regels
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

// Simpele text-wrap op basis van geschatte teken-breedte
function wrapText(text, maxWidth, fontSize, font) {
    // Geschatte breedte per teken (mm) — Inter ~0.55x font-size, Playfair ~0.50x
    const charWidth = (font.includes('Playfair') ? 0.50 : 0.55) * fontSize;
    const charsPerLine = Math.max(10, Math.floor(maxWidth / charWidth));

    const words = text.split(' ');
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