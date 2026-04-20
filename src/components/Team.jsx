/**
 * Team.jsx — Module 1: Team Insight & Quick Wins
 *
 * UX: tab-navigatie binnen de pagina. Vier tabs, elk één scherm.
 * Geen eindeloos scrollen — de gebruiker ziet altijd precies één onderwerp.
 *
 * Tabs:
 *   1. Overzicht     — header + samenvatting + betrouwbaarheid + navigatie
 *   2. Samenstelling — persona-verdeling + clusterbalans
 *   3. Werkplek      — werkplekbehoefte + top-3 toelichting
 *   4. Kansen        — quick wins + teamleden
 */

import React, { useMemo, useState } from 'react';
import { ARCHETYPES } from '../data';
import { hasFullTeamAccess, isMakerAccess } from '../utils/access';
import { PageShell, PrimaryButton, SecondaryButton, SectionEyebrow } from '../ui/AppShell';

// ─── CONSTANTEN ───────────────────────────────────────────────────────────────

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

const TABS = [
    { id: 'overview', label: 'Overzicht' },
    { id: 'composition', label: 'Samenstelling' },
    { id: 'workplace', label: 'Werkplek' },
    { id: 'wins', label: 'Kansen' },
];

// ─── DATA HELPERS ─────────────────────────────────────────────────────────────

function getArchetype(id) {
    return ARCHETYPES.find((a) => a.id === id) || null;
}

function resolveTeamName(selectedTeam) {
    if (!selectedTeam) return 'jouw team';
    if (typeof selectedTeam === 'string') return selectedTeam;
    return selectedTeam.team || selectedTeam.organization || 'jouw team';
}

function buildPersonaScores(teamResponses) {
    const scores = {};
    teamResponses.forEach((r) => {
        const full = r?.full_scores || {};
        if (Object.keys(full).length > 0) {
            Object.entries(full).forEach(([k, v]) => { scores[k] = (scores[k] || 0) + Number(v || 0); });
            return;
        }
        if (r?.primary_archetype) scores[r.primary_archetype] = (scores[r.primary_archetype] || 0) + 3;
        if (r?.secondary_archetype) scores[r.secondary_archetype] = (scores[r.secondary_archetype] || 0) + 2;
        if (r?.tertiary_archetype) scores[r.tertiary_archetype] = (scores[r.tertiary_archetype] || 0) + 1;
    });
    return scores;
}

function buildWorkplaceSummary(sorted, totalScore) {
    const totals = { focus: 0, work: 0, hybride: 0, meeting: 0, project: 0, team: 0, learning: 0, retreat: 0, social: 0 };
    sorted.forEach(([id, value]) => {
        const profile = getArchetype(id)?.bricksProfile || {};
        Object.keys(totals).forEach((k) => { totals[k] += Number(profile[k] || 0) * Number(value || 0); });
    });
    const grand = Object.values(totals).reduce((s, v) => s + v, 0);
    return Object.entries(totals)
        .map(([key, value]) => ({ key, label: WORKPLACE_LABELS[key], color: WORKPLACE_COLORS[key], value, percentage: grand > 0 ? Math.round((value / grand) * 100) : 0 }))
        .filter((i) => i.value > 0)
        .sort((a, b) => b.value - a.value);
}

