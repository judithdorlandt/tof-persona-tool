/**
 * TeamDynamics — Module 2: Team Dynamics Sessie
 *
 * Architectuur conform design-system, spiegelbeeld van Team Insight:
 * - HeroBlock direct op canvas (rose accent)
 * - Meta-strip + signature-quote
 * - TileGrid met vier navigatie-tegels
 * - SectionCard detail-panel opent onder de tegels
 * - Cross-link terug naar Team Insight (sage)
 * - Geen tabs meer, geen sticky-bar
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
import { SPACING, TYPE, RADIUS, MODULE, useIsMobile } from '../ui/tokens';

import { ARCHETYPES } from '../data';
import { hasTeamLevel, LEVEL_DYNAMICS, isAdminAccess } from '../utils/access';
import {
    getDynamics,
    getMaturity,
    getSignatureLine,
} from '../insights';

const ACCENT = MODULE.dynamics.accent;

// =========================
// PERSONA KLEUREN
// =========================

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

// =========================
// PERSONA TENSION PAIRS
// =========================

const TENSION_PAIRS = [
    {
        a: 'presteerder', b: 'verbinder',
        label: 'Resultaat vs. Verbinding',
        desc: 'De Presteerder stuurt op tempo en output. De Verbinder stuurt op relatie en afstemming. Zonder bewuste regie botsen deze ritmes.',
        risk: 'Besluiten worden snel genomen, maar draagvlak ontbreekt. Frustratie stapelt aan beide kanten.',
        leadership: 'Maak expliciet wanneer snelheid en wanneer verbinding leidend is — niet als compromis, maar als bewuste keuze per situatie.',
    },
    {
        a: 'maker', b: 'zekerzoeker',
        label: 'Vrijheid vs. Zekerheid',
        desc: 'De Maker wil experimenteren en snel bewegen. De Zekerzoeker heeft helderheid en continuïteit nodig.',
        risk: 'Onrust bij de Zekerzoeker, frustratie bij de Maker. Energie gaat naar intern conflict.',
        leadership: 'Zorg voor stabiele kaders waarbinnen experiment normaal is.',
    },
    {
        a: 'denker', b: 'presteerder',
        label: 'Diepgang vs. Tempo',
        desc: 'De Denker wil begrijpen voordat hij beweegt. De Presteerder wil bewegen voordat hij volledig begrijpt.',
        risk: 'De Denker wordt buitengesloten van besluiten. De Presteerder neemt besluiten zonder voldoende inhoud.',
        leadership: 'Reserveer denktijd vóór besluitvorming. Maak duidelijk wanneer analyse en wanneer actie centraal staat.',
    },
    {
        a: 'vernieuwer', b: 'zekerzoeker',
        label: 'Vernieuwing vs. Continuïteit',
        desc: 'De Vernieuwer zoekt verandering. De Zekerzoeker beschermt wat werkt.',
        risk: 'Vernieuwers raken gefrustreerd door rem op verandering. Zekerzoekers raken onrustig door instabiliteit.',
        leadership: 'Onderscheid tussen verbetering en vervanging. Betrek de Zekerzoeker vroeg bij veranderingstrajecten.',
    },
    {
        a: 'teamspeler', b: 'maker',
        label: 'Loyaliteit vs. Autonomie',
        desc: 'De Teamspeler werkt vanuit gedeelde verantwoordelijkheid. De Maker vanuit persoonlijke drang en autonomie.',
        risk: 'De Teamspeler ervaart de Maker als individualistisch. De Maker ervaart de Teamspeler als remmend.',
        leadership: 'Definieer eigenaarschap expliciet per taak.',
    },
    {
        a: 'groeier', b: 'zekerzoeker',
        label: 'Ontwikkeling vs. Stabiliteit',
        desc: 'De Groeier zoekt continu nieuwe uitdagingen. De Zekerzoeker heeft baat bij een stabiele omgeving.',
        risk: 'De Groeier ziet de Zekerzoeker als conservatief. De Zekerzoeker ervaart de veranderingsdrang als stressvol.',
        leadership: 'Koppel groeidoelen aan stabiele structuren.',
    },
];

// =========================
// LEIDERSCHAP
// =========================

const LEADERSHIP_MAP = {
    presteerder: ['Maak prioriteiten concreet en zichtbaar', 'Erken voortgang en output actief', 'Stuur op uitkomst, niet op drukte'],
    verbinder: ['Vraag hoe het echt gaat — regelmatig', 'Gebruik de Verbinder als vroege signaalgever', 'Maak ontmoeting onderdeel van het werk'],
    maker: ['Geef richting op hoofdlijnen, laat ruimte in de aanpak', 'Beloon initiatief zichtbaar', 'Maak experimenteren veilig'],
    denker: ['Geef informatie op tijd en volledig', 'Bescherm denktijd', 'Waardeer grondigheid — ook als het langzamer gaat'],
    teamspeler: ['Zorg voor duidelijke rollen en stabiele verhoudingen', 'Communiceer verandering vroeg en persoonlijk', 'Benoem teamresultaten naast individuele prestaties'],
    zekerzoeker: ['Geef voorspelbaarheid in verwachtingen', 'Communiceer verandering met reden en tijdlijn', 'Waardeer betrouwbaarheid zichtbaar'],
    groeier: ['Bespreek leerdoelen actief', 'Geef uitdagende opdrachten voor routine', 'Maak groei zichtbaar'],
    vernieuwer: ['Reserveer ruimte voor experiment', 'Maak de vernieuwer zichtbaar in besluitvorming', 'Bescherm nieuwe ideeën in de beginfase'],
};

// =========================
// HELPERS
// =========================

function getArchetype(id) {
    return ARCHETYPES.find((a) => a.id === id) || null;
}

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

function buildPersonaScores(teamResponses) {
    const scores = {};
    teamResponses.forEach((r) => {
        const full = r?.full_scores || {};
        if (Object.keys(full).length > 0) {
            Object.entries(full).forEach(([k, v]) => {
                scores[k] = (scores[k] || 0) + Number(v || 0);
            });
            return;
        }
        if (r?.primary_archetype) scores[r.primary_archetype] = (scores[r.primary_archetype] || 0) + 3;
        if (r?.secondary_archetype) scores[r.secondary_archetype] = (scores[r.secondary_archetype] || 0) + 2;
        if (r?.tertiary_archetype) scores[r.tertiary_archetype] = (scores[r.tertiary_archetype] || 0) + 1;
    });
    return scores;
}

function findActiveTensions(sorted) {
    const present = new Set(sorted.filter(([, v]) => v > 0).map(([id]) => id));
    return TENSION_PAIRS.filter((p) => present.has(p.a) && present.has(p.b));
}

function buildDynamicsAxes(sorted, totalScore) {
    const idx = {};
    ARCHETYPES.forEach((a, i) => { idx[a.id] = i; });
    const pcts = Array(8).fill(0);
    sorted.forEach(([id, value]) => {
        const i = idx[id];
        if (i !== undefined && totalScore > 0) pcts[i] = Math.round((value / totalScore) * 100);
    });
    return getDynamics(pcts);
}

function findMissingCritical(sorted) {
    const present = new Set(sorted.filter(([, v]) => v > 0).map(([id]) => id));
    return ['denker', 'verbinder', 'vernieuwer']
        .filter((id) => !present.has(id))
        .map((id) => ({ id, archetype: getArchetype(id) }))
        .filter((x) => x.archetype);
}

function buildLeadershipActions(sorted) {
    return sorted
        .slice(0, 3)
        .filter(([id]) => LEADERSHIP_MAP[id])
        .map(([id]) => ({
            persona: getArchetype(id)?.name || id,
            color: PERSONA_COLORS[id],
            items: LEADERSHIP_MAP[id],
        }));
}

function getReliability(count) {
    if (count < 3) return 'Eerste signalen';
    if (count < 6) return 'Opkomend patroon';
    if (count <= 15) return 'Betrouwbaar beeld';
    return 'Sterk patroon';
}

// =========================
// MAIN COMPONENT
// =========================

export default function TeamDynamics({
    teamResponses = [],
    selectedTeam,
    setPage,
}) {
    const [activeId, setActiveId] = useState(null);

    const teamName = resolveTeamName(selectedTeam);
    const organization = resolveOrg(selectedTeam);
    const team = resolveTeamKey(selectedTeam);

    const hasAccess = useMemo(
        () => hasTeamLevel(team, organization, LEVEL_DYNAMICS),
        [team, organization]
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
    const tensions = useMemo(() => findActiveTensions(sorted), [sorted]);
    const dynamicsAxes = useMemo(
        () => buildDynamicsAxes(sorted, totalScore),
        [sorted, totalScore]
    );
    const missingCritical = useMemo(() => findMissingCritical(sorted), [sorted]);
    const leadershipActions = useMemo(() => buildLeadershipActions(sorted), [sorted]);

    const topPersonaId = sorted[0]?.[0] || null;
    const topPersona = topPersonaId ? getArchetype(topPersonaId) : null;
    const reliability = getReliability(teamResponses.length);

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
            const mat = getMaturity(pcts, srt);
            const dyn = getDynamics(pcts);
            return getSignatureLine(dom, missing, mat, dyn);
        } catch {
            return null;
        }
    }, [sorted, totalScore, teamResponses.length]);

    // Geen toegang
    if (!hasAccess) {
        return (
            <PageShell>
                <HeroBlock
                    eyebrow="02 — Team Dynamics"
                    title="Geen toegang tot"
                    titleAccent="Team Dynamics"
                    titleAccentColor={ACCENT}
                    lead="Voer je toegangscode voor Team Dynamics in via de teamomgeving. Deze code geeft ook toegang tot Team Insight."
                    actions={
                        <PrimaryButton onClick={() => setPage('team')}>
                            Naar teamomgeving
                        </PrimaryButton>
                    }
                />
            </PageShell>
        );
    }

    // Geen data
    if (!teamResponses || teamResponses.length === 0) {
        return (
            <PageShell>
                <HeroBlock
                    eyebrow="02 — Team Dynamics"
                    title="Geen teamdata voor"
                    titleAccent={teamName}
                    titleAccentColor={ACCENT}
                    lead="Laad eerst een team via Team Insight."
                    actions={
                        <PrimaryButton
                            onClick={() => setPage('teamdashboard')}
                            style={{ background: 'var(--tof-accent-sage)' }}
                        >
                            ← Naar Team Insight
                        </PrimaryButton>
                    }
                />
            </PageShell>
        );
    }

    const TILES = [
        {
            id: 'tensions',
            eyebrow: 'Spanningen',
            value: tensions.length === 0 ? 'Geen actieve' : `${tensions.length} actief`,
            hint: 'Waar persona\'s botsen',
            detailTitle: 'Spanningsvelden in dit team',
            detailLead: tensions.length === 0
                ? 'Geen directe spanningsparen gedetecteerd — de meest voorkomende combinaties zijn niet tegelijk sterk vertegenwoordigd.'
                : 'Actieve persona-combinaties die wrijving kunnen geven. Klik op een veld voor risico en leiderschapsadvies.',
            render: () => <TensionsPanel tensions={tensions} scores={scores} totalScore={totalScore} />,
        },
        {
            id: 'dynamics',
            eyebrow: 'Dynamiek',
            value: 'Drie assen',
            hint: 'Fundamentele spanningen',
            detailTitle: 'Drie assen van teamdynamiek',
            detailLead: 'Geen van de assen is goed of fout — ze laten zien waar bewuste sturing het meeste oplevert.',
            render: () => <DynamicsPanel dynamicsAxes={dynamicsAxes} missingCritical={missingCritical} />,
        },
        {
            id: 'collaboration',
            eyebrow: 'Samenwerking',
            value: 'Per werkstijl',
            hint: 'Hoe loopt het samen',
            detailTitle: 'Samenwerking per werkstijl',
            detailLead: 'De combinatie van werkstijlen bepaalt hoe samenwerking verloopt. Patronen van de meest aanwezige persona\'s.',
            render: () => <CollaborationPanel sorted={sorted} scores={scores} totalScore={totalScore} teamResponses={teamResponses} />,
        },
        {
            id: 'leadership',
            eyebrow: 'Leiderschap',
            value: '4 acties',
            hint: 'Synthese voor morgen',
            detailTitle: 'Leiderschap voor dit team',
            detailLead: 'Concrete acties afgeleid uit alle vier de tabbladen — spanningen, dominante stijlen en blinde vlekken.',
            render: () => <LeadershipPanel leadershipActions={leadershipActions} tensions={tensions} missingCritical={missingCritical} />,
        },
    ];

    const activeTile = TILES.find((t) => t.id === activeId);

    return (
        <PageShell compact>
            <HeroBlock
                compact
                eyebrow="02 — Team Dynamics"
                title="Team Dynamics voor"
                titleAccent={teamName}
                titleAccentColor={ACCENT}
                lead="Waar samenwerking schuurt, waarom tempo en reflectie botsen, en wat dat vraagt van leiderschap."
                actions={
                    <>
                        <PrimaryButton
                            onClick={() => setPage('teamdashboard')}
                            style={{ background: 'var(--tof-accent-sage)' }}
                        >
                            ← Naar Team Insight
                        </PrimaryButton>
                        {isAdminAccess() ? (
                            <PrimaryButton
                                onClick={() => setPage('team')}
                                style={{ background: ACCENT }}
                            >
                                Ander team
                            </PrimaryButton>
                        ) : null}
                    </>
                }
            />

            {/* SIGNATURE + META gecombineerd */}
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
                        onClick={() =>
                            setActiveId((prev) => (prev === tile.id ? null : tile.id))
                        }
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
                            Sluiten ✕
                        </button>
                    </div>

                    <div style={{ padding: '0 22px 22px' }}>
                        {activeTile.render()}
                    </div>
                </SectionCard>
            ) : null}
        </PageShell>
    );
}

