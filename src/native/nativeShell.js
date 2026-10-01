/**
 * nativeShell.js — alles wat alleen in de app-build aan het toestel raakt.
 *
 * Eén ingang (`initNativeShell`) die vanuit src/index.js wordt aangeroepen en
 * op het web niets doet. De Capacitor-plugins worden dynamisch geïmporteerd,
 * zodat ze niet in de webbundel belanden.
 */
import { IS_NATIVE } from '../config/platform';

// Huisstijl-achtergrond; statusbalk en splash krijgen dezelfde kleur zodat de
// app niet begint met een randje van een andere tint.
const TOF_BG = '#F7F3EE';

/**
 * Zet het zoomen uit. `viewport-fit=cover` staat al in public/index.html — dat
 * moet daar staan, want iOS berekent de safe-area-insets alleen bij het laden.
 * Wat híér gebeurt is iets anders: in een app hoort de pagina niet te kunnen
 * zoomen. Deed hij dat wel, dan kon je na een dubbeltik heen en weer schuiven
 * en liep de tekst buiten beeld. Op het web blijft zoomen gewoon mogelijk —
 * dat hoort daar, ook voor wie slecht ziet.
 */
function lockViewport() {
  const meta = document.querySelector('meta[name="viewport"]');
  if (meta) {
    meta.setAttribute(
      'content',
      'width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1, user-scalable=no'
    );
  }
}

export async function initNativeShell() {
  if (!IS_NATIVE) return;

  lockViewport();

  try {
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    // Donkere iconen op onze lichte achtergrond. setBackgroundColor is
    // Android-only; op iOS gooit dat een "not implemented" en dat mag geen
    // invloed hebben op de rest.
    await StatusBar.setStyle({ style: Style.Light });
    try {
      await StatusBar.setBackgroundColor({ color: TOF_BG });
    } catch (_e) {
      /* iOS kent geen statusbalk-achtergrond — geen probleem. */
    }
  } catch (_e) {
    /* Plugin niet beschikbaar (bijv. in de browser-preview): negeren. */
  }

  try {
    const { SplashScreen } = await import('@capacitor/splash-screen');
    // De splash verdwijnt pas als React staat; daarom hier en niet
    // automatisch (launchAutoHide staat uit in capacitor.config.json).
    await SplashScreen.hide();
  } catch (_e) {
    /* Idem. */
  }
}

/**
 * Korte tik bij een keuze. `strong` voor het moment dat het profiel in beeld
 * komt. Bewust spaarzaam: alleen deze twee momenten.
 */
export async function tap(strong = false) {
  if (!IS_NATIVE) return;
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({
      style: strong ? ImpactStyle.Medium : ImpactStyle.Light,
    });
  } catch (_e) {
    /* Geen haptiek beschikbaar — stil doorgaan. */
  }
}