function buildQuickWins(sorted, workplaceSummary) {
    const wins = [];
    const top = sorted[0]?.[0];
    const second = sorted[1]?.[0];
    const wp = workplaceSummary[0]?.key;
    const personaWins = {
        presteerder: 'Maak resultaten zichtbaar — maar bewaar bewust ruimte voor reflectie en herstel.',
        verbinder: 'Gebruik ontmoeting als werkmoment. Plan samenwerkingsrituelen expliciet in.',
        teamspeler: 'Zorg dat besluitvorming niet alleen via consensus verloopt. Scherpte voorkomt vertraging.',
        denker: 'Vermijd vergaderdruk op complexe vragen. Geef ruimte voor verdieping voor afstemming.',
        maker: 'Faciliteer autonomie en eigenaarschap. Micromanagement dempt juist de energie.',
        vernieuwer: 'Reserveer bewust tijd voor experiment — ook als de werkdruk hoog is.',
        groeier: 'Maak leren onderdeel van het werk, niet iets dat ernaast plaatsvindt.',
        zekerzoeker: 'Investeer in duidelijkheid over rollen, verwachtingen en prioriteiten.',
    };
    if (top && personaWins[top]) wins.push(personaWins[top]);
    if (second && second !== top) {
        if (['verbinder', 'teamspeler'].includes(second) && ['presteerder', 'maker'].includes(top))
            wins.push('De verbinders in dit team signaleren eerder wat er speelt. Combineer resultaatgerichtheid met relationele check-ins.');
        else if (['denker', 'zekerzoeker'].includes(second))
            wins.push('Zorg voor helderheid voordat actie wordt gevraagd. Onduidelijkheid kost dit team meer energie dan zichtbaar is.');
        else if (['vernieuwer', 'groeier'].includes(second))
            wins.push('Maak ruimte voor de vernieuwende en lerende krachten in dit team — ook buiten projecten om.');
    }
    const workplaceWins = {
        focus: 'Investeer in ononderbroken werkomgevingen. Dit team presteert beter met minder ruis.',
        team: 'Ontwerp de werkplek rondom ontmoeting. Informele nabijheid versterkt de samenwerking.',
        meeting: 'Maak overlegplekken klein en doelgericht. Grote vergaderzalen remmen dit team.',
        project: 'Flexibele creatieve zones sluiten aan bij de werkstijl van dit team.',
        learning: 'Zorg voor zichtbare leer- en kenniszones. Dit team haalt energie uit kennisdeling.',
        social: 'Informele ontmoetingsplekken zijn voor dit team geen bijzaak — ze zijn werkvoorwaarde.',
        work: 'Zorg voor ergonomische, rustige standaardwerkplekken met zekerheid over beschikbaarheid.',
        hybride: 'Zorg voor technische kwaliteit op alle hybride werkplekken.',
        retreat: 'Bied stille herstelplekken aan. Dit team heeft momenten van rust nodig.',
    };
    if (wp && workplaceWins[wp]) wins.push(workplaceWins[wp]);
    wins.push('Gebruik dit dashboard als startpunt voor een teamgesprek — niet als eindoordeel.');
    return wins.slice(0, 4);
}

function buildTeamSummary(sorted, totalScore, workplaceSummary) {
    const topId = sorted[0]?.[0];
    const topPct = totalScore > 0 ? Math.round(((sorted[0]?.[1] || 0) / totalScore) * 100) : 0;
    const top = topId ? getArchetype(topId) : null;
    const wp1 = workplaceSummary[0];
    const wp2 = workplaceSummary[1];
    if (!top) return 'Dit dashboard laat zien hoe werkstijlen verdeeld zijn en waar directe kansen liggen.';
    const dominated = topPct > 38;
    const wording = dominated ? `sterk gedomineerd door de ${top.name}` : `het sterkst gekleurd door de ${top.name}`;
    const workStr = wp1 && wp2 ? `${wp1.label.toLowerCase()} en ${wp2.label.toLowerCase()}` : wp1 ? wp1.label.toLowerCase() : 'een gebalanceerde werkomgeving';
    return `Dit team wordt ${wording}-werkstijl. De primaire werkplekbehoefte ligt bij ${workStr}. Dat bepaalt waar energie ontstaat en waar wrijving kan optreden.`;
}

function getReliability(count) {
    if (count < 3) return { label: 'Eerste signalen', color: '#C7A24A', pct: 18 };
    if (count < 6) return { label: 'Opkomend patroon', color: '#C28D6B', pct: 42 };
    if (count <= 15) return { label: 'Betrouwbaar beeld', color: '#7F9A8A', pct: 72 };
    return { label: 'Sterk patroon', color: '#6E8872', pct: 100 };
}

