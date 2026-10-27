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
import { dominantPersonas } from './TeamAggregation';

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
const INSIGHT_COPY = {
    nl: {
        fileSuffix: 'teaminzicht',
        pill: 'TEAMINZICHT',
        heroTitle: 'De grootste groep in dit team:',
        headlineFallback: (persona) => `Het team werkt vanuit ${persona.toLowerCase()}.`,
        responses: (n) => `${n} ${n === 1 ? 'ingevuld profiel' : 'ingevulde profielen'}`,
        // Eén schaal met Teamdynamiek (besluit 6, 22 okt 2026), per niveau
        // uit getConfidence() in src/insights.js.
        confidence: {
            low: 'Eerste signalen',
            emerging: 'Opkomend patroon',
            reliable: 'Betrouwbaar beeld',
            strong: 'Sterk patroon',
        },
        distributionEyebrow: 'VERDELING',
        signatureEyebrow: 'WAT DIT TEAM IN BEWEGING BRENGT',
        signature: {
            none: 'Een team in beweging.',
            one: (drive) => `${drive} — daar bouwt dit team op.`,
            two: (driveA, driveB) => `${driveA} en ${driveB} — daar bouwt dit team op.`,
        },
        drives: {
            maker: 'creatie', groeier: 'ontwikkeling', presteerder: 'resultaat',
            denker: 'diepgang', verbinder: 'verbinding', teamspeler: 'vertrouwen',
            zekerzoeker: 'stabiliteit', vernieuwer: 'vernieuwing',
        },
        leeglopersEyebrow: 'CHECK IN HET KANTOOR',
        leeglopers: {
            // Een vraag, geen bewering — de tool kent het kantoor niet.
            tooLittle: (label) => `Zijn er genoeg ${label}?`,
            tooMuch: (label) => `Worden de ${label} echt gebruikt?`,
        },
        seeBack: 'ZIE ACHTERKANT',
        workplacePill: 'WERKPLEK',
        workplaceTitle: 'Wat dit team vraagt van de werkomgeving',
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
        sourceFallback: 'ZELF AAN DE SLAG',
        footerTagline: 'TOF Persona · The Office Factory',
    },
    en: {
        fileSuffix: 'team insight',
        pill: 'TEAM INSIGHT',
        heroTitle: 'The largest group in this team:',
        headlineFallback: (persona) => `The team works from ${persona.toLowerCase()}.`,
        responses: (n) => `${n} completed ${n === 1 ? 'profile' : 'profiles'}`,
        confidence: {
            low: 'First signals',
            emerging: 'Emerging pattern',
            reliable: 'Reliable picture',
            strong: 'Strong pattern',
        },
        distributionEyebrow: 'BREAKDOWN',
        signatureEyebrow: 'WHAT GETS THIS TEAM MOVING',
        signature: {
            none: 'A team in motion.',
            one: (drive) => `${drive} — that is what this team builds on.`,
            two: (driveA, driveB) => `${driveA} and ${driveB} — that is what this team builds on.`,
        },
        drives: {
            maker: 'creation', groeier: 'development', presteerder: 'results',
            denker: 'depth', verbinder: 'connection', teamspeler: 'trust',
            zekerzoeker: 'stability', vernieuwer: 'renewal',
        },
        leeglopersEyebrow: 'CHECK THE OFFICE',
        leeglopers: {
            tooLittle: (label) => `Are there enough ${label}?`,
            tooMuch: (label) => `Are the ${label} actually used?`,
        },
        seeBack: 'SEE REVERSE',
        workplacePill: 'WORKPLACE',
        workplaceTitle: 'What this team asks of the work environment',
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
        sourceFallback: 'GET STARTED YOURSELF',
        footerTagline: 'TOF Persona · The Office Factory',
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
    lang = 'nl',
}) {
    const c = getInsightCopy(lang);
    const svgVoorkant = buildVoorkantSVG({ aggregate, insights, teamName, organization, c, lang });
    const svgAchterkant = buildAchterkantSVG({ aggregate, insights, c, lang });

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
        const fileName = `${safeName} - ${c.fileSuffix} TOF.pdf`;
        pdf.save(fileName);
    } finally {
        document.body.removeChild(svgVoorkant);
        document.body.removeChild(svgAchterkant);
    }
}

