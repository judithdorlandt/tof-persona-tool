/**
 * TeamDashboard — Module 1: Team Insight
 *
 * Architectuur conform design-system:
 * - HeroBlock direct op canvas (geen kaart-hero)
 * - Headline-quote als signature-zin
 * - TileGrid: vier compacte tegels als navigatie
 * - SectionCard daaronder: één detail-blok opent onder de tegels
 * - Geen lange scroll door alle blokken
 *
 * Bron-of-truth voor "Werkstijlen"-tegel + "Dominant"-chip:
 *   aggregate.topPersonaByPrimary (= wie zit er primair in dit team)
 * NIET aggregate.sortedPersonas (dat is energie-sortering — voor Dynamics).
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
    InteractiveRow,
    TileGrid,
    Tile,
    keepTileInView,
    DetailPanelHeader,
} from '../ui/AppShell';
import { SPACING, TYPE, MODULE, useIsNarrow, startsNarrow } from '../ui/tokens';

import TeamPersonaDistribution from '../team/components/TeamPersonaDistribution';
import TeamWorkplaceTension from '../team/components/TeamWorkplaceTension';
import TeamQuickWins from '../team/components/TeamQuickWins';

import { buildTeamAggregate, dominantPersonas, dominantNames } from '../utils/TeamAggregation';
import { buildTeamInsights } from '../utils/TeamInsights';
import { getConfidence } from '../insights';
import { useLang, useCopy } from '../i18n/LanguageContext';
import {
    hasTeamLevel,
    LEVEL_DYNAMICS,
    isAdminAccess,
    MIN_TEAM_RESPONSES,
    countCompleteProfiles,
    namesByPersona,
    rememberAfterLogin,
} from '../utils/access';
import { logPdfDownload } from '../supabase';
import TeamGate from './TeamGate';
import ShareNote from './ShareNote';

import WerkplekProfielInline from '../team/werkplek/WerkplekProfielInline';
import {
    aantallenUitAggregate,
    buildWerkplekProfiel,
    tegelKern,
} from '../team/werkplek/werkplekProfielLogic';

const ACCENT = MODULE.insight.accent;
// Sage voor letters en knoppen (contrast); ACCENT blijft voor randen en vlakken.
const ACCENT_TEXT = MODULE.insight.text;
// Eén paneel tegelijk; elke tegel wijst ernaar met aria-controls.
const PANEL_ID = 'teaminzicht-paneel';

// =========================
// TILE DEFINITIONS
// =========================

/**
 * buildTiles — de vier tegels, met de teksten van de actieve taal erin.
 *
 * `t` is de `teamDashboard`-namespace uit useCopy(). Admin.jsx hergebruikt
 * deze tegels voor het organisatie-overzicht en roept dezelfde functie aan.
 * `names` (uit namesByPersona) geeft alleen Teaminzicht mee, en alleen als
 * het team met namen instemde; het organisatie-overzicht laat het weg.
 * `workplaceProfile` is de gelijknamige namespace: de namen van de
 * werkplektypen in de actieve taal, voor de Werkplek-tegel.
 */
