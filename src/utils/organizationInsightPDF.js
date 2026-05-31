/**
 * organizationInsightPDF.js
 *
 * Variant C — "Comparatief landschap"
 * A3 portrait, 2 pagina's. Heatmap van archetypen × teams als hoofdvisual.
 * Familie van team-PDF (kleur, font, marge, TOF-mark), maar duidelijk anders
 * van structuur en tone-of-voice voor bestuurder/directie.
 *
 * Output: <Org> - organisatie-landschap TOF.pdf
 */

import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { setupTofFonts } from './tofPdfBrand';
import {
    PDF_PAGE_W as PAGE_W,
    PDF_PAGE_H as PAGE_H,
    PDF_MARGIN as MARGIN,
    PDF_COLOR as COLOR,
    PDF_PERSONA_COLORS as PERSONA_COLORS,
    createSVGCanvas,
    createRect,
    createCircle,
    createText,
    drawTOFMark,
    drawWrappedText,
    wrapText,
    buildReliabilityLabel,
    drawDivider,
    buildLeeglopers,
} from './teamInsightPDF';

const ARCHETYPE_ORDER = ['maker', 'groeier', 'presteerder', 'denker', 'verbinder', 'teamspeler', 'zekerzoeker', 'vernieuwer'];
const ARCHETYPE_NAME = {
    maker: 'Maker',
    groeier: 'Groeier',
    presteerder: 'Presteerder',
    denker: 'Denker',
    verbinder: 'Verbinder',
    teamspeler: 'Teamspeler',
    zekerzoeker: 'Zekerzoeker',
    vernieuwer: 'Vernieuwer',
};

// =========================
// PUBLIC API
// =========================

export async function generateOrganizationInsightPDF({
    aggregate,
    insights,
    teamSummaries = [],
    organizationName = 'Organisatie',
    observations = [],
}) {
    const svgVoorkant = buildVoorkantSVG({ aggregate, insights, organizationName, teamSummaries });
    const svgAchterkant = buildAchterkantSVG({ aggregate, insights, organizationName, teamSummaries, observations });

    document.body.appendChild(svgVoorkant);
    document.body.appendChild(svgAchterkant);

    try {
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a3', compress: true });
        setupTofFonts(pdf);

        await svg2pdf(svgVoorkant, pdf, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });
        pdf.addPage('a3', 'portrait');
        await svg2pdf(svgAchterkant, pdf, { x: 0, y: 0, width: PAGE_W, height: PAGE_H });

        const safeName = (organizationName || 'organisatie')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .slice(0, 50);
        pdf.save(`${safeName} - organisatie-landschap TOF.pdf`);
    } finally {
        document.body.removeChild(svgVoorkant);
        document.body.removeChild(svgAchterkant);
    }
}

// =========================
// VOORKANT
// =========================

function buildVoorkantSVG({ aggregate, insights, organizationName, teamSummaries }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    // Splits: teams met respons (in heatmap) vs nog geen respons (footnote).
    const activeTeams = teamSummaries.filter((t) => (t.responseCount || 0) > 0);
    const inactiveTeams = teamSummaries.filter((t) => (t.responseCount || 0) === 0);

    let y = MARGIN;
    y = drawHeader({ svg, y, organizationName, aggregate, teamSummaries });
    y += 14;
    y = drawHero({ svg, y, aggregate });
    y += 12;
    y = drawDivider({ svg, y });
    y += 10;
    y = drawHeatmap({ svg, y, aggregate, teamSummaries: activeTeams });
    if (inactiveTeams.length > 0) {
        y += 6;
        y = drawInactiveNote({ svg, y, inactiveTeams });
    }
    y += 8;
    y = drawDivider({ svg, y });
    y += 10;
    drawOrgMixStrip({ svg, y, aggregate });

    return svg;
}

