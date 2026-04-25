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

export function getArchetype(id) {
    return ARCHETYPES.find((a) => a.id === id) || null;
}

export function buildTeamAggregate(teamResponses = []) {
    const safeResponses = Array.isArray(teamResponses) ? teamResponses : [];

    const personaCounts = {};
    const workplaceTotals = {};
    const totalScores = {};
    const members = [];

    ARCHETYPES.forEach((archetype) => {
        personaCounts[archetype.id] = 0;
        totalScores[archetype.id] = 0;
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

        if (primary && personaCounts[primary] !== undefined) {
            personaCounts[primary] += 1;
        }

        if (hasFullScores) {
            Object.entries(fullScores).forEach(([id, value]) => {
                totalScores[id] = (totalScores[id] || 0) + Number(value || 0);
            });
        } else {
            if (primary) totalScores[primary] = (totalScores[primary] || 0) + 3;
            if (secondary) totalScores[secondary] = (totalScores[secondary] || 0) + 2;
            if (tertiary) totalScores[tertiary] = (totalScores[tertiary] || 0) + 1;
        }

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
            name: response?.name || 'Onbekend',
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

    const sortedPersonas = Object.entries(personaCounts)
        .map(([id, count]) => {
            const archetype = getArchetype(id);
            return {
                id,
                name: archetype?.name || id,
                count,
                percentage: teamCount > 0 ? Math.round((count / teamCount) * 100) : 0,
            };
        })
        .sort((a, b) => b.count - a.count);

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
        sortedScores,
        sortedPersonas,
        topPersonas: sortedPersonas.slice(0, 3),
        workplaceTotals,
        sortedWorkplaceNeeds,
        topWorkplaceNeeds: sortedWorkplaceNeeds.slice(0, 3),
        topPersona: sortedPersonas[0] || null,
        secondPersona: sortedPersonas[1] || null,
        topWorkplace: sortedWorkplaceNeeds[0] || null,
        secondWorkplace: sortedWorkplaceNeeds[1] || null,
        members,
    };
}