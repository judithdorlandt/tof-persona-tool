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
    formatPdfDate,
} from './tofPdfBrand';
// Werkplekprofiel (kern / steun / beperkt nodig) — dezelfde bron als het
// Werkplek-paneel op het scherm.
import {
    aantallenUitAggregate,
    buildWerkplekProfiel,
    BAND,
} from '../team/werkplek/werkplekProfielLogic';
// Persona-namen komen uit één taalvaste bron, zodat NL/EN
// rapporten dezelfde termen gebruiken als de Organisatie-Landschap PDF.
import { getArchetypeName } from './organisatieLandschap/constants';

import { getCopy } from '../i18n/copy';
import { getConfidence } from '../insights';

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
// TEKSTEN — per taal
// =========================
// Alle zichtbare tekst staat hier; de teken-functies hardcoden niets.
// Font-subsets missen >= en <=; gebruik die glyphs nooit. · – — é mogen wel.
//
// `isOrg` bepaalt of we het over "de organisatie" of "het team" hebben; de
// formatters krijgen die boolean mee zodat beide varianten in copy staan.
const INSIGHT_COPY = {
    nl: {
        fileSuffix: (isOrg) => (isOrg ? 'organisatie-inzicht' : 'teaminzicht'),
        pill: (isOrg) => (isOrg ? 'ORGANISATIE-INZICHT' : 'TEAMINZICHT'),
        heroTitle: (isOrg) => (isOrg
            ? 'Dominante werkstijl in de organisatie:'
            : 'De grootste groep in dit team:'),
        headlineFallback: (isOrg, persona) =>
            `${isOrg ? 'De organisatie' : 'Het team'} werkt vanuit ${persona.toLowerCase()}.`,
        responses: (n) => `${n} respons${n === 1 ? '' : 'en'}`,
        reliability: { low: 'Indicatief', mid: 'Groeiend', high: 'Sterk beeld' },
        // Teamvariant: één schaal met Teamdynamiek (besluit 6, 22 okt 2026),
        // per niveau uit getConfidence() in src/insights.js.
        confidence: {
            low: 'Eerste signalen',
            emerging: 'Opkomend patroon',
            reliable: 'Betrouwbaar beeld',
            strong: 'Sterk patroon',
        },
        distributionEyebrow: 'VERDELING',
        mixEyebrow: (isOrg) => (isOrg ? 'ORGANISATIE-MIX' : 'JOUW TEAM-MIX'),
        roundingNote: 'Percentages zijn afgerond; de som ligt tussen 99 en 101%.',
        personCount: (n) => `${n} ${n === 1 ? 'persoon' : 'mensen'}`,
        signatureEyebrow: (isOrg) => (isOrg
            ? 'WAT DEZE ORGANISATIE IN BEWEGING BRENGT'
            : 'WAT DIT TEAM IN BEWEGING BRENGT'),
        signature: {
            none: (isOrg) => `${isOrg ? 'Een organisatie' : 'Een team'} in beweging.`,
            one: (isOrg, drive) =>
                `${drive} — daar bouwt ${isOrg ? 'deze organisatie' : 'dit team'} op.`,
            two: (isOrg, driveA, driveB) =>
                `${driveA} en ${driveB} — daar bouwt ${isOrg ? 'deze organisatie' : 'dit team'} op.`,
        },
        drives: {
            maker: 'maken', groeier: 'ontwikkeling', presteerder: 'resultaat',
            denker: 'diepgang', verbinder: 'verbinding', teamspeler: 'verbondenheid',
            zekerzoeker: 'stabiliteit', vernieuwer: 'vernieuwing',
        },
        leeglopersEyebrow: (isOrg) => (isOrg
            ? 'WAAR DE ORGANISATIE OP LEEGLOOPT'
            : 'CHECK IN HET KANTOOR'),
        leeglopers: {
            // Teamvariant: een vraag, geen bewering — de tool kent het kantoor niet.
            tooLittle: (label, isOrg) => (isOrg ? `Te weinig ${label}` : `Zijn er genoeg ${label}?`),
            tooMuch: (label, isOrg) => (isOrg ? `Te veel ${label}` : `Worden de ${label} echt gebruikt?`),
            tension: (label) => `Spanning tussen ${label}`,
            tensionPairs: {
                tempoZorgvuldigheid: 'tempo en zorgvuldigheid',
                resultaatVerbinding: 'resultaat en verbinding',
                vrijheidZekerheid: 'vrijheid en zekerheid',
                vernieuwingContinuiteit: 'vernieuwing en continuïteit',
                ontwikkelingStabiliteit: 'ontwikkeling en stabiliteit',
                loyaliteitAutonomie: 'loyaliteit en autonomie',
            },
            fallback: (isOrg) => (isOrg
                ? 'Werkplek die niet aansluit bij behoefte van de organisatie'
                : 'Werkplek die niet aansluit bij teambehoefte'),
        },
        seeBack: 'ZIE ACHTERKANT',
        workplacePill: 'JOUW IDEALE WERKPLEKMIX',
        workplaceTitle: (isOrg) => (isOrg
            ? 'Wat deze organisatie vraagt van de werkomgeving'
            : 'Wat dit team vraagt van de werkomgeving'),
        workplaceEyebrow: 'WERKPLEKBEHOEFTE',
        actionsEyebrow: (n) => `${n === 1 ? 'EÉN ACTIE' : n + ' ACTIES'} VOOR MORGEN`,
        sourceLabels: {
            werkstijlen: 'WAT DE WERKSTIJLEN VRAGEN',
            werkplek: 'WAT DE WERKPLEK VRAAGT',
            spanning: 'WAAR VRAAG EN AANBOD SCHUREN',
            minderheid: 'VOOR DE KLEINE GROEPEN',
            ontbrekend: 'WELKE WERKSTIJL ONTBREEKT',
            reflectie: 'ZELF AAN DE SLAG',
        },
        sourceFallback: 'REFLECTIE',
        footerQuote: '"Een organisatie die zichzelf herkent, beweegt sneller."',
        footerTagline: (isOrg) => (isOrg
            ? 'Helping organisations understand their workplace through insight, design and movement.'
            : 'TOF Persona · The Office Factory'),
    },
    en: {
        fileSuffix: (isOrg) => (isOrg ? 'organisation insight' : 'team insight'),
        pill: (isOrg) => (isOrg ? 'ORGANISATION INSIGHT' : 'TEAM INSIGHT'),
        heroTitle: (isOrg) => (isOrg
            ? 'Dominant working style in the organisation:'
            : 'The largest group in this team:'),
        headlineFallback: (isOrg, persona) =>
            `${isOrg ? 'The organisation' : 'The team'} works from ${persona.toLowerCase()}.`,
        responses: (n) => `${n} ${n === 1 ? 'response' : 'responses'}`,
        reliability: { low: 'Indicative', mid: 'Growing', high: 'Strong picture' },
        confidence: {
            low: 'First signals',
            emerging: 'Emerging pattern',
            reliable: 'Reliable picture',
            strong: 'Strong pattern',
        },
        distributionEyebrow: 'BREAKDOWN',
        mixEyebrow: (isOrg) => (isOrg ? 'ORGANISATION MIX' : 'YOUR TEAM MIX'),
        roundingNote: 'Percentages are rounded; the total sits between 99 and 101%.',
        personCount: (n) => `${n} ${n === 1 ? 'person' : 'people'}`,
        signatureEyebrow: (isOrg) => (isOrg
            ? 'WHAT GETS THIS ORGANISATION MOVING'
            : 'WHAT GETS THIS TEAM MOVING'),
        signature: {
            none: (isOrg) => `${isOrg ? 'An organisation' : 'A team'} in motion.`,
            one: (isOrg, drive) =>
                `${drive} — that is what ${isOrg ? 'this organisation' : 'this team'} builds on.`,
            two: (isOrg, driveA, driveB) =>
                `${driveA} and ${driveB} — that is what ${isOrg ? 'this organisation' : 'this team'} builds on.`,
        },
        drives: {
            maker: 'making', groeier: 'development', presteerder: 'results',
            denker: 'depth', verbinder: 'connection', teamspeler: 'togetherness',
            zekerzoeker: 'stability', vernieuwer: 'renewal',
        },
        leeglopersEyebrow: (isOrg) => (isOrg
            ? 'WHERE THE ORGANISATION DRAINS'
            : 'CHECK THE OFFICE'),
        leeglopers: {
            tooLittle: (label, isOrg) => (isOrg ? `Too little ${label}` : `Are there enough ${label}?`),
            tooMuch: (label, isOrg) => (isOrg ? `Too much ${label}` : `Are the ${label} actually used?`),
            tension: (label) => `Tension between ${label}`,
            tensionPairs: {
                tempoZorgvuldigheid: 'pace and care',
                resultaatVerbinding: 'results and connection',
                vrijheidZekerheid: 'freedom and certainty',
                vernieuwingContinuiteit: 'renewal and continuity',
                ontwikkelingStabiliteit: 'development and stability',
                loyaliteitAutonomie: 'loyalty and autonomy',
            },
            fallback: (isOrg) => (isOrg
                ? 'A workplace that does not match what the organisation needs'
                : 'A workplace that does not match what the team needs'),
        },
        seeBack: 'SEE REVERSE',
        workplacePill: 'YOUR IDEAL WORKPLACE MIX',
        workplaceTitle: (isOrg) => (isOrg
            ? 'What this organisation asks of the work environment'
            : 'What this team asks of the work environment'),
        workplaceEyebrow: 'WORKPLACE NEED',
        actionsEyebrow: (n) => `${n === 1 ? 'ONE ACTION' : n + ' ACTIONS'} FOR TOMORROW`,
        sourceLabels: {
            werkstijlen: 'WHAT THE WORKING STYLES ASK FOR',
            werkplek: 'WHAT THE WORKPLACE ASKS FOR',
            spanning: 'WHERE SUPPLY AND DEMAND RUB',
            minderheid: 'FOR THE SMALL GROUPS',
            ontbrekend: 'WHICH WORKING STYLE IS MISSING',
            reflectie: 'GET STARTED YOURSELF',
        },
        sourceFallback: 'REFLECTION',
        footerQuote: '"An organisation that recognises itself moves faster."',
        footerTagline: (isOrg) => (isOrg
            ? 'Helping organisations understand their workplace through insight, design and movement.'
            : 'TOF Persona · The Office Factory'),
    },
};