// =========================
// SIGNATURE BLOCK
// =========================

function SignatureBlock({ quote, accent, teamCount, organization, dominantPersona, dominantColor, tensionsCount, reliability }) {
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
                {dominantPersona ? (
                    <MetaChip label="Dominant" value={dominantPersona} accent={dominantColor || accent} />
                ) : null}
                {tensionsCount > 0 ? (
                    <MetaChip label="Spanningen" value={`${tensionsCount} actief`} accent={accent} />
                ) : null}
                {reliability ? <MetaChip label="Betrouwbaarheid" value={reliability} /> : null}
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
// DETAIL PANELS — alle vier in zandgekleurd gewicht-blok patroon
// =========================

// Helper: zandgekleurde container met eyebrow + Playfair-titel + lead.
// Gebruikt door alle vier de panels voor consistentie.

function WeightedBlock({ eyebrow, title, lead, accent, children }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface-soft)',
                border: '1px solid var(--tof-border)',
                borderRadius: RADIUS.lg,
                padding: '16px 18px',
                display: 'grid',
                gap: SPACING.md,
            }}
        >
            <div style={{ display: 'grid', gap: SPACING.xs }}>
                <SectionEyebrow color={accent}>{eyebrow}</SectionEyebrow>
                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 18,
                        lineHeight: 1.2,
                        color: 'var(--tof-text)',
                    }}
                >
                    {title}
                </h3>
                {lead ? (
                    <p style={{ ...TYPE.body, fontSize: 13 }}>{lead}</p>
                ) : null}
            </div>
            {children}
        </div>
    );
}