function buildClusterBalance(sorted, totalScore) {
    const clusters = {
        creatie: { label: 'Creatie & groei', ids: ['maker', 'groeier', 'vernieuwer'], color: '#D08C5B', score: 0 },
        resultaat: { label: 'Resultaat & focus', ids: ['presteerder'], color: '#C7A24A', score: 0 },
        verbinding: { label: 'Verbinding & team', ids: ['verbinder', 'teamspeler'], color: '#7F9A8A', score: 0 },
        structuur: { label: 'Structuur & zekerheid', ids: ['denker', 'zekerzoeker'], color: '#6F7F92', score: 0 },
    };
    sorted.forEach(([id, value]) => {
        Object.values(clusters).forEach((cl) => { if (cl.ids.includes(id)) cl.score += Number(value || 0); });
    });
    const grand = Object.values(clusters).reduce((s, c) => s + c.score, 0) || 1;
    return Object.entries(clusters).map(([key, cl]) => ({ key, ...cl, pct: Math.round((cl.score / grand) * 100) })).sort((a, b) => b.pct - a.pct);
}

// ─── HOOFDCOMPONENT ──────────────────────────────────────────────────────────

export default function Team({ setPage, teamResponses = [], selectedTeam = null }) {
    const hasAccess = hasFullTeamAccess() || isMakerAccess();
    const teamName = resolveTeamName(selectedTeam);
    const [activeTab, setActiveTab] = useState('overview');

    const scores = useMemo(() => buildPersonaScores(teamResponses), [teamResponses]);
    const sorted = useMemo(() => Object.entries(scores).sort((a, b) => b[1] - a[1]), [scores]);
    const totalScore = useMemo(() => Object.values(scores).reduce((a, b) => a + b, 0), [scores]);
    const workplaceSummary = useMemo(() => buildWorkplaceSummary(sorted, totalScore), [sorted, totalScore]);
    const quickWins = useMemo(() => buildQuickWins(sorted, workplaceSummary), [sorted, workplaceSummary]);
    const summary = useMemo(() => buildTeamSummary(sorted, totalScore, workplaceSummary), [sorted, totalScore, workplaceSummary]);
    const reliability = useMemo(() => getReliability(teamResponses.length), [teamResponses.length]);
    const clusterBalance = useMemo(() => buildClusterBalance(sorted, totalScore), [sorted, totalScore]);

    const topPersonaId = sorted[0]?.[0] || null;
    const topPersona = topPersonaId ? getArchetype(topPersonaId) : null;
    const topPct = totalScore > 0 ? Math.round(((sorted[0]?.[1] || 0) / totalScore) * 100) : 0;
    const topWorkplace = workplaceSummary[0];
    const secondWorkplace = workplaceSummary[1];

    const topIds = sorted.slice(0, 3).map(([id]) => id);
    const hasTension = (topIds.includes('presteerder') && topIds.includes('verbinder')) ||
        (topIds.includes('maker') && topIds.includes('zekerzoeker')) ||
        (topIds.includes('denker') && topIds.includes('presteerder')) ||
        (topIds.includes('vernieuwer') && topIds.includes('zekerzoeker'));
    const tensionHint = hasTension
        ? `Dit team heeft een opvallende combinatie van werkstijlen die spanningsvelden creëren — in tempo, besluitvorming of samenwerking.`
        : `In de samenstelling van dit team zitten patronen die pas zichtbaar worden als je naar het gedrag kijkt.`;

    // ── Guards ────────────────────────────────────────────────────────────────
    if (!hasAccess) {
        return (
            <PageShell padding="20px 16px 32px">
                <DashCard borderTopColor="var(--tof-accent-rose)">
                    <SectionEyebrow>Team Insight</SectionEyebrow>
                    <h1 style={s.headingXL}>🔒 Toegang vereist</h1>
                    <p style={s.body}>Deze omgeving is alleen beschikbaar met een geldige toegangscode.</p>
                    <PrimaryButton onClick={() => setPage('team')}>Terug naar uitleg</PrimaryButton>
                </DashCard>
            </PageShell>
        );
    }

    if (!teamResponses || teamResponses.length === 0) {
        return (
            <PageShell padding="24px 20px 36px">
                <DashCard borderTopColor="var(--tof-accent-rose)">
                    <h2 style={s.headingMD}>Geen teamdata beschikbaar</h2>
                    <p style={s.body}>Voor deze code zijn nog geen teamreacties gevonden.</p>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8 }}>
                        <PrimaryButton onClick={() => setPage('team')}>Terug naar teamomgeving</PrimaryButton>
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
            <div style={{ paddingTop: 20, paddingBottom: 0 }}>
                <DashCard borderTopColor="var(--tof-accent-rose)">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                        <SectionEyebrow>Module 1 · Team Insight & Quick Wins</SectionEyebrow>
                        <StatusPill color={reliability.color}>{reliability.label}</StatusPill>
                    </div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        <h1 style={s.headingXL}>{teamName}</h1>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <MetaBadge>👥 {teamResponses.length} responsen</MetaBadge>
                            {topPersona && <MetaBadge accent={PERSONA_COLORS[topPersonaId]}>{topPersona.name} · {topPct}%</MetaBadge>}
                            {topWorkplace && <MetaBadge accent={topWorkplace.color}>{topWorkplace.label}</MetaBadge>}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <SecondaryButton onClick={() => setPage('teamselector')}>Ander team</SecondaryButton>
                        <SecondaryButton onClick={() => setPage('home')}>Home</SecondaryButton>
                    </div>
                </DashCard>
            </div>

            {/* ── Sticky tab-balk — kleeft aan bovenkant bij scrollen ── */}
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
                    borderTop: '3px solid var(--tof-accent-rose)',
                    borderRadius: 14,
                    padding: '10px 16px',
                    display: 'grid',
                    gap: 8,
                    boxShadow: '0 4px 16px rgba(31,31,31,0.08)',
                }}>
                    {/* Compacte teamnaam + tabs op één rij op desktop */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 15, fontWeight: 500, color: 'var(--tof-text)', flexShrink: 0 }}>
                            {teamName}
                        </span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <TabBar tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tab content ──────────────────────────────────────── */}
            <div style={{ display: 'grid', gap: 16, paddingBottom: 40 }}>

                {activeTab === 'overview' && (
                    <TabOverview
                        summary={summary}
                        reliability={reliability}
                        teamResponses={teamResponses}
                        topPersona={topPersona}
                        topPersonaId={topPersonaId}
                        topWorkplace={topWorkplace}
                        secondWorkplace={secondWorkplace}
                        hasTension={hasTension}
                        tensionHint={tensionHint}
                        setPage={setPage}
                        onTabChange={setActiveTab}
                    />
                )}

                {activeTab === 'composition' && (
                    <TabComposition
                        sorted={sorted}
                        totalScore={totalScore}
                        clusterBalance={clusterBalance}
                    />
                )}

                {activeTab === 'workplace' && (
                    <TabWorkplace
                        workplaceSummary={workplaceSummary}
                        topWorkplace={topWorkplace}
                        secondWorkplace={secondWorkplace}
                        topPersonaId={topPersonaId}
                    />
                )}

                {activeTab === 'wins' && (
                    <TabWins
                        quickWins={quickWins}
                        teamResponses={teamResponses}
                        hasTension={hasTension}
                        tensionHint={tensionHint}
                        topPersonaName={topPersona?.name}
                        setPage={setPage}
                    />
                )}

            </div>
        </PageShell>
    );
}

