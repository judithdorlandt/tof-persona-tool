/**
 * routes.js — tweetalige routing.
 *
 * Nederlands is de standaardtaal en leeft op de root (`/intro`).
 * Engels krijgt een taalprefix (`/en/intro`) met vertaalde slugs.
 *
 * Auth-paden zijn bewust TAALNEUTRAAL: Supabase heeft `/auth/callback` en
 * `/auth/confirm` in zijn redirect-whitelist staan en die URL's komen uit
 * een e-mailtemplate. Een taalprefix daar zou bestaande magic-links breken.
 */

export const LANGS = ['nl', 'en'];
export const DEFAULT_LANG = 'nl';
export const EN_PREFIX = '/en';

// Paden die in beide talen identiek zijn (zie toelichting hierboven).
const NEUTRAL_PAGES = ['authcallback', 'authconfirm'];

// Slug per pagina per taal, zónder taalprefix. '' = de homepage van de taal.
const SLUGS = {
  nl: {
    landing: '',
    home: '/home',
    intro: '/intro',
    library: '/library',
    quiz: '/quiz',
    results: '/results',
    team: '/team',
    teamdashboard: '/team/dashboard',
    teamdynamics: '/team/dynamics',
    teamstrategic: '/team/strategisch',
    teamselector: '/team/selector',
    teamwerkplekprofiel: '/team/werkplekprofiel',
    login: '/login',
    testerlogin: '/start',
    admin: '/admin',
    strategischkompas: '/strategisch-kompas',
    strategischkompasintake: '/strategisch-kompas/intake',
    strategischkompasreview: '/strategisch-kompas/review',
    quiztest: '/quiz-test',
    authcallback: '/auth/callback',
    authconfirm: '/auth/confirm',
  },
  en: {
    landing: '',
    home: '/home',
    intro: '/intro',
    library: '/library',
    quiz: '/quiz',
    results: '/results',
    team: '/team',
    teamdashboard: '/team/dashboard',
    teamdynamics: '/team/dynamics',
    teamstrategic: '/team/strategic',
    teamselector: '/team/selector',
    teamwerkplekprofiel: '/team/workplace-profile',
    login: '/login',
    testerlogin: '/start',
    admin: '/admin',
    strategischkompas: '/strategic-compass',
    strategischkompasintake: '/strategic-compass/intake',
    strategischkompasreview: '/strategic-compass/review',
    quiztest: '/quiz-test',
    authcallback: '/auth/callback',
    authconfirm: '/auth/confirm',
  },
};

export const PAGES = Object.keys(SLUGS.nl);

/** Volledig pad voor een pagina in een taal, inclusief taalprefix. */
export function pagePath(page, lang = DEFAULT_LANG) {
  const table = SLUGS[lang] || SLUGS[DEFAULT_LANG];
  const slug = table[page];
  if (slug === undefined) return pagePath('landing', lang);
  if (lang === DEFAULT_LANG || NEUTRAL_PAGES.includes(page)) return slug || '/';
  return `${EN_PREFIX}${slug}`;
}

/** Dubbele slashes inklappen en trailing slash weg. Levert altijd '/...' op. */
function normalizePath(pathname) {
  const collapsed = String(pathname || '/').replace(/\/{2,}/g, '/').replace(/\/+$/, '');
  return collapsed || '/';
}

/**
 * Leidt pagina én taal af uit een URL-pad.
 * Onbekende paden vallen terug op de landingspagina in de gedetecteerde taal.
 */
export function resolvePath(pathname) {
  const path = normalizePath(pathname);

  const isEnglish = path === EN_PREFIX || path.startsWith(`${EN_PREFIX}/`);
  const lang = isEnglish ? 'en' : DEFAULT_LANG;
  const slug = isEnglish ? path.slice(EN_PREFIX.length) : path;

  const table = SLUGS[lang];
  const match = PAGES.find((page) => (table[page] || '/') === (slug || '/'));
  return { page: match || 'landing', lang };
}

/** Het equivalente pad van de huidige pagina in een andere taal. */
export function switchLangPath(page, nextLang) {
  return pagePath(page, nextLang);
}
