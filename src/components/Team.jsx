import React from 'react';
import { ARCHETYPES } from '../data';
import { hasFullTeamAccess, isMakerAccess } from '../utils/access';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

// =========================
// COLOR & LABEL MAPS
// =========================
const COLOR_MAP = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

const WORKPLACE_COLORS = {
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

const WORKPLACE_LABELS = {
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

// =========================
// COMPONENT
// =========================
export default function Team({
    setPage,
    teamResponses = [],
    selectedTeam = null,
}) {
    const hasAccess = hasFullTeamAccess() || isMakerAccess();

    // ---- ACCESS GATE ----
    if (!hasAccess) {
        return (
            <PageShell padding="24px 20px 36px">
                <TeamCard borderTopColor="var(--tof-accent-rose)">
                    <SectionEyebrow>Team dashboard</SectionEyebrow>

                    <h1 style={heroStyle}>Toegang vereist</h1>

                    <p style={leadStyle}>
                        Deze omgeving is alleen beschikbaar met een geldige toegangscode.
                        Ga terug naar de uitleg om opnieuw te starten.
                    </p>

                    <div style={actionsStyle}>
                        <PrimaryButton onClick={() => setPage('team')}>
                            Terug naar uitleg
                        </PrimaryButton>
                    </div>
                </TeamCard>
            </PageShell>
        );
    }

    // ---- EMPTY STATE ----
    if (!teamResponses || teamResponses.length === 0) {
        return (
            <PageShell padding="24px 20px 36px">
                <TeamCard borderTopColor="var(--tof-accent-rose)">
                    <SectionEyebrow>Team dashboard</SectionEyebrow>

                    <h1 style={heroStyle}>Geen teamdata beschikbaar</h1>

                    <p style={leadStyle}>
                        Voor deze selectie zijn nog geen teamreacties gevonden of er is
                        nog geen team geladen.
                    </p>

                    <div style={actionsStyle}>
                        <PrimaryButton onClick={() => setPage('team')}>
                            Terug naar teamomgeving
                        </PrimaryButton>

                        <SecondaryButton onClick={() => setPage('home')}>
                            Terug naar home
                        </SecondaryButton>
                    </div>
                </TeamCard>
            </PageShell>
        );
    }

    // ---- DATA ----
    const getArchetype = (id) => ARCHETYPES.find((a) => a.id === id);

    const scores = {};
    teamResponses.forEach((response) => {
        const fullScores = response?.full_scores || {};
        const hasFullScores = Object.keys(fullScores).length > 0;

        if (hasFullScores) {
            Object.entries(fullScores).forEach(([key, value]) => {
                scores[key] = (scores[key] || 0) + Number(value || 0);
            });
            return;
        }

        if (response?.primary_archetype) {
            scores[response.primary_archetype] =
                (scores[response.primary_archetype] || 0) + 3;
        }
        if (response?.secondary_archetype) {
            scores[response.secondary_archetype] =
                (scores[response.secondary_archetype] || 0) + 2;
        }
        if (response?.tertiary_archetype) {
            scores[response.tertiary_archetype] =
                (scores[response.tertiary_archetype] || 0) + 1;
        }
    });

    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

    const workplaceTotals = {
        focus: 0, work: 0, hybride: 0, meeting: 0, project: 0,
        team: 0, learning: 0, retreat: 0, social: 0,
    };

    sorted.forEach(([id, value]) => {
        const profile = getArchetype(id)?.bricksProfile;
        if (!profile) return;
        Object.keys(workplaceTotals).forEach((key) => {
            workplaceTotals[key] +=
                Number(profile[key] || 0) * Number(value || 0);
        });
    });

    const workplaceTotal = Object.values(workplaceTotals).reduce(
        (sum, value) => sum + Number(value || 0),
        0
    );

    const workplaceSummary = Object.entries(workplaceTotals)
        .map(([key, value]) => ({
            key,
            label: WORKPLACE_LABELS[key],
            value,
            percentage:
                workplaceTotal > 0
                    ? Math.round((value / workplaceTotal) * 100)
                    : 0,
            color: WORKPLACE_COLORS[key],
        }))
        .filter((item) => item.value > 0)
        .sort((a, b) => b.value - a.value);

    const topWorkplace = workplaceSummary[0];
    const secondWorkplace = workplaceSummary[1];

    const workplaceInsight =
        topWorkplace && secondWorkplace
            ? `Dit team vraagt vooral om ${topWorkplace.label.toLowerCase()} en ${secondWorkplace.label.toLowerCase()}.`
            : 'Deze mix vraagt om een gebalanceerde werkomgeving met ruimte voor focus, samenwerking en afwisseling.';

    const topPersonaId = sorted[0]?.[0] || null;
    const topPersona = topPersonaId ? getArchetype(topPersonaId) : null;

    const count = teamResponses.length;

    // ---- RENDER ----
    return (
        <PageShell padding="24px 20px 36px">
            <div
                style={{
                    display: 'grid',
                    gap: 24,
                    animation: 'tofFadeIn 0.5s ease',
                }}
            >
                {/* HERO CARD */}
                <TeamCard borderTopColor="var(--tof-accent-rose)" padding={32}>
                    <SectionEyebrow>Team dashboard</SectionEyebrow>

                    <h1 style={heroStyle}>
                        Zo ziet jouw team eruit —{' '}
                        <span
                            style={{
                                color: 'var(--tof-accent-rose)',
                                fontStyle: 'italic',
                            }}
                        >
                            waar energie zit en waar het schuurt.
                        </span>
                    </h1>

                    <p style={leadStyle}>
                        Niet alleen wie er in een team zit, maar ook waar energie ontstaat,
                        waar het schuurt en wat dat vraagt van samenwerking, leiderschap
                        en werkplek.
                    </p>

                    <div
                        style={{
                            display: 'flex',
                            gap: 10,
                            flexWrap: 'wrap',
                            marginTop: 2,
                        }}
                    >
                        <MetaChip
                            label="Responses"
                            value={count}
                            accent="var(--tof-accent-rose)"
                        />

                        {selectedTeam?.team ? (
                            <MetaChip label="Team" value={selectedTeam.team} />
                        ) : null}

                        {selectedTeam?.organization ? (
                            <MetaChip
                                label="Organisatie"
                                value={selectedTeam.organization}
                            />
                        ) : null}

                        {topPersona?.name ? (
                            <MetaChip
                                label="Dominant profiel"
                                value={topPersona.name}
                                accent="var(--tof-accent-sage)"
                            />
                        ) : null}

                        {isMakerAccess() ? (
                            <MetaChip label="Mode" value="Maker" />
                        ) : null}
                    </div>

                    {/* INSIGHT BALK */}
                    <div
                        style={{
                            display: 'grid',
                            gap: 8,
                            background: 'var(--tof-bg)',
                            borderRadius: 14,
                            padding: '16px 18px',
                            border: '1px solid var(--tof-border)',
                            marginTop: 4,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 11,
                                textTransform: 'uppercase',
                                letterSpacing: 1.4,
                                color: 'var(--tof-text-muted)',
                                fontWeight: 700,
                            }}
                        >
                            Eerste inzicht
                        </div>

                        <div
                            style={{
                                fontSize: 15,
                                color: 'var(--tof-text)',
                                lineHeight: 1.7,
                            }}
                        >
                            {getReliabilityText(count)}{' '}
                            {topPersona?.name ? (
                                <>
                                    In dit team is{' '}
                                    <strong>{topPersona.name}</strong> het meest zichtbaar.
                                </>
                            ) : null}{' '}
                            {topWorkplace?.label ? (
                                <>
                                    De werkplek vraagt daardoor vooral om{' '}
                                    <strong>{topWorkplace.label.toLowerCase()}</strong>.
                                </>
                            ) : null}
                        </div>
                    </div>

                    <div style={actionsStyle}>
                        <PrimaryButton onClick={() => setPage('teamselector')}>
                            Ander team kiezen
                        </PrimaryButton>

                        <SecondaryButton onClick={() => setPage('home')}>
                            Terug naar home
                        </SecondaryButton>
                    </div>
                </TeamCard>

                {/* MODULE INTRO */}
                <ModuleIntro
                    eyebrow="Module 01 — Team Insight & Quick Wins"
                    title="Wat dit team nodig heeft om beter te werken"
                    lead="Elk team heeft een eigen samenstelling — en die samenstelling bepaalt meer dan de meeste managers denken. Waar energie ontstaat, waar het schuurt, en wat mensen nodig hebben om goed te werken."
                />

                {/* TWEEDELING: verdeling + werkplek */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                        gap: 20,
                        alignItems: 'start',
                    }}
                >
                    <TeamCard
                        title="Verdeling in het team"
                        borderTopColor="var(--tof-accent-rose)"
                    >
                        <p style={microLeadStyle}>
                            De werkstijlen die het sterkst terugkomen in de antwoorden.
                        </p>

                        <div style={{ display: 'grid', gap: 12, marginTop: 4 }}>
                            {sorted.map(([id, value]) => {
                                const persona = getArchetype(id);
                                const pct =
                                    totalScore > 0
                                        ? Math.round((value / totalScore) * 100)
                                        : 0;
                                const color = COLOR_MAP[id] || 'var(--tof-accent-rose)';

                                return (
                                    <div key={id} style={{ display: 'grid', gap: 6 }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                color: 'var(--tof-text)',
                                                fontSize: 14,
                                            }}
                                        >
                                            <span style={{ fontWeight: 600 }}>
                                                {persona?.name || id}
                                            </span>
                                            <span
                                                style={{
                                                    color: 'var(--tof-text-soft)',
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {pct}%
                                            </span>
                                        </div>

                                        <div
                                            style={{
                                                height: 8,
                                                background: 'var(--tof-surface-soft)',
                                                borderRadius: 999,
                                                overflow: 'hidden',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: `${Math.max(pct, 2)}%`,
                                                    background: color,
                                                    height: '100%',
                                                    borderRadius: 999,
                                                    transition:
                                                        'width 0.4s var(--tof-ease)',
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </TeamCard>

                    <TeamCard
                        title="Werkplekbehoefte in het team"
                        borderTopColor="var(--tof-accent-sage)"
                    >
                        <p style={microLeadStyle}>
                            De ruimtelijke behoefte die voortkomt uit de samenstelling.
                        </p>

                        <div style={{ display: 'grid', gap: 10, marginTop: 4 }}>
                            {workplaceSummary.map((item) => (
                                <div
                                    key={item.key}
                                    style={{
                                        display: 'grid',
                                        gridTemplateColumns: '12px 1fr auto',
                                        gap: 10,
                                        alignItems: 'center',
                                        fontSize: 14,
                                        color: 'var(--tof-text-soft)',
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: 999,
                                            background: item.color,
                                        }}
                                    />
                                    <span>{item.label}</span>
                                    <strong
                                        style={{
                                            color: 'var(--tof-text)',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {item.percentage}%
                                    </strong>
                                </div>
                            ))}
                        </div>

                        <p
                            style={{
                                margin: '10px 0 0 0',
                                color: 'var(--tof-text-soft)',
                                lineHeight: 1.7,
                                fontSize: 14,
                                background: 'var(--tof-bg)',
                                borderRadius: 12,
                                padding: '12px 14px',
                                border: '1px solid var(--tof-border)',
                            }}
                        >
                            {workplaceInsight}
                        </p>
                    </TeamCard>
                </div>

                {/* GEBRUIK */}
                <TeamCard
                    title="Waar je dit dashboard voor gebruikt"
                    borderTopColor="var(--tof-text)"
                >
                    <ul
                        style={{
                            margin: 0,
                            paddingLeft: 20,
                            lineHeight: 1.9,
                            color: 'var(--tof-text-soft)',
                            fontSize: 14,
                        }}
                    >
                        <li>Als gespreksonderwerp in teamontwikkeling</li>
                        <li>Als input voor een teamoverleg of reflectiesessie</li>
                        <li>Als eerste stap naar scherpere samenwerkingsafspraken</li>
                        <li>Als basis voor keuzes in werkplek en teamritme</li>
                    </ul>
                </TeamCard>
            </div>
        </PageShell>
    );
}

// =========================
// UI HELPERS
// =========================
function TeamCard({
    title,
    children,
    borderTopColor = 'var(--tof-accent-sage)',
    padding = 24,
}) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding,
                borderTop: `4px solid ${borderTopColor}`,
                border: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 14,
                alignContent: 'start',
            }}
        >
            {title ? (
                <h2
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 'clamp(22px, 2.6vw, 30px)',
                        lineHeight: 1.08,
                        color: 'var(--tof-text)',
                    }}
                >
                    {title}
                </h2>
            ) : null}

            {children}
        </div>
    );
}

function MetaChip({ label, value, accent = 'var(--tof-text-muted)' }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--tof-bg)',
                border: '1px solid var(--tof-border)',
                borderRadius: 999,
                padding: '6px 12px',
                fontSize: 12,
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: 999,
                    background: accent,
                    flexShrink: 0,
                }}
            />
            <span
                style={{
                    color: 'var(--tof-text-muted)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.8,
                    fontSize: 11,
                }}
            >
                {label}
            </span>
            <span style={{ color: 'var(--tof-text)', fontWeight: 600 }}>
                {value}
            </span>
        </div>
    );
}

