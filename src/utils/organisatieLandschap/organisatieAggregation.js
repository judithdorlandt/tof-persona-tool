/**
 * organisatieAggregation.js — alle berekeningen op één plek.
 *
 * Pagina-builders krijgen een `data`-bundel binnen, niet de rauwe Supabase-input.
 * Daardoor zijn pagina's dom (alleen render) en is logica testbaar.
 *
 * Lost op:
 *  - Fout #4 pagina 1: betrouwbaarheidscategorie per team al voorbereid.
 *  - Cellen: niemand met die werkstijl = pct 0 (de cel toont "—"); null alleen
 *    als een rij geen profielen heeft (opdracht ronde 2, groep 4).
 *  - Werkplek volgt sinds opdracht L3 (23 okt 2026) het werkplekprofiel, net
 *    als Teaminzicht: kern, steun en beperkt nodig, zonder percentages.
 */

import {
    ARCHETYPE_ORDER,
    MIN_ROW_PROFILES,
    getArchetypeName,
    getPersonaDrive,
    PERSONA_COLORS,
} from './constants';
// Dezelfde functies als de dashboards (opdracht L4): de grootste groep met
// gelijke stand, en één betrouwbaarheidsschaal.
import { dominantPersonas } from '../TeamAggregation';
import { getConfidence } from '../../insights';
import { getOLCopy } from './copy';
import { getCopy } from '../../i18n/copy';
import { formatPdfDate } from '../tofPdfBrand';
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

    // Drempel van tien (MIN_ROW_PROFILES, constants.js): een team onder de tien
    // krijgt geen eigen rij en nergens een eigen cijfer, anders is een uitslag
    // herleidbaar tot een persoon. In het organisatietotaal tellen ze altijd
    // mee (dat komt uit `aggregate`).
    //
    // Alles zonder eigen rij — kleine teams én profielen die aan geen team
    // gekoppeld zijn — vormt samen de rest-groep "Overige". Die mag
    // nooit 1 tot 9 profielen groot zijn: dan is hij terug te rekenen als
    // organisatie min de zichtbare teams. Is hij dat toch, dan gaat het
    // kleinste team met een eigen rij er ook in, tot de rest-groep tien of
    // meer is. Zonder teams met een eigen rij is de rest-groep de hele
    // organisatie, en die is altijd tien of meer (anders geen rapport).
    const ownTeams = activeTeams
        .filter((t) => (t.responseCount || 0) >= MIN_ROW_PROFILES)
        .sort((a, b) => (a.responseCount || 0) - (b.responseCount || 0));
    const restSize = () =>
        totalRespondents - ownTeams.reduce((s, t) => s + (t.responseCount || 0), 0);
    // Teams van tien of meer die zo meeschoven: de kaart op p6 legt dat uit.
    let shiftedLargeTeams = 0;
    while (ownTeams.length > 0 && restSize() > 0 && restSize() < MIN_ROW_PROFILES) {
        ownTeams.shift();
        shiftedLargeTeams += 1;
    }

    // Staat er een rij "Overige"? Zonder teams met een eigen rij niet: die rij
    // zou dan gelijk zijn aan de organisatie, dus staat alleen de
    // organisatierij er.
    const hasRestRow = ownTeams.length > 0 && restSize() >= MIN_ROW_PROFILES;

    const orgRow = buildOrgRow(aggregate, cd, lang);
    // Op naam, zodat een lezer een team snel terugvindt (besluit Judith 26
    // okt); "Overige" blijft onderaan.
    const teamRows = ownTeams
        .map((t) => buildTeamRow(t, cd, lang))
        .sort((a, b) => String(a.name).localeCompare(String(b.name), lang, { numeric: true }));
    // Teams zonder eigen rij in dit overzicht: onder de tien, of meegeschoven
    // in de rest-groep. Alleen teams mét profielen (redactie punt 2, voorstel
    // A): teams zonder profielen tellen nergens mee en staan al op p2. Alleen
    // het aantal wordt genoemd, geen namen.
    const teamsWithoutOwnRow = activeTeams.length - ownTeams.length;

    if (hasRestRow) {
        teamRows.push(buildRestRow(aggregate, ownTeams, restSize(), teamsWithoutOwnRow, cd, lang));
    }

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


    return {
        lang,
        organizationName,
        // Zelfde notatie als de team-PDF's (ronde 2, groep 4).
        date: formatPdfDate(new Date(), lang),
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
        shiftedLargeTeams,
        dominantStyle,
        workplace,
        officeCheck,
        leegloperObservations,
        werktGoedObservations,
        teamRows,
        orgRow,
        // Voor duiding: dominante persona's organisatiebreed (top 2).
        // pct + count erbij zodat de drijfveer-conclusie navolgbaar is tegen
        // de organisatie-rij in de heatmap.
        // De grootste groep(en), net als de tegel: dominantPersonas() met
        // gelijke stand (redactie punt 8 en 9). Voor leiderschap en slotregel.
        dominantGroups: dominantPersonas(aggregate).map((p) => ({
            id: p.id,
            // Bewust de canonieke naam uit constants (taalvast), niet p.name —
            // die komt uit de generieke aggregatie en kan NL zijn.
            name: getArchetypeName(p.id, lang) || p.name || p.id,
            drive: getPersonaDrive(p.id, lang) || (p.name || '').toLowerCase(),
            color: PERSONA_COLORS[p.id],
        })),
        // Voor signature/quote.
        signatureSentence: buildSignatureSentence(aggregate, cd, lang),
        joinNames: (list) => getCopy(lang).teamPanels.names.join(list),
    };
}

