/**
 * teamDynamicsPDF.js
 *
 * Genereert een A3 portrait poster (twee pagina's) van de Team Dynamics
 * module als deliverable. Vector-output via SVG → PDF (jsPDF + svg2pdf.js)
 * met embedded fonts.
 *
 * Output: <Team> - teamdynamics TOF.pdf
 *
 * Verwacht via args:
 *   - aggregate         : output van buildTeamAggregate
 *                         (subset: teamCount, totalScores, totalEnergy)
 *   - dynamicsAxes      : output van buildDynamicsAxes
 *   - tensions          : output van findActiveTensions
 *   - leadershipWins    : array van { source, action }
 *                         source ∈ { 'dynamics' | 'collaboration' | 'tension' | 'missing' }
 *   - teamName, organization
 *   - headline          : signature-zin (optioneel)
 */

import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import tofLogo from '../assets/tof-logo.png';

// =========================
// CONSTANTEN — A3 PORTRAIT
// =========================

// A3 portrait in mm
const PAGE_W = 297;
const PAGE_H = 420;

// Marges — proportioneel ruimer dan A5
const MARGIN = 24;

// Kleuren — Dynamics gebruikt rose als hoofdaccent
const COLOR = {
    bg: '#F7F3EE',
    surface: '#FFFFFF',
    border: '#E6DDD2',
    text: '#1F1F1F',
    textSoft: '#555555',
    textMuted: '#7A7A7A',
    sage: '#6E8872',
    rose: '#B05252',
    roseSoft: '#E8C8C8',
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

// Source-labels — keys exact gelijk aan TeamDynamics.jsx
// (anders krijg je "REFLECTIE" voor alles wat geen match is)
const LEADERSHIP_SOURCE_LABELS = {
    dynamics: 'UIT DYNAMIEK',
    collaboration: 'UIT SAMENWERKING',
    tension: 'UIT SPANNINGEN',
    missing: 'UIT BLINDE VLEK',
    reflectie: 'REFLECTIE',
};

// =========================
// PUBLIC API
// =========================

export async function generateTeamDynamicsPDF({
    aggregate,
    dynamicsAxes = [],
    tensions = [],
    leadershipWins = [],
    teamName = 'Team',
    organization = '',
    headline = '',
}) {
    const svgVoorkant = buildVoorkantSVG({
        aggregate,
        dynamicsAxes,
        tensions,
        teamName,
        organization,
        headline,
    });

    const svgAchterkant = buildAchterkantSVG({
        aggregate,
        tensions,
        leadershipWins,
        teamName,
        organization,
    });

    document.body.appendChild(svgVoorkant);
    document.body.appendChild(svgAchterkant);

    try {
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a3',
            compress: true,
        });

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
        const fileName = `${safeName} - teamdynamics TOF.pdf`;
        pdf.save(fileName);
    } finally {
        document.body.removeChild(svgVoorkant);
        document.body.removeChild(svgAchterkant);
    }
}

// =========================
// SVG BUILDER — VOORKANT
// =========================

function buildVoorkantSVG({ aggregate, dynamicsAxes, tensions, teamName, organization, headline }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawHeader({
        svg, y, teamName, organization,
        pillLabel: 'TEAM DYNAMICS',
        pillColor: COLOR.rose,
    });
    y += 14;
    y = drawHero({ svg, y, aggregate, headline });
    y += 14;
    y = drawDivider({ svg, y });
    y += 12;
    y = drawAxes({ svg, y, dynamicsAxes });
    y += 12;
    y = drawDivider({ svg, y });
    y += 12;
    drawTensionsList({ svg, y, tensions, aggregate });

    drawFooterHint({ svg, label: 'ZIE ACHTERKANT VOOR REGIE EN ACTIE' });

    return svg;
}

// =========================
// SVG BUILDER — ACHTERKANT
// =========================

