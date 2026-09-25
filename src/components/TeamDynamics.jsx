/**
 * TeamDynamics — Module 2: Team Dynamics Sessie
 *
 * Familie-taal afgestemd op TeamDashboard (Module 1):
 *   - HeroBlock direct op canvas (rose accent)
 *   - SignatureBlock met meta-chips
 *   - TileGrid: vier compacte tegels uit AppShell
 *   - SectionCard daaronder: één detail-blok opent onder de tegels
 *
 * Tegelvolgorde — van breed naar concreet naar actie:
 *   1. Dynamiek      (drie fundamentele assen)
 *   2. Samenwerking  (per werkstijl, dominante persona uitgelicht)
 *   3. Spanningen    (klikbare lijst, één open)
 *   4. Leiderschap   (synthese uit alle drie + blinde vlek)
 */

import React, { useMemo, useState } from 'react';
import {
    PageShell,
    HeroBlock,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    SectionEyebrow,
    TileGrid,
    Tile,
} from '../ui/AppShell';
import { SPACING, TYPE, RADIUS, MODULE } from '../ui/tokens';

import { useArchetypes } from '../i18n/archetypes';
import { useCopy, useLang } from '../i18n/LanguageContext';
import { getCopy } from '../i18n/copy';
import { hasTeamLevel, LEVEL_DYNAMICS, isAdminAccess } from '../utils/access';
import {
    getDynamics,
    getMaturity,
    getSignatureLine,
} from '../insights';
import { generateTeamDynamicsPDF } from '../utils/teamDynamicsPDF';
import { logPdfDownload } from '../supabase';
import { PERSONA_COLORS, getArchetype, resolveTeamName, resolveTeamKey, resolveOrg, buildPersonaScores, findActiveTensions, buildDynamicsAxes, findMissingCritical, buildLeadershipActions, getReliability, collectPersonaPeople, findMentionedPersona, formatPeople, describeAxis } from './teamDynamicsLogic';

const ACCENT = MODULE.dynamics.accent;
// =========================
// MAIN COMPONENT
// =========================