// ─── TAB 1: OVERZICHT ─────────────────────────────────────────────────────────

function TabOverview({ summary, reliability, teamResponses, topPersona, topPersonaId, topWorkplace, secondWorkplace, hasTension, tensionHint, setPage, onTabChange }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>

            {/* Samenvattingszin */}
            <DashCard borderTopColor="var(--tof-accent-rose)">
                <InfoBoxLabel>Wat laat dit team zien?</InfoBoxLabel>
                <p style={{ ...s.body, fontSize: 15, lineHeight: 1.78 }}>{summary}</p>

                {/* Betrouwbaarheidsbalk */}
                <div style={{ display: 'grid', gap: 5 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                        <span style={{ color: 'var(--tof-text-soft)' }}>Betrouwbaarheid</span>
                        <span style={{ color: reliability.color, fontWeight: 600 }}>{reliability.label}</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--tof-border)', borderRadius: 999, overflow: 'hidden' }}>
                        <div style={{ width: `${reliability.pct}%`, height: '100%', background: reliability.color, borderRadius: 999 }} />
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: 'var(--tof-text-muted)' }}>
                        Op basis van {teamResponses.length} {teamResponses.length === 1 ? 'respons' : 'responsen'}.
                        {teamResponses.length < 6 && ' Meer deelname versterkt dit beeld.'}
                    </p>
                </div>
            </DashCard>

            {/* Drie snelkoppelingen naar de andere tabs */}
            <div style={s.twoCol}>
                <TabSummaryCard
                    accentColor={topPersona ? PERSONA_COLORS[topPersonaId] : 'var(--tof-accent-rose)'}
                    eyebrow="Samenstelling"
                    title={topPersona ? `Dominant: ${topPersona.name}` : 'Werkstijlen'}
                    desc="Hoe de persona's zich verhouden en op welke clusters dit team leunt."
                    onClick={() => onTabChange('composition')}
                />
                <TabSummaryCard
                    accentColor={topWorkplace?.color || 'var(--tof-accent-sage)'}
                    eyebrow="Werkplek"
                    title={topWorkplace ? topWorkplace.label : 'Werkplekbehoefte'}
                    desc="Welke werkomgeving dit team nodig heeft om goed te functioneren."
                    onClick={() => onTabChange('workplace')}
                />
                <TabSummaryCard
                    accentColor={hasTension ? '#C7A24A' : 'var(--tof-accent-sage)'}
                    eyebrow="Kansen"
                    title="Quick wins"
                    desc="Vier concrete stappen die dit team direct verder helpen."
                    onClick={() => onTabChange('wins')}
                />
            </div>

            {/* Module 2 teaser — compact */}
            <CompactModule2Teaser hasTension={hasTension} tensionHint={tensionHint} setPage={setPage} />
        </div>
    );
}