// Helper: subtiel blok zonder container, voor "secundaire" content.

function SubtleBlock({ eyebrow, lead, children }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <div style={{ display: 'grid', gap: SPACING.xs }}>
                <SectionEyebrow color="var(--tof-text-muted)">{eyebrow}</SectionEyebrow>
                {lead ? (
                    <p style={{ ...TYPE.body, fontSize: 13 }}>{lead}</p>
                ) : null}
            </div>
            {children}
        </div>
    );
}

// =========================
// PANEL 1: SPANNINGSVELDEN
// =========================

function TensionsPanel({ tensions, scores, totalScore }) {
    if (tensions.length === 0) {
        return (
            <SubtleBlock
                eyebrow="Geen actieve spanningen"
                lead="Geen directe spanningsparen gedetecteerd — de meest voorkomende combinaties zijn niet tegelijk sterk vertegenwoordigd."
            />
        );
    }

    return (
        <WeightedBlock
            eyebrow="Actieve spanningen"
            title={tensions.length === 1 ? 'Eén spanningsveld vraagt aandacht' : `${tensions.length} spanningsvelden vragen aandacht`}
            lead="Persona-combinaties die wrijving kunnen geven. Klik op een veld voor risico en leiderschapsadvies."
            accent={ACCENT}
        >
            <div style={{ display: 'grid', gap: SPACING.sm }}>
                {tensions.map((t, i) => (
                    <TensionCard key={i} tension={t} scores={scores} totalScore={totalScore} />
                ))}
            </div>
        </WeightedBlock>
    );
}

