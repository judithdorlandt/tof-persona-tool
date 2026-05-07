import { ARCHETYPES } from '../data';

export const WORKPLACE_KEYS = [
    'focus',
    'work',
    'hybride',
    'meeting',
    'project',
    'team',
    'learning',
    'retreat',
    'social',
];

export const WORKPLACE_LABELS = {
    focus: 'Concentratieplekken',
    work: 'Standaard werkplekken',
    hybride: 'Hybride plekken',
    meeting: 'Overlegplekken',
    project: 'Creatieve plekken',
    team: 'Samenwerkplekken',
    learning: 'Leerplekken',
    retreat: 'Rustplekken',
    social: 'Informele plekken',
};

export const WORKPLACE_COLORS = {
    focus: '#6F7F92',
    work: '#A8A29B',
    hybride: '#B8A48B',
    meeting: '#7F9A8A',
    project: '#D08C5B',
    team: '#8B7F9A',
    learning: '#C28D6B',
    retreat: '#7D8A6B',
    social: '#B05252',
};

// Drempel voor "ontbreekt": persona heeft 0 mensen primair én minder dan
// 5% van de totale werkstijl-energie. Strikte definitie zodat een
// persona nooit tegelijk dominant in energie én ontbrekend kan zijn.
export const MISSING_ENERGY_THRESHOLD_PCT = 5;

export function getArchetype(id) {
    return ARCHETYPES.find((a) => a.id === id) || null;
}

