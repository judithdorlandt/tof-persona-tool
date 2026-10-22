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
//   Werkplek-spanning volgt het werkplekprofiel (src/team/werkplek/):
//   kern / steun / beperkt nodig op de primaire werkstijlen, zonder
//   percentages — dezelfde bron als de Werkplek-tegel en het paneel.

import { getArchetypes } from '../i18n/archetypes';
import { getCopy } from '../i18n/copy';
import {
    aantallenUitAggregate,
    buildWerkplekProfiel,
    tegelKern,
    BAND,
} from '../team/werkplek/werkplekProfielLogic';
import { PERSONA_WERKPLEKMIX } from '../team/werkplek/werkplekmix';
import { dominantPersonas } from './TeamAggregation';

// Niveau in de werkplekmix waarop een type kern is voor een werkstijl.
const KERN_NIVEAU = 3;

// De werkplekteksten in teamInsightText staan nog op de sleutels van het oude
// model (focus/work/...). Type-id uit het werkplekprofiel → die sleutel.
const COPY_KEY_VOOR_TYPE = {
    concentratie: 'focus',
    standaard: 'work',
    overleg: 'meeting',
    creatief: 'project',
    samenwerk: 'team',
    leer: 'learning',
    rust: 'retreat',
    informeel: 'social',
};

// Alle zichtbare tekst komt uit copy/<taal>/teamInsightText.js.
function text(lang) {
    return getCopy(lang).teamInsightText;
}

// Naam van een type uit het werkplekprofiel, in de juiste taal.
function profielTypeLabel(type, lang) {
    if (!type) return '';
    return getCopy(lang).workplaceProfile?.types?.[type.id]?.label || type.label || type.id;
}

// Persona-naam uit de archetypes van die taal; nooit hardcoden.
function personaName(id, lang) {
    return getArchetypes(lang).find((a) => a.id === id)?.name || id;
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

    const teamCount = aggregate?.teamCount || 0;

    return {
        headline: buildHeadline(aggregate, lang),
        workplaceTension: buildWorkplaceTension(aggregate, lang),
        quickWins: buildWorkplaceQuickWins(aggregate, lang),
        highlights: buildHighlights(topByPrimary, secondByPrimary, lang),

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
        },
    };
}

// =========================
// HEADLINE
// =========================
function buildHeadline(aggregate, lang = 'nl') {
    const teamCount = aggregate?.teamCount || 0;
    const t = text(lang).headline;

    const profiel = buildWerkplekProfiel(aantallenUitAggregate(aggregate));
    if (teamCount === 0 || !profiel.heeftData) {
        return t.empty;
    }

    // Volgt het werkplekprofiel: de kernplekken, in de volgorde van het paneel.
    const kernen = profiel.typen.filter((k) => k.band === BAND.KERN);
    const label = (type) => profielTypeLabel(type, lang).toLowerCase();

    if (kernen.length >= 2) {
        return t.two(label(kernen[0]), label(kernen[1]));
    }

    if (kernen.length === 1) {
        return t.one(label(kernen[0]));
    }

    // Geen kern: de behoeften liggen dicht bij elkaar. Noem het hoogste type,
    // gelijk aan de Werkplek-tegel.
    return `${t.mixedBase} ${t.mixedUnderOnly(label(profiel.typen[0]))}`;
}

// =========================
// WORKPLACE TENSION — kernplekken + beperkt nodig
// =========================
// Volgt het werkplekprofiel:
//   underserved  = de kernplekken ("Voorzien jullie genoeg in"); zonder kern
//                  het hoogste type, gelijk aan de Werkplek-tegel.
//   oversupplied = de plekken in "beperkt nodig" ("En staat het niet vol
//                  met"), laagste eerst.
// De veldnamen blijven voor de bestaande lezers (tegel, PDF, acties).
function buildWorkplaceTension(aggregate, lang = 'nl') {
    const presentPersonaIds = new Set(
        (aggregate?.sortedPersonas || [])
            .filter((p) => p.count > 0)
            .map((p) => p.id)
    );

    const profiel = buildWerkplekProfiel(aantallenUitAggregate(aggregate));
    if (!profiel.heeftData) {
        return { underserved: [], oversupplied: [], kernCount: 0, impactSummary: null };
    }

    const kernen = profiel.typen.filter((t) => t.band === BAND.KERN);
    const { type: hoogste } = tegelKern(profiel);
    const nodig = kernen.length > 0 ? kernen : (hoogste ? [hoogste] : []);
    const beperkt = profiel.typen
        .filter((t) => t.band === BAND.AANVULLEND)
        .slice()
        .reverse();

    const underserved = nodig.map((t) => ({
        key: t.id,
        label: profielTypeLabel(t, lang),
        band: t.band,
        impactedPersonas: impactedPersonas(t.id, presentPersonaIds, lang),
    }));

    const oversupplied = beperkt.map((t) => ({
        key: t.id,
        label: profielTypeLabel(t, lang),
        band: t.band,
    }));

    const impactSummary = buildImpactSummary({
        underserved,
        oversupplied,
        presentPersonaIds,
        aggregate,
        lang,
    });

    return { underserved, oversupplied, kernCount: kernen.length, impactSummary };
}