function TensionCard({ tension, scores, totalScore }) {
    const [open, setOpen] = useState(false);
    const pctA = totalScore > 0 ? Math.round(((scores[tension.a] || 0) / totalScore) * 100) : 0;
    const pctB = totalScore > 0 ? Math.round(((scores[tension.b] || 0) / totalScore) * 100) : 0;
    const archA = getArchetype(tension.a);
    const archB = getArchetype(tension.b);

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderLeft: `3px solid ${ACCENT}`,
                borderRadius: RADIUS.md,
                overflow: 'hidden',
            }}
        >
            <button
                type="button"
                onClick={() => setOpen(!open)}
                style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    padding: '12px 14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'grid',
                    gap: SPACING.sm,
                    fontFamily: 'var(--tof-font-body)',
                }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: SPACING.sm }}>
                    <h4
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 16,
                            lineHeight: 1.15,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {tension.label}
                    </h4>
                    <span
                        style={{
                            fontSize: 12,
                            color: 'var(--tof-text-muted)',
                            transform: open ? 'rotate(180deg)' : 'rotate(0)',
                            transition: 'transform 0.2s var(--tof-ease)',
                        }}
                    >
                        ▾
                    </span>
                </div>

                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                    <PersonaPill name={archA?.name || tension.a} pct={pctA} color={PERSONA_COLORS[tension.a]} />
                    <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>↔</span>
                    <PersonaPill name={archB?.name || tension.b} pct={pctB} color={PERSONA_COLORS[tension.b]} />
                </div>

                <p style={{ ...TYPE.body, fontSize: 13 }}>{tension.desc}</p>
            </button>

            {open ? (
                <div
                    style={{
                        borderTop: '1px solid var(--tof-border)',
                        padding: '12px 14px',
                        display: 'grid',
                        gap: SPACING.md,
                        background: 'var(--tof-bg)',
                    }}
                >
                    <div>
                        <SectionEyebrow color="var(--tof-text-muted)">Risico</SectionEyebrow>
                        <p style={{ ...TYPE.body, fontSize: 13, marginTop: 4 }}>{tension.risk}</p>
                    </div>
                    <div>
                        <SectionEyebrow color={ACCENT}>Leiderschapsadvies</SectionEyebrow>
                        <p style={{ ...TYPE.body, fontSize: 13, marginTop: 4 }}>{tension.leadership}</p>
                    </div>
                </div>
            ) : null}
        </div>
    );
}

