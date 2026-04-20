/**
 * TeamDynamics.jsx — Module 2: Team Dynamics Sessie
 *
 * UX: tab-navigatie, geen lange scroll.
 *
 * Tabs:
 *   1. Overzicht        — signature-zin + drie snelkoppelingen + betrouwbaarheid
 *   2. Spanningsvelden  — actieve spanningsparen (uitklapbaar)
 *   3. Dynamiek         — drie assen + ontbrekende perspectieven
 *   4. Samenwerking     — ct-velden per dominante persona
 *   5. Leiderschap      — leiderschapsacties per persona
 */

import React, { useMemo, useState } from 'react';
import { ARCHETYPES } from '../data';
import { isMakerAccess } from '../utils/access';
import {
    aggregateProfiles,
    getDynamics,
    getMaturity,
    getSignatureLine,
} from '../insights';
import { PageShell, PrimaryButton, SecondaryButton, SectionEyebrow } from '../ui/AppShell';

// Module 2 toegang — lokaal opgeslagen
function hasModule2Access() {
    try { return localStorage.getItem('tof_module2_access') === '1'; } catch { return false; }
}
function grantModule2Access() {
    try { localStorage.setItem('tof_module2_access', '1'); } catch { }
}

// ─── TOEGANGSCODE MODULE 2 ────────────────────────────────────────────────────
const MODULE2_CODE = '1980!T03g4ngPERSONA';

// ─── KLEUREN ──────────────────────────────────────────────────────────────────

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

const TENSION_PAIRS = [
    {
        a: 'presteerder', b: 'verbinder', label: 'Resultaat vs. Verbinding',
        desc: 'De Presteerder stuurt op tempo en output. De Verbinder stuurt op relatie en afstemming. Zonder bewuste regie botsen deze ritmes.',
        risk: 'Besluiten worden snel genomen, maar draagvlak ontbreekt. Frustratie stapelt aan beide kanten.',
        leadership: 'Maak expliciet wanneer snelheid en wanneer verbinding leidend is — niet als compromis, maar als bewuste keuze per situatie.'
    },
    {
        a: 'maker', b: 'zekerzoeker', label: 'Vrijheid vs. Zekerheid',
        desc: 'De Maker wil experimenteren en snel bewegen. De Zekerzoeker heeft helderheid en continuïteit nodig. Beiden zijn noodzakelijk — maar werken in tegengestelde richting.',
        risk: 'Onrust bij de Zekerzoeker, frustratie bij de Maker. Energie gaat naar intern conflict.',
        leadership: 'Zorg voor stabiele kaders waarbinnen experiment normaal is.'
    },
    {
        a: 'denker', b: 'presteerder', label: 'Diepgang vs. Tempo',
        desc: 'De Denker wil begrijpen voordat hij beweegt. De Presteerder wil bewegen voordat hij volledig begrijpt.',
        risk: 'De Denker wordt buitengesloten van besluiten. De Presteerder neemt besluiten zonder voldoende inhoud.',
        leadership: 'Reserveer denktijd vóór besluitvorming. Maak duidelijk wanneer analyse en wanneer actie centraal staat.'
    },
    {
        a: 'vernieuwer', b: 'zekerzoeker', label: 'Vernieuwing vs. Continuïteit',
        desc: 'De Vernieuwer zoekt verandering. De Zekerzoeker beschermt wat werkt. Productief — maar alleen als beide stemmen een plek krijgen.',
        risk: 'Vernieuwers raken gefrustreerd door rem op verandering. Zekerzoekers raken onrustig door instabiliteit.',
        leadership: 'Onderscheid tussen verbetering en vervanging. Betrek de Zekerzoeker vroeg bij veranderingstrajecten.'
    },
    {
        a: 'teamspeler', b: 'maker', label: 'Loyaliteit vs. Autonomie',
        desc: 'De Teamspeler werkt vanuit gedeelde verantwoordelijkheid. De Maker vanuit persoonlijke drang en autonomie.',
        risk: 'De Teamspeler ervaart de Maker als individualistisch. De Maker ervaart de Teamspeler als remmend.',
        leadership: 'Definieer eigenaarschap expliciet per taak.'
    },
    {
        a: 'groeier', b: 'zekerzoeker', label: 'Ontwikkeling vs. Stabiliteit',
        desc: 'De Groeier zoekt continu nieuwe uitdagingen. De Zekerzoeker heeft baat bij een stabiele omgeving.',
        risk: 'De Groeier ziet de Zekerzoeker als conservatief. De Zekerzoeker ervaart de veranderingsdrang als stressvol.',
        leadership: 'Koppel groeidoelen aan stabiele structuren. Verandering is okay — onduidelijkheid niet.'
    },
];

