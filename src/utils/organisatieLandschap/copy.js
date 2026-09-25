/**
 * copy.js — taalresolver voor de Organisatie-Landschap PDF.
 *
 * Eén ingang: `getOLCopy(lang)`. De pagina-builders importeren NOOIT zelf
 * `copy.nl` of `copy.en`; ze krijgen het opgeloste copy-object doorgegeven
 * vanuit `generateOrganisatieLandschapPDF`.
 */
import { COPY_NL } from './copy.nl';
import { COPY_EN } from './copy.en';

export function getOLCopy(lang) {
    return lang === 'en' ? COPY_EN : COPY_NL;
}

export { COPY_NL, COPY_EN };