function drawInactiveNote({ svg, y, inactiveTeams }) {
    const names = inactiveTeams.map((t) => t?.team?.team || '—').join(', ');
    const text = `Nog geen respons: ${names}`;
    const endY = drawWrappedText({
        svg,
        x: MARGIN,
        y: y + 5,
        maxWidth: PAGE_W - 2 * MARGIN,
        text,
        font: 'Inter',
        weight: 400,
        size: 4.6,
        color: COLOR.textMuted,
        italic: true,
        lineHeight: 6,
    });
    return endY;
}

function drawHeader({ svg, y, organizationName, aggregate, teamSummaries }) {
    // Sage kader — duidelijk "organisatie-niveau" maar lichter dan een gevulde pill.
    const ACCENT = '#7A8F77';
    const pillW = 130;
    const pillH = 14;
    const pill = createRect(MARGIN, y, pillW, pillH, COLOR.surface || '#FFFFFF');
    pill.setAttribute('stroke', ACCENT);
    pill.setAttribute('stroke-width', '0.8');
    svg.appendChild(pill);
    svg.appendChild(createText({
        x: MARGIN + pillW / 2,
        y: y + 9.5,
        text: 'ORGANISATIE-LANDSCHAP',
        font: 'Inter',
        weight: 700,
        size: 6,
        color: ACCENT,
        anchor: 'middle',
        letterSpacing: 1.4,
    }));

    // Datum rechts
    const datum = new Date().toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: y + 9.5,
        text: datum,
        font: 'Inter',
        weight: 400,
        size: 6,
        color: COLOR.textMuted,
        anchor: 'end',
    }));

    // Meta-regel
    const respCount = aggregate?.teamCount || 0;
    const teamCount = teamSummaries.length;
    const meta = `${organizationName} · ${teamCount} ${teamCount === 1 ? 'team' : 'teams'} · ${respCount} ${respCount === 1 ? 'respons' : 'respondenten'}`;
    svg.appendChild(createText({
        x: MARGIN,
        y: y + pillH + 10,
        text: meta,
        font: 'Inter',
        weight: 500,
        size: 6.5,
        color: COLOR.text,
    }));

    return y + pillH + 10;
}

function drawHero({ svg, y, aggregate }) {
    const top = (aggregate?.personasByPrimary || [])[0];
    const subject = top
        ? `Een landschap van werkstijlen.`
        : `Een organisatie in beweging.`;

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 14,
        text: 'Patronen tussen teams.',
        font: 'Playfair Display',
        weight: 500,
        size: 22,
        color: COLOR.text,
    }));

    svg.appendChild(createText({
        x: MARGIN,
        y: y + 28,
        text: subject,
        font: 'Playfair Display',
        weight: 400,
        size: 13,
        color: COLOR.textSoft,
        italic: true,
    }));

    return y + 32;
}

// =========================
// HEATMAP — Hoofdvisual
// =========================