const TABS_M2 = [
    { id: 'overview', label: 'Overzicht' },
    { id: 'tensions', label: 'Spanningsvelden' },
    { id: 'dynamics', label: 'Dynamiek' },
    { id: 'collaboration', label: 'Samenwerking' },
    { id: 'leadership', label: 'Leiderschap' },
];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getArchetype(id) { return ARCHETYPES.find((a) => a.id === id) || null; }
function resolveTeamName(sel) {
    if (!sel) return 'jouw team';
    if (typeof sel === 'string') return sel;
    return sel.team || sel.organization || 'jouw team';
}

function buildPersonaScores(teamResponses) {
    const scores = {};
    teamResponses.forEach((r) => {
        const full = r?.full_scores || {};
        if (Object.keys(full).length > 0) { Object.entries(full).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + Number(v || 0); }); return; }
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
    const lsMap = {
        presteerder: ['Maak prioriteiten concreet en zichtbaar', 'Erken voortgang en output actief', 'Stuur op uitkomst, niet op drukte'],
        verbinder: ['Vraag hoe het echt gaat — regelmatig', 'Gebruik de Verbinder als vroege signaalgever', 'Maak ontmoeting onderdeel van het werk'],
        maker: ['Geef richting op hoofdlijnen, laat ruimte in de aanpak', 'Beloon initiatief zichtbaar', 'Maak experimenteren veilig'],
        denker: ['Geef informatie op tijd en volledig', 'Bescherm denktijd', 'Waardeer grondigheid — ook als het langzamer gaat'],
        teamspeler: ['Zorg voor duidelijke rollen en stabiele verhoudingen', 'Communiceer verandering vroeg en persoonlijk', 'Benoem teamresultaten naast individuele prestaties'],
        zekerzoeker: ['Geef voorspelbaarheid in verwachtingen', 'Communiceer verandering met reden en tijdlijn', 'Waardeer betrouwbaarheid zichtbaar'],
        groeier: ['Bespreek leerdoelen actief', 'Geef uitdagende opdrachten voor routine', 'Maak groei zichtbaar'],
        vernieuwer: ['Reserveer ruimte voor experiment', 'Maak de vernieuwer zichtbaar in besluitvorming', 'Bescherm nieuwe ideeën in de beginfase'],
    };
    return sorted.slice(0, 3)
        .filter(([id]) => lsMap[id])
        .map(([id]) => ({ persona: getArchetype(id)?.name || id, color: PERSONA_COLORS[id], items: lsMap[id] }));
}

function getReliability(count) {
    if (count < 3) return { label: 'Eerste signalen', color: '#C7A24A', pct: 18 };
    if (count < 6) return { label: 'Opkomend patroon', color: '#C28D6B', pct: 42 };
    if (count <= 15) return { label: 'Betrouwbaar beeld', color: '#7F9A8A', pct: 72 };
    return { label: 'Sterk patroon', color: '#6E8872', pct: 100 };
}

// ─── HOOFDCOMPONENT ──────────────────────────────────────────────────────────

