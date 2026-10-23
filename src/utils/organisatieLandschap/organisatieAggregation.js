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
 *  - Werkplek volgt sinds opdracht L3 (23 okt 2026) het werkplekprofiel, net
 *    als Teaminzicht: kern, steun en beperkt nodig, zonder percentages.
 */

import {
    ARCHETYPE_ORDER,
    getArchetypeName,
    getPersonaDrive,
    PERSONA_COLORS,
} from './constants';
// Dezelfde functies als de dashboards (opdracht L4): de grootste groep met
// gelijke stand, en één betrouwbaarheidsschaal.
import { dominantPersonas } from '../TeamAggregation';
import { getConfidence } from '../../insights';
import { getOLCopy } from './copy';
import { MIN_TEAM_RESPONSES } from '../access';
import { getCopy } from '../../i18n/copy';
// Werkplek: hetzelfde werkplekprofiel als Teaminzicht (opdracht L3, besluit
// Judith 23 okt 2026) — kern, steun en beperkt nodig, zonder percentages.
import {
    aantallenUitAggregate,
    buildWerkplekProfiel,
    BAND,
} from '../../team/werkplek/werkplekProfielLogic';

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
    // gekoppeld zijn — vormt samen de rest-groep "Overige". Die mag
    // nooit 1 tot 4 profielen groot zijn: dan is hij terug te rekenen als
    // organisatie min de zichtbare teams. Is hij dat toch, dan gaat het
    // kleinste team met een eigen rij er ook in, tot de rest-groep vijf of
    // meer is. Zonder teams met een eigen rij is de rest-groep de hele
    // organisatie, en die is altijd vijf of meer (anders geen rapport).
    const ownTeams = activeTeams
        .filter((t) => (t.responseCount || 0) >= MIN_TEAM_RESPONSES)
        .sort((a, b) => (a.responseCount || 0) - (b.responseCount || 0));
    const restSize = () =>
        totalRespondents - ownTeams.reduce((s, t) => s + (t.responseCount || 0), 0);
    while (ownTeams.length > 0 && restSize() > 0 && restSize() < MIN_TEAM_RESPONSES) {
        ownTeams.shift();
    }

    // Staat er een rij "Overige"? Zonder teams met een eigen rij niet: die rij
    // zou dan gelijk zijn aan de organisatie, dus staat alleen de
    // organisatierij er.
    const hasRestRow = ownTeams.length > 0 && restSize() >= MIN_TEAM_RESPONSES;

    const orgRow = buildOrgRow(aggregate, cd);
    const teamRows = ownTeams
        .map((t) => buildTeamRow(t, cd, lang))
        .sort((a, b) => b.n - a.n);
    if (hasRestRow) {
        teamRows.push(buildRestRow(aggregate, ownTeams, restSize(), cd, lang));
    }

    // Teams zonder eigen rij in dit overzicht: onder de vijf, nog zonder
    // profielen, of meegeschoven in de rest-groep. Alleen het aantal wordt
    // genoemd, geen namen.
    const teamsWithoutOwnRow = allTeams.length - ownTeams.length;

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
    const workplace = computeWorkplace(aggregate, insights, lang);
    const officeCheck = computeOfficeCheck(insights, cd);

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
        lang,
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
        teamsWithoutOwnRow,
        hasRestRow,
        dominantStyle,
        workplace,
        officeCheck,
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

// Betrouwbaarheid per rij: getConfidence(), dezelfde schaal als overal
// (5–15 opkomend, 16–30 betrouwbaar, meer dan 30 sterk).
function confidenceFor(n, lang) {
    const c = getConfidence(n, lang);
    return { id: c.level, label: c.label };
}

function buildTeamRow(t, cd, lang) {
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
        reliability: confidenceFor(n, lang),
        isOrg: false,
    };
}