// ─── TAB 2: SAMENSTELLING ─────────────────────────────────────────────────────

function TabComposition({ sorted, totalScore, clusterBalance }) {
    return (
        <div style={s.twoCol}>

            <DashCard title="Werkstijlen" borderTopColor="var(--tof-accent-rose)">
                <p style={s.bodySmall}>Verdeling op basis van de ingevulde profielen.</p>
                <div style={{ display: 'grid', gap: 13 }}>
                    {sorted.filter(([, v]) => v > 0).map(([id, value]) => {
                        const persona = getArchetype(id);
                        const pct = totalScore > 0 ? Math.round((value / totalScore) * 100) : 0;
                        return (
                            <PersonaBar key={id} name={persona?.name || id} pct={pct} color={PERSONA_COLORS[id] || '#B05252'} tagline={persona?.short} />
                        );
                    })}
                </div>
            </DashCard>

            <DashCard title="Clusterbalans" borderTopColor="var(--tof-accent-sage)">
                <p style={s.bodySmall}>Werkstijlen gegroepeerd — laat zien waar dit team op leunt.</p>
                <div style={{ display: 'grid', gap: 16 }}>
                    {clusterBalance.map((cl) => (
                        <ClusterBar key={cl.key} cluster={cl} />
                    ))}
                </div>
                {clusterBalance[0] && (
                    <InfoBox>
                        <InfoBoxLabel>Leidend cluster</InfoBoxLabel>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.72, color: 'var(--tof-text-soft)' }}>
                            <strong style={{ color: 'var(--tof-text)' }}>{clusterBalance[0].label}</strong> is het meest aanwezige cluster ({clusterBalance[0].pct}%).{' '}
                            {clusterBalance[clusterBalance.length - 1].pct < 10
                                ? <>Het cluster <strong style={{ color: 'var(--tof-text)' }}>{clusterBalance[clusterBalance.length - 1].label}</strong> is nauwelijks vertegenwoordigd — een blinde vlek.</>
                                : <>De clusters zijn gespreid, wat breedte biedt maar bewuste coördinatie vraagt.</>
                            }
                        </p>
                    </InfoBox>
                )}
            </DashCard>
        </div>
    );
}

