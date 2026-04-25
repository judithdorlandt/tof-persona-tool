/**
 * TeamWorkplaceTension — Spanning tab
 *
 * Premium herzien volgens personakaart-DNA:
 * - Één anker-zin als hero (Groeier en Teamspeler zijn de kern...)
 * - Impact-uitspraken direct daarna als body
 * - Eén lijst voor "verder in het team" met witte kaarten + linker accent
 * - Subtiele scheidslijn tussen middenmoot en minderheid
 * - Check in je kantoor als afsluiter
 */

import React from 'react';
import { SPACING, TYPE, RADIUS, useIsMobile } from '../../ui/tokens';

const PERSONA_COLORS = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

function colorForPersona(id) {
    return PERSONA_COLORS[id] || 'var(--tof-text)';
}

function formatNamesNatural(names) {
    if (names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} en ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
}

export default function TeamWorkplaceTension({ insights }) {
    const isMobile = useIsMobile();
    const tension = insights?.workplaceTension || { impactSummary: null };
    const { impactSummary } = tension;

    if (!impactSummary) {
        return (
            <div style={{ padding: SPACING.lg, fontSize: 13, color: 'var(--tof-text-muted)' }}>
                Nog geen werkplekbehoefte zichtbaar — wacht tot meer teamleden hebben ingevuld.
            </div>
        );
    }

    const { dominant, middle, minority, checkWorkplaces, uncheckWorkplaces } = impactSummary;

    // Combineer middle + minority tot één lijst, met groep-flag
    const restOfTeam = [
        ...middle.map((p) => ({ ...p, isMinority: false })),
        ...minority.map((p) => ({ ...p, isMinority: true })),
    ];

    return (
        <div
            style={{
                display: 'grid',
                gap: isMobile ? SPACING.lg : SPACING['2xl'],
            }}
        >
            <Header isMobile={isMobile} />

            {/* HERO: anker-zinnen + impact-uitspraken */}
            {dominant.length > 0 ? (
                <DominantHero personas={dominant} isMobile={isMobile} />
            ) : null}

            {/* Verder in het team — één lijst */}
            {restOfTeam.length > 0 ? (
                <RestOfTeam items={restOfTeam} isMobile={isMobile} />
            ) : null}

            {/* Check in je kantoor */}
            {(checkWorkplaces.length > 0 || uncheckWorkplaces.length > 0) ? (
                <CheckYourOffice
                    checkWorkplaces={checkWorkplaces}
                    uncheckWorkplaces={uncheckWorkplaces}
                    isMobile={isMobile}
                />
            ) : null}
        </div>
    );
}

// =========================
// HEADER
// =========================

function Header({ isMobile }) {
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'flex-end',
                gap: SPACING.md,
                flexWrap: 'wrap',
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--tof-font-body)',
                    fontSize: 13,
                    color: 'var(--tof-text-muted)',
                }}
            >
                Hoe ziet jullie huidige kantoor eruit?
            </div>
        </div>
    );
}

// =========================
// DOMINANT HERO — ankerzin + impact + namen
// =========================

function DominantHero({ personas, isMobile }) {
    const isOne = personas.length === 1;

    const personaNames = personas.map((p) => p.name);
    const personaNamesText = formatNamesNatural(personaNames);
    const verb = isOne ? 'is' : 'zijn';

    // Som van team-percentages voor eyebrow-context
    const totalPct = personas.reduce((sum, p) => sum + (p.teamPct || 0), 0);
    const pctText = isOne
        ? `${personas[0].teamPct}% van het team`
        : personas.length === 2
            ? `${personas[0].teamPct}% + ${personas[1].teamPct}% van het team`
            : `${totalPct}% van het team`;

    // Verzamel alle namen van de dominante personae
    const allNames = [];
    personas.forEach((p) => {
        p.names.forEach((n) => {
            if (!allNames.includes(n)) allNames.push(n);
        });
    });

    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.sm,
                paddingBottom: isMobile ? SPACING.md : SPACING.lg,
                borderBottom: '1px solid var(--tof-border)',
            }}
        >
            {/* Eyebrow + percentage — zoals Werkplek hero */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    gap: SPACING.md,
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                    De kern
                </div>
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        color: 'var(--tof-text-muted)',
                        fontVariantNumeric: 'tabular-nums',
                    }}
                >
                    {pctText}
                </div>
            </div>

            {/* GROOT statement in sage Playfair — zoals "Samenwerkplekken" bij Werkplek */}
            <h3
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: isMobile ? 32 : 'clamp(32px, 3.6vw, 46px)',
                    lineHeight: 1.0,
                    fontWeight: 500,
                    color: 'var(--tof-accent-sage)',
                    letterSpacing: '-0.01em',
                }}
            >
                {personaNamesText}
            </h3>

            {/* Impact-uitspraken */}
            <div style={{ display: 'grid', gap: SPACING.sm, maxWidth: 720, marginTop: SPACING.sm }}>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {isOne ? 'Komt' : 'Komen'}{' '}
                    <span style={{ color: 'var(--tof-text)', fontWeight: 500 }}>
                        niet tot resultaat
                    </span>{' '}
                    als de werkplekken die {isOne ? 'hij of zij' : 'ze'} nodig {isOne ? 'heeft' : 'hebben'} er onvoldoende zijn.
                </p>
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 14,
                        lineHeight: 1.65,
                        color: 'var(--tof-text-soft)',
                    }}
                >
                    {isOne ? 'Verliest' : 'Verliezen'}{' '}
                    <span style={{ color: 'var(--tof-text)', fontWeight: 500 }}>
                        energie
                    </span>{' '}
                    om te komen werken als het kantoor vol staat met wat {isOne ? 'hij of zij' : 'ze'} niet {isOne ? 'gebruikt' : 'gebruiken'}.
                </p>
            </div>

            {/* Namen */}
            {allNames.length > 0 ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: 'var(--tof-text-soft)',
                        paddingTop: 4,
                    }}
                >
                    Gedragen door{' '}
                    <span style={{ color: 'var(--tof-text)', fontWeight: 500 }}>
                        {formatNamesNatural(allNames)}
                    </span>
                </div>
            ) : null}
        </div>
    );
}

