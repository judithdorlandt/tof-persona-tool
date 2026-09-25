/**
 * insights — afgeleide "signalen" over een team (betrouwbaarheid, balans,
 * spanningsassen, toon en de signatuurzin).
 *
 * Alle tekst komt uit copy/<taal>/teamSignals.js. Functies die tekst
 * teruggeven krijgen `lang` als LAATSTE parameter met default 'nl', zodat
 * bestaande aanroepers blijven werken.
 */
import { getArchetypes } from './i18n/archetypes';
import { getCopy } from './i18n/copy';

function t(lang) {
  return getCopy(lang).teamSignals;
}

export function getConfidence(n, lang = 'nl') {
  const c = t(lang).confidence;
  if (n < 5) return {
    level: 'low', label: c.low.label, cls: 'low', icon: '◎',
    text: c.low.text(n),
  };
  if (n <= 15) return {
    level: 'emerging', label: c.emerging.label, cls: 'emerging', icon: '◑',
    text: c.emerging.text(n),
  };
  if (n <= 30) return {
    level: 'reliable', label: c.reliable.label, cls: 'reliable', icon: '●',
    text: c.reliable.text(n),
  };
  return {
    level: 'strong', label: c.strong.label, cls: 'strong', icon: '◉',
    text: c.strong.text(n),
  };
}

export function getMaturity(pcts, srt, lang = 'nl') {
  const c = t(lang).maturity;
  const dominant = srt.filter(x => pcts[x.i] > 40);
  const thin = srt.filter(x => pcts[x.i] > 0 && pcts[x.i] < 5);
  const absent = srt.filter(x => pcts[x.i] === 0);

  if (dominant.length >= 1 && (absent.length + thin.length) >= 3) return {
    level: 1, label: c.imbalance.label, color: 'rose',
    stmt: c.imbalance.stmt,
    explain: c.imbalance.explain,
  };

  const spread = srt.filter(x => pcts[x.i] >= 10).length;
  if (spread >= 5) return {
    level: 3, label: c.complementary.label, color: 'green',
    stmt: c.complementary.stmt,
    explain: c.complementary.explain,
  };

  return {
    level: 2, label: c.functional.label, color: 'amber',
    stmt: c.functional.stmt,
    explain: c.functional.explain,
  };
}

/** Bouwt één as: kiest de desc/tension-variant op basis van de weging. */
function buildAxis(copy, leftValue, rightValue) {
  const leftDominant = leftValue > rightValue + 20;
  const rightDominant = rightValue > leftValue + 20;
  return {
    label: copy.label,
    left: copy.left,
    right: copy.right,
    lv: Math.min(leftValue, 100),
    rv: Math.min(rightValue, 100),
    desc: leftDominant ? copy.descLeft : rightDominant ? copy.descRight : copy.descBalanced,
    tension: leftDominant ? copy.tensionLeft : rightDominant ? copy.tensionRight : copy.tensionBalanced,
  };
}

export function getDynamics(pcts, lang = 'nl') {
  const c = t(lang).axes;
  const creatie = pcts[0] + pcts[1] + pcts[7];
  const structuur = pcts[6] + Math.round(pcts[3] / 2);
  const verbinding = pcts[4] + pcts[5];
  const individueel = pcts[0] + pcts[2] + pcts[3];
  const executie = pcts[2] + pcts[7];
  const reflectie = pcts[3] + pcts[1];

  return [
    buildAxis(c.creationStructure, creatie, structuur),
    buildAxis(c.connectionIndividual, verbinding, individueel),
    buildAxis(c.executionReflection, executie, reflectie),
  ];
}

export function getAdaptiveTone(conf, maturity, lang = 'nl') {
  const c = t(lang).tone;
  if (conf.level === 'low') return c.low;
  if (conf.level === 'emerging') return c.emerging;
  if (maturity.level === 1) return c.imbalance;
  return c.confident;
}

export function getSignatureLine(dom, missing, maturity, dynamics, lang = 'nl') {
  const c = t(lang).signature;
  const ids = dom.map(a => a.id);
  if (ids.includes('presteerder') && !ids.includes('verbinder'))
    return c.achieverWithoutConnector;
  if (ids.includes('maker') && ids.includes('zekerzoeker'))
    return c.makerAndStabiliser;
  if (ids.includes('vernieuwer') && ids.includes('zekerzoeker'))
    return c.innovatorAndStabiliser;
  if (missing.some(a => a.id === 'verbinder') && ids.includes('presteerder'))
    return c.missingConnectorWithAchiever;
  if (missing.some(a => a.id === 'vernieuwer'))
    return c.missingInnovator;
  if (maturity.level === 3)
    return c.complementary;
  if (maturity.level === 1)
    return c.imbalance;
  const d = dynamics[0];
  if (d.lv > d.rv + 25)
    return c.ideasWithoutStructure;
  if (d.rv > d.lv + 25)
    return c.structureWithoutCreation;
  return c.fallback;
}

export function aggregateProfiles(profiles, lang = 'nl') {
  const ARCHETYPES = getArchetypes(lang);
  const cnt = [0, 0, 0, 0, 0, 0, 0, 0];
  profiles.forEach(p => {
    const pi = ARCHETYPES.findIndex(a => a.id === p.primary_archetype);
    const si = ARCHETYPES.findIndex(a => a.id === p.secondary_archetype);
    const ti = ARCHETYPES.findIndex(a => a.id === p.tertiary_archetype);
    if (pi >= 0) cnt[pi] += 3;
    if (si >= 0) cnt[si] += 2;
    if (ti >= 0) cnt[ti] += 1;
  });
  const tot = cnt.reduce((a, b) => a + b, 0) || 1;
  const pcts = cnt.map(c => Math.round((c / tot) * 100));
  const srt = cnt.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c);
  const dom = srt.filter(x => x.c > 0).slice(0, 3).map(x => ARCHETYPES[x.i]);
  const missing = srt.filter(x => x.c === 0).map(x => ARCHETYPES[x.i]);
  const missCrit = missing.filter(a => ['denker', 'verbinder', 'vernieuwer'].includes(a.id));

  const n = profiles.length;
  const conf = getConfidence(n, lang);
  const maturity = getMaturity(pcts, srt, lang);
  const dynamics = getDynamics(pcts, lang);
  const tone = getAdaptiveTone(conf, maturity, lang);
  const sig = getSignatureLine(dom, missing, maturity, dynamics, lang);

  return { cnt, pcts, srt, dom, missing, missCrit, conf, maturity, dynamics, tone, sig };
}
