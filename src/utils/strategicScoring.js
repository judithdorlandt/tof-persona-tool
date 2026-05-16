/**
 * strategicScoring.js — scoring + aggregatie voor de Strategic Tool
 *
 * Individueel:
 *   scoreResponse(answers)
 *     → { axisDirections, dominantPosition, dominantTrends, summary }
 *
 *   answers shape: { [questionId]: 'A' | 'B' | 'C' | 'D' }
 *
 * Team (MT-aggregatie):
 *   aggregateResponses(allResponses)
 *     → { axes: [...], trendWeights, convergenceScore, dominantPositions }
 *
 *   allResponses shape: [{ answers: { qId: letter }, name?, role? }, ...]
 */

import { STRATEGIC_QUESTIONS, STRATEGIC_AXES, getAxis } from '../data/strategicQuestions';

// ─── INDIVIDUEEL ─────────────────────────────────────────────────────────────

/**
 * Score één respondent.
 * Per as: welk position-id ze het vaakst kozen.
 * Per trend: hoeveel hits over alle antwoorden.
 */
export function scoreResponse(answers) {
    const axisDirections = {};
    const trendHits = {};

    // Per as bijhouden welke positions getoetst zijn
    STRATEGIC_AXES.forEach((axis) => {
        axisDirections[axis.id] = {};
        axis.positions.forEach((p) => {
            axisDirections[axis.id][p.id] = 0;
        });
    });

    STRATEGIC_QUESTIONS.forEach((q) => {
        const letter = answers[q.id];
        if (!letter) return;
        const opt = q.options.find((o) => o.letter === letter);
        if (!opt) return;

        // 1. Axis-positie incrementeren
        if (axisDirections[q.axisId] && axisDirections[q.axisId][opt.position] !== undefined) {
            axisDirections[q.axisId][opt.position] += 1;
        }

        // 2. Trend-hits incrementeren
        (opt.trends || []).forEach((trendId) => {
            trendHits[trendId] = (trendHits[trendId] || 0) + 1;
        });
    });

    // Dominante positie per as
    const dominantPosition = {};
    Object.entries(axisDirections).forEach(([axisId, positionMap]) => {
        let max = -1;
        let dominant = null;
        Object.entries(positionMap).forEach(([posId, count]) => {
            if (count > max) {
                max = count;
                dominant = posId;
            }
        });
        dominantPosition[axisId] = dominant;
    });

    // Top trends
    const dominantTrends = Object.entries(trendHits)
        .sort((a, b) => b[1] - a[1])
        .map(([id, count]) => ({ id, count }));

    return {
        axisDirections,
        dominantPosition,
        dominantTrends,
        summary: buildIndividualSummary(dominantPosition),
    };
}

/**
 * Korte tekst-uitkomst voor een individuele respondent.
 */
function buildIndividualSummary(dominantPosition) {
    const labels = STRATEGIC_AXES.map((axis) => {
        const posId = dominantPosition[axis.id];
        const pos = axis.positions.find((p) => p.id === posId);
        return pos ? `${axis.label.split(' ↔ ')[0]} — ${pos.label}` : null;
    }).filter(Boolean);

    return labels;
}

// ─── TEAM-AGGREGATIE ─────────────────────────────────────────────────────────

/**
 * Aggregeer meerdere responses naar een team-/organisatie-resultaat.
 *
 * Geeft per as:
 *   - distribution: hoeveel mensen op elke positie zaten
 *   - dominantPosition: meest gekozen
 *   - convergence: % dat de dominante positie koos
 *   - status: 'convergent' (>= 65%) | 'mixed' (40-65%) | 'divergent' (< 40%)
 *
 * Geeft ook geaggregeerde trend-weights (0–100 schaal) voor het Module 3 dashboard.
 */