export default function TeamDynamics({ setPage, teamResponses = [], selectedTeam = null }) {
    const [accessInput, setAccessInput] = useState('');
    const [accessError, setAccessError] = useState('');
    const [hasAccess, setHasAccess] = useState(hasModule2Access());
    const [activeTab, setActiveTab] = useState('overview');

    const teamName = resolveTeamName(selectedTeam);

    const scores = useMemo(() => buildPersonaScores(teamResponses), [teamResponses]);
    const sorted = useMemo(() => Object.entries(scores).sort((a, b) => b[1] - a[1]), [scores]);
    const totalScore = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const tensions = useMemo(() => findActiveTensions(sorted), [sorted]);
    const dynamicsAxes = useMemo(() => buildDynamicsAxes(sorted, totalScore), [sorted, totalScore]);
    const missingCritical = useMemo(() => findMissingCritical(sorted), [sorted]);
    const leadershipActions = useMemo(() => buildLeadershipActions(sorted), [sorted]);
    const reliability = useMemo(() => getReliability(teamResponses.length), [teamResponses.length]);

    const topPersonaId = sorted[0]?.[0] || null;
    const topPersona = topPersonaId ? getArchetype(topPersonaId) : null;
    const topPct = totalScore > 0 ? Math.round(((sorted[0]?.[1] || 0) / totalScore) * 100) : 0;

    const signatureLine = useMemo(() => {
        if (!teamResponses.length) return null;
        try {
            const idx = {};
            ARCHETYPES.forEach((a, i) => { idx[a.id] = i; });
            const pcts = Array(8).fill(0);
            sorted.forEach(([id, value]) => { const i = idx[id]; if (i !== undefined && totalScore > 0) pcts[i] = Math.round((value / totalScore) * 100); });
            const srt = pcts.map((c, i) => ({ c, i })).sort((a, b) => b.c - a.c);
            const dom = srt.filter(x => x.c > 0).slice(0, 3).map(x => ARCHETYPES[x.i]);
            const missing = srt.filter(x => x.c === 0).map(x => ARCHETYPES[x.i]);
            const mat = getMaturity(pcts, srt);
            const dyn = getDynamics(pcts);
            return getSignatureLine(dom, missing, mat, dyn);
        } catch { return null; }
    }, [sorted, totalScore, teamResponses.length]);

    // ── Toegang ───────────────────────────────────────────────────────────────
    if (!hasAccess) {
        return (
            <PageShell padding="0 16px 40px">
                {/* Lege pagina-achtergrond met modal bovenop */}
                <div style={{ paddingTop: 20 }}>
                    <DashCard borderTopColor="var(--tof-accent-sage)">
                        <SectionEyebrow>Module 2 · Team Dynamics Sessie</SectionEyebrow>
                        <h1 style={s.headingXL}>Team Dynamics</h1>
                        <p style={s.body}>Voer je toegangscode in om het verdiepte dashboard te openen.</p>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <SecondaryButton onClick={() => setPage('team-dynamics')}>← Terug</SecondaryButton>
                            <SecondaryButton onClick={() => setPage('home')}>Home</SecondaryButton>
                        </div>
                    </DashCard>
                </div>

                {/* Modal — zelfde stijl als Team Insight */}
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.28)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 1000, padding: 16,
                }}>
                    <div style={{
                        background: '#fff', borderRadius: 18, padding: 26,
                        width: '100%', maxWidth: 380,
                        display: 'grid', gap: 14,
                        boxShadow: '0 24px 64px rgba(0,0,0,0.14)',
                        border: '1px solid #E5D9CD',
                    }}>
                        <div style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 22, lineHeight: 1.1, color: 'var(--tof-text)' }}>
                            Toegangscode
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>
                            Voer je persoonlijke code in om naar Team Dynamics te gaan.
                        </p>
                        <input
                            type="password"
                            placeholder="Voer code in"
                            value={accessInput}
                            autoFocus
                            onChange={(e) => { setAccessInput(e.target.value); setAccessError(''); }}
                            onKeyDown={(e) => e.key === 'Enter' && (accessInput.trim() === MODULE2_CODE ? (grantModule2Access(), setHasAccess(true), setAccessError('')) : setAccessError('Onjuiste toegangscode.'))}
                            style={{
                                padding: '10px 13px', borderRadius: 10,
                                border: `1px solid ${accessError ? 'var(--tof-accent-rose)' : '#E5D9CD'}`,
                                fontSize: 14, outline: 'none', fontFamily: 'var(--tof-font-body)',
                            }}
                        />
                        {accessError && (
                            <p style={{ margin: 0, fontSize: 13, color: 'var(--tof-accent-rose)', lineHeight: 1.5 }}>{accessError}</p>
                        )}
                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton onClick={() => accessInput.trim() === MODULE2_CODE ? (grantModule2Access(), setHasAccess(true), setAccessError('')) : setAccessError('Onjuiste toegangscode.')} style={{ flex: 1 }}>
                                Ga verder
                            </PrimaryButton>
                            <SecondaryButton onClick={() => setPage('team-dynamics')}>
                                Sluiten
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            </PageShell>
        );
    }

    if (!teamResponses || teamResponses.length === 0) {
        return (
            <PageShell padding="24px 20px 36px">
                <DashCard borderTopColor="var(--tof-accent-sage)">
                    <h2 style={s.headingMD}>Geen teamdata beschikbaar</h2>
                    <p style={s.body}>Laad eerst een team via Module 1.</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                        <PrimaryButton onClick={() => setPage('team')}>Naar teamomgeving</PrimaryButton>
                        <SecondaryButton onClick={() => setPage('home')}>Home</SecondaryButton>
                    </div>
                </DashCard>
            </PageShell>
        );
    }

    // ── DASHBOARD ─────────────────────────────────────────────────────────────
    return (
        <PageShell padding="0 16px 40px">

            {/* ── Volledige headerkaart — scrollt mee ──────────────── */}
            <div style={{ paddingTop: 20 }}>
                <DashCard borderTopColor="var(--tof-accent-sage)">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <SectionEyebrow>Module 2 · Team Dynamics Sessie</SectionEyebrow>
                        <StatusPill color={reliability.color}>{reliability.label}</StatusPill>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <h1 style={s.headingXL}>{teamName}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <MetaBadge>👥 {teamResponses.length} responsen</MetaBadge>
                            {topPersona && <MetaBadge accent={PERSONA_COLORS[topPersonaId]}>{topPersona.name} · {topPct}%</MetaBadge>}
                            {tensions.length > 0 && <MetaBadge accent="#C7A24A">⚡ {tensions.length} spanningsveld{tensions.length > 1 ? 'en' : ''}</MetaBadge>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <SecondaryButton onClick={() => setPage('teamdashboard')}>← Module 1</SecondaryButton>
                        <SecondaryButton onClick={() => setPage('teamselector')}>Ander team</SecondaryButton>
                    </div>
                </DashCard>
            </div>

            {/* ── Sticky tab-balk ───────────────────────────────────── */}
            <div style={{
                position: 'sticky',
                top: 0,
                zIndex: 100,
                background: 'var(--tof-bg)',
                paddingTop: 10,
                paddingBottom: 10,
            }}>
                <div style={{
                    background: 'var(--tof-surface)',
                    border: '1px solid var(--tof-border)',
                    borderTop: '3px solid var(--tof-accent-sage)',
                    borderRadius: 14,
                    padding: '10px 16px',
                    display: 'grid',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(31,31,31,0.08)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 15, fontWeight: 500, color: 'var(--tof-text)', flexShrink: 0 }}>
                            {teamName}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <TabBar tabs={TABS_M2} activeTab={activeTab} onChange={setActiveTab} accentColor="var(--tof-accent-sage)" />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab content ──────────────────────────────────────── */}
            <div style={{ display: 'grid', gap: 16, paddingBottom: 40 }}>

                {activeTab === 'overview' && (
                    <M2TabOverview
                        signatureLine={signatureLine}
                        reliability={reliability}
                        teamResponses={teamResponses}
                        tensions={tensions}
                        missingCritical={missingCritical}
                        onTabChange={setActiveTab}
                        setPage={setPage}
                        teamName={teamName}
                    />
                )}

                {activeTab === 'tensions' && (
                    <M2TabTensions
                        tensions={tensions}
                        sorted={sorted}
                        totalScore={totalScore}
                    />
                )}

                {activeTab === 'dynamics' && (
                    <M2TabDynamics
                        dynamicsAxes={dynamicsAxes}
                        missingCritical={missingCritical}
                    />
                )}

                {activeTab === 'collaboration' && (
                    <M2TabCollaboration
                        sorted={sorted}
                        scores={scores}
                        totalScore={totalScore}
                    />
                )}

                {activeTab === 'leadership' && (
                    <M2TabLeadership
                        leadershipActions={leadershipActions}
                        setPage={setPage}
                        teamName={teamName}
                    />
                )}

            </div>
        </PageShell>
    );
}