// De rest-groep: de organisatie min de teams met een eigen rij. Zo zitten
// kleine teams en niet-gekoppelde profielen er samen in, en sluit de som van
// de rijen precies aan op het organisatietotaal.
function buildRestRow(aggregate, ownTeams, n, cd, lang) {
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
        reliability: confidenceFor(n, lang),
        isOrg: false,
        isOther: true,
    };
}

// De grootste groep: dominantPersonas(), bij een gelijke stand alle namen
// ("Maker en Groeier"), zoals Teaminzicht.
function computeDominantStyle(aggregate, lang) {
    const dominant = dominantPersonas(aggregate);
    if (dominant.length === 0) return { id: null, name: '—', color: '#999' };
    const top = dominant[0];
    const names = dominant.map((p) => getArchetypeName(p.id, lang) || p.name || p.id);
    return {
        id: top.id,
        name: getCopy(lang).teamPanels.names.join(names),
        color: PERSONA_COLORS[top.id],
        count: top.count,
        tie: dominant.length > 1,
    };
}

// Werkplekprofiel van de hele organisatie — dezelfde rekenwijze en dezelfde
// woorden als Teaminzicht. Kleine teams tellen mee (het profiel komt uit het
// organisatie-aggregaat). `needed` volgt Teaminzicht: de kernplekken, of
// zonder kern het hoogste type.
function computeWorkplace(aggregate, insights, lang) {
    const wp = getCopy(lang).workplaceProfile;
    const label = (t) => wp?.types?.[t.id]?.label || t.label || t.id;
    const profiel = buildWerkplekProfiel(aantallenUitAggregate(aggregate));
    const bands = { [BAND.KERN]: [], [BAND.STEUN]: [], [BAND.AANVULLEND]: [] };
    (profiel.typen || []).forEach((t) => {
        if (profiel.heeftData) bands[t.band].push(label(t));
    });
    const needed = (insights?.workplaceTension?.underserved || []).map((t) => t.label);
    return {
        hasData: profiel.heeftData,
        bands,
        bandLabels: {
            [BAND.KERN]: wp?.band?.kern?.label || 'Kern',
            [BAND.STEUN]: wp?.band?.steun?.label || 'Steun',
            [BAND.AANVULLEND]: wp?.band?.aanvullend?.label || 'Aanvullend',
        },
        needed,
        top: needed[0] || '—',
    };
}

// "Check in het kantoor": dezelfde twee vragen als de team-PDF. De tool kent
// het kantoor niet, dus geen bewering ("te weinig", "te veel") maar een vraag.
// Geen spanningsregel en geen opvulregel meer.
function computeOfficeCheck(insights, cd) {
    const t = insights?.workplaceTension || {};
    const q = cd.officeCheck;
    const out = [];
    if (t.underserved?.length > 0) out.push(q.enough(t.underserved[0].label.toLowerCase()));
    if (t.oversupplied?.length > 0) out.push(q.used(t.oversupplied[0].label.toLowerCase()));
    return out;
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

// Werkomgeving als vraag, niet als investeringsadvies (besluit Judith 23 okt).
export function buildEnvironmentDirections(data, copy = getOLCopy('nl')) {
    const ce = copy.data.environment;
    const needed = data.workplace?.needed || [];
    if (!data.workplace?.hasData || needed.length === 0) return [ce.notEnoughData];
    const labels = getCopy(data.lang || 'nl').teamPanels.names.join(needed.map((l) => l.toLowerCase()));
    return [ce.focusQuestion(labels)];
}

// "Teams die ruimte verdienen": alleen hoeveel teams geen eigen rij hebben.
// Geen teamnamen en geen aantallen per team — samen met de heatmap zou dat
// een klein team herleidbaar maken.
export function buildAttentionSummary(data, copy = getOLCopy('nl')) {
    const x = data.teamsWithoutOwnRow || 0;
    if (x === 0) return [];
    const ca = copy.data.attention;
    return [data.hasRestRow ? ca.noOwnRow(x) : ca.noOwnRowNoRest(x)];
}
