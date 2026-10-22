/**
 * teamDynamicsLogic - pure functies voor TeamDynamics view.
 * Geextraheerd uit TeamDynamics.jsx voor overzicht en testbaarheid.
 *
 * Alle tekst komt uit copy/<taal>/teamDynamics.js. Functies die tekst
 * teruggeven krijgen `lang` als laatste parameter en halen hun strings op
 * via `getCopy(lang).teamDynamics`.
 */
import { ARCHETYPE_ORDER } from '../data';
import { getArchetypes } from '../i18n/archetypes';
import { getCopy } from '../i18n/copy';
import { getDynamics } from '../insights';
import { MODULE } from '../ui/tokens';

const ACCENT = MODULE.dynamics.accent;

function t(lang) {
    return getCopy(lang).teamDynamics;
}

export const PERSONA_COLORS = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

// =========================
// TENSION PAIRS
// =========================
// Alleen de structuur: welke twee werkstijlen vormen een spanningsveld.
// De sleutel `${a}:${b}` is een logica-id en wijst naar
// copy.tensions.pairs — daar staan label/desc/risk/leadership.
export const TENSION_PAIRS = [
    { a: 'presteerder', b: 'verbinder' },
    { a: 'maker', b: 'zekerzoeker' },
    { a: 'denker', b: 'presteerder' },
    { a: 'vernieuwer', b: 'zekerzoeker' },
    { a: 'teamspeler', b: 'maker' },
    { a: 'groeier', b: 'zekerzoeker' },
];

// =========================
// LEADERSHIP MAP
// =========================
/** Drie leiderschapsacties per persona, in de gevraagde taal. */
export function getLeadershipMap(lang = 'nl') {
    return t(lang).leadership.actions;
}

export function getArchetype(id, lang = 'nl') {
    return getArchetypes(lang).find((a) => a.id === id) || null;
}

export function resolveTeamName(sel, lang = 'nl') {
    const fallback = t(lang).fallbackTeamName;
    if (!sel) return fallback;
    if (typeof sel === 'string') return sel;
    return sel.name || sel.team || fallback;
}

export function resolveTeamKey(sel) {
    if (!sel) return '';
    if (typeof sel === 'string') return sel;
    return sel.team || '';
}

export function resolveOrg(sel) {
    if (!sel || typeof sel === 'string') return '';
    return sel.organization || '';
}

export function buildPersonaScores(teamResponses) {
    const scores = {};
    teamResponses.forEach((r) => {
        const full = r?.full_scores || {};
        if (Object.keys(full).length > 0) {
            Object.entries(full).forEach(([k, v]) => {
                scores[k] = (scores[k] || 0) + Number(v || 0);
            });
            return;
        }
        if (r?.primary_archetype) scores[r.primary_archetype] = (scores[r.primary_archetype] || 0) + 3;
        if (r?.secondary_archetype) scores[r.secondary_archetype] = (scores[r.secondary_archetype] || 0) + 2;
        if (r?.tertiary_archetype) scores[r.tertiary_archetype] = (scores[r.tertiary_archetype] || 0) + 1;
    });
    return scores;
}

// Aandeel in de teamenergie, afgerond op hele procenten — zoals het scherm
// het toont. De grenzen (10% spanning, 8% ontbreekt) toetsen op dit getal,
// zodat "Teamspeler 10%" ook als 10% meetelt (besluit Judith, 22 okt 2026).
export function energyPercentages(sorted) {
    const total = sorted.reduce((sum, [, v]) => sum + Number(v || 0), 0);
    const pct = {};
    sorted.forEach(([id, v]) => {
        pct[id] = total > 0 ? Math.round((Number(v || 0) / total) * 100) : 0;
    });
    return pct;
}

export const TENSION_MIN_PCT = 10;
export const MAX_TENSIONS = 3;
export const MISSING_BELOW_PCT = 8;

// Actief als beide werkstijlen minstens 10% van de teamenergie hebben
// (besluit 2). Gesorteerd op de zwakste van de twee, hoogste eerst;
// hoogstens drie.
export function findActiveTensions(sorted, lang = 'nl') {
    const pct = energyPercentages(sorted);
    const raw = Object.fromEntries(sorted);
    const pairs = t(lang).tensions.pairs;
    return TENSION_PAIRS
        .filter((p) => (pct[p.a] || 0) >= TENSION_MIN_PCT && (pct[p.b] || 0) >= TENSION_MIN_PCT)
        .map((p) => ({
            ...p,
            ...(pairs[`${p.a}:${p.b}`] || {}),
            weakest: Math.min(pct[p.a], pct[p.b]),
            weakestRaw: Math.min(raw[p.a] || 0, raw[p.b] || 0),
        }))
        .sort((x, y) => y.weakest - x.weakest || y.weakestRaw - x.weakestRaw)
        .slice(0, MAX_TENSIONS);
}

export function buildDynamicsAxes(sorted, totalScore, lang = 'nl') {
    // Alleen de index-mapping is nodig — die is taal-onafhankelijk.
    const idx = {};
    ARCHETYPE_ORDER.forEach((id, i) => { idx[id] = i; });
    const pcts = Array(8).fill(0);
    sorted.forEach(([id, value]) => {
        const i = idx[id];
        if (i !== undefined && totalScore > 0) pcts[i] = Math.round((value / totalScore) * 100);
    });
    return getDynamics(pcts, lang);
}

export function findMissingCritical(sorted, lang = 'nl') {
    const present = new Set(sorted.filter(([, v]) => v > 0).map(([id]) => id));
    return ['denker', 'verbinder', 'vernieuwer']
        .filter((id) => !present.has(id))
        .map((id) => ({ id, archetype: getArchetype(id, lang) }))
        .filter((x) => x.archetype);
}

export function buildLeadershipActions(sorted, lang = 'nl') {
    const map = getLeadershipMap(lang);
    return sorted
        .slice(0, 3)
        .filter(([id]) => map[id])
        .map(([id]) => ({
            id,
            persona: getArchetype(id, lang)?.name || id,
            color: PERSONA_COLORS[id],
            items: map[id],
        }));
}

export function findMentionedPersona(text, presentMap, lang = 'nl') {
    const lowered = String(text).toLowerCase();
    for (const arch of getArchetypes(lang)) {
        if (!presentMap[arch.id]) continue;
        if (lowered.includes(arch.name.toLowerCase())) {
            return {
                id: arch.id,
                name: arch.name,
                color: PERSONA_COLORS[arch.id] || ACCENT,
            };
        }
    }
    return null;
}

// =========================
// DYNAMICS-AS UITLEG — uitgeschreven per richting
// =========================
// Geeft per as een uitgeschreven leeszin afhankelijk van richting & disbalans.
// axis.left / axis.right komen uit src/insights.js.

export function describeAxis(axis, lang = 'nl') {
    const total = axis.lv + axis.rv;
    if (total === 0) return axis.desc || '';

    const lPct = Math.round((axis.lv / total) * 100);
    const rPct = 100 - lPct;
    const balanced = Math.abs(lPct - rPct) <= 20;

    const left = (axis.left || '').trim();
    const right = (axis.right || '').trim();
    const dominant = lPct >= rPct ? left : right;
    const recessive = lPct >= rPct ? right : left;

    const copy = t(lang).dynamics;
    if (balanced) return copy.axisBalanced(left, right);
    return copy.axisDominant(dominant, recessive);
}

// =========================
// MAIN COMPONENT
// =========================
