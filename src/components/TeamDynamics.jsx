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
import { flushSync } from 'react-dom';
import {
    PageShell,
    HeroBlock,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    SectionEyebrow,
    TileGrid,
    Tile,
    keepTileInView,
    DetailPanelHeader,
} from '../ui/AppShell';
import { SPACING, TYPE, RADIUS, MODULE, useIsNarrow } from '../ui/tokens';

import { useArchetypes } from '../i18n/archetypes';
import { useCopy, useLang } from '../i18n/LanguageContext';
import { getCopy } from '../i18n/copy';
import {
    hasTeamLevel,
    LEVEL_DYNAMICS,
    isAdminAccess,
    MIN_TEAM_RESPONSES,
    countCompleteProfiles,
    rememberAfterLogin,
} from '../utils/access';
import TeamGate from './TeamGate';
import ShareNote from './ShareNote';
import { BOOKING_URL } from '../config/contact';
import {
    getConfidence,
    getDynamics,
    getMaturity,
    getSignatureLine,
} from '../insights';
import { logPdfDownload } from '../supabase';
import { buildTeamAggregate, dominantPersonas, dominantNames } from '../utils/TeamAggregation';
import { PERSONA_COLORS, getArchetype, resolveTeamName, resolveTeamKey, resolveOrg, buildPersonaScores, findActiveTensions, buildDynamicsAxes, findMissingCritical, buildLeadershipActions, findMentionedPersona, MISSING_BELOW_PCT, describeAxis } from './teamDynamicsLogic';