export function aggregateResponses(allResponses) {
    if (!allResponses || allResponses.length === 0) {
        return { count: 0, axes: [], trendWeights: {}, convergenceOverall: 0 };
    }

    const count = allResponses.length;

    // Per as: count per positie
    const axisDistributions = {};
    STRATEGIC_AXES.forEach((axis) => {
        axisDistributions[axis.id] = {};
        axis.positions.forEach((p) => {
            axisDistributions[axis.id][p.id] = 0;
        });
    });

    // Trend-hits totaal
    const trendHits = {};

    allResponses.forEach((resp) => {
        STRATEGIC_QUESTIONS.forEach((q) => {
            const letter = resp.answers?.[q.id];
            if (!letter) return;
            const opt = q.options.find((o) => o.letter === letter);
            if (!opt) return;

            if (axisDistributions[q.axisId] && axisDistributions[q.axisId][opt.position] !== undefined) {
                axisDistributions[q.axisId][opt.position] += 1;
            }

            (opt.trends || []).forEach((trendId) => {
                trendHits[trendId] = (trendHits[trendId] || 0) + 1;
            });
        });
    });

    // Per as → dominant + convergence
    const axes = STRATEGIC_AXES.map((axis) => {
        const dist = axisDistributions[axis.id];
        const total = Object.values(dist).reduce((s, v) => s + v, 0);
        let dominant = null;
        let dominantCount = 0;
        Object.entries(dist).forEach(([posId, cnt]) => {
            if (cnt > dominantCount) {
                dominantCount = cnt;
                dominant = posId;
            }
        });
        const convergence = total > 0 ? Math.round((dominantCount / total) * 100) : 0;
        const status = convergence >= 65 ? 'convergent' : convergence >= 40 ? 'mixed' : 'divergent';
        const dominantPosition = axis.positions.find((p) => p.id === dominant) || null;

        // Tweede en derde keuze voor "divergente stemmen"
        const sortedPositions = Object.entries(dist)
            .filter(([id]) => id !== dominant)
            .sort((a, b) => b[1] - a[1])
            .filter(([, cnt]) => cnt > 0)
            .map(([posId, cnt]) => {
                const pos = axis.positions.find((p) => p.id === posId);
                return pos ? { ...pos, count: cnt, share: total ? Math.round((cnt / total) * 100) : 0 } : null;
            })
            .filter(Boolean);

        return {
            id: axis.id,
            label: axis.label,
            subtitle: axis.subtitle,
            distribution: dist,
            dominant: dominantPosition,
            dominantShare: convergence,
            otherPositions: sortedPositions,
            status,
        };
    });

    // Convergence-gemiddelde over alle assen
    const convergenceOverall = Math.round(
        axes.reduce((s, a) => s + a.dominantShare, 0) / axes.length
    );

    // Trend weights normaliseren (0–100 schaal):
    // max hits = aantal vragen waar die trend in voorkomt × aantal respondenten
    const maxPossiblePerTrend = {};
    STRATEGIC_QUESTIONS.forEach((q) => {
        q.options.forEach((opt) => {
            (opt.trends || []).forEach((tid) => {
                // Conservatieve schatting: 1 hit per vraag waar de trend voorkomt in een antwoord-optie
                maxPossiblePerTrend[tid] = (maxPossiblePerTrend[tid] || 0) + 1;
            });
        });
    });
    // Maar elke respondent kiest maar 1 antwoord per vraag, dus max per trend per respondent =
    // aantal vragen waarin de trend in MINSTENS één optie voorkomt.
    const trendQuestionPresence = {};
    STRATEGIC_QUESTIONS.forEach((q) => {
        const trendIds = new Set();
        q.options.forEach((opt) => {
            (opt.trends || []).forEach((tid) => trendIds.add(tid));
        });
        trendIds.forEach((tid) => {
            trendQuestionPresence[tid] = (trendQuestionPresence[tid] || 0) + 1;
        });
    });

    const trendWeights = {};
    Object.entries(trendHits).forEach(([tid, hits]) => {
        const maxForTrend = (trendQuestionPresence[tid] || 1) * count;
        trendWeights[tid] = maxForTrend > 0 ? Math.round((hits / maxForTrend) * 100) : 0;
    });

    return {
        count,
        axes,
        trendWeights,
        convergenceOverall,
    };
}

/**
 * Tekstuele duiding van een individueel resultaat.
 * Gegeven dominantPosition per as, schrijft een korte zin per as uit.
 */
export function describeIndividualResult(dominantPosition) {
    return STRATEGIC_AXES.map((axis) => {
        const posId = dominantPosition[axis.id];
        const pos = axis.positions.find((p) => p.id === posId);
        if (!pos) return null;
        return {
            axisLabel: axis.label,
            axisSubtitle: axis.subtitle,
            positionLabel: pos.label,
        };
    }).filter(Boolean);
}