function getInsightCopy(lang) {
    return INSIGHT_COPY[lang] || INSIGHT_COPY.nl;
}

// =========================
// PUBLIC API
// =========================

export async function generateTeamInsightPDF({
    aggregate,
    insights,
    teamName = 'Team',
    organization = '',
    mode = 'team', // 'team' | 'organization'
    lang = 'nl',
}) {
    const c = getInsightCopy(lang);
    const svgVoorkant = buildVoorkantSVG({ aggregate, insights, teamName, organization, mode, c, lang });
    const svgAchterkant = buildAchterkantSVG({ aggregate, insights, teamName, organization, mode, c, lang });

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
        const suffix = c.fileSuffix(mode === 'organization');
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

function buildVoorkantSVG({ aggregate, insights, teamName, organization, mode = 'team', c, lang }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawHeader({ svg, y, teamName, organization, aggregate, mode, c, lang });
    y += 12;
    y = drawHero({ svg, y, aggregate, insights, mode, c, lang });
    y += 12;
    y = drawDivider({ svg, y });
    y += 10;
    y = drawDistributionAndMix({ svg, y, aggregate, mode, c, lang });
    y += 10;
    y = drawDivider({ svg, y });
    y += 10;
    drawSignature({ svg, y, aggregate, insights, mode, c, lang });

    drawFooterHint({ svg, c });

    return svg;
}

// =========================
// SVG BUILDER — ACHTERKANT
// =========================

function buildAchterkantSVG({ aggregate, insights, teamName, organization, mode = 'team', c, lang }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawAchterkantHeader({ svg, y, c });
    y += 10;
    y = drawAchterkantTitle({ svg, y, mode, c });
    y += 8;
    // Teamvariant: minder witruimte rond de scheidingslijnen en "Check in het
    // kantoor", zodat er na de ruimere regelafstand nog vijf acties passen.
    // De organisatievariant houdt zijn oude maten.
    const isOrg = mode === 'organization';
    const blokRuimte = isOrg ? 8 : 5;

    y = drawWorkplaceCompact({ svg, y, aggregate, c, lang });
    y += blokRuimte;
    y = drawDivider({ svg, y });
    y += blokRuimte;
    // "Waar het team op leegloopt" verhuist van pagina 1 naar hier: het
    // hoort thematisch bij de werkplekbehoefte (vraag → spanning → actie)
    // en vult de voorheen lege onderhelft van pagina 2, terwijl pagina 1
    // lucht krijgt onder de team-mix.
    y = drawLeeglopers({ svg, y, insights, mode, c });
    y += blokRuimte;
    y = drawDivider({ svg, y });
    y += blokRuimte;
    drawQuickWinsCompact({ svg, y, insights, c });

    drawAchterkantFooter({ svg, mode, c });

    return svg;
}

// =========================
// SECTIES — VOORKANT
// =========================

function drawHeader({ svg, y, teamName, organization, aggregate, mode = 'team', c = getInsightCopy('nl'), lang = 'nl' }) {
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
        text: c.pill(mode === 'organization'),
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

    const dateText = formatPdfDate(new Date(), lang);
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

function drawHero({ svg, y, aggregate, insights, mode = 'team', c = getInsightCopy('nl'), lang = 'nl' }) {
    const isOrg = mode === 'organization';
    // Gebruik personasByPrimary (= sortering op aantal mensen primair),
    // niet sortedPersonas (= gewogen energie-sortering). Anders kan de
    // "dominante werkstijl" iets anders aanwijzen dan het hoogste
    // percentage in de verdelingstabel — dat leest als bug.
    const top = aggregate?.personasByPrimary?.[0] || aggregate?.sortedPersonas?.[0];
    if (!top) return y;

    const teamCount = aggregate?.teamCount || 0;
    const personaColor = PERSONA_COLORS[top.id] || COLOR.text;
    // Canonieke persona-naam (taalvast) i.p.v. top.name uit de aggregatie.
    const topName = getArchetypeName(top.id, lang) || top.name;

    const fontSize = 16;
    const lineH = 18;

    const titleY = y + 22;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: c.heroTitle(isOrg),
        font: 'Playfair Display',
        weight: 500,
        size: fontSize,
        color: COLOR.text,
    }));

    const line2Y = titleY + lineH;
    svg.appendChild(createText({
        x: MARGIN,
        y: line2Y,
        text: topName,
        font: 'Playfair Display',
        weight: 500,
        size: fontSize,
        color: personaColor,
        italic: true,
    }));

    const subY = line2Y + 14;
    const headline = insights?.headline || c.headlineFallback(isOrg, topName);
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
    const reliability = buildReliabilityLabel(teamCount, c, isOrg);
    const metaLine = `${c.responses(teamCount)}${reliability ? ' · ' + reliability : ''}`;
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