// =========================
// SVG BUILDER — VOORKANT
// =========================

function buildVoorkantSVG({ aggregate, insights, teamName, organization, c, lang }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawHeader({ svg, y, teamName, organization, c, lang });
    y += 12;
    y = drawHero({ svg, y, aggregate, insights, c, lang });
    y += 12;
    y = drawDivider({ svg, y });
    y += 10;
    y = drawDistribution({ svg, y, aggregate, lang, c });
    y += 10;
    y = drawDivider({ svg, y });
    y += 10;
    drawSignature({ svg, y, aggregate, c, lang });

    drawFooterHint({ svg, c });

    return svg;
}

// =========================
// SVG BUILDER — ACHTERKANT
// =========================

function buildAchterkantSVG({ aggregate, insights, c, lang }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;

    y = drawAchterkantHeader({ svg, y, c });
    y += 10;
    y = drawAchterkantTitle({ svg, y, c });
    y += 8;
    // Weinig witruimte rond de scheidingslijnen en "Check in het kantoor",
    // zodat er na de ruimere regelafstand nog vijf acties passen.
    const blokRuimte = 5;

    y = drawWorkplaceCompact({ svg, y, aggregate, c, lang });
    y += blokRuimte;
    y = drawDivider({ svg, y });
    y += blokRuimte;
    // "Waar het team op leegloopt" verhuist van pagina 1 naar hier: het
    // hoort thematisch bij de werkplekbehoefte (vraag → spanning → actie)
    // en vult de voorheen lege onderhelft van pagina 2, terwijl pagina 1
    // lucht krijgt onder de team-mix.
    y = drawLeeglopers({ svg, y, insights, c });
    y += blokRuimte;
    y = drawDivider({ svg, y });
    y += blokRuimte;
    drawQuickWinsCompact({ svg, y, insights, c });

    drawAchterkantFooter({ svg, c });

    return svg;
}

// =========================
// SECTIES — VOORKANT
// =========================

function drawHeader({ svg, y, teamName, organization, c = getInsightCopy('nl'), lang = 'nl' }) {
    const pillW = 80;
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
        text: c.pill,
        font: 'Inter',
        weight: 700,
        size: 5.2,
        color: '#FFFFFF',
        letterSpacing: 0.6,
    }));

    drawTOFMark(svg, PAGE_W - MARGIN - 12, pillY + 2, 10);

    const metaY = pillY + pillH + 16;
    // Organisatie en team gelijk (zoals "Demo · Demo")? Dan maar één keer.
    const sameName = String(teamName || '').trim().toLowerCase()
        === String(organization || '').trim().toLowerCase();
    const metaText = `${teamName}${organization && !sameName ? ' · ' + organization : ''}`;
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