function drawHeatmap({ svg, y, aggregate, teamSummaries }) {
    // GETRANSPONEERD: teams = rijen, archetypen = kolommen.
    // Schaalt veel beter bij veel teams + lange teamnamen worden leesbaar.
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: 'WERKSTIJL PER TEAM',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: y + 6,
        text: 'kleurintensiteit = % primair · cijfer = %',
        font: 'Inter',
        weight: 400,
        size: 4.4,
        color: COLOR.textMuted,
        anchor: 'end',
    }));

    const usableW = PAGE_W - 2 * MARGIN;
    const labelColW = 78;
    const respColW = 0;
    const dataAreaW = usableW - labelColW - respColW;
    const archetypeColW = dataAreaW / ARCHETYPE_ORDER.length;

    const headerH = 16;
    const headerY = y + 14;
    const rowsStartY = headerY + headerH;
    // Schaal rijhoogte op aantal teams: 12 teams + 1 org-row = 13 rijen
    const rowCount = teamSummaries.length + 1;
    const maxHeatmapH = 250;
    const rowH = Math.min(20, Math.max(13, maxHeatmapH / rowCount));
    const cellPad = 1.2;

    const ACCENT = '#7A8F77';

    // ── Kolomheaders: archetype-namen
    ARCHETYPE_ORDER.forEach((id, ci) => {
        const cx = MARGIN + labelColW + ci * archetypeColW + archetypeColW / 2;
        svg.appendChild(createCircle(cx, headerY + 2, 2.2, PERSONA_COLORS[id]));
        svg.appendChild(createText({
            x: cx,
            y: headerY + 11,
            text: ARCHETYPE_NAME[id],
            font: 'Inter',
            weight: 700,
            size: 4.6,
            color: COLOR.text,
            anchor: 'middle',
        }));
    });

    // ── Bereken matrix (per team x archetype) + max voor normalisatie
    let maxPct = 0;
    const rows = teamSummaries.map((t) => {
        const total = t.aggregate?.teamCount || 0;
        const cells = ARCHETYPE_ORDER.map((id) => {
            const persona = (t.aggregate?.personasByPrimary || []).find((p) => p.id === id);
            const pct = total > 0 && persona ? Math.round((persona.count / total) * 100) : 0;
            if (pct > maxPct) maxPct = pct;
            return pct;
        });
        return { team: t, cells };
    });

    // Org-rij
    const orgTotal = aggregate?.teamCount || 0;
    const orgCells = ARCHETYPE_ORDER.map((id) => {
        const persona = (aggregate?.personasByPrimary || []).find((p) => p.id === id);
        return orgTotal > 0 && persona ? Math.round((persona.count / orgTotal) * 100) : 0;
    });
    const norm = maxPct > 0 ? maxPct : 100;

    // ── Rijen per team
    rows.forEach((row, ri) => {
        const ry = rowsStartY + ri * rowH;
        const teamName = row.team?.team?.team || '—';

        // Lichte zebra-stripe voor leesbaarheid
        if (ri % 2 === 0) {
            svg.appendChild(createRect(MARGIN, ry, usableW, rowH - 1, '#F5EFE8'));
        }

        // Teamnaam (links) — max 2 regels wrap, dan truncate met …
        const respText = `(${row.team.responseCount})`;
        const respW = respText.length * 2.4;
        const teamLines = wrapText(teamName, labelColW - 6 - respW, 5.2, 'Inter');
        const displayLines = teamLines.slice(0, 2);
        if (teamLines.length > 2) {
            displayLines[1] = displayLines[1] + '…';
        }
        if (displayLines.length === 1) {
            svg.appendChild(createText({
                x: MARGIN + 2,
                y: ry + rowH / 2 + 1.5,
                text: displayLines[0],
                font: 'Inter',
                weight: 600,
                size: 5.2,
                color: COLOR.text,
            }));
        } else {
            displayLines.forEach((line, li) => {
                svg.appendChild(createText({
                    x: MARGIN + 2,
                    y: ry + rowH / 2 - 1 + li * 5.6,
                    text: line,
                    font: 'Inter',
                    weight: 600,
                    size: 5.2,
                    color: COLOR.text,
                }));
            });
        }

        // Respons-count tussen () achter naam
        svg.appendChild(createText({
            x: MARGIN + labelColW - 2,
            y: ry + rowH / 2 + 1.5,
            text: respText,
            font: 'Inter',
            weight: 500,
            size: 4.6,
            color: COLOR.textMuted,
            anchor: 'end',
        }));

        // Cellen
        row.cells.forEach((pct, ci) => {
            const cx = MARGIN + labelColW + ci * archetypeColW;
            const cellX = cx + cellPad;
            const cellY = ry + cellPad;
            const cellW = archetypeColW - cellPad * 2;
            const cellH = rowH - 1 - cellPad * 2;

            if (pct > 0) {
                const opacity = Math.max(0.18, Math.min(1, pct / norm));
                const rect = createRect(cellX, cellY, cellW, cellH, PERSONA_COLORS[ARCHETYPE_ORDER[ci]]);
                rect.setAttribute('opacity', opacity.toFixed(2));
                svg.appendChild(rect);
            }
            // Geen 0%-cellen tekenen — schoner

            if (pct > 0) {
                const labelColor = pct > norm * 0.45 ? '#fff' : COLOR.text;
                svg.appendChild(createText({
                    x: cx + archetypeColW / 2,
                    y: cellY + cellH / 2 + 2,
                    text: `${pct}`,
                    font: 'Inter',
                    weight: 600,
                    size: 5.2,
                    color: labelColor,
                    anchor: 'middle',
                }));
            }
        });
    });

    // ── ORG-totaal rij — sage kader, licht gevuld (niet zo zwaar aanwezig).
    const orgY = rowsStartY + rows.length * rowH + 2;
    const orgRect = createRect(MARGIN, orgY, usableW, rowH - 1, ACCENT);
    orgRect.setAttribute('opacity', '0.14');
    svg.appendChild(orgRect);
    const orgFrame = createRect(MARGIN, orgY, usableW, rowH - 1, 'none');
    orgFrame.setAttribute('stroke', ACCENT);
    orgFrame.setAttribute('stroke-width', '0.6');
    orgFrame.setAttribute('fill', 'none');
    svg.appendChild(orgFrame);

    svg.appendChild(createText({
        x: MARGIN + 2,
        y: orgY + rowH / 2 + 1.5,
        text: 'ORGANISATIE',
        font: 'Inter',
        weight: 700,
        size: 5.4,
        color: ACCENT,
        letterSpacing: 0.6,
    }));
    svg.appendChild(createText({
        x: MARGIN + labelColW - 2,
        y: orgY + rowH / 2 + 1.5,
        text: `${orgTotal}`,
        font: 'Inter',
        weight: 700,
        size: 5,
        color: ACCENT,
        anchor: 'end',
    }));

    orgCells.forEach((pct, ci) => {
        const cx = MARGIN + labelColW + ci * archetypeColW;
        const cellX = cx + cellPad;
        const cellY = orgY + cellPad;
        const cellW = archetypeColW - cellPad * 2;
        const cellH = rowH - 1 - cellPad * 2;

        if (pct > 0) {
            // Op org-rij: archetype-kleur licht doorlaten zodat sage-kader leesbaar blijft.
            const rect = createRect(cellX, cellY, cellW, cellH, PERSONA_COLORS[ARCHETYPE_ORDER[ci]]);
            const opacity = Math.max(0.28, Math.min(0.95, pct / norm));
            rect.setAttribute('opacity', opacity.toFixed(2));
            svg.appendChild(rect);
            const labelColor = pct > norm * 0.55 ? '#fff' : COLOR.text;
            svg.appendChild(createText({
                x: cx + archetypeColW / 2,
                y: cellY + cellH / 2 + 2,
                text: `${pct}`,
                font: 'Inter',
                weight: 700,
                size: 5.4,
                color: labelColor,
                anchor: 'middle',
            }));
        }
    });

    return orgY + rowH;
}

