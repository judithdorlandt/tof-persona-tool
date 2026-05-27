/**
 * tofPdfBrand.js — gedeelde brand-tokens en helpers voor alle TOF PDFs.
 *
 * Eén bron van waarheid voor:
 *  - Brand-fonts (Inter + Playfair Display) via jsPDF font registratie
 *  - Kleur-palet dat matcht met index.css
 *  - Font-family-namen die we via SVG / setFont gebruiken
 *
 * Doel: persona-kaart, team-insight en team-dynamics voelen als één familie.
 */

import {
  INTER_REGULAR,
  INTER_SEMIBOLD,
  INTER_BOLD,
  PLAYFAIR_REGULAR,
  PLAYFAIR_ITALIC,
} from './tofFontsData';

// Brand-font namen — matcht index.css en SVG font-family strings.
// LET OP: 'Playfair Display' bevat een spatie (zoals in SVG en CSS).
export const FONT_BODY = 'Inter';
export const FONT_HEAD = 'Playfair Display';

// Brand-kleur-palet — gedeeld door alle PDFs.
export const TOF_COLORS = {
  bg: '#F4EFEA',
  surface: '#FFFFFF',
  border: '#E6DDD2',
  text: '#1F1B17',
  textSoft: '#5C544B',
  textMuted: '#8B8278',
  rose: '#B05252',
  sage: '#7A8F77',
  ochre: '#C7A24A',
};

// Persona-kleuren — gedeeld door alle PDFs.
export const TOF_PERSONA_COLORS = {
  maker: '#B05252',
  groeier: '#C28D6B',
  presteerder: '#C7A24A',
  denker: '#6F7F92',
  verbinder: '#7F9A8A',
  teamspeler: '#8B7F9A',
  zekerzoeker: '#7D8A6B',
  vernieuwer: '#D08C5B',
};

/**
 * Registreert de TOF brand-fonts in een jsPDF instance.
 * Aanroepen vóór elke `setFont(FONT_BODY/HEAD, ...)` of svg2pdf render.
 */
export function setupTofFonts(pdf) {
  pdf.addFileToVFS('Inter-Regular.ttf', INTER_REGULAR);
  pdf.addFont('Inter-Regular.ttf', FONT_BODY, 'normal');
  pdf.addFileToVFS('Inter-SemiBold.ttf', INTER_SEMIBOLD);
  pdf.addFont('Inter-SemiBold.ttf', FONT_BODY, 'bold');
  pdf.addFileToVFS('Inter-Bold.ttf', INTER_BOLD);
  pdf.addFont('Inter-Bold.ttf', FONT_BODY, 'bolder');
  pdf.addFileToVFS('PlayfairDisplay-Regular.ttf', PLAYFAIR_REGULAR);
  pdf.addFont('PlayfairDisplay-Regular.ttf', FONT_HEAD, 'normal');
  pdf.addFileToVFS('PlayfairDisplay-Italic.ttf', PLAYFAIR_ITALIC);
  pdf.addFont('PlayfairDisplay-Italic.ttf', FONT_HEAD, 'italic');
}
