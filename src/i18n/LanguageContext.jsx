/**
 * LanguageContext.jsx — taalkeuze voor de hele app.
 *
 * De URL is de bron van waarheid: `/en/...` is Engels, al het andere
 * Nederlands. Voor taalneutrale paden (de auth-flow, die uit een Supabase
 * e-mailtemplate komt) valt de app terug op de laatst gekozen taal uit
 * localStorage.
 */
import { createContext, useCallback, useContext, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DEFAULT_LANG, LANGS, resolvePath, switchLangPath } from './routes';
import { getCopy } from './copy';

const STORAGE_KEY = 'tof_lang';

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  copy: getCopy(DEFAULT_LANG),
});

function readStoredLang() {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return LANGS.includes(stored) ? stored : null;
  } catch (_e) {
    return null;
  }
}

function storeLang(lang) {
  try {
    window.localStorage.setItem(STORAGE_KEY, lang);
  } catch (_e) {
    /* private browsing — taal blijft dan alleen in de URL zitten */
  }
}

export function LanguageProvider({ children }) {
  const location = useLocation();
  const routerNavigate = useNavigate();

  const { page, lang: pathLang } = resolvePath(location.pathname);

  // Taalneutrale paden (auth) dragen geen taal in de URL. Daar gebruiken we
  // de laatst gekozen taal, zodat een magic-link niet ineens van taal wisselt.
  const isNeutral = page === 'authcallback' || page === 'authconfirm';
  const lang = isNeutral ? (readStoredLang() || DEFAULT_LANG) : pathLang;

  const setLang = useCallback(
    (nextLang) => {
      if (!LANGS.includes(nextLang)) return;
      storeLang(nextLang);
      routerNavigate(switchLangPath(page, nextLang) + location.search);
    },
    [page, location.search, routerNavigate]
  );

  const value = useMemo(
    () => ({ lang, setLang, copy: getCopy(lang) }),
    [lang, setLang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

/** `const { lang, setLang } = useLang()` */
export function useLang() {
  return useContext(LanguageContext);
}

/** `const c = useCopy()` — het volledige tekstenobject voor de huidige taal. */
export function useCopy() {
  return useContext(LanguageContext).copy;
}