// ─── M2 TAB 1: OVERZICHT ──────────────────────────────────────────────────────

function M2TabOverview({ signatureLine, reliability, teamResponses, tensions, missingCritical, onTabChange, setPage, teamName }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>
            <DashCard borderTopColor="var(--tof-accent-sage)">
                {signatureLine && (
                    <div style={{ borderLeft: '3px solid var(--tof-accent-sage)', paddingLeft: 16 }}>
                        <p style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 'clamp(16px, 2vw, 20px)', fontStyle: 'italic', lineHeight: 1.45, color: 'var(--tof-text)' }}>
                            "{signatureLine}"
                        </p>
                    </div>
                )}
                <p style={{ ...s.body, fontSize: 14, lineHeight: 1.75 }}>
                    Dit dashboard legt bloot wat er onder de oppervlakte speelt. Niet de verdeling — maar de dynamiek. Waar botst het? Wat kost energie? Wat vraagt dat van leiderschap?
                </p>
                <div style={{ display: 'grid', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--tof-text-soft)' }}>Betrouwbaarheid</span>
                        <span style={{ color: reliability.color, fontWeight: 600 }}>{reliability.label}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--tof-border)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${reliability.pct}%`, height: '100%', background: reliability.color, borderRadius: 999 }} />
                    </div>
                </div>
            </DashCard>

            {/* Snelkoppelingen */}
            <div style={s.twoCol}>
                <TabSummaryCard accentColor="#C7A24A" eyebrow="Spanningsvelden" title={`${tensions.length} actief`} desc="Welke persona-combinaties wrijving geven in dit team." onClick={() => onTabChange('tensions')} />
                <TabSummaryCard accentColor="var(--tof-accent-sage)" eyebrow="Teamdynamiek" title="Drie assen" desc="Creatie vs structuur, verbinding vs individueel, executie vs reflectie." onClick={() => onTabChange('dynamics')} />
                <TabSummaryCard accentColor="var(--tof-accent-rose)" eyebrow="Leiderschap" title="Per persona" desc="Concrete leiderschapsrichtlijnen op basis van de dominante werkstijlen." onClick={() => onTabChange('leadership')} />
            </div>

            {missingCritical.length > 0 && (
                <DashCard borderTopColor="#C7A24A" eyebrow="Let op">
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--tof-text-soft)' }}>
                        <strong style={{ color: 'var(--tof-text)' }}>{missingCritical.map(m => m.archetype.name).join(', ')}</strong>{' '}
                        {missingCritical.length === 1 ? 'is' : 'zijn'} niet of nauwelijks aanwezig in dit team.
                        Bekijk de <button onClick={() => onTabChange('dynamics')} style={{ color: 'var(--tof-accent-sage)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, fontFamily: 'var(--tof-font-body)', padding: 0, textDecoration: 'underline', textUnderlineOffset: 3 }}>Dynamiek-tab</button> voor de implicaties.
                    </p>
                </DashCard>
            )}

            {/* Module 3 teaser compact */}
            <Module3TeaserCompact setPage={setPage} />
        </div>
    );
}

// ─── M2 TAB 2: SPANNINGSVELDEN ────────────────────────────────────────────────

function M2TabTensions({ tensions, sorted, totalScore }) {
    const scores = {};
    sorted.forEach(([id, v]) => { scores[id] = v; });
    if (tensions.length === 0) {
        return (
            <DashCard borderTopColor="var(--tof-accent-sage)">
                <InfoBox>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.72, color: 'var(--tof-text-soft)' }}>
                        Geen directe spanningsparen gedetecteerd. Dat betekent niet dat er geen spanning is — maar de meest voorkomende combinaties zijn niet tegelijk sterk vertegenwoordigd.
                    </p>
                </InfoBox>
            </DashCard>
        );
    }
    return (
        <div style={{ display: 'grid', gap: 14 }}>
            {tensions.map((t, i) => (
                <TensionCard key={i} tension={t} scores={scores} totalScore={totalScore} />
            ))}
        </div>
    );
}

// ─── M2 TAB 3: DYNAMIEK ───────────────────────────────────────────────────────

function M2TabDynamics({ dynamicsAxes, missingCritical }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>
            <DashCard title="Drie assen van teamdynamiek" borderTopColor="var(--tof-accent-sage)">
                <p style={s.bodySmall}>Elke as laat een fundamentele spanning zien. Geen van de assen is goed of fout — ze laten zien waar bewuste sturing het meeste oplevert.</p>
                <div style={{ display: 'grid', gap: 22 }}>
                    {dynamicsAxes.map((axis, i) => <DynamicsAxis key={i} axis={axis} />)}
                </div>
            </DashCard>

            {missingCritical.length > 0 && (
                <DashCard title="Kritieke stemmen die ontbreken" borderTopColor="#C7A24A" eyebrow="Blinde vlekken">
                    <p style={s.bodySmall}>Niet of nauwelijks vertegenwoordigd. Vergroot het risico op blinde vlekken bij verandering.</p>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {missingCritical.map(({ id, archetype }) => (
                            <div key={id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', gap: 12, alignItems: 'start', padding: '12px 14px', background: 'rgba(199,162,74,0.06)', border: '1px solid rgba(199,162,74,0.18)', borderRadius: 12 }}>
                                <div style={{ width: 36, height: 36, borderRadius: 999, background: 'rgba(199,162,74,0.15)', border: '1px solid rgba(199,162,74,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#C7A24A' }}>
                                    {archetype.name.charAt(0)}
                                </div>
                                <div>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--tof-text)', marginBottom: 3 }}>{archetype.name} ontbreekt</div>
                                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: 'var(--tof-text-soft)' }}>{archetype.short}</p>
                                    <p style={{ margin: '5px 0 0', fontSize: 12, lineHeight: 1.55, color: '#C7A24A', fontStyle: 'italic' }}>{archetype.lquote}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </DashCard>
            )}
        </div>
    );
}

// ─── M2 TAB 4: SAMENWERKING ───────────────────────────────────────────────────

function M2TabCollaboration({ sorted, scores, totalScore }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>
            <DashCard title="Samenwerking per werkstijl" borderTopColor="var(--tof-accent-sage)">
                <p style={s.bodySmall}>De combinatie van werkstijlen bepaalt hoe samenwerking verloopt. Hieronder de patronen van de meest aanwezige persona's.</p>
                <div style={s.twoCol}>
                    {sorted.slice(0, 4).filter(([, v]) => v > 0).map(([id]) => {
                        const arch = getArchetype(id);
                        if (!arch) return null;
                        const pct = totalScore > 0 ? Math.round(((scores[id] || 0) / totalScore) * 100) : 0;
                        return (
                            <div key={id} style={{ background: 'var(--tof-surface)', border: '1px solid var(--tof-border)', borderLeft: `3px solid ${PERSONA_COLORS[id]}`, borderRadius: 12, padding: '14px 16px', display: 'grid', gap: 8 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--tof-text)' }}>{arch.name}</span>
                                    <span style={{ fontSize: 12, fontWeight: 600, color: PERSONA_COLORS[id], background: `${PERSONA_COLORS[id]}18`, padding: '2px 8px', borderRadius: 999 }}>{pct}%</span>
                                </div>
                                <div style={{ display: 'grid', gap: 5 }}>
                                    {arch.ct?.map((line, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                            <span style={{ color: PERSONA_COLORS[id], fontSize: 12, flexShrink: 0, marginTop: 2 }}>—</span>
                                            <span style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>{line}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </DashCard>
        </div>
    );
}

// ─── M2 TAB 5: LEIDERSCHAP ────────────────────────────────────────────────────

function M2TabLeadership({ leadershipActions, setPage, teamName }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>
            <DashCard title="Leiderschapsimplicaties" borderTopColor="var(--tof-accent-rose)" eyebrow="Wat vraagt dit team?">
                <p style={s.bodySmall}>Concrete gedragsrichtlijnen per dominante werkstijl. Geen algemene tips — afgeleid uit dit team.</p>
                <div style={{ display: 'grid', gap: 22 }}>
                    {leadershipActions.map((la, i) => (
                        <div key={i} style={{ display: 'grid', gap: 10 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: la.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--tof-text)' }}>Voor de {la.persona}</span>
                            </div>
                            <div style={{ paddingLeft: 16, display: 'grid', gap: 8 }}>
                                {la.items.map((item, j) => (
                                    <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <div style={{ width: 20, height: 20, borderRadius: 999, background: `${la.color}18`, border: `1px solid ${la.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: la.color, flexShrink: 0, marginTop: 1 }}>
                                            {j + 1}
                                        </div>
                                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.68, color: 'var(--tof-text-soft)' }}>{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </DashCard>

            {/* Module 3 teaser compact */}
            <Module3TeaserCompact setPage={setPage} />
        </div>
    );
}