// ─── TAB 3: WERKPLEK ──────────────────────────────────────────────────────────

function TabWorkplace({ workplaceSummary, topWorkplace, secondWorkplace, topPersonaId }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>
            <DashCard title="Werkplekbehoefte" borderTopColor="var(--tof-accent-sage)">
                <p style={s.bodySmall}>Afgeleid uit de persoonlijke profielen — welke werkplekken heeft dit team nodig?</p>

                <div style={s.twoCol}>
                    {/* Percentagebalken */}
                    <div style={{ display: 'grid', gap: 11 }}>
                        {workplaceSummary.map((item) => (
                            <WorkplaceRow key={item.key} item={item} />
                        ))}
                    </div>

                    {/* Top 3 toelichting */}
                    <div style={{ display: 'grid', gap: 10, alignContent: 'start' }}>
                        {workplaceSummary.slice(0, 3).map((item, i) => (
                            <div key={item.key} style={{ padding: '13px 15px', background: i === 0 ? 'var(--tof-surface-soft)' : 'transparent', border: '1px solid transparent', borderLeft: `3px solid ${item.color}`, borderRadius: 10 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--tof-text)', marginBottom: 5 }}>
                                    {['①', '②', '③'][i]} {item.label} · {item.percentage}%
                                </div>
                                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.68, color: 'var(--tof-text-soft)' }}>
                                    {topPersonaId
                                        ? (getArchetype(topPersonaId)?.bricksProfileText?.[item.key] || 'Scoort hoog voor dit team op basis van de aanwezige werkstijlen.')
                                        : 'Scoort hoog voor dit team op basis van de aanwezige werkstijlen.'
                                    }
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {topWorkplace && secondWorkplace && (
                    <InfoBox>
                        <InfoBoxLabel>Conclusie</InfoBoxLabel>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.72, color: 'var(--tof-text-soft)' }}>
                            Dit team heeft de meeste behoefte aan <strong style={{ color: 'var(--tof-text)' }}>{topWorkplace.label.toLowerCase()}</strong> en <strong style={{ color: 'var(--tof-text)' }}>{secondWorkplace.label.toLowerCase()}</strong>. Dat zijn functionele randvoorwaarden, geen wensen.
                        </p>
                    </InfoBox>
                )}
            </DashCard>
        </div>
    );
}

// ─── TAB 4: KANSEN ────────────────────────────────────────────────────────────

function TabWins({ quickWins, teamResponses, hasTension, tensionHint, topPersonaName, setPage }) {
    return (
        <div style={{ display: 'grid', gap: 14 }}>

            <DashCard title="Quick wins" borderTopColor="var(--tof-accent-rose)" eyebrow="Wat direct helpt">
                <p style={s.bodySmall}>Vier concrete stappen, afgeleid uit de samenstelling en werkplekbehoefte.</p>
                <div style={{ display: 'grid', gap: 13 }}>
                    {quickWins.map((win, i) => (
                        <QuickWinRow key={i} number={i + 1} text={win} />
                    ))}
                </div>
            </DashCard>

            <DashCard title="Teamleden" borderTopColor="var(--tof-accent-sage)" eyebrow="Overzicht">
                <div style={{ display: 'grid', gap: 0 }}>
                    {teamResponses.map((r, i) => (
                        <MemberRow key={i} response={r} isLast={i === teamResponses.length - 1} />
                    ))}
                </div>
                {teamResponses.length < 5 && (
                    <InfoBox>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.68, color: 'var(--tof-text-soft)' }}>
                            <strong style={{ color: 'var(--tof-text)' }}>Tip:</strong> Met meer responsen wordt het teambeeld betrouwbaarder.
                        </p>
                    </InfoBox>
                )}
            </DashCard>

            {/* Module 2 teaser — compact */}
            <CompactModule2Teaser hasTension={hasTension} tensionHint={tensionHint} setPage={setPage} />
        </div>
    );
}

