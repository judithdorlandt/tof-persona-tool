/**
 * appStore.js — staat de app in de App Store?
 *
 * Staat sinds 10 oktober 2026 op true: TOF Persona is te downloaden.
 *
 * De vlag bepaalt één ding — of de teampagina zegt "Te downloaden in de App
 * Store" of "Binnenkort in de App Store" (TeamIntro.jsx). De webquiz blijft
 * gewoon open; dat is een bewuste keuze, want de browser is voor veel mensen
 * de makkelijkste eerste kennismaking.
 */
export const APP_IN_STORE = true;

// Winkelpagina's. Apple zonder landcode, dan kiest de App Store zelf het land
// van de bezoeker.
export const APP_STORE_URL = 'https://apps.apple.com/app/id6818191615';
export const GOOGLE_PLAY_URL = 'https://play.google.com/store/apps/details?id=services.tof.persona';