function drawDistributionAndMix({ svg, y, aggregate, mode = 'team', c = getInsightCopy('nl'), lang = 'nl' }) {
    const isOrg = mode === 'organization';
    // Org-mode heeft veel meer regels → kleinere tekst zodat het past.
    const nameFontSize = isOrg ? 4 : 5.2;
    const nameLineH = isOrg ? 5 : 7;
    const totalWidth = PAGE_W - MARGIN * 2;
    const gap = 24;
    // Teamvariant heeft geen mix-kolom: de verdeling krijgt de volle breedte.
    const colWidth = isOrg ? (totalWidth - gap) / 2 : totalWidth;
    const colLeftX = MARGIN;
    const colRightX = MARGIN + colWidth + gap;

    svg.appendChild(createText({
        x: colLeftX,
        y: y + 6,
        text: c.distributionEyebrow,
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    // De mix met aantallen mensen alleen in de organisatievariant: binnen een
    // team wijst "1 persoon" iemand aan.
    if (isOrg) svg.appendChild(createText({
        x: colRightX,
        y: y + 6,
        text: c.mixEyebrow(isOrg),
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
            text: getArchetypeName(id, lang) || p.name,
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

    // Afrondingsnoot: de verdeling rondt af op hele procenten, dus de
    // kolom telt niet altijd exact op tot 100% (org-rapport doet dit ook).
    svg.appendChild(createText({
        x: colLeftX,
        y: lineY + 2,
        text: c.roundingNote,
        font: 'Inter',
        weight: 400,
        size: 4.4,
        color: COLOR.textMuted,
    }));
    lineY += 8;

    if (!isOrg) return lineY;

    // Alle primair-aanwezige archetypes tonen, gesorteerd op aantal
    // mensen primair (= personasByPrimary). Eerder werd sortedPersonas
    // (energie) gebruikt — daardoor stond bv. Denker met 1 persoon
    // boven Groeier met 4 als hun energie hoger lag. Verwarrend.
    const topPresent = aggregate?.personasByPrimary || [];

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
            text: getArchetypeName(p.id, lang) || p.name,
            font: 'Playfair Display',
            weight: 500,
            size: 7.2,
            color: color,
        }));

        // Geen namen: alleen de werkstijl en het aantal mensen erachter.
        // Zie utils/access.js onder "NAMEN IN HET TEAMBEELD".
        const countText = c.personCount(p.count);
        svg.appendChild(createText({
            x: xPos,
            y: curY + 8,
            text: countText,
            font: 'Inter',
            weight: 400,
            size: nameFontSize,
            color: COLOR.textSoft,
        }));

        const advance = 8 + nameLineH + 6;
        if (inLeftSubCol) mixY1 += advance;
        else mixY2 += advance;
    });

    return Math.max(lineY, mixY1, mixY2);
}

function drawSignature({ svg, y, aggregate, insights, mode = 'team', c = getInsightCopy('nl'), lang = 'nl' }) {
    const isOrg = mode === 'organization';
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: c.signatureEyebrow(isOrg),
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const signatureSentence = buildSignatureSentence(aggregate, mode, c, lang);

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

function buildSignatureSentence(aggregate, mode = 'team', c = getInsightCopy('nl'), lang = 'nl') {
    // Volg dezelfde sortering als hero en mix: aantal mensen primair,
    // niet gewogen energie. Zo blijft het hele PDF-verhaal coherent.
    const top = aggregate?.personasByPrimary || [];
    const isOrg = mode === 'organization';
    const driveFor = (p) =>
        c.drives[p.id] || String(getArchetypeName(p.id, lang) || p.name || '').toLowerCase();

    if (top.length === 0) return c.signature.none(isOrg);
    if (top.length === 1) return c.signature.one(isOrg, capitalize(driveFor(top[0])));
    return c.signature.two(isOrg, capitalize(driveFor(top[0])), driveFor(top[1]));
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function drawLeeglopers({ svg, y, insights, mode = 'team', c = getInsightCopy('nl') }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: c.leeglopersEyebrow(mode === 'organization'),
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const leeglopers = buildLeeglopers(insights, mode, c);
    const isOrg = mode === 'organization';

    let lineY = y + (isOrg ? 16 : 15);
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

        lineY += 9;
    });

    // Teamvariant: minder lucht onder de laatste regel.
    return isOrg ? lineY : lineY - 4;
}

function drawFooterHint({ svg, c = getInsightCopy('nl') }) {
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: PAGE_H - 12,
        text: c.seeBack,
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

function drawAchterkantHeader({ svg, y, c = INSIGHT_COPY.nl }) {
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
        text: c.workplacePill,
        font: 'Inter',
        weight: 700,
        size: 5.2,
        color: '#FFFFFF',
        letterSpacing: 0.6,
    }));

    drawTOFMark(svg, PAGE_W - MARGIN - 12, y + 2, 10);

    return y + pillH;
}

