// =========================
// TEAM INSIGHTS — MODULE 1 (werkplek-gericht)
// =========================
// Levert:
//   headline         — wat dit team van de werkplek vraagt (één zin)
//   workplaceTension — waar team behoefte en werkplekaanbod mismatchen
//                       { underserved: [...], oversupplied: [...] }
//   quickWins        — werkplek-gerichte acties
//   highlights       — compat
//   energy           — bewaard voor Module 2 (op werkstijl-energie)
//   friction         — bewaard voor Module 2 (op werkstijl-energie)
//   usage            — bewaard voor Module 2
//
// Consistency-regel:
//   "Dominante persona" in meta + highlights = personasByPrimary[0].
//   Dat is dezelfde definitie die Tegel + Chip gebruiken in TeamDashboard.
//   Werkplek-spanning blijft gewogen op energie/full_scores — daar gaat
//   het om wat het hele profiel van de werkplek vraagt, niet wie er
//   primair zit.

import { getArchetypes } from '../i18n/archetypes';
import { getCopy } from '../i18n/copy';

const WORKPLACE_PRESENT_PCT = 15;

// Persona scoort >= deze waarde op een werkplek → die persona heeft hoge behoefte
const PERSONA_NEED_THRESHOLD = 3;

// Alle zichtbare tekst komt uit copy/<taal>/teamInsightText.js.
function text(lang) {
    return getCopy(lang).teamInsightText;
}

// Werkplek-label in de juiste taal. De aggregatie levert nog een vaste
// Nederlandse `label`; die blijft de terugval zodat er nooit een lege
// naam in een zin belandt. De sleutel (focus/work/...) is taalonafhankelijk.
function workplaceLabel(need, lang) {
    if (!need) return '';
    return text(lang).workplaceLabels[need.key] || need.label || need.key;
}

// Persona-naam uit de archetypes van die taal; nooit hardcoden.
function personaName(id, lang) {
    return getArchetypes(lang).find((a) => a.id === id)?.name || id;
}

// Datawaarden, geen UI-tekst: de aggregatie zet deze namen als een
// respondent geen naam heeft achtergelaten. Niet vertalen — ze worden
// hier alleen weggefilterd, nooit getoond.
const UNKNOWN_NAME_SENTINEL = 'Onbekend';
const ANONYMOUS_NAME_SENTINEL = 'Anoniem';

function isRealName(name) {
    return Boolean(name)
        && name !== UNKNOWN_NAME_SENTINEL
        && name !== ANONYMOUS_NAME_SENTINEL;
}

// =========================
// PUBLIC API
// =========================
export function buildTeamInsights(aggregate, lang = 'nl') {
    // "Wie zit er primair" — voor headline + meta + highlights
    const topByPrimary = aggregate?.personasByPrimary?.[0] || null;
    const secondByPrimary = aggregate?.personasByPrimary?.[1] || null;

    // Werkstijl-energie — voor Module 2 dynamics
    const topByEnergy = aggregate?.sortedPersonas?.[0] || null;
    const secondByEnergy = aggregate?.sortedPersonas?.[1] || null;

    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0];
    const secondNeed = aggregate?.sortedWorkplaceNeeds?.[1];
    const teamCount = aggregate?.teamCount || 0;

    return {
        headline: buildHeadline(aggregate, lang),
        workplaceTension: buildWorkplaceTension(aggregate, lang),
        quickWins: buildWorkplaceQuickWins(aggregate, lang),
        highlights: buildHighlights(topByPrimary, secondByPrimary, topNeed, secondNeed, lang),

        // Voor Module 2 — energie-basis
        energy: buildEnergy(aggregate, lang),
        friction: buildPersonaFriction(aggregate, lang),
        usage: buildUsage(aggregate, lang),

        // Meta levert beide expliciet zodat downstream consumers (PDF, hero, etc.)
        // weten welke ze nodig hebben. "top" blijft op primair voor consistentie
        // met het dashboard.
        meta: {
            teamCount,
            top: topByPrimary,
            second: secondByPrimary,
            topByEnergy,
            secondByEnergy,
            topNeed,
            secondNeed,
        },
    };
}

