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

    // 5 pagina's — pagina 1 (cover) bevat brand+org in één;
    // pagina 2-5 hebben gedeelde header/footer-chrome.
    const pages = [
        buildCoverSVG({ data, copy }),                // 1 — TOF cover voor Module 1
        buildHeroSVG({ data, copy }),                 // 2 — kerncijfers
        buildHeatmapSVG({ data, copy }),              // 3 — werkstijl per team
        buildPatronenSVG({ data, copy }),             // 4 — patronen
        buildDuidingSVG({ data, copy }),              // 5 — duiding
    ];

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