export function buildTeamAggregate(teamResponses = []) {
    const safeResponses = Array.isArray(teamResponses) ? teamResponses : [];

    const personaCounts = {};        // Aantal mensen met deze persona als primair
    const personaPrimaryNames = {};  // Voornamen per persona (op basis van primair)
    const personaPrimaryAnonymous = {}; // Aantal anonieme primary-respondenten per persona
    const totalScores = {};          // Opgetelde werkstijl-energie
    const workplaceTotals = {};
    const members = [];

    ARCHETYPES.forEach((archetype) => {
        personaCounts[archetype.id] = 0;
        totalScores[archetype.id] = 0;
        personaPrimaryNames[archetype.id] = [];
        personaPrimaryAnonymous[archetype.id] = 0;
    });

    WORKPLACE_KEYS.forEach((key) => {
        workplaceTotals[key] = 0;
    });

    safeResponses.forEach((response) => {
        const primary =
            response?.primary_archetype ||
            response?.primary ||
            '';

        const secondary =
            response?.secondary_archetype ||
            response?.secondary ||
            '';

        const tertiary =
            response?.tertiary_archetype ||
            response?.tertiary ||
            '';

        const fullScores = response?.full_scores || response?.scores || {};
        const hasFullScores = Object.keys(fullScores).length > 0;

        // ── Naam met anonimiteit ───────────────────────────────
        const rawName = String(response?.name || '').trim();
        const hasName = rawName && rawName !== 'Onbekend';
        const firstName = hasName ? rawName.split(/\s+/)[0] : null;

        // ── personaCounts + namen op primair ───────────────────
        if (primary && personaCounts[primary] !== undefined) {
            personaCounts[primary] += 1;

            if (firstName && !personaPrimaryNames[primary].includes(firstName)) {
                personaPrimaryNames[primary].push(firstName);
            } else if (!firstName) {
                personaPrimaryAnonymous[primary] += 1;
            }
        }

        // ── totalScores = werkstijl-energie ────────────────────
        if (hasFullScores) {
            Object.entries(fullScores).forEach(([id, value]) => {
                totalScores[id] = (totalScores[id] || 0) + Number(value || 0);
            });
        } else {
            if (primary) totalScores[primary] = (totalScores[primary] || 0) + 3;
            if (secondary) totalScores[secondary] = (totalScores[secondary] || 0) + 2;
            if (tertiary) totalScores[tertiary] = (totalScores[tertiary] || 0) + 1;
        }

        // ── workplaceTotals: gewogen door volledige profiel ────
        if (hasFullScores) {
            Object.entries(fullScores).forEach(([id, value]) => {
                const archetype = getArchetype(id);
                const bricksProfile = archetype?.bricksProfile || {};
                const numericValue = Number(value || 0);

                WORKPLACE_KEYS.forEach((key) => {
                    workplaceTotals[key] += Number(bricksProfile[key] || 0) * numericValue;
                });
            });
        } else {
            const weightedPersonas = [
                { id: primary, weight: 3 },
                { id: secondary, weight: 2 },
                { id: tertiary, weight: 1 },
            ];

            weightedPersonas.forEach(({ id, weight }) => {
                if (!id) return;
                const archetype = getArchetype(id);
                const bricksProfile = archetype?.bricksProfile || {};

                WORKPLACE_KEYS.forEach((key) => {
                    workplaceTotals[key] += Number(bricksProfile[key] || 0) * weight;
                });
            });
        }

        members.push({
            name: hasName ? rawName : 'Anoniem',
            isAnonymous: !hasName,
            role: response?.role || '',
            organization: response?.organization || response?.org || '',
            department: response?.department || response?.dept || '',
            team: response?.team || '',
            primary,
            secondary,
            tertiary,
            created_at: response?.created_at || null,
        });
    });

    const teamCount = safeResponses.length;
    const totalEnergy = Object.values(totalScores).reduce(
        (sum, value) => sum + Number(value || 0),
        0
    );

    // ── personasByPrimary: gerangschikt op aantal mensen primair ──
    // Voor de Insight-vraag: "wie zit er in dit team".
    // Heeft countPercentage (= count / teamCount), namen, anoniem.
    const personasByPrimary = ARCHETYPES
        .map((archetype) => {
            const id = archetype.id;
            const count = personaCounts[id] || 0;
            const score = Number(totalScores[id] || 0);
            return {
                id,
                name: archetype.name || id,
                count,
                score,
                names: [...(personaPrimaryNames[id] || [])],
                anonymousCount: personaPrimaryAnonymous[id] || 0,
                countPercentage: teamCount > 0
                    ? Math.round((count / teamCount) * 100)
                    : 0,
                energyPercentage: totalEnergy > 0
                    ? Math.round((score / totalEnergy) * 100)
                    : 0,
            };
        })
        .filter((p) => p.count > 0)
        .sort((a, b) => b.count - a.count);

    // ── personasByEnergy: gerangschikt op werkstijl-energie ────
    // Voor de Dynamics-vraag: "welke werkstijl-energie draagt dit team".
    const personasByEnergy = ARCHETYPES
        .map((archetype) => {
            const id = archetype.id;
            const count = personaCounts[id] || 0;
            const score = Number(totalScores[id] || 0);
            return {
                id,
                name: archetype.name || id,
                count,
                score,
                names: [...(personaPrimaryNames[id] || [])],
                anonymousCount: personaPrimaryAnonymous[id] || 0,
                countPercentage: teamCount > 0
                    ? Math.round((count / teamCount) * 100)
                    : 0,
                energyPercentage: totalEnergy > 0
                    ? Math.round((score / totalEnergy) * 100)
                    : 0,
            };
        })
        .sort((a, b) => b.score - a.score);

    // ── missingPersonas: persona's met 0 mensen primair én lage energie ──
    // Strikte definitie: een persona kan nooit tegelijk dominant in energie
    // én ontbrekend zijn.
    const missingPersonas = ARCHETYPES
        .map((archetype) => {
            const id = archetype.id;
            const count = personaCounts[id] || 0;
            const score = Number(totalScores[id] || 0);
            const energyPct = totalEnergy > 0
                ? (score / totalEnergy) * 100
                : 0;
            return {
                id,
                name: archetype.name || id,
                short: archetype.short || '',
                count,
                score,
                energyPercentage: Math.round(energyPct),
                _energyPctRaw: energyPct,
            };
        })
        .filter((p) => p.count === 0 && p._energyPctRaw < MISSING_ENERGY_THRESHOLD_PCT)
        .sort((a, b) => a._energyPctRaw - b._energyPctRaw)
        .map(({ _energyPctRaw, ...rest }) => rest);

    // ── Backwards-compat: sortedPersonas blijft bestaan (= energie-sortering) ──
    // Bestaande componenten (TeamPersonaDistribution, TeamStatsCards,
    // TeamInsights.js) lezen hier nog uit.
    const sortedPersonas = personasByEnergy.map((p) => ({
        id: p.id,
        name: p.name,
        count: p.count,
        score: p.score,
        percentage: p.energyPercentage,
    }));

    // ── Workplace needs ────────────────────────────────────────
    const totalWorkplaceValue = Object.values(workplaceTotals).reduce(
        (sum, value) => sum + Number(value || 0),
        0
    );

    const sortedWorkplaceNeeds = Object.entries(workplaceTotals)
        .map(([key, value]) => ({
            key,
            label: WORKPLACE_LABELS[key] || key,
            color: WORKPLACE_COLORS[key] || '#A8A29B',
            value: Number(Number(value || 0).toFixed(1)),
            percentage:
                totalWorkplaceValue > 0
                    ? Math.round((Number(value || 0) / totalWorkplaceValue) * 100)
                    : 0,
        }))
        .sort((a, b) => b.value - a.value);

    const sortedScores = Object.entries(totalScores)
        .map(([id, value]) => {
            const archetype = getArchetype(id);
            return {
                id,
                name: archetype?.name || id,
                value: Number(value || 0),
            };
        })
        .sort((a, b) => b.value - a.value);

    return {
        teamCount,
        personaCounts,
        totalScores,
        totalEnergy,
        sortedScores,

        // Twee waarheden, beide expliciet:
        personasByPrimary,           // "Wie zit er in dit team" — sortering op aantal primair
        personasByEnergy,            // "Welke werkstijl-energie" — sortering op score
        missingPersonas,             // Strikt: count=0 én energie <5%

        // Convenience:
        topPersonaByPrimary: personasByPrimary[0] || null,
        topPersonaByEnergy: personasByEnergy[0] || null,

        // Backwards-compat (lees als energie-sortering):
        sortedPersonas,
        topPersonas: sortedPersonas.slice(0, 3),
        topPersona: sortedPersonas[0] || null,
        secondPersona: sortedPersonas[1] || null,

        // Workplace:
        workplaceTotals,
        sortedWorkplaceNeeds,
        topWorkplaceNeeds: sortedWorkplaceNeeds.slice(0, 3),
        topWorkplace: sortedWorkplaceNeeds[0] || null,
        secondWorkplace: sortedWorkplaceNeeds[1] || null,

        members,
    };
}