// ─── COMPACTE MODULE 2 TEASER ─────────────────────────────────────────────────

function CompactModule2Teaser({ hasTension, tensionHint, setPage }) {
    return (
        <div style={{
            borderRadius: 14,
            border: '1px solid var(--tof-border)',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(31,31,31,0.07)',
        }}>
            {/* Rose topper */}
            <div style={{ background: 'var(--tof-accent-rose)', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>Module 2</span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', display: 'inline-block' }} />
                    <span style={{ fontSize: 13, fontFamily: 'var(--tof-font-heading)', fontStyle: 'italic', color: '#fff' }}>Team Dynamics Sessie</span>
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.12)', padding: '3px 10px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.2)' }}>
                    Vervolgtraject
                </span>
            </div>

            {/* Sage body — compact */}
            <div style={{ background: 'var(--tof-accent-sage)', padding: '20px 20px 22px', display: 'grid', gap: 14 }}>
                <p style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 'clamp(17px, 2.5vw, 22px)', color: '#fff', lineHeight: 1.15 }}>
                    Wat er écht speelt — dat laat dit dashboard nog niet zien.
                </p>
                <div style={{ borderLeft: `3px solid ${hasTension ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.25)'}`, paddingLeft: 14 }}>
                    <p style={{ margin: 0, fontSize: 14, lineHeight: 1.68, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic' }}>
                        {tensionHint}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setPage('teamdynamics')}
                        style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 20px', borderRadius: 999, background: '#fff', color: 'var(--tof-accent-sage)', fontWeight: 700, fontSize: 13, border: 'none', cursor: 'pointer', fontFamily: 'var(--tof-font-body)', letterSpacing: 0.2 }}
                    >
                        Naar Module 2 →
                    </button>
                    <a href="mailto:hello@tof.services" style={{ display: 'inline-flex', alignItems: 'center', padding: '10px 18px', borderRadius: 999, background: 'transparent', color: 'rgba(255,255,255,0.8)', fontWeight: 500, fontSize: 13, textDecoration: 'none', border: '1px solid rgba(255,255,255,0.25)', fontFamily: 'var(--tof-font-body)' }}>
                        Sessie aanvragen
                    </a>
                </div>
            </div>
        </div>
    );
}

// ─── TAB OVERZICHT KAART ──────────────────────────────────────────────────────

function TabSummaryCard({ accentColor, eyebrow, title, desc, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'grid',
                gap: 8,
                padding: '18px 20px',
                borderRadius: 14,
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderTop: `3px solid ${accentColor}`,
                boxShadow: 'var(--tof-shadow)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--tof-font-body)',
                transition: 'box-shadow 0.15s ease',
                alignContent: 'start',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 24px rgba(31,31,31,0.10)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'var(--tof-shadow)'}
        >
            <InfoBoxLabel>{eyebrow}</InfoBoxLabel>
            <div style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 18, lineHeight: 1.15, color: 'var(--tof-text)' }}>{title}</div>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>{desc}</p>
            <div style={{ fontSize: 12, color: accentColor, fontWeight: 600, marginTop: 4 }}>Bekijk →</div>
        </button>
    );
}

// ─── GEDEELDE UI COMPONENTEN ──────────────────────────────────────────────────