// =========================
// PANEL 2: DYNAMIEK (drie assen + ontbrekende stemmen)
// =========================

function DynamicsPanel({ dynamicsAxes, missingCritical }) {
    return (
        <div style={{ display: 'grid', gap: SPACING.xl }}>
            {/* DRIE ASSEN — gewichtsblok */}
            <WeightedBlock
                eyebrow="Drie assen"
                title="Fundamentele spanningen in dit team"
                lead="Geen van de assen is goed of fout — ze laten zien waar bewuste sturing het meeste oplevert."
                accent={ACCENT}
            >
                <div style={{ display: 'grid', gap: SPACING.lg }}>
                    {dynamicsAxes.map((axis, i) => <DynamicsAxis key={i} axis={axis} />)}
                </div>
            </WeightedBlock>

            {/* ONTBREKENDE KRITIEKE STEMMEN — subtiel onder */}
            {missingCritical.length > 0 ? (
                <SubtleBlock
                    eyebrow="Blinde vlekken"
                    lead={
                        missingCritical.length === 1
                            ? 'Eén kritieke stem ontbreekt of is nauwelijks aanwezig — dat vergroot het risico op blinde vlekken bij verandering.'
                            : `${missingCritical.length} kritieke stemmen ontbreken of zijn nauwelijks aanwezig — dat vergroot het risico op blinde vlekken bij verandering.`
                    }
                >
                    <div style={{ display: 'grid', gap: SPACING.sm }}>
                        {missingCritical.map(({ id, archetype }) => (
                            <div
                                key={id}
                                style={{
                                    background: 'var(--tof-surface)',
                                    border: '1px solid var(--tof-border)',
                                    borderLeft: `3px solid ${PERSONA_COLORS[id] || ACCENT}`,
                                    borderRadius: RADIUS.md,
                                    padding: '12px 14px',
                                    display: 'flex',
                                    alignItems: 'baseline',
                                    gap: SPACING.md,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: SPACING.sm,
                                        flexShrink: 0,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: RADIUS.pill,
                                            background: PERSONA_COLORS[id] || ACCENT,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <span
                                        style={{
                                            fontWeight: 700,
                                            fontSize: 14,
                                            color: 'var(--tof-text)',
                                        }}
                                    >
                                        {archetype.name}
                                    </span>
                                </div>

                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: 13,
                                        lineHeight: 1.55,
                                        color: 'var(--tof-text-soft)',
                                        flex: '1 1 300px',
                                    }}
                                >
                                    {archetype.short}
                                </p>
                            </div>
                        ))}
                    </div>
                </SubtleBlock>
            ) : null}
        </div>
    );
}

function DynamicsAxis({ axis }) {
    const total = axis.lv + axis.rv || 1;
    const lPct = Math.round((axis.lv / total) * 100);
    const rPct = 100 - lPct;
    const imbalance = Math.abs(axis.lv - axis.rv) > 20;

    return (
        <div style={{ display: 'grid', gap: SPACING.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tof-text)' }}>
                    {axis.label}
                </span>
                {imbalance && (
                    <span
                        style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: ACCENT,
                            background: 'rgba(176,82,82,0.10)',
                            padding: '2px 8px',
                            borderRadius: RADIUS.pill,
                            border: `1px solid ${ACCENT}40`,
                            textTransform: 'uppercase',
                            letterSpacing: 0.8,
                        }}
                    >
                        Disbalans
                    </span>
                )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm + 2 }}>
                <span
                    style={{
                        fontSize: 12,
                        color: 'var(--tof-text-muted)',
                        minWidth: 58,
                        textAlign: 'right',
                    }}
                >
                    {axis.left}
                </span>
                <div
                    style={{
                        flex: 1,
                        height: 8,
                        background: 'var(--tof-border)',
                        borderRadius: RADIUS.pill,
                        overflow: 'hidden',
                        display: 'flex',
                    }}
                >
                    <div style={{ width: `${lPct}%`, height: '100%', background: 'var(--tof-accent-rose)' }} />
                    <div style={{ width: `${rPct}%`, height: '100%', background: 'var(--tof-accent-sage)' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)', minWidth: 58 }}>
                    {axis.right}
                </span>
            </div>

            <p style={{ ...TYPE.body, fontSize: 12, paddingLeft: 66, paddingRight: 66 }}>
                {axis.desc}
            </p>
        </div>
    );
}

