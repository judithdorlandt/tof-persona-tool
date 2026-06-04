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
    ARCHETYPE_NAME,
    PERSONA_DRIVE,
    PERSONA_COLORS,
    reliabilityFor,
} from './constants';

/**
 * Hoofd-entry — verwerkt input van Admin tot stabiele dataset voor pagina's.
 */
export function prepareOrganisatieData({
    aggregate,
    insights,
    teamSummaries = [],
    organizationName = 'Organisatie',
    observations = [],
}) {
    const allTeams = [...teamSummaries];
    const activeTeams = allTeams.filter((t) => (t.responseCount || 0) > 0);
    const inactiveTeams = allTeams.filter((t) => (t.responseCount || 0) === 0);

    const totalRespondents = aggregate?.teamCount || 0;

    const orgRow = buildOrgRow(aggregate);
    const teamRows = activeTeams
        .map((t) => buildTeamRow(t))
        .sort((a, b) => b.n - a.n);

    // Reconciliatie respondenten: het organisatietotaal (aggregate.teamCount)
    // telt álle responses; de teamrijen tellen alleen responses die aan een
    // team gekoppeld konden worden. Het verschil maken we expliciet zichtbaar
    // i.p.v. het stil weg te laten.
    const linkedRespondents = teamRows.reduce((s, r) => s + r.n, 0);
    const unlinkedRespondents = Math.max(0, totalRespondents - linkedRespondents);
    // Theoretisch kan een response aan meerdere teams matchen (dubbeltelling);
    // dan is linked > totaal. Dat signaleren we apart.
    const overlapRespondents = Math.max(0, linkedRespondents - totalRespondents);

    const dominantStyle = computeDominantStyle(aggregate);
    const topNeed = computeTopWorkplaceNeed(aggregate);
    const workplaceNeeds = computeWorkplaceNeeds(aggregate, 5);
    const leeglopers = computeLeeglopers(aggregate, insights);

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
        date: new Date().toLocaleDateString('nl-NL', {
            day: 'numeric', month: 'long', year: 'numeric',
        }),
        totalRespondents,
        linkedRespondents,
        unlinkedRespondents,
        overlapRespondents,
        totalTeams: allTeams.length,
        activeTeamCount: activeTeams.length,
        inactiveTeamCount: inactiveTeams.length,
        inactiveTeams: inactiveTeams.map(getTeamName),
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
            name: p.name || ARCHETYPE_NAME[p.id] || p.id,
            drive: PERSONA_DRIVE[p.id] || (p.name || '').toLowerCase(),
            color: PERSONA_COLORS[p.id],
            pct: Number.isFinite(p.countPercentage) ? p.countPercentage : null,
            count: p.count || 0,
        })),
        // Voor signature/quote.
        signatureSentence: buildSignatureSentence(aggregate),
    };
}

function getTeamName(t) {
    return t?.team?.team || '—';
}

function buildOrgRow(aggregate) {
    const n = aggregate?.teamCount || 0;
    const personas = aggregate?.personasByPrimary || [];
    const map = new Map(personas.map((p) => [p.id, p]));
    const cells = ARCHETYPE_ORDER.map((id) => {
        const p = map.get(id);
        if (!p) return { id, pct: null, count: 0 };
        return { id, pct: n > 0 ? Math.round((p.count / n) * 100) : 0, count: p.count || 0 };
    });
    return { name: 'ORGANISATIE', n, cells, isOrg: true };
}

function buildTeamRow(t) {
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
        name: getTeamName(t),
        n,
        cells,
        reliability: reliabilityFor(n),
        isOrg: false,
    };
}