// =========================
// HEADLINE
// =========================
function buildHeadline(aggregate, lang = 'nl') {
    const needs = (aggregate?.sortedWorkplaceNeeds || []).filter(
        (n) => n.percentage >= WORKPLACE_PRESENT_PCT
    );
    const teamCount = aggregate?.teamCount || 0;
    const t = text(lang).headline;

    if (teamCount === 0) {
        return t.empty;
    }

    if (needs.length >= 2) {
        return t.two(
            workplaceLabel(needs[0], lang).toLowerCase(),
            workplaceLabel(needs[1], lang).toLowerCase()
        );
    }

    if (needs.length === 1) {
        return t.one(workplaceLabel(needs[0], lang).toLowerCase());
    }

    // Geen categorie boven de drempel: de behoeften liggen dicht bij elkaar.
    // Maak de basis voor de acties expliciet — de winst zit niet in een
    // verschil van één procentpunt, maar in de balans tussen relatief veel
    // en relatief weinig gevraagde plekken (vraag versus aanbod).
    const base = t.mixedBase;
    const tension = buildWorkplaceTension(aggregate, lang);
    const under = tension.underserved?.[0];
    const over = tension.oversupplied?.[0];
    if (under && over) {
        return `${base} ${t.mixedBalance(under.label.toLowerCase(), over.label.toLowerCase())}`;
    }
    if (under) {
        return `${base} ${t.mixedUnderOnly(under.label.toLowerCase())}`;
    }
    return base;
}

// =========================
// WORKPLACE TENSION — onderbediend + overdosis
// =========================
function buildWorkplaceTension(aggregate, lang = 'nl') {
    const needs = aggregate?.sortedWorkplaceNeeds || [];
    const members = aggregate?.members || [];
    const presentPersonaIds = new Set(
        (aggregate?.sortedPersonas || [])
            .filter((p) => p.count > 0)
            .map((p) => p.id)
    );

    if (needs.length === 0) {
        return { underserved: [], oversupplied: [], impactSummary: null };
    }

    // Gemiddelde als scheidslijn (gelijk aan TeamWorkplaceNeeds)
    const averagePct = 100 / needs.length;

    const underserved = [];
    const oversupplied = [];

    needs.forEach((need) => {
        const impacted = impactedPersonas(need.key, presentPersonaIds, lang);
        const names = impactedNames(need.key, members, lang);

        // Onderbediend: bovengemiddelde behoefte
        if (need.percentage >= averagePct && impacted.length > 0) {
            underserved.push({
                key: need.key,
                label: workplaceLabel(need, lang),
                percentage: need.percentage,
                impactedPersonas: impacted,
                impactedNames: names,
                message: buildUnderservedMessage(need, lang),
            });
        }

        // Overdosis: ondergemiddeld en relatief laag
        if (need.percentage < averagePct * 0.7) {
            oversupplied.push({
                key: need.key,
                label: workplaceLabel(need, lang),
                percentage: need.percentage,
                message: buildOversuppliedMessage(need, lang),
            });
        }
    });

    underserved.sort((a, b) => b.percentage - a.percentage);
    oversupplied.sort((a, b) => a.percentage - b.percentage);

    const impactSummary = buildImpactSummary({
        underserved,
        oversupplied,
        members,
        presentPersonaIds,
        needs,
        averagePct,
        aggregate,
        lang,
    });

    return { underserved, oversupplied, impactSummary };
}

