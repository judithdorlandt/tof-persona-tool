/**
 * OL_Cover.jsx — Pagina 1: TOF cover voor Module 1 · Insights.
 *
 * Verticale opbouw (optisch gecentreerd op de pagina):
 *   1. Logo (echt PNG via drawTOFMark, ~30mm)
 *   2. ~60pt witruimte
 *   3. MODULE 1 · INSIGHTS    — klein, uppercase, textMuted
 *   4. 12pt
 *   5. Organisatie-landschap  — Playfair italic, secundair
 *   6. 16pt
 *   7. Organisatienaam        — Playfair primair, groot
 *   8. 20pt
 *   9. ── divider (60mm) ──
 *  10. 12pt
 *  11. Datum · respondenten · teams met data
 *
 * Kritieke fix v12: baselines worden nu individueel berekend op basis
 * van eigen font-size + gap, zodat ze niet meer stapelen.
 */

import { PAGE_W, PAGE_H } from './constants';
import { COLOR_FAMILIES, TYPE_V9 } from './OL_styles';
import { createCanvas, rect, text, line } from './svgPrimitives';
import { drawTOFMark } from '../teamInsightPDF';

const C = COLOR_FAMILIES.neutral;

// Spec-spacing (in mm; 1pt = 0.353mm).
const PT = 0.353;
const SP = {
    pt8: 8 * PT,        // 2.82mm
    pt12: 12 * PT,      // 4.23mm
    pt16: 16 * PT,      // 5.65mm
    pt20: 20 * PT,      // 7.06mm
    pt60: 60 * PT,      // 21.17mm
};

// Type-groottes voor cover — v14: Playfair (heading) + Inter (label/meta).
const SZ = {
    label: 2.82,         // 8pt — eyebrow (Inter SemiBold uppercase tracked)
    sub: 6.35,           // 18pt — Organisatie-landschap (Playfair Italic)
    title: 15.50,        // 44pt — organisatienaam (Playfair Regular)
    meta: 3.18,          // 9pt — datum-regel
    tagline: 3.18,       // 9pt — slot-signatuur (Inter Italic)
};

export function buildCoverSVG({ data, copy }) {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, C.bg));

    const cx = PAGE_W / 2;
    const logoSize = 30;

    // ── Bereken totale blok-hoogte zodat we optisch kunnen centreren.
    // Elke regel: vorige baseline + (vorige descender ≈ 0.2*size) + gap +
    //             eigen ascender (≈ 0.8*size).
    // Versimpeld: gap + eigen font-size als baseline-stap (≈ correct
    // voor optische scheiding).
    const totalBlockH =
        logoSize +
        SP.pt60 +
        SZ.label +
        SP.pt12 + SZ.sub +
        SP.pt16 + SZ.title +
        SP.pt20 + 0.5 +              // divider lijn-dikte
        SP.pt12 + SZ.meta;

    const blockTop = (PAGE_H - totalBlockH) / 2;

    // ── 1. Logo
    drawTOFMark(svg, cx - logoSize / 2, blockTop, logoSize);

    // ── 3. MODULE 1 · INSIGHTS — Inter SemiBold tracked
    let baseline = blockTop + logoSize + SP.pt60 + SZ.label;
    svg.appendChild(text({
        x: cx, y: baseline,
        content: 'MODULE 1 · INSIGHTS',
        font: 'Inter', weight: 600, size: SZ.label,
        color: C.textMuted, letterSpacing: 0.45, anchor: 'middle',
    }));

    // ── 5. Organisatie-landschap — Playfair Italic 18pt
    baseline += SP.pt12 + SZ.sub;
    svg.appendChild(text({
        x: cx, y: baseline,
        content: 'Organisatie-landschap',
        font: 'Playfair Display', weight: 400, size: SZ.sub,
        color: C.textSoft, italic: true, anchor: 'middle',
    }));

    // ── 7. Organisatienaam — Playfair Regular 44pt
    baseline += SP.pt16 + SZ.title;
    svg.appendChild(text({
        x: cx, y: baseline,
        content: data.organizationName,
        font: 'Playfair Display', weight: 400, size: SZ.title,
        color: C.text, anchor: 'middle',
    }));

    // ── 9. Divider — y = vorige baseline + 20pt
    const dividerY = baseline + SP.pt20;
    const dividerW = 60;
    svg.appendChild(line(
        cx - dividerW / 2, dividerY, cx + dividerW / 2, dividerY,
        C.border, 0.5,
    ));

    // ── 11. Meta — baseline = divider + 12pt + eigen size
    const metaBaseline = dividerY + SP.pt12 + SZ.meta;
    svg.appendChild(text({
        x: cx, y: metaBaseline,
        content: `${data.date}  ·  ${data.totalRespondents} ${data.totalRespondents === 1 ? 'respondent' : 'respondenten'}  ·  ${data.activeTeamCount}/${data.totalTeams} teams met data`,
        font: 'Inter', weight: 400, size: SZ.meta,
        color: C.textMuted, anchor: 'middle',
    }));

    // ── Slotsignatuur — Inter Italic 9pt textMuted, ~25mm boven onderrand.
    // Verbindt elk rapport met de TOF-propositie.
    const taglineY = PAGE_H - 25;
    svg.appendChild(text({
        x: cx, y: taglineY,
        content: 'Inzicht in werkstijl, teamdynamiek en werkplek.',
        font: 'Inter', weight: 400, size: SZ.tagline,
        color: C.textMuted, italic: true, anchor: 'middle',
    }));

    return svg;
}