export default function TeamDynamics({
    teamResponses = [],
    selectedTeam,
    setPage,
    // Wanneer true: render alleen de tegels + detail-paneel (geen
    // PageShell, geen Hero, geen Signature). Gebruikt door
    // AdminOrganizations om Dynamics geaggregeerd binnen het organisatie-
    // detail te tonen zonder dubbele page chrome.
    embedded = false,
    // Wanneer true: skip de hasTeamLevel-check. Bedoeld voor admin-vlakke
    // weergaven zoals het organisatie-inzicht.
    forceAccess = false,
}) {
    // Standaard staat de eerste tegel (Dynamics) open — zo zien
    // gebruikers meteen dat de tegels uitklapbare detail-panelen zijn.
    const [activeId, setActiveId] = useState('dynamics');
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();
    const ARCHETYPES = useArchetypes();

    const teamName = resolveTeamName(selectedTeam, lang);
    const organization = resolveOrg(selectedTeam);
    const team = resolveTeamKey(selectedTeam);

    const hasAccess = useMemo(
        () => forceAccess || hasTeamLevel(team, organization, LEVEL_DYNAMICS),
        [forceAccess, team, organization]
    );

    const scores = useMemo(() => buildPersonaScores(teamResponses), [teamResponses]);
    const sorted = useMemo(
        () => Object.entries(scores).sort((a, b) => b[1] - a[1]),
        [scores]
    );
    const totalScore = useMemo(
        () => Object.values(scores).reduce((a, b) => a + b, 0),
        [scores]
    );
    const tensions = useMemo(() => findActiveTensions(sorted, lang), [sorted, lang]);
    const dynamicsAxes = useMemo(() => buildDynamicsAxes(sorted, totalScore, lang), [sorted, totalScore, lang]);
    const missingCritical = useMemo(() => findMissingCritical(sorted, lang), [sorted, lang]);
    const leadershipActions = useMemo(() => buildLeadershipActions(sorted, lang), [sorted, lang]);

    // Leadership-wins (de 6 acties) voor zowel het paneel als de PDF.
    const leadershipWins = useMemo(
        () => buildLeadershipSynthesis({
            leadershipActions,
            tensions,
            missingCritical,
            dynamicsAxes,
        }, lang),
        [leadershipActions, tensions, missingCritical, dynamicsAxes, lang]
    );

    // PDF-aggregate: minimal subset wat teamDynamicsPDF nodig heeft.
    const pdfAggregate = useMemo(() => ({
        teamCount: teamResponses.length,
        totalScores: scores,
        totalEnergy: totalScore,
    }), [teamResponses.length, scores, totalScore]);

    const topPersonaId = sorted[0]?.[0] || null;
    const topPersona = topPersonaId ? getArchetype(topPersonaId, lang) : null;
    const reliability = getReliability(teamResponses.length, lang);

    const signatureLine = useMemo(() => {
        if (!teamResponses.length) return null;
        try {
            const idx = {};
            ARCHETYPES.forEach((a, i) => { idx[a.id] = i; });
            const pcts = Array(8).fill(0);
            sorted.forEach(([id, value]) => {
                const i = idx[id];
                if (i !== undefined && totalScore > 0) pcts[i] = Math.round((value / totalScore) * 100);
            });
            const srt = pcts.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c);
            const dom = srt.filter(x => x.c > 0).slice(0, 3).map(x => ARCHETYPES[x.i]);
            const missing = srt.filter(x => x.c === 0).map(x => ARCHETYPES[x.i]);
            const mat = getMaturity(pcts, srt, lang);
            const dyn = getDynamics(pcts, lang);
            return getSignatureLine(dom, missing, mat, dyn, lang);
        } catch {
            return null;
        }
    }, [sorted, totalScore, teamResponses.length, ARCHETYPES, lang]);

    // ── GEEN TOEGANG ─────────────────────────────────────────
    if (!hasAccess) {
        return (
            <PageShell>
                <HeroBlock
                    eyebrow={t.hero.eyebrow}
                    title={t.noAccess.title}
                    titleAccent={t.noAccess.titleAccent}
                    titleAccentColor={ACCENT}
                    lead={t.noAccess.lead}
                    actions={
                        <PrimaryButton onClick={() => setPage('team')}>
                            {t.noAccess.cta}
                        </PrimaryButton>
                    }
                />
            </PageShell>
        );
    }

    // ── GEEN DATA ────────────────────────────────────────────
    if (!teamResponses || teamResponses.length === 0) {
        if (embedded) {
            return (
                <div style={{
                    padding: 32,
                    textAlign: 'center',
                    color: 'var(--tof-text-muted)',
                    background: 'var(--tof-surface)',
                    border: '1px solid var(--tof-border)',
                    borderRadius: 14,
                }}>
                    {t.noData.embedded}
                </div>
            );
        }
        return (
            <PageShell>
                <HeroBlock
                    eyebrow={t.hero.eyebrow}
                    title={t.noData.title}
                    titleAccent={teamName}
                    titleAccentColor={ACCENT}
                    lead={t.noData.lead}
                    actions={
                        <PrimaryButton
                            onClick={() => setPage('teamdashboard')}
                            style={{ background: 'var(--tof-accent-sage)' }}
                        >
                            {t.noData.cta}
                        </PrimaryButton>
                    }
                />
            </PageShell>
        );
    }

    // ── TEGELS ───────────────────────────────────────────────
    const TILES = [
        {
            id: 'dynamics',
            eyebrow: t.tiles.dynamics.eyebrow,
            value: t.tiles.dynamics.value,
            hint: t.tiles.dynamics.hint,
            detailTitle: t.tiles.dynamics.detailTitle,
            detailLead: t.tiles.dynamics.detailLead,
            render: () => (
                <DynamicsPanel
                    dynamicsAxes={dynamicsAxes}
                    missingCritical={missingCritical}
                />
            ),
        },
        {
            id: 'collaboration',
            eyebrow: t.tiles.collaboration.eyebrow,
            value: topPersona?.name || t.tiles.collaboration.value,
            hint: t.tiles.collaboration.hint,
            detailTitle: t.tiles.collaboration.detailTitle,
            detailLead: '',
            render: () => (
                <CollaborationPanel
                    sorted={sorted}
                    totalScore={totalScore}
                    teamResponses={teamResponses}
                />
            ),
        },
        {
            id: 'tensions',
            eyebrow: t.tiles.tensions.eyebrow,
            value: tensions.length === 0
                ? t.tiles.tensions.valueNone
                : t.tiles.tensions.value(tensions.length),
            hint: t.tiles.tensions.hint,
            detailTitle: t.tiles.tensions.detailTitle,
            detailLead: tensions.length === 0
                ? t.tiles.tensions.detailLeadNone
                : t.tiles.tensions.detailLead,
            render: () => (
                <TensionsPanel
                    tensions={tensions}
                    scores={scores}
                    totalScore={totalScore}
                />
            ),
        },
        {
            id: 'leadership',
            eyebrow: t.tiles.leadership.eyebrow,
            value: t.tiles.leadership.value,
            hint: t.tiles.leadership.hint,
            detailTitle: t.tiles.leadership.detailTitle,
            detailLead: t.tiles.leadership.detailLead,
            render: () => (
                <LeadershipPanel
                    leadershipActions={leadershipActions}
                    tensions={tensions}
                    missingCritical={missingCritical}
                    dynamicsAxes={dynamicsAxes}
                />
            ),
        },
    ];

    const activeTile = TILES.find((tile) => tile.id === activeId);

    function handleTileClick(id) {
        setActiveId((prev) => (prev === id ? null : id));
    }

    // ── DASHBOARD ────────────────────────────────────────────
    const tilesAndDetail = (
        <>
            {/* TILES */}
            <TileGrid columns={4}>
                {TILES.map((tile) => (
                    <Tile
                        key={tile.id}
                        eyebrow={tile.eyebrow}
                        value={tile.value}
                        hint={tile.hint}
                        accent={ACCENT}
                        isActive={activeId === tile.id}
                        onClick={() => handleTileClick(tile.id)}
                    />
                ))}
            </TileGrid>

            {/* DETAIL */}
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
                            <h2 style={{ ...TYPE.heading, fontSize: 24 }}>
                                {activeTile.detailTitle}
                            </h2>
                            {activeTile.detailLead ? (
                                <p style={{ ...TYPE.body, maxWidth: 620 }}>
                                    {activeTile.detailLead}
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
                            {t.close}
                        </button>
                    </div>

                    <div style={{ padding: '0 22px 22px' }}>
                        {activeTile.render()}
                    </div>
                </SectionCard>
            ) : null}
        </>
    );

    if (embedded) {
        return tilesAndDetail;
    }

    return (
        <PageShell compact>
            {/* HERO */}
            <HeroBlock
                compact
                eyebrow={t.hero.eyebrow}
                title={t.hero.title}
                titleAccent={teamName}
                titleAccentColor={ACCENT}
                lead={t.hero.lead}
                actions={
                    <>
                        <PrimaryButton
                            onClick={() => {
                                generateTeamDynamicsPDF({
                                    aggregate: pdfAggregate,
                                    dynamicsAxes,
                                    tensions,
                                    leadershipWins,
                                    teamName,
                                    organization,
                                    headline: signatureLine || '',
                                    lang,
                                });
                                // Log op de achtergrond — mag stil falen.
                                logPdfDownload(`dynamics-${selectedTeam?.code || ''}`);
                            }}
                            style={{ background: ACCENT }}
                        >
                            {t.hero.downloadPdf}
                        </PrimaryButton>
                        <SecondaryButton
                            onClick={() => setPage('teamdashboard')}
                        >
                            {t.hero.backToInsight}
                        </SecondaryButton>
                        {isAdminAccess() ? (
                            <SecondaryButton onClick={() => setPage('team')}>
                                {t.hero.otherTeam}
                            </SecondaryButton>
                        ) : null}
                    </>
                }
            />

            {/* SIGNATURE + META */}
            <SignatureBlock
                quote={signatureLine}
                accent={ACCENT}
                teamCount={teamResponses.length}
                organization={organization}
                dominantPersona={topPersona?.name}
                dominantColor={topPersonaId ? PERSONA_COLORS[topPersonaId] : ACCENT}
                tensionsCount={tensions.length}
                reliability={reliability}
            />

            {tilesAndDetail}
        </PageShell>
    );
}