// Bouw drie groepen: Dominant / Gemiddeld / Minderheid
function buildImpactSummary({ underserved, oversupplied, members, presentPersonaIds, needs, averagePct, aggregate, lang = 'nl' }) {
    if (presentPersonaIds.size === 0) {
        return null;
    }

    const present = (aggregate?.sortedPersonas || [])
        .filter((p) => p.count > 0)
        .map((p) => {
            const teamPct =
                aggregate?.teamCount > 0
                    ? Math.round((p.count / aggregate.teamCount) * 100)
                    : 0;
            return { ...p, teamPct };
        });

    if (present.length === 0) return null;

    const namesByPersona = {};
    present.forEach((p) => {
        namesByPersona[p.id] = members
            .filter((m) => m.primary === p.id)
            .map((m) => firstName(m.name))
            .filter(isRealName)
            .filter((n, i, arr) => arr.indexOf(n) === i);
    });

    const personaTension = text(lang).personaTension;

    const enrichPersona = (p, group) => {
        const name = personaName(p.id, lang);
        const message = personaTension[p.id] || personaTension.fallback;
        return {
            id: p.id,
            name,
            teamPct: p.teamPct,
            tensionMessage: message(name),
            names: namesByPersona[p.id] || [],
            group,
        };
    };

    let dominant = [];
    let middle = [];
    let minority = [];

    if (present.length === 1) {
        dominant = [present[0]];
    } else if (present.length === 2) {
        dominant = present;
    } else {
        const top1 = present[0];
        const top2 = present[1];
        const soloDominant = top1.teamPct >= top2.teamPct * 1.5;

        if (soloDominant) {
            dominant = [top1];
        } else {
            dominant = [top1, top2];
        }

        const afterDominant = present.slice(dominant.length);
        const tail = afterDominant.slice(-2);

        if (tail.length === 1) {
            if (tail[0].teamPct < 10) {
                minority = tail;
            } else {
                middle = tail;
            }
        } else if (tail.length === 2) {
            const bothUnder10 = tail.every((p) => p.teamPct < 10);
            if (bothUnder10) {
                minority = tail;
                middle = afterDominant.slice(0, -2);
            } else {
                middle = afterDominant;
            }
        } else {
            middle = afterDominant;
        }
    }

    const dominantEnriched = dominant.map((p) => enrichPersona(p, 'dominant'));
    const middleEnriched = middle.map((p) => enrichPersona(p, 'middle'));
    const minorityEnriched = minority.map((p) => enrichPersona(p, 'minority'));

    const checkWorkplaces = needs
        .filter((n) => n.percentage >= averagePct)
        .map((n) => ({ label: workplaceLabel(n, lang), percentage: n.percentage }));

    const uncheckWorkplaces = needs
        .filter((n) => n.percentage < averagePct * 0.7)
        .map((n) => ({ label: workplaceLabel(n, lang), percentage: n.percentage }));

    return {
        dominant: dominantEnriched,
        middle: middleEnriched,
        minority: minorityEnriched,
        checkWorkplaces,
        uncheckWorkplaces,
    };
}

function impactedPersonas(workplaceKey, presentPersonaIds, lang = 'nl') {
    return getArchetypes(lang)
        .filter((arch) => presentPersonaIds.has(arch.id))
        .filter((arch) => {
            const score = arch?.bricksProfile?.[workplaceKey] || 0;
            return score >= PERSONA_NEED_THRESHOLD;
        })
        .map((arch) => ({
            id: arch.id,
            name: arch.name,
            score: arch.bricksProfile[workplaceKey],
        }));
}

function impactedNames(workplaceKey, members, lang = 'nl') {
    const highScoringIds = getArchetypes(lang)
        .filter((arch) => (arch?.bricksProfile?.[workplaceKey] || 0) >= PERSONA_NEED_THRESHOLD)
        .map((arch) => arch.id);

    const seen = new Set();
    const result = [];

    members.forEach((m) => {
        if (!highScoringIds.includes(m.primary)) return;
        const fname = firstName(m.name);
        if (!isRealName(fname)) return;
        if (seen.has(fname)) return;
        seen.add(fname);
        result.push({ name: fname, personaId: m.primary });
    });

    return result;
}

function firstName(fullName) {
    if (!fullName) return '';
    return String(fullName).trim().split(/\s+/)[0];
}

function formatNamesNatural(names, lang = 'nl') {
    return text(lang).joinNatural(names);
}

