/**
 * copy/index.js — alle teksten per taal, gebundeld tot één object.
 *
 * Gebruik in componenten:  const c = useCopy();  <h1>{c.nav.home}</h1>
 * Gebruik buiten React (PDF's, utils):  const c = getCopy(lang);
 *
 * Regel: teksten staan ALTIJD hier, nooit hardcoded in een component.
 * De namespaces hieronder volgen de mappenstructuur van de app.
 */
import { DEFAULT_LANG, LANGS } from '../routes';

import nl from './nl';
import en from './en';

const DICTS = { nl, en };

export function getCopy(lang) {
  return DICTS[lang] || DICTS[DEFAULT_LANG];
}

/**
 * Actieve taal voor code die buiten React draait en geen `lang` doorgegeven
 * krijgt (supabase.js). Zelfde bron van waarheid als LanguageContext: eerst de
 * URL (`/en/...`), daarna de laatst gekozen taal uit localStorage.
 */
export function getActiveLang() {
  try {
    const [, first] = window.location.pathname.split('/');
    if (LANGS.includes(first)) return first;

    const stored = window.localStorage.getItem('tof_lang');
    if (LANGS.includes(stored)) return stored;
  } catch (_e) {
    /* geen window/localStorage — val terug op de standaardtaal */
  }

  return DEFAULT_LANG;
}