export function buildTiles(t, { names = null, workplaceProfile = null, lang = 'nl' } = {}) {
    return [
        {
            id: 'personas',
            eyebrow: t.tiles.personas.eyebrow,
            buildValue: (aggregate) => {
                // Tegel toont "wie zit er in dit team" — primaire telling,
                // bij een gelijke stand beide namen.
                const top = dominantPersonas(aggregate)[0];
                if (!top) return t.empty;
                return `${dominantNames(aggregate, lang)} ${top.countPercentage}%`;
            },
            buildHint: () => t.tiles.personas.hint,
            detailTitle: t.tiles.personas.detailTitle,
            detailLead: () => '',
            render: (aggregate) => <TeamPersonaDistribution aggregate={aggregate} names={names} />,
        },
        {
            id: 'workplace',
            eyebrow: t.tiles.workplace.eyebrow,
            buildValue: (aggregate) => {
                // Zelfde bron als het paneel: het werkplekprofiel, niet de
                // energie-gewogen sortedWorkplaceNeeds.
                const profiel = buildWerkplekProfiel(aantallenUitAggregate(aggregate));
                const { type, extra } = tegelKern(profiel);
                if (!profiel.heeftData || !type) return t.empty;
                const label = workplaceProfile?.types?.[type.id]?.label || type.label;
                return extra > 0 ? `${label} +${extra}` : label;
            },
            buildHint: () => t.tiles.workplace.hint,
            detailTitle: t.tiles.workplace.detailTitle,
            detailLead: () => '',
            render: (aggregate) => <WerkplekProfielInline aggregate={aggregate} />,
        },
        {
            id: 'tension',
            eyebrow: t.tiles.tension.eyebrow,
            // Aansluiting werkplek (besluit 1, 27 okt): de vraag naar de
            // eerste kernplek, met in de hint wat beperkt nodig is.
            buildValue: (aggregate, insights) => {
                const tension = insights?.workplaceTension;
                const first = tension?.underserved?.[0];
                if (!tension?.impactSummary || !first) return t.empty;
                return t.tiles.tension.value(first.label);
            },
            buildHint: (aggregate, insights) => {
                const beperkt = insights?.workplaceTension?.oversupplied || [];
                return t.tiles.tension.hint(beperkt[0]?.label || null, beperkt.length - 1);
            },
            detailTitle: t.tiles.tension.detailTitle,
            detailLead: (aggregate, insights) => {
                const tension = insights?.workplaceTension;
                if (!tension?.impactSummary) return '';
                const labels = (list) => (list || []).map((w) => w.label);
                const kernen = (tension.kernCount || 0) > 0 ? labels(tension.underserved) : [];
                return t.tiles.tension.lead(
                    kernen,
                    tension.underserved?.[0]?.label || '',
                    labels(tension.oversupplied)
                );
            },
            render: (aggregate, insights) => <TeamWorkplaceTension insights={insights} />,
        },
        {
            id: 'quickwins',
            eyebrow: t.tiles.quickwins.eyebrow,
            buildValue: (aggregate, insights) =>
                t.tiles.quickwins.value((insights?.quickWins || []).length),
            buildHint: () => t.tiles.quickwins.hint,
            detailTitle: t.tiles.quickwins.detailTitle,
            detailLead: () => t.tiles.quickwins.detailLead,
            render: (aggregate, insights) => <TeamQuickWins insights={insights} />,
        },
    ];
}

// =========================
// MAIN COMPONENT
// =========================