function ModuleIntro({ eyebrow, title, lead }) {
    return (
        <div style={{ display: 'grid', gap: 8, paddingLeft: 2 }}>
            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.8,
                    color: 'var(--tof-accent-rose)',
                    fontWeight: 700,
                }}
            >
                {eyebrow}
            </div>

            <h2
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 'clamp(24px, 3vw, 34px)',
                    lineHeight: 1.06,
                    color: 'var(--tof-text)',
                }}
            >
                {title}
            </h2>

            {lead ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: 'var(--tof-text-soft)',
                        maxWidth: 720,
                    }}
                >
                    {lead}
                </p>
            ) : null}
        </div>
    );
}

function getReliabilityText(count) {
    if (count < 3)
        return 'Er zijn nog weinig antwoorden, dus dit is een eerste indicatie.';
    if (count < 6)
        return 'De eerste patronen zijn zichtbaar.';
    return 'Het beeld is sterk genoeg om scherper te sturen.';
}

// =========================
// STYLES
// =========================
const heroStyle = {
    margin: 0,
    fontFamily: 'var(--tof-font-heading)',
    fontSize: 'clamp(32px, 4.6vw, 52px)',
    lineHeight: 1.04,
    color: 'var(--tof-text)',
    maxWidth: 820,
};

const leadStyle = {
    margin: 0,
    color: 'var(--tof-text-soft)',
    lineHeight: 1.75,
    fontSize: 15,
    maxWidth: 760,
};

const microLeadStyle = {
    margin: 0,
    color: 'var(--tof-text-soft)',
    lineHeight: 1.65,
    fontSize: 14,
};

const actionsStyle = {
    display: 'flex',
    gap: 12,
    flexWrap: 'wrap',
    marginTop: 4,
};
