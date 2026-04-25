/**
 * TeamDashboard — Module 1: Team Insight
 *
 * Architectuur conform design-system:
 * - HeroBlock direct op canvas (geen kaart-hero)
 * - Headline-quote als signature-zin
 * - TileGrid: vier compacte tegels als navigatie
 * - SectionCard daaronder: één detail-blok opent onder de tegels
 * - Geen lange scroll door alle blokken
 */

import React, { useMemo, useState } from 'react';
import {
    PageShell,
    HeroBlock,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    SectionEyebrow,
    InteractiveRow,
    TileGrid,
    Tile,
} from '../ui/AppShell';
import { SPACING, TYPE, RADIUS, MODULE } from '../ui/tokens';

import TeamPersonaDistribution from '../team/components/TeamPersonaDistribution';
import TeamWorkplaceNeeds from '../team/components/TeamWorkplaceNeeds';
import TeamWorkplaceTension from '../team/components/TeamWorkplaceTension';
import TeamQuickWins from '../team/components/TeamQuickWins';

import { buildTeamAggregate } from '../utils/TeamAggregation';
import { buildTeamInsights } from '../utils/TeamInsights';
import { hasTeamLevel, LEVEL_DYNAMICS, isAdminAccess } from '../utils/access';
import { generateTeamInsightPDF } from '../utils/teamInsightPDF';

const ACCENT = MODULE.insight.accent;

// =========================
// TILE DEFINITIONS
// =========================

const TILES = [
    {
        id: 'personas',
        eyebrow: 'Werkstijlen',
        buildValue: (aggregate) => {
            const top = aggregate?.sortedPersonas?.[0];
            if (!top) return '—';
            return `${top.name} ${top.percentage}%`;
        },
        buildHint: () => 'Wie zit er in dit team',
        detailTitle: 'Wie zit er in dit team',
        detailLead: () => '',
        render: (aggregate) => <TeamPersonaDistribution aggregate={aggregate} />,
    },
    {
        id: 'workplace',
        eyebrow: 'Werkplek',
        buildValue: (aggregate) => {
            const top = aggregate?.sortedWorkplaceNeeds?.[0];
            if (!top) return '—';
            return top.label;
        },
        buildHint: () => 'Wat vraagt dit team',
        detailTitle: 'Wat vraagt dit team van de werkplek',
        detailLead: () => '',
        render: (aggregate) => <TeamWorkplaceNeeds aggregate={aggregate} />,
    },
    {
        id: 'tension',
        eyebrow: 'Spanning',
        buildValue: (aggregate, insights) => {
            const t = insights?.workplaceTension || { underserved: [], oversupplied: [] };
            const under = t.underserved?.length || 0;
            const over = t.oversupplied?.length || 0;
            if (under === 0 && over === 0) return 'Consistent';
            if (under > 0 && over > 0) return `${under} + ${over}`;
            if (under > 0) return `${under} onderbediend`;
            return `${over} teveel`;
        },
        buildHint: () => 'Waar het kan botsen',
        detailTitle: 'Waar behoefte en aanbod kunnen botsen',
        detailLead: (aggregate, insights) => {
            const t = insights?.workplaceTension || { underserved: [], oversupplied: [] };
            const under = t.underserved?.length || 0;
            const over = t.oversupplied?.length || 0;
            if (under === 0 && over === 0) return 'De werkplekbehoefte is consistent — weinig botsing.';
            if (under > 0 && over > 0) return `${under} werkplek${under > 1 ? 'ken' : ''} onderbediend, ${over} mogelijk te veel aanwezig.`;
            if (under > 0) return `${under} werkplek${under > 1 ? 'ken' : ''} waar dit team extra op leunt.`;
            return `${over} werkplek${over > 1 ? 'ken' : ''} waar dit team weinig aan heeft.`;
        },
        render: (aggregate, insights) => <TeamWorkplaceTension insights={insights} />,
    },
    {
        id: 'quickwins',
        eyebrow: 'Quick wins',
        buildValue: (aggregate, insights) => {
            const count = (insights?.quickWins || []).length;
            return `${count} acties`;
        },
        buildHint: () => 'Voor morgen',
        detailTitle: 'Acties voor morgen',
        detailLead: () => 'Concrete acties afgeleid uit alle inzichten van dit dashboard.',
        render: (aggregate, insights) => <TeamQuickWins insights={insights} />,
    },
];

// =========================
// MAIN COMPONENT
// =========================