// =========================
// SIGNATURE BLOCK
// =========================

function SignatureBlock({
    quote,
    accent,
    teamCount,
    organization,
    dominantPersona,
    dominantColor,
    tensionsCount,
    reliability,
}) {
    const { teamDynamics: t } = useCopy();

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
                <MetaChip label={t.chips.responses} value={teamCount} />
                {organization ? <MetaChip label={t.chips.organisation} value={organization} /> : null}
                {dominantPersona ? (
                    <MetaChip label={t.chips.dominant} value={dominantPersona} accent={dominantColor || accent} />
                ) : null}
                {tensionsCount > 0 ? (
                    <MetaChip
                        label={t.chips.tensions}
                        value={t.tiles.tensions.value(tensionsCount)}
                        accent={accent}
                    />
                ) : null}
                {reliability ? <MetaChip label={t.chips.reliability} value={reliability} /> : null}
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
// SHARED LEESBLOK-PRIMITIVES
// =========================

function Divider({ marginY = SPACING.lg }) {
    return (
        <div
            style={{
                height: 1,
                background: 'var(--tof-border)',
                margin: `${marginY}px 0`,
            }}
        />
    );
}

function SubsectionHeading({ eyebrow, lead, color }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.xs }}>
            <SectionEyebrow color={color || 'var(--tof-text-muted)'}>
                {eyebrow}
            </SectionEyebrow>
            {lead ? (
                <p style={{ ...TYPE.body, fontSize: 14, maxWidth: 720 }}>
                    {lead}
                </p>
            ) : null}
        </div>
    );
}

function EmptyLine({ children }) {
    return (
        <p style={{ ...TYPE.body, fontSize: 14, color: 'var(--tof-text-soft)' }}>
            {children}
        </p>
    );
}