// =========================
// PANEL 3: SAMENWERKING
// =========================

function CollaborationPanel({ sorted, scores, totalScore, teamResponses }) {
    const isMobile = useIsMobile();
    const gridCols = isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))';

    // Map: persona-id → {percentage, names[]}
    const presentMap = {};
    sorted.forEach(([id, value]) => {
        if (value > 0) {
            presentMap[id] = {
                percentage: totalScore > 0 ? Math.round((value / totalScore) * 100) : 0,
                names: [],
            };
        }
    });

    // Voornamen verzamelen per primary
    teamResponses.forEach((r) => {
        const pid = r?.primary_archetype;
        if (!pid || !presentMap[pid]) return;
        const fname = String(r?.name || '').trim().split(/\s+/)[0];
        if (!fname || fname === 'Onbekend') return;
        if (!presentMap[pid].names.includes(fname)) {
            presentMap[pid].names.push(fname);
        }
    });

    const presentIds = Object.keys(presentMap);
    const presentArchetypes = ARCHETYPES.filter((a) => presentIds.includes(a.id));
    const missingArchetypes = ARCHETYPES.filter((a) => !presentIds.includes(a.id));

    if (presentArchetypes.length === 0) {
        return (
            <SubtleBlock
                eyebrow="Geen werkstijlen"
                lead="Nog geen samenwerkingspatronen zichtbaar — wacht tot meer teamleden hebben ingevuld."
            />
        );
    }

    return (
        <div style={{ display: 'grid', gap: SPACING.xl }}>
            {/* AANWEZIGE PERSONA'S — gewicht-blok, 2 kolommen */}
            <WeightedBlock
                eyebrow="Hoe loopt het samen"
                title={`Samenwerking per werkstijl in dit team`}
                lead="Per persona: wat werkt goed met wie er nog meer in het team zit, en waar nog aandacht voor mag zijn."
                accent={ACCENT}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: gridCols,
                        gap: SPACING.sm,
                    }}
                >
                    {presentArchetypes
                        .sort((a, b) => (presentMap[b.id]?.percentage || 0) - (presentMap[a.id]?.percentage || 0))
                        .map((arch) => (
                            <CollaborationCard
                                key={arch.id}
                                archetype={arch}
                                percentage={presentMap[arch.id].percentage}
                                names={presentMap[arch.id].names}
                                presentMap={presentMap}
                            />
                        ))}
                </div>
            </WeightedBlock>

            {/* ONTBREKENDE PERSONA'S — subtiel */}
            {missingArchetypes.length > 0 ? (
                <SubtleBlock
                    eyebrow="Niet vertegenwoordigd"
                    lead={
                        missingArchetypes.length === 1
                            ? 'Eén werkstijl ontbreekt — die kan nog niet meedoen in deze samenwerking.'
                            : `${missingArchetypes.length} werkstijlen ontbreken — die kunnen nog niet meedoen in deze samenwerking.`
                    }
                >
                    <div
                        style={{
                            display: 'flex',
                            gap: 6,
                            flexWrap: 'wrap',
                        }}
                    >
                        {missingArchetypes.map((arch) => {
                            const color = PERSONA_COLORS[arch.id] || ACCENT;
                            return (
                                <span
                                    key={arch.id}
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
                                    {arch.name}
                                </span>
                            );
                        })}
                    </div>
                </SubtleBlock>
            ) : null}
        </div>
    );
}

// =========================
// COLLABORATION CARD — per persona
// =========================
// Toont:
//  - Persona-naam, percentage, voornamen
//  - "Wat werkt goed" — ct[0], ALLEEN als die match-persona ook in team zit; met namen
//  - "Aandacht voor" — ct[1], ALLEEN als die match-persona ook in team zit
//  - Algemene rol — ct[2], altijd