function buildAchterkantSVG({ aggregate, tensions, leadershipWins, teamName, organization }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawAchterkantHeader({ svg, y });
    y += 14;
    y = drawAchterkantTitle({ svg, y });
    y += 12;
    y = drawTensionAdvice({ svg, y, tensions });
    y += 10;
    y = drawDivider({ svg, y });
    y += 12;
    drawLeadershipActions({ svg, y, leadershipWins });

    drawAchterkantFooter({ svg });

    return svg;
}

// =========================
// SECTIES — VOORKANT
// =========================

function drawHeader({ svg, y, teamName, organization, pillLabel, pillColor }) {
    const pillW = 80;
    const pillH = 12;
    const pillY = y;

    const pill = createRect(MARGIN, pillY, pillW, pillH, pillColor);
    pill.setAttribute('rx', '6');
    pill.setAttribute('ry', '6');
    svg.appendChild(pill);

    svg.appendChild(createCircle(MARGIN + 6, pillY + pillH / 2, 1.4, '#FFFFFF'));

    svg.appendChild(createText({
        x: MARGIN + 11,
        y: pillY + pillH / 2 + 2,
        text: pillLabel,
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

function drawHero({ svg, y, aggregate, headline }) {
    const teamCount = aggregate?.teamCount || 0;

    const titleY = y + 22;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: 'Wat onder de samenwerking ligt',
        font: 'Playfair Display',
        weight: 500,
        size: 16,
        color: COLOR.text,
    }));

    const subY = titleY + 16;
    const sentence = headline
        || 'Drie assen tonen waar dit team in evenwicht is en waar regie nodig is.';

    drawWrappedText({
        svg,
        x: MARGIN,
        y: subY,
        maxWidth: PAGE_W - MARGIN * 2,
        text: sentence,
        font: 'Playfair Display',
        weight: 500,
        size: 8,
        color: COLOR.text,
        italic: true,
        lineHeight: 11,
    });

    const sentenceCount = wrapText(sentence, PAGE_W - MARGIN * 2, 8, 'Playfair Display').length;
    const metaY = subY + sentenceCount * 11 + 6;

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

function drawAxes({ svg, y, dynamicsAxes }) {
    if (!dynamicsAxes || dynamicsAxes.length === 0) return y;

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: 'DRIE ASSEN — WAAR HET TEAM ZIT',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    let lineY = y + 18;
    const usableW = PAGE_W - MARGIN * 2;
    const axisHeight = 32;

    dynamicsAxes.slice(0, 3).forEach((axis) => {
        const total = (axis.lv || 0) + (axis.rv || 0);
        const lPct = total > 0 ? Math.round((axis.lv / total) * 100) : 50;
        const rPct = 100 - lPct;

        // Pool-labels
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY,
            text: axis.left || '',
            font: 'Inter',
            weight: 600,
            size: 6,
            color: COLOR.text,
        }));
        svg.appendChild(createText({
            x: MARGIN + usableW,
            y: lineY,
            text: axis.right || '',
            font: 'Inter',
            weight: 600,
            size: 6,
            color: COLOR.text,
            anchor: 'end',
        }));

        // Percentages onder pool-labels
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY + 6,
            text: `${lPct}%`,
            font: 'Inter',
            weight: 400,
            size: 5,
            color: COLOR.textMuted,
        }));
        svg.appendChild(createText({
            x: MARGIN + usableW,
            y: lineY + 6,
            text: `${rPct}%`,
            font: 'Inter',
            weight: 400,
            size: 5,
            color: COLOR.textMuted,
            anchor: 'end',
        }));

        // Balans-balk
        const barY = lineY + 10;
        const barH = 2.4;
        svg.appendChild(createRect(MARGIN, barY, usableW, barH, '#EADFD4'));
        if (lPct > 0) {
            svg.appendChild(createRect(MARGIN, barY, usableW * (lPct / 100), barH, COLOR.rose));
        }

        // 50%-marker
        const midX = MARGIN + usableW / 2;
        svg.appendChild(createRect(midX - 0.2, barY - 1, 0.4, barH + 2, COLOR.textMuted));

        // As-naam onder de balk
        svg.appendChild(createText({
            x: MARGIN + usableW / 2,
            y: barY + barH + 6,
            text: axis.label || '',
            font: 'Inter',
            weight: 400,
            size: 5,
            color: COLOR.textMuted,
            italic: true,
            anchor: 'middle',
        }));

        lineY += axisHeight;
    });

    return lineY;
}