// =========================
// REST OF TEAM — één lijst, witte kaarten met linker accent
// =========================

function RestOfTeam({ items, isMobile }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                Verder in het team
            </div>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: SPACING.sm,
                }}
            >
                {items.map((persona) => (
                    <PersonaCard key={persona.id} persona={persona} />
                ))}
            </div>
        </div>
    );
}

function PersonaCard({ persona }) {
    const color = colorForPersona(persona.id);

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderLeft: `3px solid ${color}`,
                borderRadius: RADIUS.md,
                padding: '12px 14px',
                display: 'grid',
                gap: 6,
            }}
        >
            {/* Header: naam + percentage + minderheid-label */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'space-between',
                    gap: SPACING.sm,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACING.sm }}>
                    <h4
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 18,
                            lineHeight: 1.1,
                            fontWeight: 500,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {persona.name}
                    </h4>
                    <span
                        style={{
                            fontFamily: 'var(--tof-font-body)',
                            fontSize: 12,
                            color: 'var(--tof-text-muted)',
                            fontVariantNumeric: 'tabular-nums',
                        }}
                    >
                        {persona.teamPct}%
                    </span>
                </div>

                {persona.isMinority ? (
                    <span
                        style={{
                            fontSize: 10,
                            textTransform: 'uppercase',
                            letterSpacing: 1.2,
                            fontWeight: 700,
                            color: 'var(--tof-text-muted)',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        Risico op isolatie
                    </span>
                ) : null}
            </div>

            <p
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-body)',
                    fontSize: 13,
                    lineHeight: 1.55,
                    color: 'var(--tof-text-soft)',
                }}
            >
                {persona.tensionMessage}
            </p>

            {persona.names.length > 0 ? (
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {formatNamesNatural(persona.names)}
                </p>
            ) : null}
        </div>
    );
}

// =========================
// CHECK IN JE KANTOOR
// =========================

function CheckYourOffice({ checkWorkplaces, uncheckWorkplaces, isMobile }) {
    return (
        <div
            style={{
                display: 'grid',
                gap: SPACING.md,
                paddingTop: SPACING.md,
                borderTop: '1px solid var(--tof-border)',
            }}
        >
            <div style={{ ...TYPE.eyebrow, color: 'var(--tof-text-muted)' }}>
                Check in je kantoor
            </div>

            {checkWorkplaces.length > 0 ? (
                <div style={{ display: 'grid', gap: SPACING.sm }}>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-body)',
                            fontSize: 13,
                            color: 'var(--tof-text-soft)',
                        }}
                    >
                        Voorzien jullie genoeg in:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {checkWorkplaces.map((wp) => (
                            <WorkplacePill key={wp.label} workplace={wp} accent="var(--tof-accent-sage)" />
                        ))}
                    </div>
                </div>
            ) : null}

            {uncheckWorkplaces.length > 0 ? (
                <div style={{ display: 'grid', gap: SPACING.sm }}>
                    <p
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-body)',
                            fontSize: 13,
                            color: 'var(--tof-text-soft)',
                        }}
                    >
                        En staat het niet vol met:
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {uncheckWorkplaces.map((wp) => (
                            <WorkplacePill key={wp.label} workplace={wp} accent="var(--tof-accent-rose)" />
                        ))}
                    </div>
                </div>
            ) : null}
        </div>
    );
}

function WorkplacePill({ workplace, accent }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--tof-surface)',
                border: `1px solid ${accent}44`,
                borderRadius: RADIUS.pill,
                padding: '5px 12px',
                fontSize: 13,
                color: 'var(--tof-text)',
                fontWeight: 500,
            }}
        >
            {workplace.label}
            <span
                style={{
                    fontSize: 11,
                    color: accent,
                    fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                }}
            >
                {workplace.percentage}%
            </span>
        </span>
    );
}