function CollaborationCard({ archetype, percentage, names, presentMap }) {
    const color = PERSONA_COLORS[archetype.id];
    const ct = archetype.ct || [];

    // ct[0] = positieve match, ct[1] = aandachtspunt, ct[2] = algemene rol
    const positiveText = ct[0] || null;
    const tensionText = ct[1] || null;
    const generalText = ct[2] || null;

    // Match: welke persona wordt in de zin genoemd?
    const positiveMatch = positiveText ? findMentionedPersona(positiveText, presentMap) : null;
    const tensionMatch = tensionText ? findMentionedPersona(tensionText, presentMap) : null;

    const positiveActive = !!positiveMatch;
    const tensionActive = !!tensionMatch;

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderLeft: `3px solid ${color}`,
                borderRadius: RADIUS.md,
                padding: '12px 14px',
                display: 'grid',
                gap: SPACING.sm,
            }}
        >
            {/* Header: persona + percentage + voornamen */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: SPACING.sm,
                    flexWrap: 'wrap',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--tof-text)' }}>
                        {archetype.name}
                    </span>
                    <span
                        style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color,
                            background: `${color}18`,
                            padding: '2px 8px',
                            borderRadius: RADIUS.pill,
                        }}
                    >
                        {percentage}%
                    </span>

                    {names.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                            {names.map((n) => (
                                <span
                                    key={n}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        fontSize: 11,
                                        color: 'var(--tof-text)',
                                        background: `${color}10`,
                                        border: `1px solid ${color}40`,
                                        borderRadius: RADIUS.pill,
                                        padding: '2px 8px',
                                        fontWeight: 500,
                                    }}
                                >
                                    {n}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>

            {/* Wat werkt goed — alleen als match-persona ook aanwezig */}
            {positiveActive ? (
                <CollaborationLine
                    icon="✓"
                    iconColor="var(--tof-accent-sage)"
                    label="Wat werkt goed"
                    text={positiveText}
                    matchNames={positiveMatch.names}
                    matchColor={positiveMatch.color}
                />
            ) : null}

            {/* Aandacht voor — alleen als de tension-persona ook aanwezig */}
            {tensionActive ? (
                <CollaborationLine
                    icon="⚠"
                    iconColor="var(--tof-accent-rose)"
                    label="Aandacht voor"
                    text={tensionText}
                />
            ) : null}

            {/* Algemene rol — altijd */}
            {generalText ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: 12,
                        lineHeight: 1.55,
                        color: 'var(--tof-text-muted)',
                        fontStyle: 'italic',
                        paddingTop: 2,
                    }}
                >
                    {generalText}
                </p>
            ) : null}
        </div>
    );
}