// =========================
// PANEL 1: DYNAMIEK
// =========================

function DynamicsPanel({ dynamicsAxes, missingCritical }) {
    const { teamDynamics: t } = useCopy();

    return (
        <div>
            <div style={{ display: 'grid', gap: SPACING.lg }}>
                {dynamicsAxes.map((axis, i) => (
                    <DynamicsAxis key={i} axis={axis} isFirst={i === 0} />
                ))}
            </div>

            {missingCritical.length > 0 ? (
                <>
                    <Divider />
                    <SubsectionHeading
                        eyebrow={t.dynamics.missing.eyebrow}
                        lead={t.dynamics.missing.lead(missingCritical.length)}
                    />
                    <div style={{ display: 'grid', gap: SPACING.md, marginTop: SPACING.md }}>
                        {missingCritical.map(({ id, archetype }) => (
                            <MissingPersonaRow
                                key={id}
                                name={archetype.name}
                                description={archetype.short}
                                color={PERSONA_COLORS[id] || ACCENT}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}

function DynamicsAxis({ axis, isFirst }) {
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();
    const total = axis.lv + axis.rv || 1;
    const lPct = Math.round((axis.lv / total) * 100);
    const rPct = 100 - lPct;
    const imbalance = Math.abs(axis.lv - axis.rv) > 20;
    const description = describeAxis(axis, lang);

    return (
        <div style={{ display: 'grid', gap: SPACING.sm }}>
            {!isFirst ? <Divider marginY={0} /> : null}

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: SPACING.sm,
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 16,
                        color: 'var(--tof-text)',
                    }}
                >
                    {axis.label}
                </span>
                {imbalance ? (
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: ACCENT,
                            textTransform: 'uppercase',
                            letterSpacing: 1.2,
                        }}
                    >
                        {t.dynamics.imbalance}
                    </span>
                ) : null}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm + 2 }}>
                <span
                    style={{
                        fontSize: 12,
                        color: 'var(--tof-text-muted)',
                        minWidth: 72,
                        textAlign: 'right',
                    }}
                >
                    {axis.left}
                </span>
                <div
                    style={{
                        flex: 1,
                        height: 6,
                        background: 'var(--tof-border)',
                        borderRadius: RADIUS.pill,
                        overflow: 'hidden',
                        display: 'flex',
                    }}
                >
                    <div style={{ width: `${lPct}%`, height: '100%', background: 'var(--tof-accent-rose)' }} />
                    <div style={{ width: `${rPct}%`, height: '100%', background: 'var(--tof-accent-sage)' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)', minWidth: 72 }}>
                    {axis.right}
                </span>
            </div>

            <p
                style={{
                    ...TYPE.body,
                    fontSize: 13,
                    paddingLeft: 80,
                    paddingRight: 8,
                }}
            >
                {description}
            </p>
        </div>
    );
}

function MissingPersonaRow({ name, description, color }) {
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(140px, max-content) 1fr',
                columnGap: SPACING.lg,
                alignItems: 'baseline',
                borderLeft: `3px solid ${color}`,
                paddingLeft: SPACING.md,
            }}
        >
            <span
                style={{
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 17,
                    color: 'var(--tof-text)',
                }}
            >
                {name}
            </span>
            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                {description}
            </p>
        </div>
    );
}

// =========================
// PANEL 2: SAMENWERKING
// =========================

function CollaborationPanel({ sorted, totalScore, teamResponses }) {
    const ARCHETYPES = useArchetypes();
    const { teamDynamics: t } = useCopy();
    const presentMap = {};
    sorted.forEach(([id, value]) => {
        if (value > 0) {
            const people = collectPersonaPeople(teamResponses, id);
            presentMap[id] = {
                percentage: totalScore > 0 ? Math.round((value / totalScore) * 100) : 0,
                names: people.names,
                anonymousCount: people.anonymousCount,
            };
        }
    });

    const presentIds = Object.keys(presentMap);
    const presentArchetypes = ARCHETYPES.filter((a) => presentIds.includes(a.id));
    const missingArchetypes = ARCHETYPES.filter((a) => !presentIds.includes(a.id));

    if (presentArchetypes.length === 0) {
        return (
            <EmptyLine>{t.collaboration.empty}</EmptyLine>
        );
    }

    const sortedPresent = [...presentArchetypes].sort(
        (a, b) => (presentMap[b.id]?.percentage || 0) - (presentMap[a.id]?.percentage || 0)
    );

    const dominant = sortedPresent[0];
    const rest = sortedPresent.slice(1);

    return (
        <div>
            <DominantCollaborationBlock
                archetype={dominant}
                data={presentMap[dominant.id]}
                presentMap={presentMap}
            />

            {rest.length > 0 ? (
                <>
                    <Divider marginY={SPACING.xl} />
                    <SubsectionHeading
                        eyebrow={t.collaboration.rest.eyebrow}
                        lead={t.collaboration.rest.lead}
                    />
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
                            gap: SPACING.xl,
                            marginTop: SPACING.lg,
                        }}
                    >
                        {rest.map((arch) => (
                            <CompactCollaborationRow
                                key={arch.id}
                                archetype={arch}
                                data={presentMap[arch.id]}
                                presentMap={presentMap}
                            />
                        ))}
                    </div>
                </>
            ) : null}

            {missingArchetypes.length > 0 ? (
                <>
                    <Divider />
                    <SubsectionHeading
                        eyebrow={t.collaboration.missing.eyebrow}
                        lead={t.collaboration.missing.lead(missingArchetypes.length)}
                    />
                    <div
                        style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: SPACING.sm,
                            marginTop: SPACING.md,
                        }}
                    >
                        {missingArchetypes.map((arch) => (
                            <MissingPill
                                key={arch.id}
                                name={arch.name}
                                color={PERSONA_COLORS[arch.id] || ACCENT}
                            />
                        ))}
                    </div>
                </>
            ) : null}
        </div>
    );
}