function drawTensionsList({ svg, y, tensions, aggregate }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: 'ACTIEVE SPANNINGEN',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    if (!tensions || tensions.length === 0) {
        svg.appendChild(createText({
            x: MARGIN,
            y: y + 20,
            text: 'Geen actieve spanningen — werkstijlen zijn in balans.',
            font: 'Inter',
            weight: 400,
            size: 6,
            color: COLOR.textSoft,
            italic: true,
        }));
        return y + 28;
    }

    const totalEnergy = aggregate?.totalEnergy || 0;
    const totalScores = aggregate?.totalScores || {};
    const pctFor = (id) => {
        if (totalEnergy === 0) return 0;
        return Math.round(((totalScores[id] || 0) / totalEnergy) * 100);
    };

    let lineY = y + 18;
    const lineHeight = 16;

    tensions.slice(0, 6).forEach((t) => {
        const pctA = pctFor(t.a);
        const pctB = pctFor(t.b);
        const colorA = PERSONA_COLORS[t.a];
        const colorB = PERSONA_COLORS[t.b];

        // Titel-zin in rose
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY,
            text: t.label,
            font: 'Playfair Display',
            weight: 500,
            size: 7.5,
            color: COLOR.rose,
        }));

        // Persona-pills regel
        const pillY = lineY + 7;
        const archAName = capitalize(t.a);
        const archBName = capitalize(t.b);

        svg.appendChild(createCircle(MARGIN + 1.6, pillY - 1.6, 1.4, colorA));
        svg.appendChild(createText({
            x: MARGIN + 5,
            y: pillY,
            text: `${archAName} ${pctA}%`,
            font: 'Inter',
            weight: 400,
            size: 5,
            color: COLOR.textSoft,
        }));

        // Schat positie van " en " na A-pill
        const aText = `${archAName} ${pctA}%`;
        const aTextWidth = aText.length * 0.55 * 5 + 8;
        const enX = MARGIN + 5 + aTextWidth;

        svg.appendChild(createText({
            x: enX,
            y: pillY,
            text: 'en',
            font: 'Inter',
            weight: 400,
            size: 5,
            color: COLOR.textMuted,
        }));

        const bDotX = enX + 9;
        svg.appendChild(createCircle(bDotX + 1.6, pillY - 1.6, 1.4, colorB));
        svg.appendChild(createText({
            x: bDotX + 5,
            y: pillY,
            text: `${archBName} ${pctB}%`,
            font: 'Inter',
            weight: 400,
            size: 5,
            color: COLOR.textSoft,
        }));

        lineY += lineHeight;
    });

    return lineY;
}

function drawFooterHint({ svg, label }) {
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: PAGE_H - 12,
        text: label,
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
    const pillW = 100;
    const pillH = 12;

    const pill = createRect(MARGIN, y, pillW, pillH, COLOR.rose);
    pill.setAttribute('rx', '6');
    pill.setAttribute('ry', '6');
    svg.appendChild(pill);

    svg.appendChild(createCircle(MARGIN + 6, y + pillH / 2, 1.4, '#FFFFFF'));

    svg.appendChild(createText({
        x: MARGIN + 11,
        y: y + pillH / 2 + 2,
        text: 'REGIE EN ACTIE',
        font: 'Inter',
        weight: 700,
        size: 5.2,
        color: '#FFFFFF',
        letterSpacing: 0.6,
    }));

    drawTOFMark(svg, PAGE_W - MARGIN - 12, y + 2, 10);

    return y + pillH;
}

function drawAchterkantTitle({ svg, y }) {
    const titleY = y + 16;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: 'Waar regie helpt en wat te doen',
        font: 'Playfair Display',
        weight: 500,
        size: 12,
        color: COLOR.text,
    }));
    return titleY;
}