function CollaborationLine({ icon, iconColor, label, text, matchNames, matchColor }) {
    return (
        <div style={{ display: 'grid', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: SPACING.sm }}>
                <span
                    style={{
                        fontSize: 12,
                        color: iconColor,
                        flexShrink: 0,
                        marginTop: 2,
                        fontWeight: 700,
                    }}
                >
                    {icon}
                </span>
                <div style={{ display: 'grid', gap: 2 }}>
                    <span
                        style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1.2,
                            color: iconColor,
                            fontWeight: 700,
                        }}
                    >
                        {label}
                    </span>
                    <span style={{ ...TYPE.body, fontSize: 13, color: 'var(--tof-text)' }}>
                        {text}
                    </span>
                    {matchNames && matchNames.length > 0 ? (
                        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 2 }}>
                            {matchNames.map((n) => (
                                <span
                                    key={n}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        fontSize: 11,
                                        color: 'var(--tof-text)',
                                        background: `${matchColor}10`,
                                        border: `1px solid ${matchColor}40`,
                                        borderRadius: RADIUS.pill,
                                        padding: '2px 8px',
                                        fontWeight: 500,
                                    }}
                                >
                                    {n}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

// Detecteer welke aanwezige persona in een ct-zin genoemd wordt.
// Returnt { id, names, color } of null.
function findMentionedPersona(text, presentMap) {
    const lowered = text.toLowerCase();
    for (const arch of ARCHETYPES) {
        if (!presentMap[arch.id]) continue;
        // matcht zowel "Denker" als "Denkers", "Zekerzoeker" als "Zekerzoekers"
        if (lowered.includes(arch.name.toLowerCase())) {
            return {
                id: arch.id,
                names: presentMap[arch.id].names,
                color: PERSONA_COLORS[arch.id] || ACCENT,
            };
        }
    }
    return null;
}

// =========================
// PANEL 4: LEIDERSCHAP — synthese met source-labels
// =========================
// Module 2's Quick Wins-equivalent: vier scherpe leiderschapsacties,
// elk gekoppeld aan een tabblad-bron.

function LeadershipPanel({ leadershipActions, tensions, missingCritical }) {
    // Bouw vier wins op basis van wat in andere tabbladen is gezien.
    const wins = buildLeadershipSynthesis({ leadershipActions, tensions, missingCritical });

    if (wins.length === 0) {
        return (
            <SubtleBlock
                eyebrow="Geen acties"
                lead="Nog geen leiderschapsacties te genereren — wacht tot meer teamleden hebben ingevuld."
            />
        );
    }

    return (
        <WeightedBlock
            eyebrow="Synthese in acties"
            title={`${wins.length} leiderschapsacties voor dit team`}
            lead="Direct afgeleid uit wat dit dashboard laat zien — spanningen, dynamiek, samenwerking en blinde vlekken."
            accent={ACCENT}
        >
            <div style={{ display: 'grid', gap: SPACING.sm }}>
                {wins.map((win, index) => (
                    <ActionRow
                        key={index}
                        index={index + 1}
                        source={win.source}
                        action={win.action}
                    />
                ))}
            </div>
        </WeightedBlock>
    );
}

// Bron-labels voor leiderschapssynthese
const LEADERSHIP_SOURCE_LABELS = {
    tension: 'Uit spanningen',
    persona: 'Uit dominante stijl',
    dynamics: 'Uit dynamiek',
    missing: 'Uit blinde vlek',
};

// Genereer max 4 leiderschapsacties met source-info
function buildLeadershipSynthesis({ leadershipActions, tensions, missingCritical }) {
    const wins = [];

    // WIN 1 — uit SPANNINGEN: het eerste actieve spanningsveld levert direct leiderschapsadvies
    if (tensions && tensions.length > 0) {
        const first = tensions[0];
        wins.push({
            source: 'tension',
            action: first.leadership,
        });
    }

    // WIN 2 — uit DOMINANTE STIJL: de top-1 persona vraagt iets specifieks
    if (leadershipActions && leadershipActions.length > 0) {
        const top = leadershipActions[0];
        const firstAction = top.items?.[0];
        if (firstAction) {
            wins.push({
                source: 'persona',
                action: `Voor de ${top.persona}: ${firstAction.toLowerCase()}.`,
            });
        }
    }

    // WIN 3 — uit DOMINANTE STIJL: de tweede dominante persona
    if (leadershipActions && leadershipActions.length > 1) {
        const second = leadershipActions[1];
        const firstAction = second.items?.[0];
        if (firstAction) {
            wins.push({
                source: 'persona',
                action: `Voor de ${second.persona}: ${firstAction.toLowerCase()}.`,
            });
        }
    }

    // WIN 4 — uit BLINDE VLEK: ontbrekende kritieke stem vraagt expliciet bewustzijn
    if (missingCritical && missingCritical.length > 0) {
        const first = missingCritical[0];
        wins.push({
            source: 'missing',
            action: `${first.archetype.name} ontbreekt — breng dit perspectief actief in besluiten, anders ontstaat een blinde vlek.`,
        });
    } else if (leadershipActions && leadershipActions.length > 2) {
        // Geen blinde vlek? Pak derde persona-actie
        const third = leadershipActions[2];
        const firstAction = third.items?.[0];
        if (firstAction) {
            wins.push({
                source: 'persona',
                action: `Voor de ${third.persona}: ${firstAction.toLowerCase()}.`,
            });
        }
    }

    return wins.slice(0, 4);
}

function ActionRow({ index, source, action }) {
    const sourceLabel = LEADERSHIP_SOURCE_LABELS[source] || 'Reflectie';

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderLeft: `3px solid ${ACCENT}`,
                borderRadius: RADIUS.md,
                padding: '10px 14px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                alignItems: 'center',
                gap: SPACING.md,
            }}
        >
            {/* LINKS: nummer + source label, vaste breedte */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: SPACING.sm,
                    minWidth: 180,
                }}
            >
                <div
                    style={{
                        width: 22,
                        height: 22,
                        borderRadius: RADIUS.pill,
                        background: ACCENT,
                        color: '#fff',
                        fontSize: 12,
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    {index}
                </div>

                <span
                    style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.4,
                        fontWeight: 700,
                        color: ACCENT,
                        whiteSpace: 'nowrap',
                    }}
                >
                    {sourceLabel}
                </span>
            </div>

            {/* RECHTS: actie-tekst */}
            <p
                style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: 'var(--tof-text)',
                }}
            >
                {action}
            </p>
        </div>
    );
}

// =========================
// PERSONA PILL (gedeeld voor TensionCard)
// =========================

function PersonaPill({ name, pct, color }) {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 10px',
                borderRadius: RADIUS.pill,
                background: `${color}15`,
                border: `1px solid ${color}40`,
                fontSize: 13,
                fontWeight: 600,
                color,
            }}
        >
            {name}
            <span style={{ fontWeight: 400, color: `${color}99`, fontSize: 12 }}>
                {pct}%
            </span>
        </div>
    );
}