function DominantCollaborationBlock({ archetype, data, presentMap }) {
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();
    const color = PERSONA_COLORS[archetype.id];
    const ct = archetype.ct || [];
    const positiveText = ct[0] || null;
    const tensionText = ct[1] || null;
    const generalText = ct[2] || null;

    const positiveMatch = positiveText ? findMentionedPersona(positiveText, presentMap, lang) : null;
    const tensionMatch = tensionText ? findMentionedPersona(tensionText, presentMap, lang) : null;

    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <SectionEyebrow color="var(--tof-text-muted)">
                {t.collaboration.dominantEyebrow(data.percentage)}
            </SectionEyebrow>

            <h3
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 'clamp(36px, 5vw, 56px)',
                    lineHeight: 1.05,
                    color,
                }}
            >
                {archetype.name}
            </h3>

            {(data.names.length > 0 || data.anonymousCount > 0) ? (
                <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                    {t.collaboration.carriedBy}{' '}
                    <strong style={{ color: 'var(--tof-text)' }}>
                        {formatPeople(data.names, data.anonymousCount, lang)}
                    </strong>
                </p>
            ) : null}

            {generalText ? (
                <p style={{ ...TYPE.body, fontSize: 15, maxWidth: 720, margin: 0 }}>
                    {generalText}
                </p>
            ) : null}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(140px, max-content) 1fr',
                    columnGap: SPACING.lg,
                    rowGap: SPACING.lg,
                    marginTop: SPACING.sm,
                }}
            >
                {positiveMatch ? (
                    <>
                        <SectionEyebrow color="var(--tof-accent-sage)">{t.collaboration.worksWell}</SectionEyebrow>
                        <div style={{ display: 'grid', gap: SPACING.xs }}>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                                {positiveText}
                                {(positiveMatch.names.length > 0 || positiveMatch.anonymousCount > 0) ? (
                                    <span style={{ color: 'var(--tof-text-muted)' }}>
                                        {' '}— {formatPeople(positiveMatch.names, positiveMatch.anonymousCount, lang)}
                                    </span>
                                ) : null}
                            </p>
                            <p style={{ ...TYPE.body, fontSize: 13, margin: 0, color: 'var(--tof-text-soft)' }}>
                                {capitalize(buildSynergyReason(archetype.id, positiveMatch.id, lang))}.
                            </p>
                        </div>
                    </>
                ) : null}

                {tensionMatch ? (
                    <>
                        <SectionEyebrow color="var(--tof-accent-rose)">{t.collaboration.attentionFor}</SectionEyebrow>
                        <div style={{ display: 'grid', gap: SPACING.xs }}>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                                {tensionText}
                                {(tensionMatch.names.length > 0 || tensionMatch.anonymousCount > 0) ? (
                                    <span style={{ color: 'var(--tof-text-muted)' }}>
                                        {' '}— {formatPeople(tensionMatch.names, tensionMatch.anonymousCount, lang)}
                                    </span>
                                ) : null}
                            </p>
                            <p style={{ ...TYPE.body, fontSize: 13, margin: 0, color: 'var(--tof-text-soft)' }}>
                                {capitalize(buildAttentionReason(archetype.id, tensionMatch.id, lang))}.
                            </p>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

function CompactCollaborationRow({ archetype, data, presentMap }) {
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();
    const color = PERSONA_COLORS[archetype.id];
    const ct = archetype.ct || [];
    const positiveText = ct[0] || null;
    const tensionText = ct[1] || null;

    const positiveMatch = positiveText ? findMentionedPersona(positiveText, presentMap, lang) : null;
    const tensionMatch = tensionText ? findMentionedPersona(tensionText, presentMap, lang) : null;

    return (
        <div
            style={{
                borderLeft: `3px solid ${color}`,
                paddingLeft: SPACING.lg,
                display: 'grid',
                gap: SPACING.md,
            }}
        >
            {/* PERSONA-KOP */}
            <div style={{ display: 'grid', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: SPACING.sm, flexWrap: 'wrap' }}>
                    <span
                        style={{
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 22,
                            color: 'var(--tof-text)',
                            lineHeight: 1.1,
                        }}
                    >
                        {archetype.name}
                    </span>
                    <span style={{ fontSize: 13, color: 'var(--tof-text-muted)', fontWeight: 500 }}>
                        {data.percentage}%
                    </span>
                </div>
                {(data.names.length > 0 || data.anonymousCount > 0) ? (
                    <span style={{ fontSize: 13, color: 'var(--tof-text-soft)' }}>
                        {formatPeople(data.names, data.anonymousCount, lang)}
                    </span>
                ) : null}
            </div>

            {/* STERK MET — label boven, uitleg eronder */}
            {positiveMatch ? (
                <div style={{ display: 'grid', gap: 4 }}>
                    <div
                        style={{
                            ...TYPE.eyebrow,
                            color: 'var(--tof-accent-sage)',
                            fontSize: 10,
                        }}
                    >
                        {t.collaboration.strongWith(positiveMatch.name.toLowerCase())}
                        {(positiveMatch.names.length > 0 || positiveMatch.anonymousCount > 0) ? (
                            <span style={{ color: 'var(--tof-text-muted)', fontWeight: 500, letterSpacing: 0 }}>
                                {' · '}{formatPeople(positiveMatch.names, positiveMatch.anonymousCount, lang)}
                            </span>
                        ) : null}
                    </div>
                    <p style={{ ...TYPE.body, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                        {capitalize(buildSynergyReason(archetype.id, positiveMatch.id, lang))}.
                    </p>
                </div>
            ) : null}

            {/* AANDACHT MET — label boven, uitleg eronder */}
            {tensionMatch ? (
                <div style={{ display: 'grid', gap: 4 }}>
                    <div
                        style={{
                            ...TYPE.eyebrow,
                            color: ACCENT,
                            fontSize: 10,
                        }}
                    >
                        {t.collaboration.attentionWith(tensionMatch.name.toLowerCase())}
                    </div>
                    <p style={{ ...TYPE.body, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                        {capitalize(buildAttentionReason(archetype.id, tensionMatch.id, lang))}.
                    </p>
                </div>
            ) : null}
        </div>
    );
}

// =========================
// SAMENWERKING — uitgeschreven redenen per persona-paar
// =========================
// Per (persona × match-persona) combinatie een uitleg-zin, opgezocht in
// copy.collaboration.synergy / .attention met de sleutel `persona:match`.
// Fallback: generieke zin.

function buildSynergyReason(personaId, matchId, lang = 'nl') {
    const reasons = getCopy(lang).teamDynamics.collaboration.synergy;
    return reasons[`${personaId}:${matchId}`] || reasons.fallback;
}

function buildAttentionReason(personaId, matchId, lang = 'nl') {
    const reasons = getCopy(lang).teamDynamics.collaboration.attention;
    return reasons[`${personaId}:${matchId}`] || reasons.fallback;
}

function MissingPill({ name, color }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: RADIUS.pill,
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                fontSize: 12,
                color: 'var(--tof-text-soft)',
            }}
        >
            <span
                style={{
                    width: 6,
                    height: 6,
                    borderRadius: RADIUS.pill,
                    background: color,
                    flexShrink: 0,
                }}
            />
            {name}
        </span>
    );
}

// =========================
// PANEL 3: SPANNINGEN (KLIKBAAR)
// =========================

function TensionsPanel({ tensions, scores, totalScore }) {
    const [openIndex, setOpenIndex] = useState(0);
    const { teamDynamics: t } = useCopy();

    if (tensions.length === 0) {
        return <EmptyLine>{t.tensions.empty}</EmptyLine>;
    }

    return (
        <div style={{ display: 'grid', gap: 0 }}>
            {tensions.map((tension, i) => (
                <TensionRow
                    key={i}
                    tension={tension}
                    scores={scores}
                    totalScore={totalScore}
                    isOpen={openIndex === i}
                    isFirst={i === 0}
                    onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
                />
            ))}
        </div>
    );
}

function TensionRow({ tension, scores, totalScore, isOpen, isFirst, onToggle }) {
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();
    const pctA = totalScore > 0 ? Math.round(((scores[tension.a] || 0) / totalScore) * 100) : 0;
    const pctB = totalScore > 0 ? Math.round(((scores[tension.b] || 0) / totalScore) * 100) : 0;
    const archA = getArchetype(tension.a, lang);
    const archB = getArchetype(tension.b, lang);

    return (
        <>
            {!isFirst ? <Divider marginY={0} /> : null}

            <button
                type="button"
                onClick={onToggle}
                style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: `${SPACING.md}px 0`,
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontFamily: 'var(--tof-font-body)',
                    display: 'grid',
                    gap: SPACING.sm,
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: SPACING.md,
                    }}
                >
                    <div style={{ display: 'grid', gap: SPACING.xs, flex: 1 }}>
                        <h3
                            style={{
                                margin: 0,
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 'clamp(18px, 2vw, 22px)',
                                lineHeight: 1.2,
                                fontWeight: 500,
                                color: ACCENT,
                            }}
                        >
                            {tension.label}
                        </h3>

                        <div style={{ display: 'flex', gap: SPACING.sm, flexWrap: 'wrap', alignItems: 'center' }}>
                            <PersonaPill name={archA?.name || tension.a} pct={pctA} color={PERSONA_COLORS[tension.a]} />
                            <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>{t.tensions.and}</span>
                            <PersonaPill name={archB?.name || tension.b} pct={pctB} color={PERSONA_COLORS[tension.b]} />
                        </div>
                    </div>

                    <span
                        style={{
                            fontSize: 14,
                            color: ACCENT,
                            fontWeight: 700,
                            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s ease',
                            flexShrink: 0,
                        }}
                    >
                        ▾
                    </span>
                </div>

                {isOpen ? (
                    <div
                        style={{
                            display: 'grid',
                            gap: SPACING.md,
                            paddingTop: SPACING.sm,
                        }}
                    >
                        <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                            {tension.desc}
                        </p>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: 'minmax(160px, max-content) 1fr',
                                columnGap: SPACING.lg,
                                rowGap: SPACING.sm,
                                alignItems: 'baseline',
                            }}
                        >
                            <SectionEyebrow>{t.tensions.risk}</SectionEyebrow>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>{tension.risk}</p>

                            <SectionEyebrow color={ACCENT}>{t.tensions.advice}</SectionEyebrow>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0, color: 'var(--tof-text)' }}>
                                {tension.leadership}
                            </p>
                        </div>
                    </div>
                ) : null}
            </button>
        </>
    );
}