function drawTensionAdvice({ svg, y, tensions }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 8,
        text: 'PER SPANNING — WAT VRAAGT REGIE',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    if (!tensions || tensions.length === 0) {
        svg.appendChild(createText({
            x: MARGIN,
            y: y + 22,
            text: 'Geen actieve spanningen om regie op te voeren.',
            font: 'Inter',
            weight: 400,
            size: 6,
            color: COLOR.textSoft,
            italic: true,
        }));
        return y + 30;
    }

    let lineY = y + 20;
    const usableW = PAGE_W - MARGIN * 2;

    tensions.slice(0, 4).forEach((t) => {
        // Titel in rose
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY,
            text: t.label,
            font: 'Playfair Display',
            weight: 500,
            size: 8,
            color: COLOR.rose,
        }));

        // Leiderschapsadvies eronder
        const adviceLines = wrapText(t.leadership || '', usableW, 5.8, 'Inter');
        adviceLines.forEach((line, i) => {
            svg.appendChild(createText({
                x: MARGIN,
                y: lineY + 8 + i * 7.4,
                text: line,
                font: 'Inter',
                weight: 400,
                size: 5.8,
                color: COLOR.text,
            }));
        });

        lineY += 8 + adviceLines.length * 7.4 + 6;
    });

    return lineY;
}

function drawLeadershipActions({ svg, y, leadershipWins }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 8,
        text: 'ZES ACTIES VOOR LEIDERSCHAP',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    if (!leadershipWins || leadershipWins.length === 0) {
        svg.appendChild(createText({
            x: MARGIN,
            y: y + 22,
            text: 'Nog geen acties beschikbaar.',
            font: 'Inter',
            weight: 400,
            size: 6,
            color: COLOR.textSoft,
            italic: true,
        }));
        return;
    }

    let lineY = y + 20;
    const numberColW = 16;
    const usableW = PAGE_W - MARGIN * 2 - numberColW;

    leadershipWins.slice(0, 6).forEach((win, index) => {
        const item = typeof win === 'string'
            ? { source: 'reflectie', action: win }
            : win;
        const sourceLabel = LEADERSHIP_SOURCE_LABELS[item.source] || 'REFLECTIE';

        // Nummer in Playfair rose
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY + 1,
            text: String(index + 1).padStart(2, '0'),
            font: 'Playfair Display',
            weight: 500,
            size: 8,
            color: COLOR.rose,
        }));

        // Source-label
        svg.appendChild(createText({
            x: MARGIN + numberColW,
            y: lineY,
            text: sourceLabel,
            font: 'Inter',
            weight: 700,
            size: 4.4,
            color: COLOR.rose,
            letterSpacing: 0.8,
        }));

        // Actie-tekst
        const actionLines = wrapText(item.action || '', usableW, 5.8, 'Inter');
        actionLines.forEach((line, i) => {
            svg.appendChild(createText({
                x: MARGIN + numberColW,
                y: lineY + 7 + i * 7.4,
                text: line,
                font: 'Inter',
                weight: 400,
                size: 5.8,
                color: COLOR.text,
            }));
        });

        lineY += 7 + actionLines.length * 7.4 + 6;
    });
}

function drawAchterkantFooter({ svg }) {
    const footerY = PAGE_H - 56;

    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY,
        text: '"Regie geven is duidelijkheid scheppen — niet bepalen."',
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
        text: 'Helping teams understand their workplace through insight, design and movement.',
        font: 'Inter',
        weight: 400,
        size: 4.8,
        color: COLOR.textMuted,
        anchor: 'middle',
    }));
}

// =========================
// DIVIDER
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

// =========================
// SVG PRIMITIVES
// =========================

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

function capitalize(s) {
    if (!s) return '';
    return String(s).charAt(0).toUpperCase() + String(s).slice(1);
}

function buildReliabilityLabel(count) {
    if (count === null || count === undefined) return '';
    if (count < 3) return 'Eerste signalen';
    if (count < 6) return 'Opkomend patroon';
    if (count <= 15) return 'Betrouwbaar beeld';
    return 'Sterk patroon';
}