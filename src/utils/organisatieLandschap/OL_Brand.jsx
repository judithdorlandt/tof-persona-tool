/**
 * OL_Brand.jsx — NIEUW pagina 1: TOF merkcover.
 *
 * Spec: altijd vooraan, ongeacht klant. Geen footer, geen paginanummer,
 * geen ORGANISATIE-LANDSCHAP-pill. Alleen merk.
 *
 * Layout: zand-achtergrond, logo op ~40% van de pagina-hoogte,
 * tekst "The Office Factory" (Inter + Italic) eronder, tagline daaronder.
 *
 * Lost op: anchort het merk vóór data — rapport krijgt een "deksel".
 */

import { PAGE_W, PAGE_H } from './constants';
import { TYPE_V9, COLOR_FAMILIES } from './OL_styles';
import { createCanvas, rect, text } from './svgPrimitives';
import { drawTOFLogo } from './OL_Logo';

export function buildBrandSVG() {
    const svg = createCanvas();
    svg.appendChild(rect(0, 0, PAGE_W, PAGE_H, COLOR_FAMILIES.neutral.bg));

    // ── Visueel zwaartepunt op ~40% van pagina-hoogte (spec).
    // A4 landscape: H = 210mm. 40% = 84mm.
    const cx = PAGE_W / 2;
    const logoCenterY = PAGE_H * 0.36;     // licht boven 40% zodat tekst er ruim onder past

    // Logo-diameter: spec gaf 240px op 1489px hoogte → 16.1% van H.
    // Voor A4 landscape (H=210mm): 33.8mm. Iets compacter voor landscape: 32mm.
    const logoDiameter = 32;

    drawTOFLogo(svg, {
        cx, cy: logoCenterY,
        diameter: logoDiameter,
        color: COLOR_FAMILIES.accent.frictie, // rose #B05252
    });

    // ── 64px (16.93mm) ademruimte onder logo, dan de propositie.
    // Logo-onderkant: logoCenterY + diameter/2 = 36 + 16 = 52mm.
    // Tekst-baseline: 52 + 16.93 + 25.40 (font-size baseline-shift) ≈ 94mm.
    const titleBaseline = logoCenterY + logoDiameter / 2 + 16.93 + 25.40;

    // ── "The Office Factory" — Inter Regular + Italic op één regel.
    // Strategie: render twee text-elements naast elkaar, centered om cx.
    // Probleem: anchor middle van twee elements vereist gemeten breedte.
    // Praktische oplossing: schat breedte op basis van karakter-aantallen
    // (Inter @ 25.4mm: avg char ≈ 12.5mm). "The Office" = 10ch incl spaties
    // → ~125mm; "Factory" = 7ch → ~87.5mm. Totaal ~212mm; iets korter rendert.
    //
    // Praktisch gebruik measureText-achtige fallback: gebruik tspan binnen
    // één <text> zodat browser/jsPDF de natuurlijke baseline aanhoudt.
    drawTwoToneTitle(svg, {
        cx,
        baseline: titleBaseline,
        left: 'The Office ',
        right: 'Factory',
        leftStyle: TYPE_V9.brandTitle,
        rightStyle: TYPE_V9.brandTitleAccent,
    });

    // ── 32px (8.47mm) ademruimte tussen titel en tagline.
    const taglineY = titleBaseline + 8.47 + TYPE_V9.brandTagline.size;
    svg.appendChild(text({
        x: cx, y: taglineY,
        content: 'Inzicht in werkstijl, teamdynamiek en werkplek.',
        ...TYPE_V9.brandTagline,
        anchor: 'middle',
    }));

    return svg;
}

/**
 * Twee-kleurs-titel: linker stuk + rechter stuk, samen gecentreerd om cx.
 * Geeft "The Office" zwart + "Factory" rose italic in één regel.
 *
 * Aanpak: tekent allebei eerst los, meet geschatte breedtes, en herpositioneert
 * met start-anchor zodat de gecombineerde tekst-string op cx gecentreerd is.
 */
function drawTwoToneTitle(svg, { cx, baseline, left, right, leftStyle, rightStyle }) {
    // Heuristische breedte-schatting (Inter 96px ≈ 25.4mm):
    // Empirisch ratio breedte/size ≈ 0.55 voor Inter Regular bij gemengde tekst.
    const ratio = 0.55;
    const wLeft = left.length * leftStyle.size * ratio;
    const wRight = right.length * rightStyle.size * ratio;
    const wTotal = wLeft + wRight;

    const xLeft = cx - wTotal / 2;
    const xRight = xLeft + wLeft;

    svg.appendChild(text({
        x: xLeft, y: baseline,
        content: left,
        ...leftStyle,
        anchor: 'start',
    }));
    svg.appendChild(text({
        x: xRight, y: baseline,
        content: right,
        ...rightStyle,
        anchor: 'start',
    }));
}