function PersonaPill({ name, pct, color }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 14,
                color: 'var(--tof-text)',
                fontWeight: 600,
            }}
        >
            <span
                style={{
                    width: 8,
                    height: 8,
                    borderRadius: RADIUS.pill,
                    background: color,
                    flexShrink: 0,
                }}
            />
            {name}
            <span style={{ color: 'var(--tof-text-muted)', fontWeight: 500, fontSize: 13 }}>
                {pct}%
            </span>
        </span>
    );
}

// =========================
// PANEL 4: LEIDERSCHAP
// =========================

function LeadershipPanel({
    leadershipActions,
    tensions,
    missingCritical,
    dynamicsAxes,
}) {
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();

    const wins = buildLeadershipSynthesis({
        leadershipActions,
        tensions,
        missingCritical,
        dynamicsAxes,
    }, lang);

    if (wins.length === 0) {
        return <EmptyLine>{t.leadership.empty}</EmptyLine>;
    }

    return (
        <div style={{ display: 'grid', gap: SPACING.lg }}>
            {wins.map((win, index) => (
                <LeadershipAction
                    key={index}
                    index={index + 1}
                    sourceLabel={t.leadership.sources[win.source] || t.leadership.sources.fallback}
                    text={win.action}
                    isFirst={index === 0}
                />
            ))}
        </div>
    );
}