function drawOrgMixStrip({ svg, y, aggregate }) {
    svg.appendChild(createText({
        x: MARGIN,
        y: y + 6,
        text: 'ORGANISATIE-MIX',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const total = aggregate?.teamCount || 0;
    const reliability = buildReliabilityLabel(total);
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: y + 6,
        text: `${total} ${total === 1 ? 'respons' : 'responsen'}${reliability ? ' · ' + reliability : ''}`,
        font: 'Inter',
        weight: 400,
        size: 4.8,
        color: COLOR.textMuted,
        anchor: 'end',
    }));

    const barY = y + 14;
    const barW = PAGE_W - 2 * MARGIN;
    const barH = 10;

    svg.appendChild(createRect(MARGIN, barY, barW, barH, '#EADFD4'));

    const items = ARCHETYPE_ORDER
        .map((id) => {
            const p = (aggregate?.personasByPrimary || []).find((x) => x.id === id);
            const pct = p && total > 0 ? p.count / total : 0;
            return { id, pct };
        })
        .filter((x) => x.pct > 0);

    let cursorX = MARGIN;
    items.forEach((it) => {
        const w = barW * it.pct;
        svg.appendChild(createRect(cursorX, barY, w, barH, PERSONA_COLORS[it.id]));
        cursorX += w;
    });

    // Legenda onder bar
    let lx = MARGIN;
    const ly = barY + barH + 9;
    items.forEach((it) => {
        svg.appendChild(createCircle(lx + 2, ly - 1.5, 1.8, PERSONA_COLORS[it.id]));
        const label = `${ARCHETYPE_NAME[it.id]} ${Math.round(it.pct * 100)}%`;
        svg.appendChild(createText({
            x: lx + 7,
            y: ly,
            text: label,
            font: 'Inter',
            weight: 500,
            size: 5,
            color: COLOR.text,
        }));
        lx += 7 + label.length * 2.4 + 6;
    });

    return ly + 6;
}

