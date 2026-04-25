import React from 'react';
import { PrimaryButton, SecondaryButton } from '../../ui/AppShell';

/**
 * TeamHeader — hero-kaart in de stijl van de Quiz ("Kort voordat je start.").
 *
 * Props:
 *   accent:        'sage' | 'rose'   (default 'sage')
 *   eyebrow:       bijv. '01 — Teaminzicht'
 *   titleLead:     bijv. 'Teaminzicht voor'
 *   titleHighlight: bijv. 'Demo Team 3'   (komt italic in accent-kleur)
 *   lead:          korte zin, rechts naast titel op desktop
 *   selectedTeam:  fallback voor titleHighlight
 *   teamCount, organization, dominantPersona: gebruikt voor meta-chips
 *   setPage:       voor Ander team / Terug naar home
 */

const ACCENT_COLOR_MAP = {
    sage: 'var(--tof-accent-sage)',
    rose: 'var(--tof-accent-rose)',
};

export default function TeamHeader({
    accent = 'sage',
    eyebrow = '01 — Teaminzicht',
    titleLead = 'Teaminzicht voor',
    titleHighlight,
    lead,
    selectedTeam,
    teamCount,
    organization,
    dominantPersona,
    setPage,
    extraActions = null,
}) {
    const isMobile =
        typeof window !== 'undefined' && window.innerWidth < 900;

    const accentColor = ACCENT_COLOR_MAP[accent] || ACCENT_COLOR_MAP.sage;

    const teamName =
        titleHighlight ||
        (typeof selectedTeam === 'object' && selectedTeam !== null
            ? selectedTeam.name || selectedTeam.team || 'jouw team'
            : selectedTeam || 'jouw team');

    const reliabilityLabel = buildReliabilityLabel(teamCount);

    const defaultLead =
        accent === 'rose'
            ? 'Waar samenwerking schuurt, waarom tempo en reflectie botsen, en wat dat vraagt van leiderschap.'
            : 'Wat werkstijlen zijn, wat het team van de werkomgeving vraagt en waar de eerste kansen liggen.';

    return (
        <div
            style={{
                background: '#ffffff',
                borderRadius: 20,
                borderLeft: `4px solid ${accentColor}`,
                boxShadow: '0 10px 26px rgba(70, 45, 35, 0.05)',
                padding: isMobile ? '22px 20px 22px 22px' : '36px 40px 32px 44px',
                display: 'grid',
                gap: isMobile ? 16 : 22,
            }}
        >
            {/* KOP + LEAD */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'minmax(0, 1fr) 300px',
                    gap: isMobile ? 14 : 40,
                    alignItems: 'start',
                }}
            >
                <div>
                    <div
                        style={{
                            color: accentColor,
                            letterSpacing: 2,
                            fontSize: 12,
                            marginBottom: 12,
                            textTransform: 'uppercase',
                            fontWeight: 600,
                        }}
                    >
                        {eyebrow}
                    </div>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontSize: isMobile ? 34 : 'clamp(38px, 4.5vw, 54px)',
                            lineHeight: 1.08,
                            fontWeight: 500,
                            color: '#1f1b18',
                        }}
                    >
                        {titleLead}{' '}
                        <span
                            style={{
                                color: accentColor,
                                fontStyle: 'italic',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {teamName}
                        </span>
                    </h1>
                </div>

                <p
                    style={{
                        margin: 0,
                        lineHeight: 1.6,
                        color: '#444',
                        fontSize: isMobile ? 14 : 15,
                    }}
                >
                    {lead || defaultLead}
                </p>
            </div>

            {/* META-CHIPS */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                <MetaChip label="Responses" value={teamCount ?? 0} />
                {organization ? (
                    <MetaChip label="Organisatie" value={organization} />
                ) : null}
                {dominantPersona ? (
                    <MetaChip
                        label="Dominant"
                        value={dominantPersona}
                        accent={accentColor}
                    />
                ) : null}
                {reliabilityLabel ? (
                    <MetaChip label="Betrouwbaarheid" value={reliabilityLabel} />
                ) : null}
            </div>

            {/* ACTIES */}
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                }}
            >
                {extraActions}

                <PrimaryButton
                    onClick={() => setPage && setPage('team')}
                    style={{ background: accentColor }}
                >
                    Ander team
                </PrimaryButton>

                <SecondaryButton onClick={() => setPage && setPage('home')}>
                    Terug naar home
                </SecondaryButton>
            </div>
        </div>
    );
}

// =========================
// META CHIP
// =========================
function MetaChip({ label, value, accent = 'var(--tof-text-muted)' }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--tof-bg)',
                border: '1px solid var(--tof-border)',
                borderRadius: 999,
                padding: '3px 10px',
                fontSize: 11,
            }}
        >
            <span
                style={{
                    width: 5,
                    height: 5,
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
                    letterSpacing: 0.6,
                    fontSize: 10,
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

// =========================
// HELPERS
// =========================
function buildReliabilityLabel(count) {
    if (count === null || count === undefined) return '';
    if (count < 3) return 'Indicatief';
    if (count < 6) return 'Groeiend';
    return 'Sterk beeld';
}