function buildLeadershipSynthesis({
    leadershipActions,
    tensions,
    missingCritical,
    dynamicsAxes,
}, lang = 'nl') {
    const t = getCopy(lang).teamDynamics.leadership;
    const wins = [];

    const sortedAxes = [...(dynamicsAxes || [])]
        .map((axis, i) => ({ axis, i, gap: Math.abs(axis.lv - axis.rv) }))
        .sort((a, b) => b.gap - a.gap);

    // 1. UIT DYNAMIEK — meest disbalans
    const axis1 = sortedAxes[0];
    if (axis1 && axis1.gap > 0) {
        wins.push({
            source: 'dynamics',
            action: dynamicsActionFor(axis1.axis, lang),
        });
    }

    // 2. UIT SAMENWERKING — top-1 dominante persona
    if (leadershipActions && leadershipActions.length > 0) {
        const top = leadershipActions[0];
        const firstAction = top.items?.[0];
        if (firstAction) {
            wins.push({
                source: 'collaboration',
                action: t.forPersona(top.persona.toLowerCase(), decapitalize(firstAction)),
            });
        }
    }

    // 3. UIT SPANNINGEN
    if (tensions && tensions.length > 0) {
        wins.push({
            source: 'tension',
            action: tensions[0].leadership,
        });
    }

    // 4. UIT DYNAMIEK — tweede in disbalans
    const axis2 = sortedAxes[1];
    if (axis2 && axis2.gap > 0) {
        wins.push({
            source: 'dynamics',
            action: dynamicsActionFor(axis2.axis, lang),
        });
    }

    // 5. UIT SAMENWERKING — top-2 dominante persona
    if (leadershipActions && leadershipActions.length > 1) {
        const second = leadershipActions[1];
        const firstAction = second.items?.[0];
        if (firstAction) {
            wins.push({
                source: 'collaboration',
                action: t.forPersona(second.persona.toLowerCase(), decapitalize(firstAction)),
            });
        }
    }

    // 6. UIT BLINDE VLEK
    if (missingCritical && missingCritical.length > 0) {
        const first = missingCritical[0];
        wins.push({
            source: 'missing',
            action: buildMissingAction(first.archetype, lang),
        });
    }

    if (wins.length < 6) {
        const fallbacks = buildFallbackActions({
            leadershipActions,
            tensions,
            sortedAxes,
            existing: wins,
        }, lang);
        for (const f of fallbacks) {
            if (wins.length >= 6) break;
            wins.push(f);
        }
    }

    return wins.slice(0, 6);
}