export default function TeamDashboard({
    teamResponses = [],
    selectedTeam,
    setPage,
}) {
    // Standaard staat de eerste tegel (Werkstijlen) open — zo zien
    // gebruikers meteen dat de tegels uitklapbare detail-panelen zijn.
    // Op een telefoon juist alles dicht (besluit Judith 26 okt): dan zie je
    // de vier tegels als inhoudsopgave in plaats van één lang paneel.
    const [activeId, setActiveId] = useState(() => (startsNarrow() ? null : 'personas'));
    const { lang } = useLang();
    const { teamDashboard: t, common, workplaceProfile } = useCopy();
    const isNarrow = useIsNarrow();

    const aggregate = useMemo(
        () => buildTeamAggregate(teamResponses, lang),
        [teamResponses, lang]
    );
    const insights = useMemo(() => buildTeamInsights(aggregate, lang), [aggregate, lang]);
    // Voornamen alleen als het team instemde (zie utils/access.js); de
    // naamloze aggregaat-stroom — PDF, Teamdynamiek — blijft ongemoeid.
    const names = useMemo(
        () => namesByPersona(teamResponses, common.locale),
        [teamResponses, common.locale]
    );
    const tiles = useMemo(
        () => buildTiles(t, { names, workplaceProfile, lang }),
        [t, names, workplaceProfile, lang]
    );

    const teamName = resolveTeamName(selectedTeam, t.fallbackTeamName);
    const organization = resolveOrg(selectedTeam);

    // "Dominant" in de chip = wie zit er primair in dit team (besluit 4),
    // bij een gelijke stand beide namen. Consistent met de Werkstijlen-tegel.
    const dominantPersona = dominantNames(aggregate, lang);

    // Het getal dat je ziet = de telling van de drempel: rijen met een
    // werkstijl (E2.5, 27 okt 2026). aggregate.teamCount telt alle rijen en
    // blijft de noemer van de percentages.
    const completeProfiles = countCompleteProfiles(teamResponses);
    const teamCount = completeProfiles;
    // Eén schaal op beide dashboards en in de PDF's (besluit 6, 22 okt 2026).
    const reliability = teamCount > 0 ? getConfidence(teamCount, lang).label : '';

    const team = resolveTeamKey(selectedTeam);
    const hasDynamicsAccess = hasTeamLevel(team, organization, LEVEL_DYNAMICS);

    const activeTile = tiles.find((tile) => tile.id === activeId);

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

    // ── DREMPEL ──
    // Onder vijf ingevulde werkstijlen geen teambeeld: in een kleiner team is
    // een uitslag herleidbaar tot een persoon. Beheerders mogen wel door, zij
    // zien de teams om de tool te kunnen bedienen.
    if (completeProfiles < MIN_TEAM_RESPONSES && !isAdminAccess()) {
        return (
            <TeamGate
                count={completeProfiles}
                accent={ACCENT_TEXT}
                eyebrow={t.hero.eyebrow}
                teamName={selectedTeam?.team || ''}
                code={selectedTeam?.code || ''}
            />
        );
    }

    const detailPanel = activeTile ? (
        <SectionCard id={PANEL_ID} accent={ACCENT} padding={0}>
            <DetailPanelHeader
                eyebrow={activeTile.eyebrow}
                eyebrowColor={ACCENT_TEXT}
                title={activeTile.detailTitle}
                lead={activeTile.detailLead(aggregate, insights)}
                closeText={t.close}
                closeLabel={t.closeLabel}
                onClose={closePanel}
            />

            <div style={{ padding: '0 22px 22px' }}>
                {activeTile.render(aggregate, insights)}
            </div>
        </SectionCard>
    ) : null;

    return (
        <PageShell compact>
            {/* ── HERO ── */}
            <HeroBlock
                compact
                eyebrow={t.hero.eyebrow}
                title={t.hero.title}
                titleAccent={teamName}
                titleAccentColor={ACCENT_TEXT}
                lead={t.hero.lead}
                actionsBelowOnNarrow
                actions={
                    <>
                        <PrimaryButton
                            onClick={async () => {
                                // Dynamisch: jsPDF (~0,5 MB) blijft zo uit de
                                // hoofdbundel en laadt pas bij de download.
                                const { generateTeamInsightPDF } = await import(
                                    '../utils/teamInsightPDF'
                                );
                                generateTeamInsightPDF({
                                    aggregate,
                                    insights,
                                    teamName,
                                    organization,
                                    lang,
                                });
                                // Log op de achtergrond — mag stil falen.
                                logPdfDownload(selectedTeam?.code || null);
                            }}
                            style={{ background: ACCENT_TEXT }}
                        >
                            {t.hero.downloadPdf}
                        </PrimaryButton>
                        {isAdminAccess() ? (
                            <SecondaryButton onClick={() => setPage('team')}>
                                {t.hero.otherTeam}
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
                labels={t.chips}
            />

            {/* ── TILE GRID ── vier compacte tegels; op een telefoon één
                kolom met het paneel direct onder de getikte tegel ── */}
            <TileGrid columns={4} stackOnNarrow>
                {tiles.map((tile) => (
                    <React.Fragment key={tile.id}>
                        <Tile
                            eyebrow={tile.eyebrow}
                            value={tile.buildValue(aggregate, insights)}
                            hint={tile.buildHint(aggregate, insights)}
                            accent={ACCENT}
                            activeColor={ACCENT_TEXT}
                            isActive={activeId === tile.id}
                            panelId={PANEL_ID}
                            onClick={(e) => handleTileClick(tile.id, e)}
                        />
                        {isNarrow && activeId === tile.id ? detailPanel : null}
                    </React.Fragment>
                ))}
            </TileGrid>

            {/* ── DETAIL PANEL ── opent onder de tegels ── */}
            {!isNarrow ? detailPanel : null}

            {/* ── CROSS-LINK NAAR MODULE 2 ── */}
            <DynamicsBridge
                hasDynamicsAccess={hasDynamicsAccess}
                setPage={setPage}
                t={t.bridge}
                team={team}
                organization={organization}
            />
        </PageShell>
    );
}

// =========================
// SIGNATURE BLOCK
// =========================

function SignatureBlock({ quote, accent, teamCount, organization, dominantPersona, reliability, labels }) {
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

            <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: SPACING.lg, rowGap: SPACING.xs }}>
                <MetaChip label={labels.responses} value={teamCount} />
                {organization ? <MetaChip label={labels.organisation} value={organization} /> : null}
                {dominantPersona ? <MetaChip label={labels.dominant} value={dominantPersona} /> : null}
                {reliability ? <MetaChip value={reliability} /> : null}
            </div>
        </div>
    );
}