export default function TeamDashboard({
    teamResponses = [],
    selectedTeam,
    setPage,
}) {
    const [activeId, setActiveId] = useState(null);

    const aggregate = useMemo(
        () => buildTeamAggregate(teamResponses),
        [teamResponses]
    );
    const insights = useMemo(() => buildTeamInsights(aggregate), [aggregate]);

    const teamName = resolveTeamName(selectedTeam);
    const organization = resolveOrg(selectedTeam);
    const dominantPersona = aggregate?.sortedPersonas?.[0]?.name || '';
    const teamCount = aggregate?.teamCount || 0;
    const reliability = buildReliabilityLabel(teamCount);

    const team = resolveTeamKey(selectedTeam);
    const hasDynamicsAccess = hasTeamLevel(team, organization, LEVEL_DYNAMICS);

    const activeTile = TILES.find((t) => t.id === activeId);

    function handleTileClick(id) {
        setActiveId((prev) => (prev === id ? null : id));
    }

    return (
        <PageShell compact>
            {/* ── HERO ── */}
            <HeroBlock
                compact
                eyebrow="01 — Team Insight"
                title="Teaminzicht voor"
                titleAccent={teamName}
                titleAccentColor={ACCENT}
                lead="Wat werkstijlen zijn, wat het team van de werkplek vraagt en waar de eerste kansen liggen."
                actions={
                    <>
                        <PrimaryButton
                            onClick={() => generateTeamInsightPDF({
                                aggregate,
                                insights,
                                teamName,
                                organization,
                            })}
                            style={{ background: ACCENT }}
                        >
                            Download als PDF
                        </PrimaryButton>
                        {isAdminAccess() ? (
                            <SecondaryButton onClick={() => setPage('team')}>
                                Ander team
                            </SecondaryButton>
                        ) : null}
                    </>
                }
            />

            {/* ── SIGNATURE + META gecombineerd ── */}
            <SignatureBlock
                quote={insights?.headline}
                accent={ACCENT}
                teamCount={teamCount}
                organization={organization}
                dominantPersona={dominantPersona}
                reliability={reliability}
            />

            {/* ── TILE GRID ── vier compacte tegels ── */}
            <TileGrid columns={4}>
                {TILES.map((tile) => (
                    <Tile
                        key={tile.id}
                        eyebrow={tile.eyebrow}
                        value={tile.buildValue(aggregate, insights)}
                        hint={tile.buildHint(aggregate, insights)}
                        accent={ACCENT}
                        isActive={activeId === tile.id}
                        onClick={() => handleTileClick(tile.id)}
                    />
                ))}
            </TileGrid>

            {/* ── DETAIL PANEL ── opent onder de tegels ── */}
            {activeTile ? (
                <SectionCard accent={ACCENT} padding={0}>
                    <div
                        style={{
                            padding: '22px 22px 8px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            gap: SPACING.md,
                        }}
                    >
                        <div style={{ display: 'grid', gap: SPACING.sm, flex: 1 }}>
                            <SectionEyebrow color={ACCENT}>
                                {activeTile.eyebrow}
                            </SectionEyebrow>
                            <h2
                                style={{
                                    ...TYPE.heading,
                                    fontSize: 24,
                                }}
                            >
                                {activeTile.detailTitle}
                            </h2>
                            {activeTile.detailLead(aggregate, insights) ? (
                                <p
                                    style={{
                                        ...TYPE.body,
                                        maxWidth: 620,
                                    }}
                                >
                                    {activeTile.detailLead(aggregate, insights)}
                                </p>
                            ) : null}
                        </div>

                        <button
                            type="button"
                            onClick={() => setActiveId(null)}
                            style={{
                                background: 'transparent',
                                border: '1px solid var(--tof-border)',
                                borderRadius: RADIUS.pill,
                                padding: '4px 12px',
                                fontSize: 12,
                                color: 'var(--tof-text-muted)',
                                cursor: 'pointer',
                                fontFamily: 'var(--tof-font-body)',
                                fontWeight: 500,
                                flexShrink: 0,
                            }}
                        >
                            Sluiten ✕
                        </button>
                    </div>

                    <div style={{ padding: '0 22px 22px' }}>
                        {activeTile.render(aggregate, insights)}
                    </div>
                </SectionCard>
            ) : null}

            {/* ── CROSS-LINK NAAR MODULE 2 ── */}
            <DynamicsBridge
                hasDynamicsAccess={hasDynamicsAccess}
                setPage={setPage}
            />
        </PageShell>
    );
}

// =========================
// SIGNATURE BLOCK
// =========================
// Combineert meta-chips + signature-zin in één compacter blok