function getTeamName(t, cd) {
    return t?.team?.team || cd.teamNameFallback;
}

function buildOrgRow(aggregate, cd, lang) {
    const n = aggregate?.teamCount || 0;
    const personas = aggregate?.personasByPrimary || [];
    const map = new Map(personas.map((p) => [p.id, p]));
    const cells = ARCHETYPE_ORDER.map((id) => {
        const p = map.get(id);
        if (n === 0) return { id, pct: null, count: 0 };
        if (!p) return { id, pct: 0, count: 0 };              // niemand: "—"
        return { id, pct: Math.round((p.count / n) * 100), count: p.count || 0 };
    });
    // Ook de organisatie krijgt een betrouwbaarheidslabel (redactie punt 21).
    return { name: cd.orgRowLabel, n, cells, isOrg: true, reliability: confidenceFor(n, lang) };
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
        if (n === 0) return { id, pct: null, count: 0 };
        if (!p) return { id, pct: 0, count: 0 };              // niemand: "—"
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
function buildRestRow(aggregate, ownTeams, n, teamCount, cd, lang) {
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
        if (count === 0) return { id, pct: 0, count: 0 };     // niemand: "—"
        return { id, pct: Math.round((count / n) * 100), count };
    });
    return {
        // Het aantal teams; n (profielen) staat al in de kolom ernaast (C2).
        name: cd.otherTeamsRowLabel(teamCount),
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
            // Band 3 heet overal "Beperkt nodig", zoals op het scherm en in de
            // Teaminzicht-PDF (besluit Judith 27 okt): de `kort` van die band.
            [BAND.AANVULLEND]: wp?.band?.aanvullend?.kort || 'Beperkt nodig',
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

// Slotregel: beschrijven, niet beweren (redactie punt 9, besluit J3). De
// drijfveer van de grootste groep(en), bij gelijke stand allemaal.
function buildSignatureSentence(aggregate, cd, lang) {
    const top = dominantPersonas(aggregate);
    if (top.length === 0) return cd.signature.none;
    const drives = top.map((p) => getPersonaDrive(p.id, lang) || (p.name || '').toLowerCase());
    if (drives.length === 1) return cd.signature.one(capitalize(drives[0]));
    return cd.signature.more(capitalize(getCopy(lang).teamPanels.names.join(drives)));
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
    const groups = data.dominantGroups || [];
    if (groups.length === 0) return [];
    if (groups.length === 1) return [cl.oneDrive(groups[0].name, groups[0].drive)];
    return [cl.twoDrives(
        data.joinNames(groups.map((g) => g.name)),
        data.joinNames(groups.map((g) => g.drive)),
    )];
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
    if (!data.hasRestRow) {
        // Zonder "Overige": is er een team van tien of meer meegeschoven, dan
        // zegt de kaart waarom (redacteur en Judith 27 okt). Bij één team gaat
        // het om profielen zonder team, niet om kleinere teams.
        if ((data.shiftedLargeTeams || 0) > 0) {
            return [`${ca.noOwnRowNoRest(x)} ${x > 1 ? ca.shiftedLargeNoRest : ca.shiftedLargeNoRestOne}`];
        }
        return [ca.noOwnRowNoRest(x)];
    }
    // Is er een team van tien of meer meegeschoven, dan zegt de kaart dat
    // (tekst redacteur 26 okt, alleen in het meervoud).
    const shifted = (data.shiftedLargeTeams || 0) > 0 && x > 1;
    return [shifted ? `${ca.noOwnRow(x)} ${ca.shiftedLarge}` : ca.noOwnRow(x)];
}
