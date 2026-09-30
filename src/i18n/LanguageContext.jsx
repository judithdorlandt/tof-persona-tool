/**
 * LanguageContext.jsx — taalkeuze voor de hele app.
 *
 * De URL is de bron van waarheid: `/en/...` is Engels, al het andere
 * Nederlands. Voor taalneutrale paden (de auth-flow, die uit een Supabase
 * e-mailtemplate komt) valt de app terug op de laatst gekozen taal uit
 * localStorage.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { DEFAULT_LANG, LANGS, pagePath, resolvePath, switchLangPath } from './routes';
import { getCopy } from './copy';
import { IS_NATIVE } from '../config/platform';

const STORAGE_KEY = 'tof_lang';

const LanguageContext = createContext({
  lang: DEFAULT_LANG,
  setLang: () => {},
  rememberLang: () => {},
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

  /**
   * De taal vastleggen zonder te navigeren. De app gebruikt dit als je het
   * landingsscherm verlaat: daarmee is de keuze gemaakt, ook als je gewoon
   * de standaardtaal liet staan.
   */
  const rememberLang = useCallback(() => storeLang(lang), [lang]);

  // De app start altijd op de kale root. Heb je hier eerder een taal gekozen,
  // dan is het landingsscherm zijn werk kwijt: dan ga je meteen door naar de
  // app, in díe taal. Alleen de allereerste start toont de landing.
  //
  // Eén keer bij het opstarten (useRef), anders zou een klik op "Nederlands"
  // — die naar '/' navigeert — meteen worden weggestuurd. Op het web gebeurt
  // dit niet: daar is de URL gedeeld en gebookmarkt, en beslist de link.
  const startupHandled = useRef(false);
  useEffect(() => {
    if (startupHandled.current) return;
    startupHandled.current = true;
    if (!IS_NATIVE) return;
    if (location.pathname !== '/') return;
    const stored = readStoredLang();
    if (!stored) return;
    routerNavigate(pagePath('home', stored), { replace: true });
  }, [location.pathname, routerNavigate]);

  const value = useMemo(
    () => ({ lang, setLang, rememberLang, copy: getCopy(lang) }),
    [lang, setLang, rememberLang]
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