function TabBar({ tabs, activeTab, onChange }) {
    return (
        <div style={{
            display: 'flex',
            gap: 4,
            background: 'var(--tof-surface-soft)',
            borderRadius: 12,
            padding: 4,
            flexWrap: 'wrap',
        }}>
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    style={{
                        flex: '1 1 auto',
                        padding: '9px 14px',
                        borderRadius: 9,
                        border: 'none',
                        background: activeTab === tab.id ? 'var(--tof-surface)' : 'transparent',
                        color: activeTab === tab.id ? 'var(--tof-text)' : 'var(--tof-text-muted)',
                        fontWeight: activeTab === tab.id ? 700 : 400,
                        fontSize: 13,
                        cursor: 'pointer',
                        fontFamily: 'var(--tof-font-body)',
                        transition: 'all 0.15s ease',
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

function DashCard({ title, eyebrow, children, borderTopColor = 'var(--tof-accent-sage)' }) {
    return (
        <div style={{ background: 'var(--tof-surface)', borderRadius: 16, padding: '20px 22px', borderTop: `4px solid ${borderTopColor}`, border: '1px solid var(--tof-border)', boxShadow: 'var(--tof-shadow)', display: 'grid', gap: 13, alignContent: 'start' }}>
            {eyebrow && <InfoBoxLabel>{eyebrow}</InfoBoxLabel>}
            {title && <h2 style={{ margin: 0, fontFamily: 'var(--tof-font-heading)', fontSize: 21, lineHeight: 1.1, color: 'var(--tof-text)' }}>{title}</h2>}
            {children}
        </div>
    );
}

function PersonaBar({ name, pct, color, tagline }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, fontSize: 14 }}>
                <span style={{ fontWeight: 600, color: 'var(--tof-text)' }}>{name}</span>
                <span style={{ color: 'var(--tof-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{pct}%</span>
            </div>
            <div style={{ height: 7, background: 'var(--tof-border)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 999 }} />
            </div>
            {tagline && pct >= 14 && (
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--tof-text-muted)', lineHeight: 1.5 }}>
                    {tagline.length > 85 ? tagline.slice(0, 83) + '…' : tagline}
                </p>
            )}
        </div>
    );
}

function ClusterBar({ cluster }) {
    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13 }}>
                <span style={{ fontWeight: 600, color: 'var(--tof-text)' }}>{cluster.label}</span>
                <span style={{ color: 'var(--tof-text-muted)', fontVariantNumeric: 'tabular-nums' }}>{cluster.pct}%</span>
            </div>
            <div style={{ height: 10, background: 'var(--tof-border)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: `${cluster.pct}%`, height: '100%', background: cluster.color, borderRadius: 999, opacity: 0.85 }} />
            </div>
        </div>
    );
}

function WorkplaceRow({ item }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '10px 1fr auto', gap: 11, alignItems: 'center', fontSize: 14, color: 'var(--tof-text-soft)' }}>
            <div style={{ width: 10, height: 10, borderRadius: 999, background: item.color, flexShrink: 0 }} />
            <span>{item.label}</span>
            <strong style={{ color: 'var(--tof-text)', fontVariantNumeric: 'tabular-nums', fontSize: 13 }}>{item.percentage}%</strong>
        </div>
    );
}

function QuickWinRow({ number, text }) {
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr', gap: 12, alignItems: 'start' }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: 'var(--tof-surface-soft)', border: '1px solid var(--tof-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--tof-accent-rose)', flexShrink: 0 }}>
                {number}
            </div>
            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.72, color: 'var(--tof-text-soft)', paddingTop: 4 }}>{text}</p>
        </div>
    );
}

function MemberRow({ response, isLast }) {
    const primaryId = response?.primary_archetype;
    const persona = primaryId ? getArchetype(primaryId) : null;
    const color = PERSONA_COLORS[primaryId] || '#CCC';
    const name = response?.name || response?.respondent_name || 'Anoniem';
    const secondary = response?.secondary_archetype ? getArchetype(response.secondary_archetype) : null;
    return (
        <div style={{ display: 'grid', gridTemplateColumns: '30px 1fr auto', gap: 11, alignItems: 'center', padding: '9px 0', borderBottom: isLast ? 'none' : '1px solid var(--tof-border)' }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: color, opacity: 0.85, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>
                {name.charAt(0).toUpperCase()}
            </div>
            <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--tof-text)' }}>{name}</div>
                {persona && <div style={{ fontSize: 12, color: 'var(--tof-text-muted)', marginTop: 1 }}>{persona.name}</div>}
            </div>
            {secondary && (
                <div style={{ fontSize: 11, color: 'var(--tof-text-muted)', padding: '3px 9px', borderRadius: 999, background: 'var(--tof-surface-soft)', border: '1px solid var(--tof-border)', whiteSpace: 'nowrap' }}>
                    + {secondary.name}
                </div>
            )}
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
    twoCol: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14, alignItems: 'start' },
};