// =========================
// ACHTERKANT
// =========================

function buildAchterkantSVG({ aggregate, insights, organizationName, teamSummaries, observations = [] }) {
    const svg = createSVGCanvas();
    svg.appendChild(createRect(0, 0, PAGE_W, PAGE_H, COLOR.bg));

    let y = MARGIN;
    y = drawOrgAchterkantHeader({ svg, y });
    y += 14;
    y = drawAchterkantTitle({ svg, y });
    y += 14;
    y = drawDivider({ svg, y });
    y += 12;

    const leegloperObs = observations.filter((o) => o.category === 'leegloper');
    const werktGoedObs = observations.filter((o) => o.category === 'werkt_goed');

    // ── Drie volwaardige kolommen — krijgen nu de volle achterkant-hoogte
    // (per-team-overzicht is bewust verwijderd; staat al op de voorkant).
    const colGap = 16;
    const usableW = PAGE_W - 2 * MARGIN;
    const colW = (usableW - 2 * colGap) / 3;
    drawLeegloperColumn({ svg, x: MARGIN, y, w: colW, insights, extra: leegloperObs });
    drawWerkomgevingColumn({ svg, x: MARGIN + colW + colGap, y, w: colW, aggregate });
    drawWerktGoedColumn({ svg, x: MARGIN + (colW + colGap) * 2, y, w: colW, items: werktGoedObs });

    drawAchterkantFooter({ svg, organizationName });
    return svg;
}

function drawOrgAchterkantHeader({ svg, y }) {
    const ACCENT = '#7A8F77';
    const pillW = 130;
    const pillH = 14;
    const pill = createRect(MARGIN, y, pillW, pillH, COLOR.surface || '#FFFFFF');
    pill.setAttribute('stroke', ACCENT);
    pill.setAttribute('stroke-width', '0.8');
    svg.appendChild(pill);
    svg.appendChild(createText({
        x: MARGIN + pillW / 2,
        y: y + 9.5,
        text: 'ORGANISATIE-LANDSCHAP',
        font: 'Inter',
        weight: 700,
        size: 6,
        color: ACCENT,
        anchor: 'middle',
        letterSpacing: 1.4,
    }));
    svg.appendChild(createText({
        x: PAGE_W - MARGIN,
        y: y + 9.5,
        text: 'PAGINA 2 — PATRONEN',
        font: 'Inter',
        weight: 600,
        size: 5.4,
        color: COLOR.textMuted,
        anchor: 'end',
        letterSpacing: 1.2,
    }));
    return y + pillH;
}