// Bouw drie groepen: Dominant / Gemiddeld / Minderheid
function buildImpactSummary({ underserved, oversupplied, presentPersonaIds, aggregate, lang = 'nl' }) {
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

    const personaTension = text(lang).personaTension;

    const enrichPersona = (p, group) => {
        const name = personaName(p.id, lang);
        const message = personaTension[p.id] || personaTension.fallback;
        return {
            id: p.id,
            name,
            teamPct: p.teamPct,
            tensionMessage: message(name),
            group,
        };
    };

    // "De grootste groep" = de dominante werkstijl(en): meeste mensen
    // primair, bij een gelijke stand allemaal (besluit 4, 22 okt 2026).
    const dominantIds = new Set(dominantPersonas(aggregate).map((p) => p.id));
    const dominant = present.filter((p) => dominantIds.has(p.id));
    const afterDominant = present.filter((p) => !dominantIds.has(p.id));
    let middle = [];
    let minority = [];

    if (present.length < 3) {
        middle = afterDominant;
    } else {
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

    // Zelfde volgorde als het Werkplek-paneel en de PDF (meeste nadruk eerst);
    // `oversupplied` zelf staat laagste-eerst voor de leeglopers en acties.
    const checkWorkplaces = underserved.map((w) => ({ key: w.key, label: w.label }));
    const uncheckWorkplaces = oversupplied
        .slice()
        .reverse()
        .map((w) => ({ key: w.key, label: w.label }));

    return {
        dominant: dominantEnriched,
        middle: middleEnriched,
        minority: minorityEnriched,
        checkWorkplaces,
        uncheckWorkplaces,
    };
}

// Aanwezige werkstijlen voor wie dit type kern is in de werkplekmix.
function impactedPersonas(typeId, presentPersonaIds, lang = 'nl') {
    return PERSONA_WERKPLEKMIX
        .filter((p) => presentPersonaIds.has(p.id) && p.mix[typeId] === KERN_NIVEAU)
        .map((p) => ({ id: p.id, name: personaName(p.id, lang), niveau: p.mix[typeId] }));
}

function formatNamesNatural(names, lang = 'nl') {
    return text(lang).joinNatural(names);
}

// =========================
// QUICK WINS
// =========================
function buildWorkplaceQuickWins(aggregate, lang = 'nl') {
    const wins = [];

    // QuickWins gaan over "wie zit er in dit team" voor de werkstijl-actie,
    // zodat ze rijmen met het dashboard. Voor de werkstijl-actie kiezen we
    // de meest voorkomende primaire persona.
    const personasByPrimary = aggregate?.personasByPrimary || [];
    const topPersona = personasByPrimary[0] || null;

    // Ontbrekend op basis van strikte definitie uit aggregate
    const missingPersonas = aggregate?.missingPersonas || [];

    // Zelfde type als de Werkplek-tegel: de eerste kern, anders het hoogste.
    const { type: werkplekType } = tegelKern(
        buildWerkplekProfiel(aantallenUitAggregate(aggregate))
    );
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
    if (werkplekType) {
        const action = t.workplace[COPY_KEY_VOOR_TYPE[werkplekType.id]];
        if (action) {
            wins.push({ source: 'werkplek', action });
        }
    }

    // WIN 3 — uit SPANNING
    // De eerste kern zit al in de Werkplek-actie, dus hier de tweede kern;
    // zonder tweede kern het laagste type uit "beperkt nodig".
    if ((tension.kernCount || 0) >= 2) {
        const second = tension.underserved[1];
        // Bewust niet op persoonsnaam: de behoefte volgt uit de werkstijl
        // (werkplekmix), niet uit een individuele werkplekvoorkeur. We
        // benoemen het patroon — de werkstijl die vastloopt — niet "de pijn
        // van persoon X".
        const arch = second.impactedPersonas?.[0];
        const who = arch ? text(lang).personaPlural(arch.name) : t.tensionWhoFallback;
        wins.push({
            source: 'spanning',
            action: t.tensionSecondCore(second.label.toLowerCase(), who),
        });
    } else if (tension.oversupplied.length > 0) {
        const lowest = tension.oversupplied[0];
        wins.push({
            source: 'spanning',
            action: t.tensionLimited(lowest.label.toLowerCase()),
        });
    }

    // WIN 4 — uit MINDERHEID
    const minority = tension?.impactSummary?.minority || [];
    if (minority.length > 0) {
        const personaNames = minority.map((p) => p.name);
        const personaText = formatNamesNatural(personaNames, lang);

        // Wat de minderheid vraagt, uit de werkplekmix (zelfde bron als het profiel).
        const workplaceScores = {};
        minority.forEach((p) => {
            const mix = PERSONA_WERKPLEKMIX.find((m) => m.id === p.id)?.mix;
            if (!mix) return;
            Object.entries(mix).forEach(([typeId, niveau]) => {
                workplaceScores[typeId] = (workplaceScores[typeId] || 0) + niveau;
            });
        });

        const topMinorityWorkplaces = Object.entries(workplaceScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 2)
            .map(([typeId]) => profielTypeLabel({ id: typeId }, lang));

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
function buildHighlights(top, second, lang = 'nl') {
    const t = text(lang).highlights;
    const out = [];
    if (top) {
        out.push(t.top(personaName(top.id, lang)));
    }
    if (top && second) {
        out.push(t.combination(personaName(top.id, lang), personaName(second.id, lang)));
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
    const pct = top?.countPercentage ?? top?.percentage ?? 0;

    return [
        {
            situation: t.meeting.situation,
            title: t.meeting.title,
            items: top ? [t.meeting.item(personaName(top.id, lang), pct)] : [],
        },
    ];
}