// ─── TENSION CARD ─────────────────────────────────────────────────────────────

function TensionCard({ tension, scores, totalScore }) {
    const [open, setOpen] = useState(false);
    const pctA = totalScore > 0 ? Math.round(((scores[tension.a] || 0) / totalScore) * 100) : 0;
    const pctB = totalScore > 0 ? Math.round(((scores[tension.b] || 0) / totalScore) * 100) : 0;
    const archA = getArchetype(tension.a);
    const archB = getArchetype(tension.b);
    return (
        <div style={{ background: 'var(--tof-surface)', borderRadius: 16, border: '1px solid var(--tof-border)', boxShadow: 'var(--tof-shadow)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 22px', display: 'grid', gap: 12, cursor: 'pointer', borderTop: '4px solid #C7A24A' }} onClick={() => setOpen(o => !o)}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <InfoBoxLabel>⚡ Spanningsveld</InfoBoxLabel>
                    <span style={{ fontSize: 13, color: 'var(--tof-text-muted)', transform: open ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s ease' }}>▾</span>
                </div>
                <h3 style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 19, lineHeight: 1.1, color: 'var(--tof-text)' }}>{tension.label}</h3>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    <PersonaPill name={archA?.name || tension.a} pct={pctA} color={PERSONA_COLORS[tension.a]} />
                    <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>↔</span>
                    <PersonaPill name={archB?.name || tension.b} pct={pctB} color={PERSONA_COLORS[tension.b]} />
                </div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.72, color: 'var(--tof-text-soft)' }}>{tension.desc}</p>
            </div>
            {open && (
                <div style={{ borderTop: '1px solid var(--tof-border)', padding: '16px 22px', display: 'grid', gap: 14, background: 'var(--tof-surface-soft)' }}>
                    <div>
                        <InfoBoxLabel>Risico</InfoBoxLabel>
                        <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.7, color: 'var(--tof-text-soft)' }}>{tension.risk}</p>
                    </div>
                    <div>
                        <InfoBoxLabel>Leiderschapsadvies</InfoBoxLabel>
                        <p style={{ margin: '6px 0 0', fontSize: 14, lineHeight: 1.7, color: 'var(--tof-text-soft)' }}>{tension.leadership}</p>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── DYNAMICS AXIS ────────────────────────────────────────────────────────────

