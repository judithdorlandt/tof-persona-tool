/**
 * Vector PDF generator voor de personakaart — editorial premium-stijl.
 *
 * Doel: dezelfde look & feel als de oorspronkelijke "A — personakaart TOF"
 * (rustige typografie, dunne lijnen, mix-cards, quote-box, ×-lijst,
 * werkplek-cards met score rechts), maar nu als echte vector PDF:
 *   - Tekst is selecteerbaar en doorzoekbaar
 *   - Lijnen, vormen en typografie blijven scherp op elke zoom
 *   - Klein bestand (geen JPEG-blobs)
 *
 * Lettertype: jsPDF built-in `times` (serif → Playfair-stand-in) en
 * `helvetica` (sans → Inter-stand-in). Brand-fonts vereisen TTF-base64
 * embedding (~200 KB) en zijn pas later nodig wanneer de premium-toon
 * verfijnd moet worden.
 */
import jsPDF from 'jspdf';
import { TOF_LOGO_PNG_BASE64 } from './tofLogoData';
import { FONT_BODY, FONT_HEAD, setupTofFonts } from './tofPdfBrand';

// A5 portrait, in mm
const PAGE_W = 148;
const PAGE_H = 210;
const MARGIN_X = 12;
const MARGIN_Y = 14;
const CONTENT_W = PAGE_W - MARGIN_X * 2;

// TOF palet (sync met index.css)
const COLOR = {
  bg: '#F4ECDF',            // warme crème, iets dieper dan #F7F3EE — matcht OLD ontwerp
  surface: '#FFFFFF',
  border: '#E2D7C6',        // zachte beige border voor cards
  text: '#1F1B17',
  textSoft: '#5A524A',
  textMuted: '#8B8278',
  rose: '#B05252',
  sage: '#7A8F77',
  ochre: '#C7A547',         // gele underline-accent op page 1
  trackSoft: '#E4D9C7',     // verdeling-lijn track (achtergrond)
};

// --- helpers -----------------------------------------------------------------