const ACCENT = MODULE.dynamics.accent;
// Eén paneel tegelijk; elke tegel wijst ernaar met aria-controls.
const PANEL_ID = 'teamdynamiek-paneel';
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
    const [activeId, setActiveId] = useState('tensions');
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();
    const ARCHETYPES = useArchetypes();
    const isNarrow = useIsNarrow();

    const teamName = resolveTeamName(selectedTeam, lang);
    const organization = resolveOrg(selectedTeam);
    const team = resolveTeamKey(selectedTeam);

    // Bewust geen useMemo: de managerlijst komt na het verversen een tel
    // later binnen (App.js), en dan moet dit opnieuw uitgerekend worden.
    const hasAccess = forceAccess || hasTeamLevel(team, organization, LEVEL_DYNAMICS);

    const scores = useMemo(() => buildPersonaScores(teamResponses), [teamResponses]);

    // Dominant = meeste mensen primair, bij een gelijke stand allemaal
    // (besluit 4, 22 okt 2026) — dezelfde functie als Teaminzicht. De
    // energie-sortering hieronder blijft voor assen, spanningen en aandelen.
    const primaryAggregate = useMemo(
        () => buildTeamAggregate(teamResponses, lang),
        [teamResponses, lang]
    );
    const dominantIds = useMemo(
        () => dominantPersonas(primaryAggregate).map((p) => p.id),
        [primaryAggregate]
    );
    const dominantLabel = dominantNames(primaryAggregate, lang);
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
    // Actie "uit samenwerking" begint bij de dominante werkstijl(en), daarna
    // de energie-volgorde.
    const leadershipOrder = useMemo(
        () => [
            ...sorted.filter(([id]) => dominantIds.includes(id)),
            ...sorted.filter(([id]) => !dominantIds.includes(id)),
        ],
        [sorted, dominantIds]
    );
    const leadershipActions = useMemo(
        () => buildLeadershipActions(leadershipOrder, lang),
        [leadershipOrder, lang]
    );

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

    const topPersonaId = dominantIds[0] || null;
    // Eén schaal op beide dashboards en in de PDF's (besluit 6, 22 okt 2026).
    const reliability = teamResponses.length > 0 ? getConfidence(teamResponses.length, lang).label : '';

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
            // Onder 8% = ontbreekt of is nauwelijks aanwezig (besluit 5).
            const missing = srt.filter(x => x.c < MISSING_BELOW_PCT).map(x => ARCHETYPES[x.i]);
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
                />
                {/* Onder de uitleg, niet ernaast: eerst lezen waarom, dan de knop. */}
                <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap' }}>
                    <PrimaryButton
                        onClick={() => {
                            // Na de inloglink terug naar Teamdynamiek
                            // van dit team (AuthCallback).
                            rememberAfterLogin({ page: 'teamdynamics', team, organization });
                            setPage('login');
                        }}
                        style={{ background: 'var(--tof-accent-sage-text)' }}
                    >
                        {t.noAccess.login}
                    </PrimaryButton>
                    <SecondaryButton onClick={() => setPage('teamdashboard')}>
                        {t.noAccess.cta}
                    </SecondaryButton>
                </div>
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
                            style={{ background: 'var(--tof-accent-sage-text)' }}
                        >
                            {t.noData.cta}
                        </PrimaryButton>
                    }
                />
            </PageShell>
        );
    }

    // ── DREMPEL ──────────────────────────────────────────────
    // Onder vijf ingevulde werkstijlen geen teambeeld: in een kleiner team is
    // een uitslag herleidbaar tot een persoon. Beheerders en het organisatie-
    // overzicht (embedded/forceAccess) mogen door — dat laatste aggregeert
    // over alle teams en is dus geen venster op één klein team.
    const completeProfiles = countCompleteProfiles(teamResponses);
    if (
        completeProfiles < MIN_TEAM_RESPONSES
        && !isAdminAccess()
        && !forceAccess
        && !embedded
    ) {
        return (
            <TeamGate
                count={completeProfiles}
                accent={ACCENT}
                eyebrow={t.hero.eyebrow}
                teamName={selectedTeam?.team || ''}
                code={selectedTeam?.code || ''}
            />
        );
    }

    // ── TEGELS ───────────────────────────────────────────────
    // Spanningen staat vooraan en is bij openen uitgeklapt (besluit 7,
    // 22 okt 2026): de open tegel en het paneel horen bij elkaar.
    const TILES = [
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
            value: dominantLabel || t.tiles.collaboration.value,
            hint: t.tiles.collaboration.hint,
            detailTitle: t.tiles.collaboration.detailTitle,
            detailLead: '',
            render: () => (
                <CollaborationPanel
                    sorted={sorted}
                    totalScore={totalScore}
                    dominantIds={dominantIds}
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

    function handleTileClick(id, event) {
        const opening = activeId !== id;
        setActiveId((prev) => (prev === id ? null : id));
        if (isNarrow) keepTileInView(event.currentTarget, { opening });
    }

    // Na "Sluiten" verdwijnt de knop; zet de focus terug op de tegel die
    // open stond, anders valt hij terug naar het begin van de pagina.
    function closePanel() {
        const tile = document.querySelector(`[aria-controls="${PANEL_ID}"][aria-expanded="true"]`);
        // flushSync: het paneel is weg vóórdat de focus verhuist.
        flushSync(() => setActiveId(null));
        if (tile) tile.focus();
    }

    // ── DASHBOARD ────────────────────────────────────────────
    const detailPanel = activeTile ? (
        <SectionCard id={PANEL_ID} accent={ACCENT} padding={0}>
            <DetailPanelHeader
                eyebrow={activeTile.eyebrow}
                eyebrowColor={ACCENT}
                title={activeTile.detailTitle}
                lead={activeTile.detailLead}
                closeText={t.close}
                closeLabel={t.closeLabel}
                onClose={closePanel}
            />

            <div style={{ padding: '0 22px 22px' }}>
                {activeTile.render()}
            </div>
        </SectionCard>
    ) : null;

    const tilesAndDetail = (
        <>
            {/* TILES — op een telefoon één kolom, met het paneel direct
                onder de getikte tegel */}
            <TileGrid columns={4} stackOnNarrow>
                {TILES.map((tile) => (
                    <React.Fragment key={tile.id}>
                        <Tile
                            eyebrow={tile.eyebrow}
                            value={tile.value}
                            hint={tile.hint}
                            accent={ACCENT}
                            isActive={activeId === tile.id}
                            panelId={PANEL_ID}
                            onClick={(e) => handleTileClick(tile.id, e)}
                        />
                        {isNarrow && activeId === tile.id ? detailPanel : null}
                    </React.Fragment>
                ))}
            </TileGrid>

            {/* DETAIL */}
            {!isNarrow ? detailPanel : null}
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
                            onClick={async () => {
                                // Dynamisch: jsPDF (~0,5 MB) blijft zo uit de
                                // hoofdbundel en laadt pas bij de download.
                                const { generateTeamDynamicsPDF } = await import(
                                    '../utils/teamDynamicsPDF'
                                );
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
                dominantPersona={dominantLabel}
                dominantColor={topPersonaId ? PERSONA_COLORS[topPersonaId] : ACCENT}
                tensionsCount={tensions.length}
                reliability={reliability}
            />

            {tilesAndDetail}

            <ShareBlock t={t} />
        </PageShell>
    );
}

// =========================
// DEELMOMENT 3 — onderaan, alleen voor de leidinggevende
// =========================
// Doorvertellen aan een collega-leidinggevende (het voorbeeldteam, niet dit
// scherm), een tweede eigen team, en los daaronder de sessieregel. Niet in
// de ingebedde weergave van het organisatie-overzicht (die rendert alleen
// tilesAndDetail). Komen de gespreksvragen later, dan komen die erboven.

function ShareBlock({ t }) {
    return (
        <SectionCard accent={ACCENT}>
            <ShareNote
                eyebrow={t.share.eyebrow}
                title={t.share.title}
                text={t.share.lead}
                button={t.share.button}
                copied={t.share.copied}
                copyFailed={t.share.copyFailed}
                getText={() => t.share.text}
                accent={ACCENT}
            />
            <p style={{ ...TYPE.body, margin: 0 }}>{t.share.secondTeam}</p>

            <Divider marginY={0} />

            <div style={{ display: 'grid', gap: SPACING.sm, maxWidth: 680 }}>
                <p style={{ ...TYPE.body, margin: 0 }}>{t.session.lead}</p>
                <p style={{ margin: 0 }}>
                    <a
                        href={BOOKING_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                            color: ACCENT,
                            fontFamily: 'var(--tof-font-body)',
                            fontSize: 14,
                            fontWeight: 600,
                            textDecoration: 'underline',
                            textUnderlineOffset: 3,
                        }}
                    >
                        {t.session.cta}
                    </a>
                </p>
            </div>
        </SectionCard>
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
                <MetaChip
                    label={t.chips.tensions}
                    value={tensionsCount > 0
                        ? t.tiles.tensions.value(tensionsCount)
                        : t.tiles.tensions.valueNone}
                    accent={accent}
                />
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
                fontSize: 12,
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
                    fontSize: 12,
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

// Label naast de tekst (desktop) of erboven (telefoon). Op desktop is elke
// LabelRow `display: contents`, zodat label en tekst gewoon de twee kolommen
// van het raster vullen — precies zoals het was.
function LabelGrid({ labelWidth, rowGap, alignItems, style = {}, children }) {
    const isNarrow = useIsNarrow();
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: isNarrow
                    ? 'minmax(0, 1fr)'
                    : `minmax(${labelWidth}px, max-content) 1fr`,
                columnGap: SPACING.lg,
                rowGap: isNarrow ? SPACING.md : rowGap,
                alignItems: isNarrow ? undefined : alignItems,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

function LabelRow({ label, children }) {
    const isNarrow = useIsNarrow();
    return (
        <div style={isNarrow ? { display: 'grid', gap: SPACING.xs } : { display: 'contents' }}>
            {label}
            {children}
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

// Desktop: labelkolom links en rechts van de asbalk, plus de ruimte ernaast.
const AXIS_LABEL_W = 140;
const AXIS_GAP = SPACING.sm + 2;

function DynamicsAxis({ axis, isFirst }) {
    const { lang } = useLang();
    const isNarrow = useIsNarrow();
    const { teamDynamics: t } = useCopy();
    const { lPct, rPct, imbalanced: imbalance } = axis;
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
                            fontSize: 12,
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

            {/* Verhouding in getallen én in kleur: rose tegen sage alleen is
                voor de meest voorkomende kleurenblindheid niet te onderscheiden.
                Op een telefoon staan de labels boven de balk, anders blijft er
                van de balk te weinig over. */}
            {isNarrow ? (
                <div style={{ display: 'grid', gap: SPACING.xs }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: SPACING.sm }}>
                        <AxisEnd label={axis.left} pct={lPct} />
                        <AxisEnd label={axis.right} pct={rPct} pctFirst />
                    </div>
                    <AxisBar lPct={lPct} rPct={rPct} />
                </div>
            ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: AXIS_GAP }}>
                    {/* Vaste breedte, zodat de drie balken op dezelfde x
                        beginnen en eindigen en je ze kunt vergelijken. */}
                    <span style={{ width: AXIS_LABEL_W, flexShrink: 0, textAlign: 'right' }}>
                        <AxisEnd label={axis.left} pct={lPct} />
                    </span>
                    <AxisBar lPct={lPct} rPct={rPct} />
                    <span style={{ width: AXIS_LABEL_W, flexShrink: 0 }}>
                        <AxisEnd label={axis.right} pct={rPct} pctFirst />
                    </span>
                </div>
            )}

            <p
                style={{
                    ...TYPE.body,
                    fontSize: 13,
                    // Op desktop begint de leeszin waar de balk begint; op een
                    // telefoon kost die inspringing te veel regelbreedte.
                    paddingLeft: isNarrow ? 0 : AXIS_LABEL_W + AXIS_GAP,
                    paddingRight: isNarrow ? 0 : 8,
                }}
            >
                {description}
            </p>
        </div>
    );
}

// Eén uiteinde van een as: label plus percentage, zoals in de PDF ("67%").
// Het percentage staat aan de kant van de balk: "Creatie 67%" links,
// "33% Structuur" rechts (pctFirst).
function AxisEnd({ label, pct, pctFirst = false }) {
    const pctEl = (
        <span style={{ fontWeight: 600, color: 'var(--tof-text)', fontVariantNumeric: 'tabular-nums' }}>
            {pct}%
        </span>
    );
    return (
        <span
            style={{
                fontSize: 12,
                color: 'var(--tof-text-muted)',
                whiteSpace: 'nowrap',
            }}
        >
            {pctFirst ? <>{pctEl} {label}</> : <>{label} {pctEl}</>}
        </span>
    );
}

function AxisBar({ lPct, rPct }) {
    return (
        <div
            aria-hidden="true"
            style={{
                flex: 1,
                height: 6,
                background: 'var(--tof-border)',
                borderRadius: RADIUS.pill,
                overflow: 'hidden',
                display: 'flex',
            }}
        >
            {/* flex in plaats van procenten: dan telt de scheiding van 2 px
                niet op bij de 100%. */}
            <div style={{ flex: lPct, height: '100%', background: 'var(--tof-accent-rose)' }} />
            {/* Smalle witte scheiding tussen de twee delen. */}
            {lPct > 0 && rPct > 0 ? (
                <div style={{ width: 2, height: '100%', background: '#FFFFFF', flexShrink: 0 }} />
            ) : null}
            <div style={{ flex: rPct, height: '100%', background: 'var(--tof-accent-sage)' }} />
        </div>
    );
}

function MissingPersonaRow({ name, description, color }) {
    const isNarrow = useIsNarrow();
    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: isNarrow ? 'minmax(0, 1fr)' : 'minmax(140px, max-content) 1fr',
                columnGap: SPACING.lg,
                rowGap: SPACING.xs,
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

function CollaborationPanel({ sorted, totalScore, dominantIds = [] }) {
    const ARCHETYPES = useArchetypes();
    const { teamDynamics: t } = useCopy();
    const presentMap = {};
    sorted.forEach(([id, value]) => {
        if (value > 0) {
            presentMap[id] = {
                percentage: totalScore > 0 ? Math.round((value / totalScore) * 100) : 0,
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

    // Dominant = meeste mensen primair (besluit 4); bij een gelijke stand
    // krijgt elke dominante werkstijl een eigen blok. Aandelen blijven energie.
    const dominantList = sortedPresent.filter((a) => dominantIds.includes(a.id));
    const dominant = dominantList.length > 0 ? dominantList : sortedPresent.slice(0, 1);
    const rest = sortedPresent.filter((a) => !dominant.includes(a));

    return (
        <div>
            {dominant.map((a, i) => (
                <React.Fragment key={a.id}>
                    {i > 0 ? <Divider marginY={SPACING.xl} /> : null}
                    <DominantCollaborationBlock
                        archetype={a}
                        data={presentMap[a.id]}
                        presentMap={presentMap}
                    />
                </React.Fragment>
            ))}

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
                            // min(): smaller dan 420 px wordt het één kolom
                            // in plaats van opzij schuiven.
                            gridTemplateColumns: 'repeat(auto-fit, minmax(min(420px, 100%), 1fr))',
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

            {generalText ? (
                <p style={{ ...TYPE.body, fontSize: 15, maxWidth: 720, margin: 0 }}>
                    {generalText}
                </p>
            ) : null}

            <LabelGrid labelWidth={140} rowGap={SPACING.lg} style={{ marginTop: SPACING.sm }}>
                {positiveMatch ? (
                    <LabelRow
                        label={<SectionEyebrow color="var(--tof-accent-sage-text)">{t.collaboration.worksWell}</SectionEyebrow>}
                    >
                        <div style={{ display: 'grid', gap: SPACING.xs }}>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                                {positiveText}
                            </p>
                            <p style={{ ...TYPE.body, fontSize: 13, margin: 0, color: 'var(--tof-text-soft)' }}>
                                {capitalize(buildSynergyReason(archetype.id, positiveMatch.id, lang))}.
                            </p>
                        </div>
                    </LabelRow>
                ) : null}

                {tensionMatch ? (
                    <LabelRow
                        label={<SectionEyebrow color="var(--tof-accent-rose)">{t.collaboration.attentionFor}</SectionEyebrow>}
                    >
                        <div style={{ display: 'grid', gap: SPACING.xs }}>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                                {tensionText}
                            </p>
                            <p style={{ ...TYPE.body, fontSize: 13, margin: 0, color: 'var(--tof-text-soft)' }}>
                                {capitalize(buildAttentionReason(archetype.id, tensionMatch.id, lang))}.
                            </p>
                        </div>
                    </LabelRow>
                ) : null}
            </LabelGrid>
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
            </div>

            {/* STERK MET — label boven, uitleg eronder */}
            {positiveMatch ? (
                <div style={{ display: 'grid', gap: 4 }}>
                    <div
                        style={{
                            ...TYPE.eyebrow,
                            color: 'var(--tof-accent-sage-text)',
                            fontSize: 12,
                        }}
                    >
                        {t.collaboration.strongWith(positiveMatch.name.toLowerCase())}
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
                            fontSize: 12,
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
                    index={i}
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

function TensionRow({ tension, index, scores, totalScore, isOpen, isFirst, onToggle }) {
    const { lang } = useLang();
    const { teamDynamics: t } = useCopy();
    const pctA = totalScore > 0 ? Math.round(((scores[tension.a] || 0) / totalScore) * 100) : 0;
    const pctB = totalScore > 0 ? Math.round(((scores[tension.b] || 0) / totalScore) * 100) : 0;
    const archA = getArchetype(tension.a, lang);
    const archB = getArchetype(tension.b, lang);
    const contentId = `spanningsveld-${index}`;

    // Alleen de kopregel is de knop. Beschrijving, risico en advies staan
    // erbuiten: zo kun je die tekst selecteren en kopiëren, en leest een
    // schermlezer de knop niet als één lange tekst voor.
    return (
        <>
            {!isFirst ? <Divider marginY={0} /> : null}

            <div>
                <h3 style={{ margin: 0, fontSize: 'inherit', fontWeight: 'inherit' }}>
                    <button
                        type="button"
                        onClick={onToggle}
                        aria-expanded={isOpen}
                        aria-controls={contentId}
                        style={{
                            width: '100%',
                            background: 'transparent',
                            border: 'none',
                            padding: `${SPACING.md}px 0`,
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontFamily: 'var(--tof-font-body)',
                            fontWeight: 400,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: SPACING.md,
                        }}
                    >
                        <span style={{ display: 'grid', gap: SPACING.xs, flex: 1 }}>
                            <span
                                style={{
                                    fontFamily: 'var(--tof-font-heading)',
                                    fontSize: 'clamp(18px, 2vw, 22px)',
                                    lineHeight: 1.2,
                                    fontWeight: 500,
                                    color: ACCENT,
                                }}
                            >
                                {tension.label}
                            </span>

                            <span style={{ display: 'flex', gap: SPACING.sm, flexWrap: 'wrap', alignItems: 'center' }}>
                                <PersonaPill name={archA?.name || tension.a} pct={pctA} color={PERSONA_COLORS[tension.a]} />
                                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>{t.tensions.and}</span>
                                <PersonaPill name={archB?.name || tension.b} pct={pctB} color={PERSONA_COLORS[tension.b]} />
                            </span>
                        </span>

                        <span
                            aria-hidden="true"
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
                    </button>
                </h3>

                {isOpen ? (
                    <div
                        id={contentId}
                        style={{
                            display: 'grid',
                            gap: SPACING.md,
                            paddingTop: SPACING.xs,
                            paddingBottom: SPACING.md,
                        }}
                    >
                        <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                            {tension.desc}
                        </p>

                        <LabelGrid labelWidth={160} rowGap={SPACING.sm} alignItems="baseline">
                            <LabelRow label={<SectionEyebrow>{t.tensions.risk}</SectionEyebrow>}>
                                <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>{tension.risk}</p>
                            </LabelRow>

                            <LabelRow label={<SectionEyebrow color={ACCENT}>{t.tensions.advice}</SectionEyebrow>}>
                                <p style={{ ...TYPE.body, fontSize: 14, margin: 0, color: 'var(--tof-text)' }}>
                                    {tension.leadership}
                                </p>
                            </LabelRow>
                        </LabelGrid>
                    </div>
                ) : null}
            </div>
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

    // Alleen assen in disbalans (boven 60/40, besluit 3), de grootste
    // afwijking eerst. Een as in balans levert geen actie op.
    const sortedAxes = [...(dynamicsAxes || [])]
        .filter((axis) => axis.imbalanced)
        .map((axis, i) => ({ axis, i, gap: Math.abs(axis.lPct - axis.rPct) }))
        .sort((a, b) => b.gap - a.gap);

    // 1. UIT DYNAMIEK — meest disbalans
    const axis1 = sortedAxes[0];
    if (axis1) {
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
    if (axis2) {
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

    const dominantSide = axis.lPct >= axis.rPct ? axis.left : axis.right;
    const recessiveSide = axis.lPct >= axis.rPct ? axis.right : axis.left;

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
