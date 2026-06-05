/**
 * OrganisatieLandschap.jsx — public orchestrator.
 *
 * Eén entry-point: `generateOrganisatieLandschapPDF(...)`. Bouwt vier SVG-pagina's
 * (Cover, Heatmap, Patronen, Duiding), giet die door svg2pdf in één A4-landscape
 * PDF, en triggert de download.
 *
 * Vaste oriëntatie-regel: élke pagina is A4 landscape — geen mix.
 */

import jsPDF from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';

import { setupTofFonts } from '../tofPdfBrand';
import { PAGE_W, PAGE_H } from './constants';
import { COPY_NL } from './copy.nl';
import { prepareOrganisatieData } from './organisatieAggregation';

import { buildCoverSVG } from './OL_Cover';
import { buildHeroSVG } from './OL_Hero';
import { buildHeatmapSVG } from './OL_Heatmap';
import { buildPatronenSVG } from './OL_Patronen';
import { buildDuidingSVG } from './OL_Duiding';
import { drawPageFooter } from './OL_Chrome';

export async function generateOrganisatieLandschapPDF({
    aggregate,
    insights,
    teamSummaries = [],
    organizationName = 'Organisatie',
    observations = [],
}) {
    const data = prepareOrganisatieData({
        aggregate, insights, teamSummaries, organizationName, observations,
    });
    const copy = COPY_NL;

    // Pagina-builders geven óf één SVG óf een array van SVG's terug (Patronen
    // en Duiding kunnen uitlopen naar vervolgpagina's wanneer de inhoud niet op
    // één pagina past). We platten ze hier en nummeren de footers dynamisch.
    const groups = [
        buildCoverSVG({ data, copy }),                // 1 — TOF cover voor Module 1
        buildHeroSVG({ data, copy }),                 // kerncijfers
        buildHeatmapSVG({ data, copy }),              // werkstijl per team
        buildPatronenSVG({ data, copy }),             // patronen (1+ pagina's)
        buildDuidingSVG({ data, copy }),              // duiding (1+ pagina's)
    ];
    const pages = groups.flatMap((g) => (Array.isArray(g) ? g : [g]));

    // Footer per pagina, behalve de cover (index 0 heeft een eigen layout).
    const totalPages = pages.length;
    pages.forEach((svg, i) => {
        if (i > 0) drawPageFooter(svg, { pageNum: i + 1, totalPages });
    });

    // svg2pdf heeft SVG nodes nodig die in de DOM zitten voor layoutmeting.
    pages.forEach((p) => document.body.appendChild(p));

    try {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'mm',
            format: 'a4',
            compress: true,
        });
        setupTofFonts(pdf);

        for (let i = 0; i < pages.length; i++) {
            if (i > 0) pdf.addPage('a4', 'landscape');
            await svg2pdf(pages[i], pdf, {
                x: 0, y: 0, width: PAGE_W, height: PAGE_H,
            });
        }

        const safeName = (organizationName || 'organisatie')
            .replace(/[^\w\s-]/g, '')
            .trim()
            .slice(0, 50);
        pdf.save(`${safeName} - ${copy.fileSuffix}.pdf`);
    } finally {
        pages.forEach((p) => {
            if (p.parentNode) p.parentNode.removeChild(p);
        });
    }
}

// Achterwaarts-compatible alias zodat oude callsite blijft werken tijdens transitie.
export { generateOrganisatieLandschapPDF as generateOrganizationInsightPDF };