function computeDominantStyle(aggregate) {
    const top = (aggregate?.personasByPrimary || [])[0];
    if (!top) return { id: null, name: '—', color: '#999' };
    return {
        id: top.id,
        name: top.name || ARCHETYPE_NAME[top.id] || top.id,
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

function computeTopWorkplaceNeed(aggregate) {
    const items = aggregate?.sortedWorkplaceNeeds || [];
    if (items.length === 0) return { label: '—', value: 0, pct: 0 };
    const top = items[0];
    return {
        label: top.label || top.name || '—',
        value: Number(top.value || top.count || 0),
        pct: pctOfTotal(top),
    };
}

function computeWorkplaceNeeds(aggregate, take = 5) {
    const items = (aggregate?.sortedWorkplaceNeeds || []).slice(0, take);
    return items.map((it) => ({
        label: it.label || it.name || '—',
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

function computeLeeglopers(aggregate, insights) {
    const t = insights?.workplaceTension || {};
    const out = [];
    if (t.underserved?.[0]) out.push(sanitizeUserText(`Te weinig ${t.underserved[0].label.toLowerCase()}`));
    if (t.oversupplied?.[0]) out.push(sanitizeUserText(`Te veel ${t.oversupplied[0].label.toLowerCase()}`));

    const personas = [
        ...(t.impactSummary?.dominant || []),
        ...(t.impactSummary?.middle || []),
    ].map((p) => p.id);

    const TENSION_PAIRS = [
        ['presteerder', 'denker', 'tempo en zorgvuldigheid'],
        ['presteerder', 'verbinder', 'resultaat en verbinding'],
        ['maker', 'zekerzoeker', 'vrijheid en zekerheid'],
        ['vernieuwer', 'zekerzoeker', 'vernieuwing en continuïteit'],
        ['groeier', 'zekerzoeker', 'ontwikkeling en stabiliteit'],
        ['teamspeler', 'maker', 'loyaliteit en autonomie'],
    ];
    for (const [a, b, label] of TENSION_PAIRS) {
        if (personas.includes(a) && personas.includes(b)) {
            out.push(`Spanning tussen ${label}`);
            break;
        }
    }
    while (out.length < 3) {
        out.push('Werkplek die niet aansluit bij behoefte van de organisatie');
    }
    return out.slice(0, 3);
}

function buildSignatureSentence(aggregate) {
    const top = aggregate?.personasByPrimary || [];
    if (top.length === 0) return 'Een organisatie in beweging.';
    const drive1 = PERSONA_DRIVE[top[0].id] || (top[0].name || '').toLowerCase();
    if (top.length === 1) {
        return `${capitalize(drive1)} — daar bouwt deze organisatie op.`;
    }
    const drive2 = PERSONA_DRIVE[top[1].id] || (top[1].name || '').toLowerCase();
    return `${capitalize(drive1)} en ${drive2} — daar bouwt deze organisatie op.`;
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

export function buildLeadershipDirections(data) {
    const out = [];
    if (data.leeglopers?.length >= 1) {
        out.push(`Bespreek expliciet: ${data.leeglopers[0].toLowerCase()}.`);
    }
    if (data.topPersonas?.length >= 2) {
        const a = data.topPersonas[0];
        const b = data.topPersonas[1];
        out.push(
            `Twee drijfveren springen eruit: ${a.drive} (${a.name}${a.pct != null ? `, ${a.pct}% primair` : ''}) en ${b.drive} (${b.name}${b.pct != null ? `, ${b.pct}% primair` : ''}). Maak ruimte voor beide — onderdruk geen van twee.`,
        );
    } else if (data.topPersonas?.length === 1) {
        const a = data.topPersonas[0];
        out.push(
            `De dominante drijfveer is ${a.drive} (${a.name}${a.pct != null ? `, ${a.pct}% primair` : ''}). Toets in gesprek of teams met andere drijfveren zich nog gezien voelen.`,
        );
    }
    if (data.lowReliabilityTeams?.length >= 3) {
        out.push(
            `${data.lowReliabilityTeams.length} teams hebben te weinig respons voor harde uitspraken. Verdiep in gesprek voordat je beleid maakt.`,
        );
    }
    return out;
}

export function buildEnvironmentDirections(data) {
    const out = [];
    const needs = data.workplaceNeeds || [];
    const spread = data.workplaceSpread || { close: false, min: 0, max: 0 };

    if (needs.length === 0) {
        out.push('Te weinig data om concrete investeringskeuzes te onderbouwen.');
        return out;
    }

    if (spread.close) {
        // Behoefte is breed en gespreid — de spreiding zelf is het signaal.
        const labels = needs.slice(0, 3).map((n) => n.label.toLowerCase()).join(', ');
        out.push(
            `De voorkeuren liggen dicht bij elkaar (${spread.min}–${spread.max}% van het geheel). De behoefte is breed: geen enkel werkplektype springt eruit.`,
        );
        out.push(
            `Investeer in een mix van werkplekken, niet in één type. Het meest genoemd: ${labels}.`,
        );
    } else {
        // Wél een duidelijke top — benoem die, met het echte aandeel.
        needs.slice(0, 3).forEach((n) => {
            out.push(
                `Investeer in ${n.label.toLowerCase()} — ${n.pct}% van álle werkplek-voorkeur ligt hier.`,
            );
        });
    }
    return out;
}

export function buildAttentionTeams(data) {
    const out = (data.lowReliabilityTeams || []).map((t) => ({
        name: t.name,
        n: t.n,
        why: t.n === 0
            ? 'nog geen respons'
            : `slechts ${t.n} ${t.n === 1 ? 'respondent' : 'respondenten'}`,
    }));
    // Voeg ook teams toe die helemaal geen respons hebben.
    (data.inactiveTeams || []).forEach((name) => {
        if (!out.find((x) => x.name === name)) {
            out.push({ name, n: 0, why: 'nog geen respons' });
        }
    });
    return out;
}