function drawAchterkantTitle({ svg, y, mode = 'team', c = INSIGHT_COPY.nl }) {
    const titleY = y + 16;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: c.workplaceTitle(mode === 'organization'),
        font: 'Playfair Display',
        weight: 500,
        size: 12,
        color: COLOR.text,
    }));
    return titleY;
}

function drawWorkplaceCompact({ svg, y, aggregate, c = INSIGHT_COPY.nl, lang = 'nl' }) {
    // Zelfde opbouw als het Werkplek-paneel: de sterkste behoefte groot, dan
    // de overige kern- en steunplekken in twee kolommen, dan één regel met wat
    // beperkt nodig is. Geen percentages, geen balkjes.
    const profiel = buildWerkplekProfiel(aantallenUitAggregate(aggregate));
    if (!profiel.heeftData || profiel.typen.length === 0) return y;

    const wp = getCopy(lang).workplaceProfile;
    const typeLabel = (t) => wp?.types?.[t.id]?.label || t.label;
    const plekkenVoor = (t) => wp?.types?.[t.id]?.voorbeeldplekken || t.voorbeeldplekken || [];
    const bandLabel = (band) => String(wp?.band?.[band]?.label || band).toUpperCase();

    const [hero, ...overige] = profiel.typen;
    const secundair = overige.filter((t) => t.band !== BAND.AANVULLEND);
    const beperkt = overige.filter((t) => t.band === BAND.AANVULLEND);

    const totalWidth = PAGE_W - MARGIN * 2;
    const plekSize = 3.8;
    // Regelstap 1,35 × de lettergrootte (Judith, 22 okt 2026: "staat soms erg dicht op elkaar").
    const plekLineH = 5.1;

    // Kleine "soort plek"-regel onder een type. Volledig uitgeschreven; past
    // het niet op één regel, dan zakt het netjes naar de volgende regel.
    function drawPlekken(type, x, startY, w) {
        const plekken = plekkenVoor(type);
        if (plekken.length === 0) return startY;
        const lines = wrapText(plekken.slice(0, 3).join(' · '), w, plekSize, 'Inter');
        lines.forEach((line, i) => {
            svg.appendChild(createText({
                x,
                y: startY + i * plekLineH,
                text: line,
                font: 'Inter',
                weight: 400,
                size: plekSize,
                color: COLOR.textMuted,
            }));
        });
        return startY + lines.length * plekLineH;
    }

    // ── Sterkste behoefte ──
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 8,
        text: String(wp?.ui?.heroEyebrow || c.workplaceEyebrow).toUpperCase(),
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));
    svg.appendChild(createText({
        x: MARGIN + totalWidth,
        y: y + 8,
        text: bandLabel(hero.band),
        font: 'Inter',
        weight: 700,
        size: 4.2,
        color: hero.band === BAND.AANVULLEND ? COLOR.textMuted : COLOR.sage,
        letterSpacing: 0.8,
        anchor: 'end',
    }));
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 20,
        text: typeLabel(hero),
        font: 'Playfair Display',
        weight: 500,
        size: 12,
        color: COLOR.sage,
    }));
    let lineY = drawPlekken(hero, MARGIN, y + 26.4, totalWidth);

    // ── Overige kern- en steunplekken, op volgorde ──
    if (secundair.length > 0) {
        lineY += 6;
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY,
            text: String(wp?.ui?.overzichtKop || '').toUpperCase(),
            font: 'Inter',
            weight: 700,
            size: 4.2,
            color: COLOR.textMuted,
            letterSpacing: 0.8,
        }));

        const gap = 16;
        const colWidth = (totalWidth - gap) / 2;
        const startY = lineY + 9;
        const half = Math.ceil(secundair.length / 2);

        const drawColumn = (items, x) => {
            let colY = startY;
            items.forEach((type) => {
                svg.appendChild(createText({
                    x,
                    y: colY,
                    text: typeLabel(type),
                    font: 'Inter',
                    weight: 500,
                    size: 5.6,
                    color: COLOR.text,
                }));
                svg.appendChild(createText({
                    x: x + colWidth,
                    y: colY,
                    text: bandLabel(type.band),
                    font: 'Inter',
                    weight: 700,
                    size: 3.8,
                    color: COLOR.sage,
                    letterSpacing: 0.6,
                    anchor: 'end',
                }));
                colY = drawPlekken(type, x, colY + 5.4, colWidth) + 4.5;
            });
            return colY;
        };

        lineY = Math.max(
            drawColumn(secundair.slice(0, half), MARGIN),
            drawColumn(secundair.slice(half), MARGIN + colWidth + gap)
        );
    }

    // ── Beperkt nodig ──
    if (beperkt.length > 0) {
        lineY += 4;
        svg.appendChild(createText({
            x: MARGIN,
            y: lineY,
            text: String(wp?.band?.aanvullend?.kort || '').toUpperCase(),
            font: 'Inter',
            weight: 700,
            size: 4.2,
            color: COLOR.textMuted,
            letterSpacing: 0.8,
        }));
        const lines = wrapText(beperkt.map(typeLabel).join(' · '), totalWidth, 5, 'Inter');
        lines.forEach((line, i) => {
            svg.appendChild(createText({
                x: MARGIN,
                y: lineY + 8 + i * 7,
                text: line,
                font: 'Inter',
                weight: 400,
                size: 5,
                color: COLOR.textSoft,
            }));
        });
        lineY += 8 + (lines.length - 1) * 7;
    }

    return lineY;
}

