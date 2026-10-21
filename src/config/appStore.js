/**
 * appStore.js — de app in de stores.
 *
 * APP_IN_STORE staat sinds 10 oktober 2026 op true. Hij had één consument, de
 * app-strook op /team ("Te downloaden" vs "Binnenkort"); die strook is op
 * 21 okt 2026 vervangen door de toegangsstrook, dus de vlag wordt nu nergens
 * meer gelezen. Laten staan of weghalen — hij doet niets.
 */
export const APP_IN_STORE = true;

// Winkelpagina's. Apple zonder landcode, dan kiest de App Store zelf het land
// van de bezoeker.
export const APP_STORE_URL = 'https://apps.apple.com/app/id6818191615';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=services.tof.persona';