function buildFallbackActions({ leadershipActions, tensions, sortedAxes, existing }, lang = 'nl') {
    const t = getCopy(lang).teamDynamics.leadership;
    const out = [];
    const usedActions = new Set(existing.map((w) => w.action));

    if (leadershipActions && leadershipActions.length > 2) {
        const third = leadershipActions[2];
        const firstAction = third.items?.[0];
        if (firstAction) {
            const txt = t.forPersona(third.persona.toLowerCase(), decapitalize(firstAction));
            if (!usedActions.has(txt)) out.push({ source: 'collaboration', action: txt });
        }
    }

    if (tensions && tensions.length > 1) {
        const txt = tensions[1].leadership;
        if (!usedActions.has(txt)) out.push({ source: 'tension', action: txt });
    }

    if (leadershipActions && leadershipActions.length > 0) {
        const top = leadershipActions[0];
        const secondAction = top.items?.[1];
        if (secondAction) {
            const txt = t.forPersona(top.persona.toLowerCase(), decapitalize(secondAction));
            if (!usedActions.has(txt)) out.push({ source: 'collaboration', action: txt });
        }
    }

    if (sortedAxes && sortedAxes.length > 2) {
        const a = sortedAxes[2];
        if (a && a.gap > 0) {
            const txt = dynamicsActionFor(a.axis, lang);
            if (!usedActions.has(txt)) out.push({ source: 'dynamics', action: txt });
        }
    }

    return out;
}

function decapitalize(str) {
    if (!str) return '';
    return str.charAt(0).toLowerCase() + str.slice(1);
}

function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Vertaal een dynamics-as-disbalans naar een uitgeschreven leiderschapsadvies.
 */
function dynamicsActionFor(axis, lang = 'nl') {
    if (!axis) return '';
    const total = axis.lv + axis.rv;
    if (total === 0) return '';

    const dominantSide = axis.lv >= axis.rv ? axis.left : axis.right;
    const recessiveSide = axis.lv >= axis.rv ? axis.right : axis.left;

    return getCopy(lang).teamDynamics.leadership.axisAction(dominantSide, recessiveSide);
}

function buildMissingAction(archetype, lang = 'nl') {
    return getCopy(lang).teamDynamics.leadership.missingAction(archetype.name);
}

function LeadershipAction({ index, sourceLabel, text, isFirst }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.sm }}>
            {!isFirst ? <Divider marginY={0} /> : null}

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto 1fr',
                    columnGap: SPACING.md,
                    alignItems: 'baseline',
                }}
            >
                <span
                    style={{
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 28,
                        lineHeight: 1,
                        color: ACCENT,
                        minWidth: 36,
                    }}
                >
                    {String(index).padStart(2, '0')}
                </span>

                <div style={{ display: 'grid', gap: SPACING.xs }}>
                    <SectionEyebrow color={ACCENT}>{sourceLabel}</SectionEyebrow>
                    <p
                        style={{
                            ...TYPE.body,
                            fontSize: 15,
                            margin: 0,
                            color: 'var(--tof-text)',
                            maxWidth: 760,
                            lineHeight: 1.6,
                        }}
                    >
                        {text}
                    </p>
                </div>
            </div>
        </div>
    );
}