function drawQuickWinsCompact({ svg, y, insights, c = INSIGHT_COPY.nl }) {
    const wins = insights?.quickWins || [];
    if (wins.length === 0) return y;

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 8,
        text: c.actionsEyebrow(wins.length),
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    let lineY = y + 16;
    const numberColW = 16;
    const usableW = PAGE_W - MARGIN * 2 - numberColW;

    wins.forEach((win, index) => {
        const item = typeof win === 'string'
            ? { source: 'reflectie', action: win }
            : win;
        const label = c.sourceLabels[item.source] || c.sourceFallback;

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
                y: lineY + 6 + i * 7.8,
                text: line,
                font: 'Inter',
                weight: 400,
                size: 5.6,
                color: COLOR.text,
            }));
        });

        lineY += 6 + actionLines.length * 7.8 + 4;
    });

    return lineY;
}

function drawAchterkantFooter({ svg, mode = 'team', c = INSIGHT_COPY.nl }) {
    // Footer compacter en lager geplaatst zodat hij niet overlapt met de
    // quick-wins erboven. Blok loopt van quote (PAGE_H-40) tot tagline
    // (PAGE_H-14), dus ~26mm hoog met nog 14mm marge tot de onderrand.
    const isOrg = mode === 'organization';
    // Teamvariant: 6 mm lager (geen quote erboven), meer ruimte voor de acties.
    const footerY = PAGE_H - (isOrg ? 40 : 34);

    // Quote alleen in het organisatie-rapport; in de team-insight PDF
    // liep hij door de quick-wins-tekst erboven heen.
    if (isOrg) {
        svg.appendChild(createText({
            x: PAGE_W / 2,
            y: footerY,
            text: c.footerQuote,
            font: 'Playfair Display',
            weight: 500,
            size: 6.4,
            color: COLOR.textSoft,
            anchor: 'middle',
            italic: true,
        }));
    }

    const logoSize = 13;
    drawTOFMark(svg, PAGE_W / 2 - logoSize / 2, footerY + 7, logoSize);

    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY + 26,
        text: c.footerTagline(isOrg),
        font: 'Inter',
        weight: 400,
        size: 4.6,
        color: COLOR.textMuted,
        anchor: 'middle',
    }));
}

