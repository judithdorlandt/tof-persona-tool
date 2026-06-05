/**
 * OL_Chrome.jsx — gedeelde paginakop en -voet voor pagina 2–5.
 *
 * Pagina 1 (cover) heeft eigen layout en gebruikt deze chrome niet.
 *
 * Header: "MODULE 1 · INSIGHTS" links, datum rechts, daaronder paginatitel.
 * Footer: TOF-logo (PNG via drawTOFMark) + brand-tekst links, paginanummer rechts.
 *
 * Lost op: visueel rust en herhaalbare structuur — bestuurder herkent
 * elke pagina direct als deel van hetzelfde rapport.
 */

import { PAGE_W, PAGE_H, MARGIN } from './constants';
import { COLOR_FAMILIES, TYPE_V9, SPACING, RHYTHM } from './OL_styles';
import { text, line } from './svgPrimitives';
import { drawTOFMark } from '../teamInsightPDF';

const C = COLOR_FAMILIES.neutral;

/** Header — small eyebrow label + date, with paginatitel below.
 *  V24: compacter + hoger — eyebrow/datum op MARGIN+3, lijn op MARGIN+7. */
export function drawPageHeader(svg, { date, pageTitle }) {
    // Label links
    svg.appendChild(text({
        x: MARGIN, y: MARGIN + 3,
        content: 'MODULE 1 · INSIGHTS',
        ...TYPE_V9.eyebrow,
    }));
    // Datum rechts
    svg.appendChild(text({
        x: PAGE_W - MARGIN, y: MARGIN + 3,
        content: date,
        ...TYPE_V9.footer,
        anchor: 'end',
    }));
    // Hairline scheiding
    const lineY = MARGIN + 7;
    svg.appendChild(line(MARGIN, lineY, PAGE_W - MARGIN, lineY, C.border, 0.3));

    // Paginatitel (klein, sage) onder de lijn — alleen tonen als anders dan H2.
    if (pageTitle) {
        svg.appendChild(text({
            x: MARGIN, y: lineY + 5,
            content: pageTitle,
            font: 'Inter', weight: 600, size: 3.4, color: COLOR_FAMILIES.accent.rust,
            letterSpacing: 0.4,
        }));
        return lineY + 5 + SPACING.md;
    }
    // Geen pageTitle → header eindigt direct na de lijn.
    return lineY + SPACING.md;
}

/** Footer — logo + brand links, paginanummer rechts.
 *  V13: hele footer 20pt (~7mm) lager — meer adem onderaan de pagina. */
export function drawPageFooter(svg, { pageNum, totalPages = 5 }) {
    const yLine = PAGE_H - MARGIN + 2;
    svg.appendChild(line(MARGIN, yLine, PAGE_W - MARGIN, yLine, C.border, 0.3));

    // Footer-content 3-4pt onder de lijn voor lucht tussen lijn en tekst.
    const yText = PAGE_H - MARGIN + 9.4;
    // TOF logo (6mm) links — gebruikt drawTOFMark uit team-PDF (PNG embed).
    drawTOFMark(svg, MARGIN, yText - 4.6, 5.8);
    svg.appendChild(text({
        x: MARGIN + 8, y: yText,
        content: 'TOF · The Office Factory',
        ...TYPE_V9.footer,
    }));
    svg.appendChild(text({
        x: PAGE_W - MARGIN, y: yText,
        content: `${pageNum} / ${totalPages}`,
        ...TYPE_V9.footer,
        weight: 500, anchor: 'end',
    }));
}

/** De Y-waarde waar pagina-content begint na de header. */
export const CONTENT_TOP = MARGIN + 7 + 5 + SPACING.md;