function drawAchterkantTitle({ svg, y }) {
    const titleY = y + 14;
    svg.appendChild(createText({
        x: MARGIN,
        y: titleY,
        text: 'Patronen in de organisatie',
        font: 'Playfair Display',
        weight: 500,
        size: 18,
        color: COLOR.text,
    }));
    const subY = titleY + 12;
    svg.appendChild(createText({
        x: MARGIN,
        y: subY,
        text: 'Waar de organisatie op leegloopt, wat de werkomgeving vraagt, en wat goed werkt.',
        font: 'Playfair Display',
        weight: 400,
        size: 8,
        color: COLOR.textSoft,
        italic: true,
    }));
    return subY;
}

function drawLeegloperColumn({ svg, x, y, w, insights, extra = [] }) {
    svg.appendChild(createText({
        x,
        y: y + 6,
        text: 'WAAR DE ORGANISATIE OP LEEGLOOPT',
        font: 'Inter',
        weight: 700,
        size: 5,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    // Data-driven leeglopers eerst (rose dot), daarna eigen observaties (sage dot).
    const leeglopers = buildLeeglopers(insights, 'organization');
    let ly = y + 22;
    leeglopers.forEach((tekst) => {
        svg.appendChild(createCircle(x + 2, ly - 2.4, 1.6, COLOR.rose));
        const endY = drawWrappedText({
            svg,
            x: x + 9,
            y: ly,
            maxWidth: w - 11,
            text: tekst,
            font: 'Inter',
            weight: 400,
            size: 7,
            color: COLOR.text,
            lineHeight: 10,
        });
        ly = endY + 9;
    });

    if (extra.length > 0) {
        ly += 6;
        svg.appendChild(createText({
            x,
            y: ly,
            text: 'GEZIEN / GEHOORD',
            font: 'Inter',
            weight: 700,
            size: 4.4,
            color: COLOR.textMuted,
            letterSpacing: 0.8,
        }));
        ly += 11;
        extra.forEach((it) => {
            svg.appendChild(createCircle(x + 2, ly - 2.4, 1.6, '#7A8F77'));
            const endY = drawWrappedText({
                svg,
                x: x + 9,
                y: ly,
                maxWidth: w - 11,
                text: it.content || '',
                font: 'Inter',
                weight: 400,
                size: 7,
                color: COLOR.text,
                lineHeight: 10,
            });
            ly = endY + 9;
        });
    }
}

function drawWerktGoedColumn({ svg, x, y, w, items = [] }) {
    svg.appendChild(createText({
        x,
        y: y + 6,
        text: 'WAT WERKT GOED',
        font: 'Inter',
        weight: 700,
        size: 5,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    if (items.length === 0) {
        svg.appendChild(createText({
            x,
            y: y + 24,
            text: '(nog geen observaties toegevoegd)',
            font: 'Inter',
            weight: 400,
            size: 6,
            color: COLOR.textMuted,
            italic: true,
        }));
        return;
    }

    let ly = y + 22;
    items.forEach((it) => {
        svg.appendChild(createCircle(x + 2, ly - 2.4, 1.6, COLOR.sage || '#7A8F77'));
        const endY = drawWrappedText({
            svg,
            x: x + 9,
            y: ly,
            maxWidth: w - 11,
            text: it.content || '',
            font: 'Inter',
            weight: 400,
            size: 7,
            color: COLOR.text,
            lineHeight: 10,
        });
        ly = endY + 9;
    });
}

function drawWerkomgevingColumn({ svg, x, y, w, aggregate }) {
    svg.appendChild(createText({
        x,
        y: y + 6,
        text: 'WAT DE WERKOMGEVING VRAAGT',
        font: 'Inter',
        weight: 700,
        size: 5,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const items = (aggregate?.sortedWorkplaceNeeds || []).slice(0, 5);
    const total = items.reduce((s, it) => s + Number(it.value || it.count || 0), 0);
    let ly = y + 22;

    items.forEach((it) => {
        const value = Number(it.value || it.count || 0);
        const pct = total > 0 ? Math.round((value / total) * 100) : 0;

        svg.appendChild(createText({
            x,
            y: ly,
            text: it.label || it.name || '—',
            font: 'Inter',
            weight: 600,
            size: 6.4,
            color: COLOR.text,
        }));
        svg.appendChild(createText({
            x: x + w,
            y: ly,
            text: `${pct}%`,
            font: 'Inter',
            weight: 600,
            size: 6.4,
            color: COLOR.textMuted,
            anchor: 'end',
        }));

        const barY = ly + 3;
        const barH = 2.4;
        svg.appendChild(createRect(x, barY, w, barH, '#EADFD4'));
        if (pct > 0) {
            svg.appendChild(createRect(x, barY, w * (pct / 100), barH, COLOR.sage || '#7A8F77'));
        }
        ly += 16;
    });
}

function drawTeamsGrid({ svg, x, y, w, teamSummaries }) {
    svg.appendChild(createText({
        x,
        y: y + 6,
        text: 'PER TEAM IN HET KORT',
        font: 'Inter',
        weight: 700,
        size: 4.8,
        color: COLOR.textMuted,
        letterSpacing: 0.8,
    }));

    const cols = 3;
    const gap = 12;
    const colW = (w - gap * (cols - 1)) / cols;
    const startY = y + 18;
    const itemH = 20;

    // Sorteer: teams mét respons eerst (op aantal), dan inactieve teams
    const sorted = [...teamSummaries].sort((a, b) => (b.responseCount || 0) - (a.responseCount || 0));
    const perCol = Math.ceil(sorted.length / cols);

    sorted.forEach((t, idx) => {
        const colIdx = Math.floor(idx / perCol);
        const rowIdx = idx % perCol;
        const cx = x + colIdx * (colW + gap);
        const cy = startY + rowIdx * itemH;

        const top = (t.aggregate?.personasByPrimary || [])[0];
        const second = (t.aggregate?.personasByPrimary || [])[1];
        const dominantColor = top ? PERSONA_COLORS[top.id] : '#D9CFC1';

        svg.appendChild(createCircle(cx + 2, cy - 1, 2, dominantColor));

        // Team-naam (max 2 regels)
        const nameLines = wrapText(t?.team?.team || '—', colW - 24, 5.4, 'Inter');
        const displayLines = nameLines.slice(0, 2);
        if (nameLines.length > 2) displayLines[1] = displayLines[1] + '…';
        displayLines.forEach((line, li) => {
            svg.appendChild(createText({
                x: cx + 8,
                y: cy + 1 + li * 5.6,
                text: line,
                font: 'Inter',
                weight: 600,
                size: 5.4,
                color: COLOR.text,
            }));
        });

        // # respons rechts
        svg.appendChild(createText({
            x: cx + colW,
            y: cy + 1,
            text: `${t.responseCount || 0}`,
            font: 'Inter',
            weight: 600,
            size: 5,
            color: COLOR.textMuted,
            anchor: 'end',
        }));

        // Dominant + 2e (onder team-naam)
        const subY = cy + 1 + Math.max(1, displayLines.length) * 5.6 + 2;
        const parts = [];
        if (top) parts.push(top.name);
        if (second) parts.push(second.name);
        const sub = parts.length ? parts.join(' · ') : '(nog geen data)';
        svg.appendChild(createText({
            x: cx + 8,
            y: subY,
            text: sub,
            font: 'Inter',
            weight: 400,
            size: 4.8,
            color: COLOR.textSoft,
            italic: parts.length === 0,
        }));
    });
}

function drawAchterkantFooter({ svg, organizationName }) {
    const footerY = PAGE_H - 56;
    svg.appendChild(createText({
        x: PAGE_W / 2,
        y: footerY,
        text: '"Een organisatie die zichzelf herkent, beweegt sneller."',
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
        text: `Organisatie-landschap · ${organizationName || ''}`,
        font: 'Inter',
        weight: 400,
        size: 4.8,
        color: COLOR.textMuted,
        anchor: 'middle',
    }));
}
