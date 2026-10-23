/**
 * organisatieAggregation.js — alle berekeningen op één plek.
 *
 * Pagina-builders krijgen een `data`-bundel binnen, niet de rauwe Supabase-input.
 * Daardoor zijn pagina's dom (alleen render) en is logica testbaar.
 *
 * Lost op:
 *  - Fout #4 pagina 1: betrouwbaarheidscategorie per team al voorbereid.
 *  - Fout #1 pagina 1 (cellen): verschil tussen "0% gemeten" en "niet aanwezig"
 *    wordt hier expliciet in de matrix gezet als null vs 0.
 *  - Fout #2 pagina 2 (schaal): workplaceNeeds genormaliseerd naar 0–100 voor
 *    weergave op échte schaal.
 */

import {
    ARCHETYPE_ORDER,
    getArchetypeName,
    getPersonaDrive,
    PERSONA_COLORS,
    reliabilityFor,
} from './constants';
import { getOLCopy } from './copy';
import { getArchetypes } from '../../i18n/archetypes';
import { MIN_TEAM_RESPONSES } from '../access';

/**
 * Hoofd-entry — verwerkt input van Admin tot stabiele dataset voor pagina's.
 *
 * `copy`/`lang` komen uit `generateOrganisatieLandschapPDF`. Alle afgeleide
 * zinnen worden via `copy.data.*` gevormd; hier staat geen losse tekst meer.
 */
export function prepareOrganisatieData({
    aggregate,
    insights,
    teamSummaries = [],
    organizationName = 'Organisatie',
    observations = [],
    lang = 'nl',
    copy = getOLCopy(lang),
}) {
    const cd = copy.data;
    const allTeams = [...teamSummaries];
    const activeTeams = allTeams.filter((t) => (t.responseCount || 0) > 0);
    const inactiveTeams = allTeams.filter((t) => (t.responseCount || 0) === 0);

    const totalRespondents = aggregate?.teamCount || 0;

    // Drempel van vijf, ook hier (zie utils/access.js): een team onder de vijf
    // krijgt geen eigen rij en nergens een eigen cijfer, anders is een uitslag
    // herleidbaar tot een persoon. In het organisatietotaal tellen ze altijd
    // mee (dat komt uit `aggregate`).
    //
    // Alles zonder eigen rij — kleine teams én profielen die aan geen team
    // gekoppeld zijn — vormt samen de rest-groep "Overige teams". Die mag
    // nooit 1 tot 4 profielen groot zijn: dan is hij terug te rekenen als
    // organisatie min de zichtbare teams. Is hij dat toch, dan gaat het
    // kleinste team met een eigen rij er ook in, tot de rest-groep vijf of
    // meer is. Zonder teams met een eigen rij is de rest-groep de hele
    // organisatie, en die is altijd vijf of meer (anders geen rapport).
    const smallTeams = activeTeams.filter((t) => (t.responseCount || 0) < MIN_TEAM_RESPONSES);
    const ownTeams = activeTeams
        .filter((t) => (t.responseCount || 0) >= MIN_TEAM_RESPONSES)
        .sort((a, b) => (a.responseCount || 0) - (b.responseCount || 0));
    const restSize = () =>
        totalRespondents - ownTeams.reduce((s, t) => s + (t.responseCount || 0), 0);
    while (ownTeams.length > 0 && restSize() > 0 && restSize() < MIN_TEAM_RESPONSES) {
        ownTeams.shift();
    }

    const orgRow = buildOrgRow(aggregate, cd);
    const teamRows = ownTeams
        .map((t) => buildTeamRow(t, cd))
        .sort((a, b) => b.n - a.n);
    if (ownTeams.length > 0 && restSize() >= MIN_TEAM_RESPONSES) {
        teamRows.push(buildRestRow(aggregate, ownTeams, restSize(), cd));
    }

    // Teams zonder eigen beeld: onder de vijf, of nog zonder profielen. Alleen
    // het aantal wordt genoemd, geen namen.
    const teamsWithoutOwnPicture = smallTeams.length + inactiveTeams.length;

    // Reconciliatie respondenten: het organisatietotaal (aggregate.teamCount)
    // telt álle responses; de teams tellen alleen responses die aan een team
    // gekoppeld konden worden. Het verschil maken we expliciet zichtbaar
    // i.p.v. het stil weg te laten. Kleine teams tellen hier mee, ook als ze
    // geen rij krijgen: ze zijn wél gekoppeld.
    const linkedRespondents = activeTeams.reduce((s, t) => s + (t.responseCount || 0), 0);
    const unlinkedRespondents = Math.max(0, totalRespondents - linkedRespondents);
    // Theoretisch kan een response aan meerdere teams matchen (dubbeltelling);
    // dan is linked > totaal. Dat signaleren we apart.
    const overlapRespondents = Math.max(0, linkedRespondents - totalRespondents);

    const dominantStyle = computeDominantStyle(aggregate, lang);
    const topNeed = computeTopWorkplaceNeed(aggregate, cd);
    const workplaceNeeds = computeWorkplaceNeeds(aggregate, cd, 5);
    const leeglopers = computeLeeglopers(insights, cd, aggregate);

    const leegloperObservations = (observations || [])
        .filter((o) => o.category === 'leegloper')
        .map((o) => sanitizeUserText(o.content || ''))
        .filter(Boolean);

    const werktGoedObservations = (observations || [])
        .filter((o) => o.category === 'werkt_goed')
        .map((o) => sanitizeUserText(o.content || ''))
        .filter(Boolean);

    const lowReliabilityTeams = teamRows.filter((r) => r.reliability.id === 'laag');

    return {
        organizationName,
        date: new Date().toLocaleDateString(cd.dateLocale, {
            day: 'numeric', month: 'long', year: 'numeric',
        }),
        totalRespondents,
        linkedRespondents,
        unlinkedRespondents,
        overlapRespondents,
        totalTeams: allTeams.length,
        activeTeamCount: activeTeams.length,
        inactiveTeamCount: inactiveTeams.length,
        inactiveTeams: inactiveTeams.map((t) => getTeamName(t, cd)),
        teamsWithoutOwnPicture,
        dominantStyle,
        topNeed,
        workplaceNeeds,
        workplaceSpread: computeWorkplaceSpread(workplaceNeeds),
        leeglopers,
        leegloperObservations,
        werktGoedObservations,
        teamRows,
        orgRow,
        lowReliabilityTeams,
        // Voor duiding: dominante persona's organisatiebreed (top 2).
        // pct + count erbij zodat de drijfveer-conclusie navolgbaar is tegen
        // de organisatie-rij in de heatmap.
        topPersonas: (aggregate?.personasByPrimary || []).slice(0, 2).map((p) => ({
            id: p.id,
            // Bewust de canonieke naam uit constants (taalvast), niet p.name —
            // die komt uit de generieke aggregatie en kan NL zijn.
            name: getArchetypeName(p.id, lang) || p.name || p.id,
            drive: getPersonaDrive(p.id, lang) || (p.name || '').toLowerCase(),
            color: PERSONA_COLORS[p.id],
            pct: Number.isFinite(p.countPercentage) ? p.countPercentage : null,
            count: p.count || 0,
        })),
        // Voor signature/quote.
        signatureSentence: buildSignatureSentence(aggregate, cd, lang),
    };
}

