/**
 * platform.js — één buildvlag dat web en app uit elkaar houdt.
 *
 * De app-build (`npm run build:app`) zet REACT_APP_PLATFORM=native. Alles
 * wat alleen op het web thuishoort — teammodules, admin, inloggen, links
 * naar buiten — blijft in de code staan, maar is in app-modus onbereikbaar.
 */
export const IS_NATIVE = process.env.REACT_APP_PLATFORM === 'native';

/**
 * De enige pagina's die de app kent: stap 1, de individuele persona-tool,
 * plus de historie en de gespreksvoorbereiding die alleen in de app bestaan.
 * Alles daarbuiten valt terug op de startpagina.
 */
export const NATIVE_PAGES = [
    'home',
    'intro',
    'quiz',
    'results',
    'library',
    'historie',
    'gesprek',
    'privacy',
];

/** Pagina's die alleen in de app bestaan en op het web niets te zoeken hebben. */
export const NATIVE_ONLY_PAGES = ['historie', 'gesprek', 'privacy'];

export function isPageAllowed(page) {
    if (IS_NATIVE) return NATIVE_PAGES.includes(page);
    return !NATIVE_ONLY_PAGES.includes(page);
}