function DynamicsAxis({ axis }) {
    const total = axis.lv + axis.rv || 1;
    const lPct = Math.round((axis.lv / total) * 100);
    const rPct = 100 - lPct;
    const imbalance = Math.abs(axis.lv - axis.rv) > 20;
    return (
        <div style={{ display: 'grid', gap: 9 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tof-text)' }}>{axis.label}</span>
                {imbalance && <span style={{ fontSize: 11, fontWeight: 700, color: '#C7A24A', background: 'rgba(199,162,74,0.12)', padding: '2px 8px', borderRadius: 999, border: '1px solid rgba(199,162,74,0.25)' }}>Disbalans</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)', minWidth: 58, textAlign: 'right' }}>{axis.left}</span>
                <div style={{ flex: 1, height: 10, background: 'var(--tof-border)', borderRadius: 999, overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${lPct}%`, height: '100%', background: 'var(--tof-accent-rose)', borderRadius: '999px 0 0 999px' }} />
                    <div style={{ width: `${rPct}%`, height: '100%', background: 'var(--tof-accent-sage)', borderRadius: '0 999px 999px 0' }} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--tof-text-muted)', minWidth: 58 }}>{axis.right}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 68, paddingRight: 68 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tof-accent-rose)', fontVariantNumeric: 'tabular-nums' }}>{lPct}%</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--tof-accent-sage)', fontVariantNumeric: 'tabular-nums' }}>{rPct}%</span>
            </div>
            <div style={{ background: imbalance ? 'rgba(199,162,74,0.06)' : 'var(--tof-surface-soft)', border: `1px solid ${imbalance ? 'rgba(199,162,74,0.2)' : 'var(--tof-border)'}`, borderRadius: 10, padding: '11px 14px', display: 'grid', gap: 4 }}>
                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.68, color: 'var(--tof-text-soft)' }}>{axis.desc}</p>
                <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: imbalance ? '#C7A24A' : 'var(--tof-text-muted)', fontStyle: 'italic' }}>{axis.tension}</p>
            </div>
        </div>
    );
}

// ─── MODULE 3 TEASER (COMPACT) ────────────────────────────────────────────────

function Module3TeaserCompact({ setPage }) {
    return (
        <div style={{ borderRadius: 14, border: '1px solid var(--tof-border)', overflow: 'hidden', boxShadow: '0 8px 24px rgba(31,31,31,0.07)' }}>
            <div style={{ background: 'var(--tof-accent-rose)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Module 3</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', display: 'inline-block' }} />
                    <span style={{ fontSize: 13, fontFamily: 'var(--tof-font-heading)', fontStyle: 'italic', color: '#fff' }}>Strategisch Team- & Werkplekinzicht</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>Op aanvraag</span>
            </div>
            <div style={{ background: 'var(--tof-accent-sage)', padding: '20px 20px 22px', display: 'grid', gap: 14 }}>
                <p style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 'clamp(16px, 2.2vw, 21px)', color: '#fff', lineHeight: 1.15 }}>
                    Van teamdynamiek naar werkplekstrategie voor de komende jaren.
                </p>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'rgba(255,255,255,0.75)' }}>
                    Module 3 verbindt de inzichten uit dit team met de bredere organisatieambitie en vertaalt dat naar concrete keuzes voor werkplek en leiderschap.
                </p>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a href="https://www.tof.services" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 999, background: '#fff', color: 'var(--tof-accent-sage)', fontWeight: 700, fontSize: 13, textDecoration: 'none', fontFamily: 'var(--tof-font-body)' }}>
                        Meer over Module 3 →
                    </a>
                    <a href="mailto:hello@tof.services" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 999, background: 'transparent', color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', fontFamily: 'var(--tof-font-body)' }}>
                        Sessie aanvragen
                    </a>
                </div>
            </div>
        </div>
    );
}

// ─── GEDEELDE UI COMPONENTEN ──────────────────────────────────────────────────

function TabBar({ tabs, activeTab, onChange, accentColor = 'var(--tof-accent-rose)' }) {
    return (
        <div style={{ display: 'flex', gap: 4, background: 'var(--tof-surface-soft)', borderRadius: 12, padding: 4, flexWrap: 'wrap' }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    style={{
                        flex: '1 1 auto', padding: '9px 12px', borderRadius: 9, border: 'none',
                        background: activeTab === tab.id ? 'var(--tof-surface)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--tof-text)' : 'var(--tof-text-muted)',
                        fontWeight: activeTab === tab.id ? 700 : 400, fontSize: 13, cursor: 'pointer',
                        fontFamily: 'var(--tof-font-body)', transition: 'all 0.15s ease',
                        boxShadow: activeTab === tab.id ? '0 1px 4px rgba(31,31,31,0.08)' : 'none',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
}

function TabSummaryCard({ accentColor, eyebrow, title, desc, onClick }) {
    return (
        <button onClick={onClick} style={{ display: 'grid', gap: 8, padding: '17px 19px', borderRadius: 14, background: 'var(--tof-surface)', border: '1px solid var(--tof-border)', borderTop: `3px solid ${accentColor}`, boxShadow: 'var(--tof-shadow)', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--tof-font-body)', alignContent: 'start' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 24px rgba(31,31,31,0.10)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = 'var(--tof-shadow)'}
        >
            <InfoBoxLabel>{eyebrow}</InfoBoxLabel>
            <div style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 17, lineHeight: 1.15, color: 'var(--tof-text)' }}>{title}</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>{desc}</p>
            <div style={{ fontSize: 12, color: accentColor, fontWeight: 600, marginTop: 2 }}>Bekijk →</div>
        </button>
    );
}

function DashCard({ title, eyebrow, children, borderTopColor = 'var(--tof-accent-sage)' }) {
    return (
        <div style={{ background: 'var(--tof-surface)', borderRadius: 16, padding: '20px 22px', borderTop: `4px solid ${borderTopColor}`, border: '1px solid var(--tof-border)', boxShadow: 'var(--tof-shadow)', display: 'grid', gap: 13, alignContent: 'start' }}>
            {eyebrow && <InfoBoxLabel>{eyebrow}</InfoBoxLabel>}
            {title && <h2 style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 21, lineHeight: 1.1, color: 'var(--tof-text)' }}>{title}</h2>}
            {children}
        </div>
    );
}

function PersonaPill({ name, pct, color }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 999, background: `${color}15`, border: `1px solid ${color}40`, fontSize: 13, fontWeight: 600, color }}>
            {name} <span style={{ fontWeight: 400, color: `${color}99`, fontSize: 12 }}>{pct}%</span>
        </div>
    );
}

function MetaBadge({ children, accent }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 11px', borderRadius: 999, fontSize: 12, fontWeight: 500, color: accent || 'var(--tof-text-muted)', background: 'var(--tof-surface-soft)', border: `1px solid ${accent ? `${accent}33` : 'var(--tof-border)'}` }}>
            {children}
        </div>
    );
}

function StatusPill({ children, color }) {
    return (
        <div style={{ display: 'inline-flex', alignItems: 'center', padding: '4px 11px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 0.8, color, background: `${color}18`, border: `1px solid ${color}40`, whiteSpace: 'nowrap' }}>
            {children}
        </div>
    );
}

function InfoBox({ children }) {
    return (
        <div style={{ background: 'var(--tof-surface-soft)', borderRadius: 10, padding: '11px 13px', border: '1px solid var(--tof-border)', display: 'grid', gap: 5 }}>
            {children}
        </div>
    );
}

function InfoBoxLabel({ children }) {
    return (
        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 700, color: 'var(--tof-text-muted)' }}>
            {children}
        </div>
    );
}

const s = {
    headingXL: { margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.05, color: 'var(--tof-text)' },
    headingMD: { margin: '0 0 10px', fontFamily: 'var(--tof-font-heading)', fontSize: 'clamp(20px, 3vw, 28px)', lineHeight: 1.1, color: 'var(--tof-text)' },
    body: { margin: 0, color: 'var(--tof-text-soft)', lineHeight: 1.7, fontSize: 15 },
    bodySmall: { margin: 0, color: 'var(--tof-text-soft)', lineHeight: 1.7, fontSize: 14 },
    twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 12, alignItems: 'start' },
};