function buildUnderservedMessage(need, lang = 'nl') {
    const tension = text(lang).underserved;
    return (
        tension[need.key] ||
        tension.fallback(workplaceLabel(need, lang).toLowerCase())
    );
}

function buildOversuppliedMessage(need, lang = 'nl') {
    const noise = text(lang).oversupplied;
    return (
        noise[need.key] ||
        noise.fallback(workplaceLabel(need, lang).toLowerCase())
    );
}

// =========================
// QUICK WINS
// =========================
function buildWorkplaceQuickWins(aggregate, lang = 'nl') {
    const wins = [];
    const needs = aggregate?.sortedWorkplaceNeeds || [];

    // QuickWins gaan over "wie zit er in dit team" voor de werkstijl-actie,
    // zodat ze rijmen met het dashboard. Voor de werkstijl-actie kiezen we
    // de meest voorkomende primaire persona.
    const personasByPrimary = aggregate?.personasByPrimary || [];
    const topPersona = personasByPrimary[0] || null;

    // Ontbrekend op basis van strikte definitie uit aggregate
    const missingPersonas = aggregate?.missingPersonas || [];

    const topNeed = needs[0];
    const tension = buildWorkplaceTension(aggregate, lang);
    const t = text(lang).quickWins;

    // WIN 1 — uit WERKSTIJLEN: de dominante primaire persona vraagt iets
    if (topPersona) {
        const template = t.persona[topPersona.id];
        if (template) {
            wins.push({
                source: 'werkstijlen',
                action: template(personaName(topPersona.id, lang)),
            });
        }
    }

    // WIN 2 — uit WERKPLEK
    if (topNeed) {
        const action = t.workplace[topNeed.key];
        if (action) {
            wins.push({ source: 'werkplek', action });
        }
    }

    // WIN 3 — uit SPANNING
    if (tension.underserved.length > 0) {
        const first = tension.underserved[0];
        // Bewust niet op persoonsnaam: de behoefte volgt uit de werkstijl
        // (bricksProfile), niet uit een individuele werkplekvoorkeur. We
        // benoemen het patroon — de werkstijl die vastloopt — niet "de pijn
        // van persoon X".
        const arch = first.impactedPersonas?.[0];
        const who = arch ? text(lang).personaPlural(arch.name) : t.tensionWhoFallback;
        wins.push({
            source: 'spanning',
            action: t.tensionUnderserved(first.label.toLowerCase(), who),
        });
    } else if (tension.oversupplied.length > 0) {
        const first = tension.oversupplied[0];
        wins.push({
            source: 'spanning',
            action: t.tensionOversupplied(first.label.toLowerCase()),
        });
    }

    // WIN 4 — uit MINDERHEID
    const minority = tension?.impactSummary?.minority || [];
    if (minority.length > 0) {
        const personaNames = minority.map((p) => p.name);
        const personaText = formatNamesNatural(personaNames, lang);

        const workplaceScores = {};
        minority.forEach((p) => {
            const arch = getArchetypes(lang).find((a) => a.id === p.id);
            if (!arch?.bricksProfile) return;
            Object.entries(arch.bricksProfile).forEach(([key, score]) => {
                workplaceScores[key] = (workplaceScores[key] || 0) + score;
            });
        });

        const topMinorityWorkplaces = Object.entries(workplaceScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([key]) => {
                const need = needs.find((n) => n.key === key);
                return workplaceLabel(need || { key }, lang);
            });

        const workplacesText = formatNamesNatural(
            topMinorityWorkplaces.map((w) => w.toLowerCase()),
            lang
        );

        wins.push({
            source: 'minderheid',
            action: t.minority(workplacesText, personaText, minority.length),
        });
    }

    // WIN 5+ — uit ONTBREKEND (strikte definitie uit aggregate)
    if (missingPersonas.length > 0) {
        missingPersonas.slice(0, 3).forEach((persona) => {
            const template = t.missing[persona.id];
            if (template) {
                wins.push({
                    source: 'ontbrekend',
                    action: template(personaName(persona.id, lang)),
                });
            }
        });
    } else {
        wins.push({
            source: 'reflectie',
            action: t.reflection,
        });
    }

    return wins.slice(0, 7);
}