function drawHero({ svg, y, aggregate, insights, c = getInsightCopy('nl'), lang = 'nl' }) {
    // Gebruik personasByPrimary (= sortering op aantal mensen primair),
    // niet sortedPersonas (= gewogen energie-sortering). Anders kan de
    // "dominante werkstijl" iets anders aanwijzen dan het hoogste
    // percentage in de verdelingstabel — dat leest als bug.
    // De dominant-functie (besluit 4) — bij een gelijke stand beide namen.
    const dominant = dominantPersonas(aggregate);
    const top = dominant[0] || aggregate?.personasByPrimary?.[0] || aggregate?.sortedPersonas?.[0];
    if (!top) return y;

    const teamCount = aggregate?.teamCount || 0;
    const personaColor = PERSONA_COLORS[top.id] || COLOR.text;
    // Canonieke persona-naam (taalvast) i.p.v. top.name uit de aggregatie.
    const nameOf = (p) => getArchetypeName(p.id, lang) || p.name;
    const topName = dominant.length > 1
        ? getCopy(lang).teamPanels.names.join(dominant.map(nameOf))
        : nameOf(top);

    const fontSize = 16;
    const lineH = 18;

    const titleY = y + 22;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: c.heroTitle,
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
    const headline = insights?.headline || c.headlineFallback(topName);
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
    const reliability = buildReliabilityLabel(teamCount, c);
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

function drawDistribution({ svg, y, aggregate, c = getInsightCopy('nl'), lang = 'nl' }) {
    // De verdeling over de volle breedte. Geen aantallen mensen per
    // werkstijl: in een team wijst "1 persoon" iemand aan.
    const colWidth = PAGE_W - MARGIN * 2;
    const colLeftX = MARGIN;

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

    return lineY;
}

function drawSignature({ svg, y, aggregate, c = getInsightCopy('nl'), lang = 'nl' }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: c.signatureEyebrow,
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const signatureSentence = buildSignatureSentence(aggregate, c, lang);

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

function buildSignatureSentence(aggregate, c = getInsightCopy('nl'), lang = 'nl') {
    // Volg dezelfde sortering als hero en mix: aantal mensen primair,
    // niet gewogen energie. Zo blijft het hele PDF-verhaal coherent.
    const top = aggregate?.personasByPrimary || [];
    const driveFor = (p) =>
        c.drives[p.id] || String(getArchetypeName(p.id, lang) || p.name || '').toLowerCase();

    if (top.length === 0) return c.signature.none;
    if (top.length === 1) return c.signature.one(capitalize(driveFor(top[0])));
    return c.signature.two(capitalize(driveFor(top[0])), driveFor(top[1]));
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

function drawLeeglopers({ svg, y, insights, c = getInsightCopy('nl') }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: c.leeglopersEyebrow,
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const leeglopers = buildLeeglopers(insights, c);

    let lineY = y + 15;
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

    // Weinig lucht onder de laatste regel.
    return lineY - 4;
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
    // Even breed als de pil op de voorkant (drawHeader).
    const pillW = 80;
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

function drawAchterkantTitle({ svg, y, c = INSIGHT_COPY.nl }) {
    const titleY = y + 16;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: c.workplaceTitle,
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
    const plekkenVoor = (t) => wp?.types?.[t.id]?.voorbeeldplekken || [];
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

// Teamvariant: hoogstens vijf acties, de eerste vijf in de bestaande
// volgorde — meer past niet altijd op de achterkant. Het scherm en de
// organisatievariant tonen ze allemaal.
const MAX_TEAM_ACTIONS = 5;

function drawQuickWinsCompact({ svg, y, insights, c = INSIGHT_COPY.nl }) {
    const allWins = insights?.quickWins || [];
    const wins = allWins.slice(0, MAX_TEAM_ACTIONS);
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

function drawAchterkantFooter({ svg, c = INSIGHT_COPY.nl }) {
    // Beeldmerk en slotregel onderaan, laag genoeg om de acties erboven
    // de ruimte te laten.
    const footerY = PAGE_H - 34;

    const logoSize = 13;
    drawTOFMark(svg, PAGE_W / 2 - logoSize / 2, footerY + 7, logoSize);

    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY + 26,
        text: c.footerTagline,
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

function buildLeeglopers(insights, c = INSIGHT_COPY.nl) {
    // Alleen de twee vragen. Geen spanningsregel (eigen paren die
    // Teamdynamiek tegenspreken, en die horen bij het deel voor de
    // leidinggevende) en geen opvulregel (ook een bewering over het kantoor).
    const t = insights?.workplaceTension || {};
    const lg = c.leeglopers;
    const out = [];

    if (t.underserved && t.underserved.length > 0) {
        out.push(lg.tooLittle(t.underserved[0].label.toLowerCase()));
    }

    if (t.oversupplied && t.oversupplied.length > 0) {
        out.push(lg.tooMuch(t.oversupplied[0].label.toLowerCase()));
    }

    return out;
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

// De schaal van getConfidence() (5–15 opkomend, 16–30 betrouwbaar, meer
// dan 30 sterk), dezelfde als op het scherm en in Teamdynamiek.
function buildReliabilityLabel(count, c = INSIGHT_COPY.nl) {
    if (count === null || count === undefined) return '';
    return c.confidence[getConfidence(count).level] || '';
}

// =========================
// GEDEELD — het beeldmerk wordt ook gebruikt door het Organisatielandschap
// (organisatieLandschap/OL_Cover.jsx en OL_Chrome.jsx).
// =========================
export { drawTOFMark };
