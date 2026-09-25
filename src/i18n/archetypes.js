/**
 * archetypes.js — structuur (src/data.js) + teksten (copy/<taal>/archetypes.js)
 * samengevoegd tot dezelfde vorm als de vroegere `ARCHETYPES`-array.
 *
 * Het resultaat wordt per taal gecachet zodat de array-identiteit stabiel is:
 * aanroepers gebruiken hem in `useMemo`-dependencies.
 */
import { ARCHETYPE_ORDER, ARCHETYPE_STRUCTURE } from '../data';
import { getCopy } from './copy';
import { useLang } from './LanguageContext';

const cache = {};

/** De persona's in de gevraagde taal, in de vaste ARCHETYPE_ORDER-volgorde. */
export function getArchetypes(lang) {
  if (!cache[lang]) {
    const { archetypes } = getCopy(lang);
    cache[lang] = ARCHETYPE_ORDER.map((id) => ({
      ...ARCHETYPE_STRUCTURE[id],
      ...archetypes[id],
    }));
  }
  return cache[lang];
}

/** Hook-variant voor gebruik in componenten. */
export function useArchetypes() {
  return getArchetypes(useLang().lang);
}