function getTeamName(t, cd) {
    return t?.team?.team || cd.teamNameFallback;
}

function buildOrgRow(aggregate, cd) {
    const n = aggregate?.teamCount || 0;
    const personas = aggregate?.personasByPrimary || [];
    const map = new Map(personas.map((p) => [p.id, p]));
    const cells = ARCHETYPE_ORDER.map((id) => {
        const p = map.get(id);
        if (!p) return { id, pct: null, count: 0 };
        return { id, pct: n > 0 ? Math.round((p.count / n) * 100) : 0, count: p.count || 0 };
    });
    return { name: cd.orgRowLabel, n, cells, isOrg: true };
}

function buildTeamRow(t, cd) {
    const n = t.responseCount || 0;
    const personas = t.aggregate?.personasByPrimary || [];
    const map = new Map(personas.map((p) => [p.id, p]));
    const cells = ARCHETYPE_ORDER.map((id) => {
        const p = map.get(id);
        if (!p) return { id, pct: null, count: 0 };           // niet voorgekomen
        if (n === 0) return { id, pct: null, count: 0 };
        return { id, pct: Math.round((p.count / n) * 100), count: p.count || 0 };
    });
    return {
        name: getTeamName(t, cd),
        n,
        cells,
        reliability: reliabilityFor(n),
        isOrg: false,
    };
}

// De rest-groep: de organisatie min de teams met een eigen rij. Zo zitten
// kleine teams en niet-gekoppelde profielen er samen in, en sluit de som van
// de rijen precies aan op het organisatietotaal.
function buildRestRow(aggregate, ownTeams, n, cd) {
    const counts = {};
    (aggregate?.personasByPrimary || []).forEach((p) => {
        counts[p.id] = (counts[p.id] || 0) + (p.count || 0);
    });
    ownTeams.forEach((t) => {
        (t.aggregate?.personasByPrimary || []).forEach((p) => {
            counts[p.id] = (counts[p.id] || 0) - (p.count || 0);
        });
    });
    const cells = ARCHETYPE_ORDER.map((id) => {
        const count = Math.max(0, counts[id] || 0);
        if (count === 0) return { id, pct: null, count: 0 };
        return { id, pct: Math.round((count / n) * 100), count };
    });
    return {
        name: cd.otherTeamsRowLabel(n),
        n,
        cells,
        reliability: reliabilityFor(n),
        isOrg: false,
        isOther: true,
    };
}