// =========================
// LEEGLOPER LOGICA
// =========================

function buildLeeglopers(insights, mode = 'team', c = INSIGHT_COPY.nl) {
    const t = insights?.workplaceTension || {};
    const lg = c.leeglopers;
    const isOrg = mode === 'organization';
    const out = [];

    if (t.underserved && t.underserved.length > 0) {
        out.push(lg.tooLittle(t.underserved[0].label.toLowerCase(), isOrg));
    }

    if (t.oversupplied && t.oversupplied.length > 0) {
        out.push(lg.tooMuch(t.oversupplied[0].label.toLowerCase(), isOrg));
    }

    // Teamvariant: alleen de twee vragen. Geen spanningsregel (eigen paren die
    // Teamdynamiek tegenspreken, en die horen bij het deel voor de
    // leidinggevende) en geen opvulregel (ook een bewering over het kantoor).
    if (!isOrg) return out;

    const personas = [
        ...(t.impactSummary?.dominant || []),
        ...(t.impactSummary?.middle || []),
    ];
    const personaIds = personas.map((p) => p.id);

    const TENSION_PAIRS = [
        ['presteerder', 'denker', 'tempoZorgvuldigheid'],
        ['presteerder', 'verbinder', 'resultaatVerbinding'],
        ['maker', 'zekerzoeker', 'vrijheidZekerheid'],
        ['vernieuwer', 'zekerzoeker', 'vernieuwingContinuiteit'],
        ['groeier', 'zekerzoeker', 'ontwikkelingStabiliteit'],
        ['teamspeler', 'maker', 'loyaliteitAutonomie'],
    ];

    for (const [a, b, pairKey] of TENSION_PAIRS) {
        if (personaIds.includes(a) && personaIds.includes(b)) {
            out.push(lg.tension(lg.tensionPairs[pairKey]));
            break;
        }
    }

    while (out.length < 3) {
        out.push(lg.fallback(mode === 'organization'));
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

// Teamvariant: de schaal van getConfidence() (5–15 opkomend, 16–30
// betrouwbaar, meer dan 30 sterk). De organisatievariant houdt zijn oude
// drempels tot daar apart over besloten is.
function buildReliabilityLabel(count, c = INSIGHT_COPY.nl, isOrg = false) {
    if (count === null || count === undefined) return '';
    if (!isOrg) return c.confidence[getConfidence(count).level] || '';
    if (count < 3) return c.reliability.low;
    if (count < 6) return c.reliability.mid;
    return c.reliability.high;
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
    buildReliabilityLabel,
    drawDivider,
    drawAchterkantHeader,
    buildLeeglopers,
};