// Eén paar in de metaregel onder de quote (A5.12): geen pil, rand of
// bolletje meer, want het is geen knop. Label in gewone letters, waarde vet;
// zonder label staat alleen de waarde (Betrouwbaarheid, tekst redacteur).
// Elk paar is één flex-item: het gaat als geheel naar de volgende regel, en
// breekt alleen binnen zichzelf af als het breder is dan de regel (een
// lange organisatienaam op 375 px).
function MetaChip({ label, value }) {
    return (
        <span style={{ ...TYPE.bodySmall, maxWidth: '100%', overflowWrap: 'anywhere' }}>
            {label ? <span style={{ color: 'var(--tof-text-soft)' }}>{label} </span> : null}
            <span style={{ color: 'var(--tof-text)', fontWeight: 600 }}>{value}</span>
        </span>
    );
}

// =========================
// DYNAMICS BRIDGE
// =========================

function DynamicsBridge({ hasDynamicsAccess, setPage, t, team, organization }) {
    if (hasDynamicsAccess) {
        return (
            <InteractiveRow
                accent="var(--tof-accent-rose)"
                style={{ justifyContent: 'space-between' }}
            >
                <div style={{ display: 'grid', gap: 2, minWidth: 240 }}>
                    <SectionEyebrow color="var(--tof-accent-rose)">
                        {t.available.eyebrow}
                    </SectionEyebrow>
                    <p style={{ ...TYPE.body, fontSize: 14 }}>
                        {t.available.lead}
                    </p>
                </div>
                <PrimaryButton
                    onClick={() => setPage('teamdynamics')}
                    style={{ background: 'var(--tof-accent-rose)' }}
                >
                    {t.available.cta}
                </PrimaryButton>
            </InteractiveRow>
        );
    }

    // Teamlid, of leidinggevende die nog niet is ingelogd: één rustige
    // alinea en een inloglink die na de inloglink terugbrengt op
    // Teamdynamiek van dit team (dezelfde route als op Teamdynamiek zelf).
    return (
        <div style={{ display: 'grid', gap: SPACING.sm, maxWidth: 680, padding: '4px 2px' }}>
            <p style={{ ...TYPE.body, margin: 0, color: 'var(--tof-text)' }}>
                {t.locked.discuss}
            </p>
            <p style={{ ...TYPE.body, margin: 0, color: 'var(--tof-text-soft)' }}>
                {t.locked.body}
            </p>
            <p style={{ margin: 0 }}>
                <button
                    type="button"
                    onClick={() => {
                        rememberAfterLogin({ page: 'teamdynamics', team, organization });
                        setPage('login');
                    }}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        padding: 0,
                        color: 'var(--tof-accent-rose)',
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: 'pointer',
                        textDecoration: 'underline',
                        textUnderlineOffset: 3,
                    }}
                >
                    {t.locked.login}
                </button>
            </p>

            {/* Deelmoment 2, deel B: een tekst voor een ánder team. */}
            <div style={{ borderTop: '1px solid var(--tof-border)', marginTop: SPACING.md, paddingTop: SPACING.lg }}>
                <ShareNote
                    eyebrow={t.locked.shareEyebrow}
                    text={t.locked.shareLead}
                    button={t.locked.button}
                    copied={t.locked.copied}
                    copyFailed={t.locked.copyFailed}
                    getText={() => t.locked.shareText}
                    accent={ACCENT_TEXT}
                />
            </div>
        </div>
    );
}

// =========================
// HELPERS
// =========================

function resolveTeamName(sel, fallback) {
    if (!sel) return fallback;
    if (typeof sel === 'string') return sel;
    return sel.name || sel.team || fallback;
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