function hexToRgb(hex) {
  const h = String(hex || '').replace('#', '');
  if (h.length !== 6) return [0, 0, 0];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function setFill(pdf, hex) {
  pdf.setFillColor.apply(pdf, hexToRgb(hex));
}
function setDraw(pdf, hex) {
  pdf.setDrawColor.apply(pdf, hexToRgb(hex));
}
function setText(pdf, hex) {
  pdf.setTextColor.apply(pdf, hexToRgb(hex));
}

/**
 * Wrap tekst en teken. Returns y-positie ná de laatste regel.
 */
function drawWrappedText(pdf, text, x, y, maxWidth, lineHeight) {
  if (!text) return y;
  const lines = pdf.splitTextToSize(String(text), maxWidth);
  lines.forEach((line, i) => {
    pdf.text(line, x, y + i * lineHeight);
  });
  return y + (lines.length - 1) * lineHeight;
}

/**
 * Wrap helper die alleen het aantal regels rapporteert (zonder te tekenen).
 * Handig voor pre-flight hoogte-berekening van cards.
 */
function wrapCount(pdf, text, maxWidth) {
  if (!text) return 0;
  return pdf.splitTextToSize(String(text), maxWidth).length;
}

/**
 * Echte TOF-mark — rose cirkel met een "T+F"-symbool binnenin:
 * twee horizontale balken (top wijd, middel iets smaller) gekruist
 * door één verticale balk. Matcht het officiële TOF-logo.
 *
 * Lijnen worden in rose getekend, met een lijndikte die schaalt met de
 * radius zodat het op alle formaten kloppend oogt.
 */
function drawTofMark(pdf, cx, cy, radius, _hex) {
  // TOF-mark = exact het origineel uit src/assets/tof-logo.png (embedded als base64).
  // Geen vector-imitatie meer — pdf.addImage() levert 1-op-1 hetzelfde mark, in de
  // juiste rose kleur en proporties, scherp op elke zoom-stand.
  const size = radius * 2;
  pdf.addImage(TOF_LOGO_PNG_BASE64, 'PNG', cx - radius, cy - radius, size, size, undefined, 'FAST');
}

/**
 * Pill-badge zoals "● PRIMAIRE PERSONA" — gevuld met primary-color,
 * witte stip + witte tekst.
 */
function drawPillBadge(pdf, x, y, label, fillHex) {
  pdf.setFont(FONT_BODY, 'bold');
  pdf.setFontSize(7);
  const textWidth = pdf.getTextWidth(label);
  const dotR = 0.8;
  const padX = 5;
  const padY = 2.4;
  const innerH = 5;
  const w = textWidth + padX * 2 + dotR * 2 + 2.5;
  const h = innerH + padY * 2;

  setFill(pdf, fillHex);
  pdf.roundedRect(x, y, w, h, h / 2, h / 2, 'F');
  setFill(pdf, '#FFFFFF');
  pdf.circle(x + padX + dotR, y + h / 2, dotR, 'F');
  setText(pdf, '#FFFFFF');
  pdf.text(label, x + padX + dotR * 2 + 1.8, y + h / 2 + 1.3);

  return { w, h };
}

/**
 * "×"-marker voor de leeglopers-lijst. Vector lijntjes, gekleurd in primary.
 */
function drawCrossMarker(pdf, cx, cy, size, hex) {
  setDraw(pdf, hex);
  pdf.setLineWidth(0.55);
  const r = size / 2;
  pdf.line(cx - r, cy - r, cx + r, cy + r);
  pdf.line(cx - r, cy + r, cx + r, cy - r);
}

// --- page 1: voorkant --------------------------------------------------------

function renderFront(pdf, data, primaryColor) {
  const page = { x: MARGIN_X, y: MARGIN_Y, w: CONTENT_W };

  // Achtergrond
  setFill(pdf, COLOR.bg);
  pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // ── HEADER ROW: pill-badge (links) + TOF-mark (rechts)
  const badge = drawPillBadge(pdf, page.x, page.y, 'PRIMAIRE PERSONA', primaryColor);
  drawTofMark(pdf, page.x + page.w - 5, page.y + badge.h / 2, 4.4, primaryColor);

  // ── Eyebrow: "JUDITH · TOF Persona Tool" — naam prominenter (bold + caps)
  let y = page.y + badge.h + 12;
  const nameUpper = String(data.naam || '').toUpperCase();
  pdf.setFont(FONT_BODY, 'bold');
  pdf.setFontSize(8.6);
  setText(pdf, COLOR.text);
  pdf.text(nameUpper, page.x, y);
  const nameW = pdf.getTextWidth(nameUpper);

  pdf.setFont(FONT_BODY, 'normal');
  pdf.setFontSize(7.6);
  setText(pdf, COLOR.textMuted);
  pdf.text(`  ·  ${data.rol || 'TOF Persona Tool'}`, page.x + nameW, y);

  // ── BIG TITLE — "Jouw dominante profiel is Persona." op één regel
  y += 13;
  const titleSize = 17;
  pdf.setFont(FONT_HEAD, 'normal');
  pdf.setFontSize(titleSize);
  setText(pdf, COLOR.text);
  const titlePart1 = 'Jouw dominante profiel is ';
  pdf.text(titlePart1, page.x, y);
  const titlePart1W = pdf.getTextWidth(titlePart1);

  pdf.setFont(FONT_HEAD, 'italic');
  setText(pdf, primaryColor);
  pdf.text(`${data.persona || ''}.`, page.x + titlePart1W, y);
  y += 3; // kleine vertikale toegift, want italic descenders

  // ── Subline (body)
  if (data.subline) {
    y += 8;
    setText(pdf, COLOR.textSoft);
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(9.5);
    y = drawWrappedText(pdf, data.subline, page.x, y, page.w, 4.6);
  }

  // ── Yellow accent underline (kort, ochre)
  y += 6;
  setDraw(pdf, COLOR.ochre);
  pdf.setLineWidth(0.7);
  pdf.line(page.x, y, page.x + 18, y);

  // ── TWO-COLUMN BLOCK: VERDELING (left) + JOUW MIX (right)
  y += 9;
  const colGap = 4;
  const colLeftW = 66;
  const colRightW = page.w - colLeftW - colGap;
  const colLeftX = page.x;
  const colRightX = page.x + colLeftW + colGap;
  const colStartY = y;

  // ── LEFT COL: VERDELING PROFIEL
  let leftY = colStartY;
  setText(pdf, COLOR.textMuted);
  pdf.setFont(FONT_BODY, 'bold');
  pdf.setFontSize(7);
  pdf.text('VERDELING PROFIEL', colLeftX, leftY);
  leftY += 6;

  const lines = (data.verdeling || []).slice(0, 8);
  const rowGap = 6.9;                       // ruimer voor rustigere, premium uitlijning
  const lineLen = colLeftW - 14;            // ruimte voor naam + lijn + %
  const lineY_offset = 2.7;                 // afstand van baseline tot lijn

  lines.forEach((row) => {
    // Naam links
    setText(pdf, COLOR.text);
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(8);
    pdf.text(row.name || '', colLeftX, leftY);

    // Track (achtergrond)
    const lineY = leftY + lineY_offset;
    setDraw(pdf, COLOR.trackSoft);
    pdf.setLineWidth(0.45);
    pdf.line(colLeftX, lineY, colLeftX + lineLen, lineY);

    // Filled portion (persona-kleur)
    const pct = Math.max(0, Math.min(100, Number(row.pct) || 0));
    const fillW = lineLen * (pct / 100);
    if (fillW > 0.3) {
      setDraw(pdf, row.color || primaryColor);
      pdf.setLineWidth(0.9);
      pdf.line(colLeftX, lineY, colLeftX + fillW, lineY);
    }

    // Percentage rechts
    setText(pdf, COLOR.textSoft);
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(8);
    pdf.text(`${pct}%`, colLeftX + colLeftW - 2, leftY, { align: 'right' });

    leftY += rowGap;
  });

  // ── RIGHT COL: JOUW MIX (max 2 cards)
  let rightY = colStartY;
  setText(pdf, COLOR.textMuted);
  pdf.setFont(FONT_BODY, 'bold');
  pdf.setFontSize(7);
  pdf.text('JOUW MIX', colRightX, rightY);
  rightY += 7;

  const mix = (data.mix || []).slice(0, 2);
  const cardPadX = 4;
  const cardPadY = 4;
  mix.forEach((m) => {
    // Pre-compute body wrap voor card-hoogte
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(7.8);
    const bodyLines = wrapCount(pdf, m.text || '', colRightW - cardPadX * 2);
    const titleH = 6.5;
    const bodyH = bodyLines * 3.6 + 2;
    const cardH = cardPadY * 2 + titleH + bodyH;

    // Card: witte rechthoek met dunne border + linker accent-streep in primary
    setFill(pdf, COLOR.surface);
    setDraw(pdf, COLOR.border);
    pdf.setLineWidth(0.18);
    pdf.roundedRect(colRightX, rightY, colRightW, cardH, 1.6, 1.6, 'FD');

    // Linker accent-balkje in persona-kleur
    setFill(pdf, m.color || primaryColor);
    pdf.rect(colRightX, rightY, 0.9, cardH, 'F');

    // Persona-naam (serif)
    setText(pdf, COLOR.text);
    pdf.setFont(FONT_HEAD, 'normal');
    pdf.setFontSize(11);
    pdf.text(m.name || '', colRightX + cardPadX, rightY + cardPadY + 3.2);

    // Body
    setText(pdf, COLOR.textSoft);
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(7.8);
    drawWrappedText(
      pdf,
      m.text || '',
      colRightX + cardPadX,
      rightY + cardPadY + titleH + 2.5,
      colRightW - cardPadX * 2,
      3.5
    );

    rightY += cardH + 3.5;
  });

  // ── Volgende sectie begint onder de langste van de twee kolommen
  y = Math.max(leftY, rightY) + 5;

  // ── "WAT JOU IN BEWEGING BRENGT" — quote-box (forceer 1 regel: leest rustiger)
  if (data.kracht) {
    const boxPadX = 11;         // ruim aan de zijkanten — quote eindigt netjes binnen border
    const boxPadY = 4;          // compacter verticaal — alles schuift op naar boven
    const SAFETY = 4;           // extra buffer rechts, anders kleeft de quote aan de border
    const maxQuoteW = page.w - boxPadX * 2 - SAFETY;

    // Schaal de font-size omlaag totdat de quote op één regel past — met buffer.
    pdf.setFont(FONT_HEAD, 'italic');
    let quoteSize = 11.5;
    pdf.setFontSize(quoteSize);
    while (quoteSize > 7.5 && pdf.getTextWidth(data.kracht) > maxQuoteW) {
      quoteSize -= 0.5;
      pdf.setFontSize(quoteSize);
    }
    // Hoogte: eyebrow + gap + 1 regel quote + onder-padding (compacter)
    const krachtH = boxPadY * 2 + 9;

    // White box met subtiele border
    setFill(pdf, COLOR.surface);
    setDraw(pdf, COLOR.border);
    pdf.setLineWidth(0.18);
    pdf.roundedRect(page.x, y, page.w, krachtH, 1.8, 1.8, 'FD');

    // Eyebrow inside box
    setText(pdf, COLOR.textMuted);
    pdf.setFont(FONT_BODY, 'bold');
    pdf.setFontSize(7);
    pdf.text('WAT JOU IN BEWEGING BRENGT', page.x + boxPadX, y + boxPadY);

    // Italic quote in primary color — gegarandeerd één regel
    setText(pdf, primaryColor);
    pdf.setFont(FONT_HEAD, 'italic');
    pdf.setFontSize(quoteSize);
    pdf.text(data.kracht, page.x + boxPadX, y + boxPadY + 7);

    y += krachtH + 6;
  }

  // ── "WAAR JE OP LEEGLOOPT" — ×-lijst
  const leeglopers = (data.leeglopers || []).slice(0, 3);
  if (leeglopers.length) {
    setText(pdf, COLOR.textMuted);
    pdf.setFont(FONT_BODY, 'bold');
    pdf.setFontSize(7);
    pdf.text('WAAR JE OP LEEGLOOPT', page.x, y);
    y += 6;

    // Laatste onderlijn moet vóór "→ ZIE ACHTERKANT" stoppen anders kruist hij
    // de footer-label rechtsonder.
    const footerLabelZoneX = PAGE_W - MARGIN_X - 32;

    leeglopers.forEach((item, idx) => {
      drawCrossMarker(pdf, page.x + 1.4, y - 1.5, 2.4, primaryColor);
      setText(pdf, COLOR.textSoft);
      pdf.setFont(FONT_BODY, 'normal');
      pdf.setFontSize(9);
      pdf.text(String(item), page.x + 5, y);

      y += 1.8;
      setDraw(pdf, COLOR.border);
      pdf.setLineWidth(0.15);
      const lineEndX = (idx === leeglopers.length - 1)
        ? Math.min(page.x + page.w, footerLabelZoneX)
        : page.x + page.w;
      pdf.line(page.x + 5, y, lineEndX, y);
      y += 3.0;
    });
  }

  // ── Bottom: vector-arrow + "ZIE ACHTERKANT"
  //    jsPDF default font heeft '→' (U+2192) niet in z'n WinAnsi-encoding,
  //    dus tekenen we het pijltje als kleine lijnen — blijft scherp + premium.
  setText(pdf, COLOR.textMuted);
  pdf.setFont(FONT_BODY, 'bold');
  pdf.setFontSize(7);
  const footerLabel = 'ZIE ACHTERKANT';
  const labelW = pdf.getTextWidth(footerLabel);
  const footerY = PAGE_H - 9;
  const labelX = PAGE_W - MARGIN_X;
  pdf.text(footerLabel, labelX, footerY, { align: 'right' });

  // Pijltje links van de label
  setDraw(pdf, COLOR.textMuted);
  pdf.setLineWidth(0.35);
  const arrowEndX = labelX - labelW - 2;
  const arrowStartX = arrowEndX - 4;
  const arrowY = footerY - 1.4;
  pdf.line(arrowStartX, arrowY, arrowEndX, arrowY);
  pdf.line(arrowEndX, arrowY, arrowEndX - 1.4, arrowY - 0.9);
  pdf.line(arrowEndX, arrowY, arrowEndX - 1.4, arrowY + 0.9);
}

// --- page 2: achterkant ------------------------------------------------------

function renderBack(pdf, data, primaryColor) {
  const page = { x: MARGIN_X, y: MARGIN_Y, w: CONTENT_W };

  // Achtergrond
  setFill(pdf, COLOR.bg);
  pdf.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // ── Top eyebrow + TOF-mark rechts
  let y = page.y;
  setText(pdf, COLOR.textMuted);
  pdf.setFont(FONT_BODY, 'bold');
  pdf.setFontSize(7);
  pdf.text('JOUW IDEALE WERKPLEKMIX', page.x, y);

  drawTofMark(pdf, page.x + page.w - 5, y - 1.2, 4.4, primaryColor);

  // ── Big serif title — op één regel
  y += 9;
  setText(pdf, COLOR.text);
  pdf.setFont(FONT_HEAD, 'normal');
  pdf.setFontSize(16);
  pdf.text('Wat jij nodig hebt in de werkomgeving.', page.x, y);

  // ── Workplace cards (lijst, geen bars) — compact, luchtige typografie.
  //    Body wrapt naar 2 regels indien nodig, met intelligente ellipsis.
  //    Body gebruikt volle card-breedte (onder titel + score), niet onder de score.
  y += 7;
  const wp = (data.workplace || []).slice(0, 9);
  const cardPadX = 5;
  const cardPadY = 1.8;
  const titleSize = 9;
  const bodySize = 7.2;
  const bodyLineH = 3.4;
  const titleBaselineY = cardPadY + 3.0;          // title hoger in de card
  const bodyStartY = cardPadY + 7.2;              // ruimere gap title → body (4.2mm)
  const cardBottomPad = 0.4;
  const cardGap = 1.0;

  wp.forEach((row) => {
    pdf.setFont(FONT_HEAD, 'italic');
    pdf.setFontSize(bodySize);
    const bodyText = String(row.text || '');
    // Forceer 1 regel (zoals version A): pak alleen de eerste zin, met ellipsis als 't niet past.
    const bodyAvail = page.w - cardPadX * 2; // body op eigen regel, mag volle breedte
    const firstSentence = bodyText.split(/(?<=[.!?])\s+/)[0] || bodyText;
    let oneLine = firstSentence;
    while (oneLine && pdf.getTextWidth(oneLine) > bodyAvail) {
      oneLine = oneLine.replace(/\s+\S+\s*$/, '');
    }
    if (oneLine && oneLine.length < firstSentence.length) oneLine += '…';
    const bodyLines = [oneLine];
    const bodyBlockH = bodyLines.length * bodyLineH;
    const cardH = bodyStartY + bodyBlockH + cardBottomPad;

    // Card achtergrond
    setFill(pdf, COLOR.surface);
    setDraw(pdf, COLOR.border);
    pdf.setLineWidth(0.18);
    pdf.roundedRect(page.x, y, page.w, cardH, 1.4, 1.4, 'FD');

    // Linker accent-streep
    setFill(pdf, primaryColor);
    pdf.rect(page.x, y, 0.9, cardH, 'F');

    // Naam — serif normal (luchtig)
    setText(pdf, COLOR.text);
    pdf.setFont(FONT_HEAD, 'normal');
    pdf.setFontSize(titleSize);
    pdf.text(row.label || row.key || '', page.x + cardPadX, y + titleBaselineY);

    // Score rechts
    const scoreNum = Number(row.score);
    const scoreStr = isFinite(scoreNum) ? scoreNum.toFixed(1) : '';
    setText(pdf, COLOR.textMuted);
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(6.8);
    pdf.text(`score ${scoreStr}`, page.x + page.w - cardPadX, y + titleBaselineY, { align: 'right' });

    // Body — italic serif, lichter color, ruime line-height
    setText(pdf, '#807468');
    pdf.setFont(FONT_HEAD, 'italic');
    pdf.setFontSize(bodySize);
    bodyLines.forEach((line, i) => {
      pdf.text(line, page.x + cardPadX, y + bodyStartY + i * bodyLineH);
    });

    y += cardH + cardGap;
  });

  // ── "WAT HELPT IN LEIDERSCHAP" — compact soft panel
  if (data.leiderschap) {
    y += 2.4;
    const panelPad = 4;
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(7.8);
    const leiderLines = wrapCount(pdf, data.leiderschap, page.w - panelPad * 2);
    const lineH = 3.6;
    const panelH = leiderLines * lineH + panelPad * 2 + 3.6;

    // Cream paneel
    setFill(pdf, '#E8D9C2');
    setDraw(pdf, '#C9B89C');
    pdf.setLineWidth(0.22);
    pdf.roundedRect(page.x, y, page.w, panelH, 1.6, 1.6, 'FD');

    // Eyebrow
    setText(pdf, COLOR.textMuted);
    pdf.setFont(FONT_BODY, 'bold');
    pdf.setFontSize(6.8);
    pdf.text('WAT HELPT IN LEIDERSCHAP', page.x + panelPad, y + panelPad);

    // Body
    setText(pdf, COLOR.text);
    pdf.setFont(FONT_BODY, 'normal');
    pdf.setFontSize(7.8);
    drawWrappedText(
      pdf,
      data.leiderschap,
      page.x + panelPad,
      y + panelPad + 4.2,
      page.w - panelPad * 2,
      lineH
    );

    y += panelH + 4;
  }

  // ── Bottom signature: italic quote + TOF-mark + tagline (gecentreerd).
  //    Van onder naar boven anchoren zodat tagline, mark en quote nooit
  //    over elkaar lopen, ongeacht hoe lang het leiderschap-panel werd.
  const TAGLINE_Y = PAGE_H - 9;
  const MARK_Y = PAGE_H - 17;
  const MARK_TO_QUOTE_GAP = 5;            // verticale ruimte tussen mark en quote
  const QUOTE_LINE_H = 4.6;

  let quoteLines = [];
  if (data.eindquote && data.eindquote.tekst) {
    pdf.setFont(FONT_HEAD, 'italic');
    pdf.setFontSize(10);
    const quoteText = `"${data.eindquote.tekst}"`;
    quoteLines = pdf.splitTextToSize(quoteText, page.w);
  }

  // Bottom edge van de quote = MARK_Y - MARK_TO_QUOTE_GAP - markRadius
  const quoteBottomY = MARK_Y - MARK_TO_QUOTE_GAP - 3.2;
  const quoteTopY = quoteBottomY - (quoteLines.length - 1) * QUOTE_LINE_H;

  // Veiligheidsmarge: minimaal 4mm vrij ná het leiderschap-panel
  const safeTop = y + 4;
  if (quoteTopY < safeTop) {
    // Niet genoeg ruimte voor standaard plaatsing — duw quote tegen het panel
    // aan en schuif de mark zo nodig omlaag, met respect voor de tagline.
    let qy = safeTop;
    quoteLines.forEach((line, i) => {
      setText(pdf, COLOR.text);
      pdf.setFont(FONT_HEAD, 'italic');
      pdf.setFontSize(10);
      pdf.text(line, PAGE_W / 2, qy + i * QUOTE_LINE_H, { align: 'center' });
    });
    // Mark hoort onder de quote (met gap), maar boven de tagline.
    const wantedMarkY = qy + (quoteLines.length - 1) * QUOTE_LINE_H + MARK_TO_QUOTE_GAP + 3.2;
    const maxMarkY = TAGLINE_Y - 5;
    const newMarkY = Math.min(maxMarkY, Math.max(MARK_Y, wantedMarkY));
    drawTofMark(pdf, PAGE_W / 2, newMarkY, 3.2, COLOR.rose);
  } else {
    quoteLines.forEach((line, i) => {
      setText(pdf, COLOR.text);
      pdf.setFont(FONT_HEAD, 'italic');
      pdf.setFontSize(10);
      pdf.text(line, PAGE_W / 2, quoteTopY + i * QUOTE_LINE_H, { align: 'center' });
    });
    drawTofMark(pdf, PAGE_W / 2, MARK_Y, 3.2, COLOR.rose);
  }

  // Tagline — altijd onderaan
  setText(pdf, COLOR.textMuted);
  pdf.setFont(FONT_BODY, 'normal');
  pdf.setFontSize(7);
  pdf.text(
    'Helping people understand their workplace through insight, design and movement.',
    PAGE_W / 2,
    TAGLINE_Y,
    { align: 'center' }
  );
}

// --- public api --------------------------------------------------------------

/**
 * Genereer en download de personakaart als vector PDF.
 *
 * @param {Object} pdfData       voorkant + achterkant data (zie Results.jsx).
 * @param {string} primaryColor  hex-kleur van de primaire persona.
 * @param {string} fileName      bestandsnaam.
 */
export function downloadPersonaCardVectorPDF({ pdfData, primaryColor, fileName }) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a5',
    compress: true,
  });

  // Brand-fonts (Inter + Playfair Display) — sync met index.css zodat de PDF
  // dezelfde typografie heeft als de webapp.
  setupTofFonts(pdf);

  try {
    pdf.setProperties({
      title: fileName || 'TOF Personakaart',
      subject: `Personakaart — ${pdfData?.voorkant?.persona || ''}`,
      author: 'The Office Factory',
      creator: 'TOF Persona Tool',
      keywords: 'TOF, Persona, Personakaart, The Office Factory',
    });
  } catch (e) {
    // Sommige jsPDF-builds gooien hierop; niet fataal.
  }

  renderFront(pdf, pdfData.voorkant, primaryColor);
  pdf.addPage('a5', 'portrait');
  renderBack(pdf, pdfData.achterkant, primaryColor);

  const safeName = fileName || 'personakaart TOF.pdf';
  try {
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = safeName;
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  } catch (err) {
    console.error('Vector PDF download failed, falling back to pdf.save:', err);
    pdf.save(safeName);
  }
}

export default downloadPersonaCardVectorPDF;