// =========================
// HIGHLIGHTS — gebaseerd op personasByPrimary (consistent met dashboard)
// =========================
function buildHighlights(top, second, topNeed, secondNeed, lang = 'nl') {
    const t = text(lang).highlights;
    const out = [];
    if (top) {
        out.push(t.top(personaName(top.id, lang)));
    }
    if (top && second) {
        out.push(t.combination(personaName(top.id, lang), personaName(second.id, lang)));
    }
    if (topNeed && secondNeed) {
        out.push(
            t.needs(
                workplaceLabel(topNeed, lang).toLowerCase(),
                workplaceLabel(secondNeed, lang).toLowerCase()
            )
        );
    }
    return out;
}

// =========================
// ENERGY & FRICTION — voor Module 2 (energie-basis)
// =========================
const DOMINANT_PCT = 30;

// Alleen de structuur: welke twee werkstijlen vormen een spanningsveld.
// Label en beschrijving staan in copy, opgezocht via `id`.
const TENSION_PAIRS = [
    { id: 'maker:denker', a: 'maker', b: 'denker' },
    { id: 'presteerder:verbinder', a: 'presteerder', b: 'verbinder' },
    { id: 'vernieuwer:zekerzoeker', a: 'vernieuwer', b: 'zekerzoeker' },
    { id: 'groeier:teamspeler', a: 'groeier', b: 'teamspeler' },
];

function buildEnergy(aggregate, lang = 'nl') {
    const t = text(lang).energy;
    const personas = (aggregate?.sortedPersonas || []).filter(
        (p) => p.count > 0 && p.percentage >= DOMINANT_PCT
    );

    if (personas.length === 0) {
        return (aggregate?.sortedPersonas || [])
            .filter((p) => p.count > 0)
            .slice(0, 2)
            .map((p) => {
                const name = personaName(p.id, lang);
                return {
                    persona: name,
                    percentage: p.percentage,
                    body: t.present(name, p.percentage),
                };
            });
    }

    return personas.map((p) => ({
        persona: personaName(p.id, lang),
        percentage: p.percentage,
        body: energyBodyFor(p, lang),
    }));
}

function energyBodyFor(persona, lang = 'nl') {
    const map = text(lang).energy.body;
    return map[persona.id] || map.fallback(personaName(persona.id, lang));
}

function buildPersonaFriction(aggregate, lang = 'nl') {
    const c = text(lang);
    const personas = aggregate?.sortedPersonas || [];
    const present = new Set(personas.filter((p) => p.count > 0).map((p) => p.id));
    const items = [];

    TENSION_PAIRS.forEach((pair) => {
        if (present.has(pair.a) && present.has(pair.b)) {
            const pA = personas.find((p) => p.id === pair.a);
            const pB = personas.find((p) => p.id === pair.b);
            const copy = c.tensionPairs[pair.id];
            if (!copy) return;

            const nameA = personaName(pair.a, lang);
            const nameB = personaName(pair.b, lang);

            items.push({
                type: 'tension',
                label: copy.label,
                body: copy.description(nameA, nameB),
                detail: c.tensionDetail(nameA, pA.percentage, nameB, pB.percentage),
            });
        }
    });

    return items;
}

function buildUsage(aggregate, lang = 'nl') {
    const t = text(lang).usage;

    // Bewust op personasByPrimary voor consistentie met dashboard
    const top = aggregate?.personasByPrimary?.[0]
        || aggregate?.sortedPersonas?.[0];
    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0];
    const pct = top?.countPercentage ?? top?.percentage ?? 0;

    return [
        {
            situation: t.meeting.situation,
            title: t.meeting.title,
            items: top ? [t.meeting.item(personaName(top.id, lang), pct)] : [],
        },
        {
            situation: t.workplace.situation,
            title: t.workplace.title,
            items: topNeed ? [t.workplace.item(workplaceLabel(topNeed, lang))] : [],
        },
    ];
}