function computeDominantStyle(aggregate, lang) {
    const top = (aggregate?.personasByPrimary || [])[0];
    if (!top) return { id: null, name: '—', color: '#999' };
    return {
        id: top.id,
        name: getArchetypeName(top.id, lang) || top.name || top.id,
        color: PERSONA_COLORS[top.id],
        count: top.count,
    };
}

// Eén definitie voor "aandeel in voorkeur": het percentage dat de aggregatie al
// berekent als value / totaal-van-álle-werkplekvoorkeuren (gewogen). We hergebruiken
// dat hier overal, zodat hetzelfde begrip op pagina 2, 4 en 5 hetzelfde getal toont.
// (Voorheen normaliseerde pagina 4/5 over alleen de top-5, waardoor "Samenwerkplekken"
//  als 22% verscheen terwijl pagina 2 het op 14% — aandeel van het geheel — toonde.)
function pctOfTotal(it) {
    if (it == null) return 0;
    if (Number.isFinite(it.percentage)) return Math.round(it.percentage);
    return 0;
}

function computeTopWorkplaceNeed(aggregate, cd) {
    const items = aggregate?.sortedWorkplaceNeeds || [];
    if (items.length === 0) return { label: '—', value: 0, pct: 0 };
    const top = items[0];
    return {
        label: cd.workplaceLabel(top.label || top.name || '—'),
        value: Number(top.value || top.count || 0),
        pct: pctOfTotal(top),
    };
}

function computeWorkplaceNeeds(aggregate, cd, take = 5) {
    const items = (aggregate?.sortedWorkplaceNeeds || []).slice(0, take);
    return items.map((it) => ({
        label: cd.workplaceLabel(it.label || it.name || '—'),
        pct: pctOfTotal(it),
    }));
}

// Spreiding over de top-5 — als die klein is, is de behoefte breed en gespreid
// en is "één type wint" een te stellige lezing.
function computeWorkplaceSpread(needs) {
    const pcts = (needs || []).map((n) => n.pct).filter((p) => Number.isFinite(p));
    if (pcts.length < 2) return { min: 0, max: 0, range: 0, close: false };
    const min = Math.min(...pcts);
    const max = Math.max(...pcts);
    const range = max - min;
    // ≤5 procentpunt verschil over 5 typen = praktisch gelijk verdeeld.
    return { min, max, range, close: range <= 5 };
}

// Spanningsparen zijn taalneutraal: het paar wijst een key aan, de copy
// levert de formulering ('tempo en zorgvuldigheid' / 'pace and care').
const TENSION_PAIRS = [
    ['presteerder', 'denker', 'tempoZorgvuldigheid'],
    ['presteerder', 'verbinder', 'resultaatVerbinding'],
    ['maker', 'zekerzoeker', 'vrijheidZekerheid'],
    ['vernieuwer', 'zekerzoeker', 'vernieuwingContinuiteit'],
    ['groeier', 'zekerzoeker', 'ontwikkelingStabiliteit'],
    ['teamspeler', 'maker', 'loyaliteitAutonomie'],
];

// Bewust op het OUDE werkplekmodel (sortedWorkplaceNeeds, % t.o.v. het
// gemiddelde). Teaminzicht volgt sinds 22 okt 2026 het werkplekprofiel; het
// organisatielandschap nog niet — dat is een apart besluit. Dit zijn de regels
// die TeamInsights daarvoor gebruikte: tekort = bovengemiddeld én een
// aanwezige werkstijl met bricksProfile >= 3; te veel = onder 70% van het
// gemiddelde.
function oudeWerkplekSpanning(aggregate) {
    const needs = aggregate?.sortedWorkplaceNeeds || [];
    if (needs.length === 0) return { under: null, over: null };
    const averagePct = 100 / needs.length;
    const present = new Set(
        (aggregate?.sortedPersonas || []).filter((p) => p.count > 0).map((p) => p.id)
    );
    const archetypes = getArchetypes('nl').filter((a) => present.has(a.id));
    const under = needs
        .filter((n) => n.percentage >= averagePct)
        .filter((n) => archetypes.some((a) => (a.bricksProfile?.[n.key] || 0) >= 3))
        .sort((a, b) => b.percentage - a.percentage)[0] || null;
    const over = needs
        .filter((n) => n.percentage < averagePct * 0.7)
        .sort((a, b) => a.percentage - b.percentage)[0] || null;
    return { under, over };
}