function SignatureBlock({ quote, accent, teamCount, organization, dominantPersona, reliability }) {
    return (
        <div
            style={{
                borderLeft: `3px solid ${accent}`,
                paddingLeft: SPACING.lg,
                display: 'grid',
                gap: SPACING.sm + 2,
            }}
        >
            {quote ? (
                <p
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 'clamp(16px, 2vw, 20px)',
                        fontStyle: 'italic',
                        lineHeight: 1.4,
                        color: 'var(--tof-text)',
                    }}
                >
                    {quote}
                </p>
            ) : null}

            <div style={{ display: 'flex', gap: SPACING.sm, flexWrap: 'wrap' }}>
                <MetaChip label="Responses" value={teamCount} />
                {organization ? <MetaChip label="Organisatie" value={organization} /> : null}
                {dominantPersona ? <MetaChip label="Dominant" value={dominantPersona} accent={accent} /> : null}
                {reliability ? <MetaChip label="Betrouwbaarheid" value={reliability} /> : null}
            </div>
        </div>
    );
}

function MetaChip({ label, value, accent = 'var(--tof-text-muted)' }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderRadius: RADIUS.pill,
                padding: '4px 12px',
                fontSize: 11,
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: RADIUS.pill,
                    background: accent,
                    flexShrink: 0,
                }}
            />
            <span
                style={{
                    color: 'var(--tof-text-muted)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: 0.6,
                    fontSize: 10,
                }}
            >
                {label}
            </span>
            <span style={{ color: 'var(--tof-text)', fontWeight: 600 }}>{value}</span>
        </div>
    );
}

// =========================
// DYNAMICS BRIDGE
// =========================

function DynamicsBridge({ hasDynamicsAccess, setPage }) {
    if (hasDynamicsAccess) {
        return (
            <InteractiveRow
                accent="var(--tof-accent-rose)"
                style={{ justifyContent: 'space-between' }}
            >
                <div style={{ display: 'grid', gap: 2, minWidth: 240 }}>
                    <SectionEyebrow color="var(--tof-accent-rose)">
                        Team Dynamics beschikbaar
                    </SectionEyebrow>
                    <p style={{ ...TYPE.body, fontSize: 14 }}>
                        Zie de onderliggende patronen: waarom deze samenstelling werkt of schuurt.
                    </p>
                </div>
                <PrimaryButton
                    onClick={() => setPage('teamdynamics')}
                    style={{ background: 'var(--tof-accent-rose)' }}
                >
                    Naar Team Dynamics →
                </PrimaryButton>
            </InteractiveRow>
        );
    }

    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #FDF6F6 0%, #F7F0ED 100%)',
                border: '1px solid rgba(176,82,82,0.14)',
                borderRadius: RADIUS.lg,
                padding: '18px 20px',
                display: 'grid',
                gap: SPACING.md,
            }}
        >
            <SectionEyebrow color="var(--tof-accent-rose)">
                Dieper kijken?
            </SectionEyebrow>

            <h3
                style={{
                    ...TYPE.subhead,
                    color: 'var(--tof-text)',
                }}
            >
                Team Dynamics laat zien{' '}
                <em style={{ color: 'var(--tof-accent-rose)' }}>waarom</em>{' '}
                deze patronen ontstaan.
            </h3>

            <p style={{ ...TYPE.body, maxWidth: 620 }}>
                Spanningsvelden tussen werkstijlen, leiderschapsimplicaties en
                de keuze tussen tempo en reflectie — in één verdiept dashboard,
                toegelicht in een sessie.
            </p>

            <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                <PrimaryButton
                    onClick={() => setPage('team')}
                    style={{ background: 'var(--tof-accent-rose)' }}
                >
                    Dynamics ontgrendelen
                </PrimaryButton>
                <SecondaryButton
                    onClick={() =>
                        window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')
                    }
                >
                    Plan een gesprek
                </SecondaryButton>
            </div>
        </div>
    );
}

// =========================
// HELPERS
// =========================

function resolveTeamName(sel) {
    if (!sel) return 'jouw team';
    if (typeof sel === 'string') return sel;
    return sel.name || sel.team || 'jouw team';
}

function resolveTeamKey(sel) {
    if (!sel) return '';
    if (typeof sel === 'string') return sel;
    return sel.team || '';
}

function resolveOrg(sel) {
    if (!sel || typeof sel === 'string') return '';
    return sel.organization || '';
}

function buildReliabilityLabel(count) {
    if (count === null || count === undefined) return '';
    if (count < 3) return 'Indicatief';
    if (count < 6) return 'Groeiend';
    return 'Sterk beeld';
}