function computeLeeglopers(insights, cd, aggregate) {
    const t = insights?.workplaceTension || {};
    const cl = cd.leeglopers;
    const out = [];
    const { under, over } = oudeWerkplekSpanning(aggregate);
    if (under) {
        const label = cd.workplaceLabel(under.label || '').toLowerCase();
        out.push(sanitizeUserText(cl.tooLittle(label)));
    }
    if (over) {
        const label = cd.workplaceLabel(over.label || '').toLowerCase();
        out.push(sanitizeUserText(cl.tooMuch(label)));
    }

    const personas = [
        ...(t.impactSummary?.dominant || []),
        ...(t.impactSummary?.middle || []),
    ].map((p) => p.id);

    for (const [a, b, key] of TENSION_PAIRS) {
        if (personas.includes(a) && personas.includes(b)) {
            out.push(cl.tension(cl.tensionPairs[key]));
            break;
        }
    }
    while (out.length < 3) {
        out.push(cl.fallback);
    }
    return out.slice(0, 3);
}

function buildSignatureSentence(aggregate, cd, lang) {
    const top = aggregate?.personasByPrimary || [];
    if (top.length === 0) return cd.signature.none;
    const drive1 = getPersonaDrive(top[0].id, lang) || (top[0].name || '').toLowerCase();
    if (top.length === 1) {
        return cd.signature.one(capitalize(drive1));
    }
    const drive2 = getPersonaDrive(top[1].id, lang) || (top[1].name || '').toLowerCase();
    return cd.signature.two(capitalize(drive1), drive2);
}

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ── Sanitizer voor admin-ingevoerde tekst (fix #1 page 4: typo's centraal).
// Voorbeelden: 'resevering' → 'reservering'. Uitbreidbaar lijstje, alleen
// hele woorden vervangen (boundary).
const TEXT_CORRECTIONS = [
    [/\bresevering\b/gi, 'reservering'],
    [/\bresev/gi, 'reserv'],            // dekt 'reseveringen', 'reseveringssysteem'
];

export function sanitizeUserText(s) {
    if (!s) return s;
    let out = String(s).trim();
    for (const [re, rep] of TEXT_CORRECTIONS) {
        out = out.replace(re, rep);
    }
    // Fix #2 page 4: hoofdletter consistent — eerste letter altijd kapitaal.
    if (out.length > 0) out = out.charAt(0).toUpperCase() + out.slice(1);
    return out;
}

// ── Duiding-helpers (concrete richting i.p.v. clichés).
// Elke helper krijgt het opgeloste copy-object mee; zonder argument valt hij
// terug op Nederlands, zodat bestaande aanroepers blijven werken.

export function buildLeadershipDirections(data, copy = getOLCopy('nl')) {
    const cl = copy.data.leadership;
    const out = [];
    if (data.leeglopers?.length >= 1) {
        out.push(cl.discuss(data.leeglopers[0].toLowerCase()));
    }
    const withLabel = (p) => ({
        drive: p.drive,
        label: cl.personaLabel(p.name, p.pct != null ? p.pct : null),
    });
    if (data.topPersonas?.length >= 2) {
        out.push(cl.twoDrives(withLabel(data.topPersonas[0]), withLabel(data.topPersonas[1])));
    } else if (data.topPersonas?.length === 1) {
        out.push(cl.oneDrive(withLabel(data.topPersonas[0])));
    }
    if (data.lowReliabilityTeams?.length >= 3) {
        out.push(cl.lowReliability(data.lowReliabilityTeams.length));
    }
    return out;
}

export function buildEnvironmentDirections(data, copy = getOLCopy('nl')) {
    const ce = copy.data.environment;
    const out = [];
    const needs = data.workplaceNeeds || [];
    const spread = data.workplaceSpread || { close: false, min: 0, max: 0 };

    if (needs.length === 0) {
        out.push(ce.notEnoughData);
        return out;
    }

    if (spread.close) {
        // Behoefte is breed en gespreid — de spreiding zelf is het signaal.
        const labels = needs.slice(0, 3).map((n) => n.label.toLowerCase()).join(', ');
        out.push(ce.spreadClose(spread.min, spread.max));
        out.push(ce.spreadMix(labels));
    } else {
        // Wél een duidelijke top — benoem die, met het echte aandeel.
        needs.slice(0, 3).forEach((n) => {
            out.push(ce.invest(n.label.toLowerCase(), n.pct));
        });
    }
    return out;
}

// "Teams die ruimte verdienen": alleen hoeveel teams nog geen eigen beeld
// hebben. Geen teamnamen en geen aantallen per team — samen met de heatmap
// zou dat een klein team herleidbaar maken.
export function buildAttentionSummary(data, copy = getOLCopy('nl')) {
    const x = data.teamsWithoutOwnPicture || 0;
    return x > 0 ? [copy.data.attention.noOwnPicture(x)] : [];
}
