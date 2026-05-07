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

import { ARCHETYPES } from '../data';
import { hasTeamLevel, LEVEL_DYNAMICS, isAdminAccess } from '../utils/access';
import {
    getDynamics,
    getMaturity,
    getSignatureLine,
} from '../insights';
import { generateTeamDynamicsPDF } from '../utils/teamDynamicsPDF';

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
// SPANNINGSVELDEN — oplossingsgerichte titels + uitgeschreven advies
// =========================

const TENSION_PAIRS = [
    {
        a: 'presteerder', b: 'verbinder',
        label: 'Tempo en verbinding vragen om regie',
        desc: 'De presteerder stuurt op tempo en uitkomst, de verbinder op relatie en afstemming. Beide zijn nodig — maar zonder regie wisselen ze elkaar niet af, ze botsen.',
        risk: 'Besluiten worden snel genomen, maar draagvlak ontbreekt. De presteerder raakt geïrriteerd door wat hij ziet als vertraging. De verbinder voelt zich overruled. Frustratie stapelt zich aan beide kanten.',
        leadership: 'Maak per situatie expliciet wat leidend is: snelheid of verbinding. Niet als compromis, maar als bewuste keuze. Zo weet iedereen waarop wordt gestuurd, en waarom.',
    },
    {
        a: 'maker', b: 'zekerzoeker',
        label: 'Vrijheid en zekerheid vragen om kaders',
        desc: 'De maker wil experimenteren en snel bewegen, de zekerzoeker heeft helderheid en continuïteit nodig. Zonder duidelijke afspraken voelt het voor de één benauwd en voor de ander chaotisch.',
        risk: 'Onrust bij de zekerzoeker, frustratie bij de maker. Energie die naar het werk had moeten gaan, verdwijnt in intern conflict over werkwijze en aanpak.',
        leadership: 'Zorg voor stabiele kaders waarbinnen experimenteren normaal is. Zo houdt de zekerzoeker zijn houvast en krijgt de maker zijn ruimte — zonder dat één van beiden hoeft te buigen.',
    },
    {
        a: 'denker', b: 'presteerder',
        label: 'Diepgang en tempo vragen om ritme',
        desc: 'De denker wil begrijpen voordat hij beweegt. De presteerder wil bewegen voordat hij volledig begrijpt. Beide horen bij goede besluitvorming, maar in hetzelfde tempo gaan ze niet.',
        risk: 'De denker wordt buitengesloten van besluiten omdat hij niet snel genoeg meekomt. De presteerder neemt besluiten zonder voldoende inhoudelijke onderbouwing. Op termijn ondermijnt dat de kwaliteit van het werk én het vertrouwen in elkaar.',
        leadership: 'Reserveer denktijd vóór besluitvorming, niet erna. Maak duidelijk wanneer analyse leidend is en wanneer actie. Dat geeft beide werkstijlen het ritme dat ze nodig hebben.',
    },
    {
        a: 'vernieuwer', b: 'zekerzoeker',
        label: 'Vernieuwing en continuïteit vragen om timing',
        desc: 'De vernieuwer zoekt verandering, de zekerzoeker beschermt wat werkt. Beide perspectieven beschermen het team — voor verschillende risico\'s.',
        risk: 'Vernieuwers raken gefrustreerd door wat ze ervaren als rem op verandering. Zekerzoekers raken onrustig door instabiliteit. Vernieuwing wordt dan óf afgeremd óf doorgedrukt — geen van beide werkt.',
        leadership: 'Maak onderscheid tussen verbetering en vervanging. Betrek de zekerzoeker vroeg in veranderingstrajecten — niet om af te remmen, maar om risico\'s te benoemen die de vernieuwer over het hoofd ziet.',
    },
    {
        a: 'teamspeler', b: 'maker',
        label: 'Loyaliteit en autonomie vragen om eigenaarschap',
        desc: 'De teamspeler werkt vanuit gedeelde verantwoordelijkheid, de maker vanuit persoonlijke drang en autonomie. Allebei willen ze resultaat — maar via een ander pad.',
        risk: 'De teamspeler ervaart de maker als individualistisch en weinig collegiaal. De maker ervaart de teamspeler als remmend en politiek. Beiden trekken zich terug op hun eigen manier.',
        leadership: 'Definieer eigenaarschap expliciet per taak. Wie beslist, wie wordt geconsulteerd, wie informeert? Zo krijgt de maker zijn ruimte zonder dat de teamspeler het gevoel heeft buitengesloten te worden.',
    },
    {
        a: 'groeier', b: 'zekerzoeker',
        label: 'Ontwikkeling en stabiliteit vragen om verankering',
        desc: 'De groeier zoekt continu nieuwe uitdagingen, de zekerzoeker heeft baat bij een stabiele omgeving. Beide hebben gelijk — maar zonder verbinding worden hun ritmes elkaars tegenpool.',
        risk: 'De groeier ziet de zekerzoeker als conservatief en weinig ambitieus. De zekerzoeker ervaart de veranderingsdrang als stressvol en ondermijnend. Het team verliest zowel ontwikkeling als stabiliteit.',
        leadership: 'Koppel groeidoelen aan stabiele structuren. Laat zien dat ontwikkeling niet hetzelfde is als verandering om de verandering — en dat stabiliteit niet hetzelfde is als stilstand.',
    },
];

// =========================
// LEIDERSCHAP per persona — uitgeschreven adviezen
// =========================
// Elke actie bestaat uit een kernadvies (wat doe je) + een tweede zin (waarom werkt dit hier).

const LEADERSHIP_MAP = {
    presteerder: [
        'Maak prioriteiten concreet en zichtbaar. Presteerders verliezen energie als ze niet weten waar ze naartoe werken — een helder doel met meetbare voortgang houdt ze scherp.',
        'Erken voortgang en uitkomst actief. Stilte voelt voor een presteerder als afkeuring of desinteresse, ook als die er niet is.',
        'Stuur op resultaat, niet op drukte. Aanwezigheid en activiteit zeggen een presteerder weinig — alleen wat wordt opgeleverd telt voor hem.',
    ],
    verbinder: [
        'Vraag regelmatig hoe het echt gaat. Verbinders signaleren spanning eerder dan anderen, maar alleen als de ruimte er is om dat te delen.',
        'Gebruik de verbinder als vroege signaalgever. Wat zij oppikken in de wandelgangen, hoor jij pas drie weken later in een formeel gesprek — als je het al hoort.',
        'Maak ontmoeting onderdeel van het werk. Voor een verbinder is een goed gesprek geen pauze, maar de manier waarop het werk gedaan wordt.',
    ],
    maker: [
        'Geef richting op hoofdlijnen, laat ruimte in de aanpak. Een maker heeft een doel nodig, geen draaiboek — anders dooft de energie waarmee hij dingen voor elkaar krijgt.',
        'Beloon initiatief zichtbaar. Makers nemen risico door dingen op te pakken die nog niet zijn afgesproken — als dat wordt afgestraft of genegeerd, stoppen ze ermee.',
        'Maak experimenteren veilig. Makers leren door te doen, en doen betekent soms falen. Zonder die ruimte verlies je hun beste werk.',
    ],
    denker: [
        'Geef informatie op tijd en volledig. Een denker die op het laatste moment moet reageren, levert niet zijn beste werk — en weet dat zelf ook.',
        'Bescherm denktijd. In een team dat draait om tempo wordt reflectie al snel een luxe — terwijl de denker juist daar zijn waarde heeft.',
        'Waardeer grondigheid, ook als het langzamer gaat. De denker voorkomt fouten die anderen pas zien als ze al gemaakt zijn.',
    ],
    teamspeler: [
        'Zorg voor duidelijke rollen en stabiele verhoudingen. Een teamspeler levert het beste werk als hij weet waar hij staat in het geheel — onduidelijkheid kost hem onevenredig veel energie.',
        'Communiceer verandering vroeg en persoonlijk. Voor een teamspeler is een mailtje over een reorganisatie geen informatie, maar een teken van afstand.',
        'Benoem teamresultaten naast individuele prestaties. De teamspeler ziet zijn bijdrage in wat het team bereikt — als alleen individuele prestaties gevierd worden, voelt hij zich onzichtbaar.',
    ],
    zekerzoeker: [
        'Geef voorspelbaarheid in verwachtingen. Een zekerzoeker presteert het beste als de regels stabiel zijn — niet omdat hij geen verandering aankan, maar omdat hij anders zijn focus kwijtraakt.',
        'Communiceer verandering met reden en tijdlijn. Een zekerzoeker accepteert verandering, maar heeft daar de context bij nodig: waarom nu, wat verandert er, wanneer.',
        'Waardeer betrouwbaarheid zichtbaar. Werk dat altijd op tijd af is, valt niet meer op — terwijl het de basis vormt waarop de rest kan bouwen.',
    ],
    groeier: [
        'Bespreek leerdoelen actief. Een groeier die geen ontwikkelperspectief ziet, wordt onrustig — ook als het werk inhoudelijk goed bevalt.',
        'Geef uitdagende opdrachten naast routine. Routine voert een groeier prima uit, maar zonder iets om in te bijten verliest hij zijn scherpte.',
        'Maak groei zichtbaar. Een groeier wil weten of hij vooruit komt — niet uit ijdelheid, maar omdat ontwikkeling voor hem de motivator is.',
    ],
    vernieuwer: [
        'Reserveer ruimte voor experiment. Vernieuwers hebben kleine vrijplaatsen nodig waarin nieuwe ideeën mogen mislukken — anders blijven ze hangen in de bestaande routines.',
        'Maak de vernieuwer zichtbaar in besluitvorming. Wie alleen aan tafel zit met executie-gerichte stemmen, krijgt geen vernieuwing — alleen optimalisatie van wat er al is.',
        'Bescherm nieuwe ideeën in de beginfase. Een idee dat nog niet af is, wordt te makkelijk afgeschoten op wat het nog niet is. De vernieuwer haakt dan af.',
    ],
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
            id,
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

function collectPersonaPeople(teamResponses, personaId) {
    const names = [];
    let anonymousCount = 0;
    teamResponses.forEach((r) => {
        if (r?.primary_archetype !== personaId) return;
        const fname = String(r?.name || '').trim().split(/\s+/)[0];
        if (!fname || fname === 'Onbekend') {
            anonymousCount += 1;
            return;
        }
        if (!names.includes(fname)) names.push(fname);
    });
    return { names, anonymousCount };
}

// Backwards-compat helper: returns just the names array
function collectFirstNames(teamResponses, personaId) {
    return collectPersonaPeople(teamResponses, personaId).names;
}

function findMentionedPersona(text, presentMap) {
    const lowered = String(text).toLowerCase();
    for (const arch of ARCHETYPES) {
        if (!presentMap[arch.id]) continue;
        if (lowered.includes(arch.name.toLowerCase())) {
            return {
                id: arch.id,
                name: arch.name,
                names: presentMap[arch.id].names,
                anonymousCount: presentMap[arch.id].anonymousCount || 0,
                color: PERSONA_COLORS[arch.id] || ACCENT,
            };
        }
    }
    return null;
}

function formatNames(names) {
    if (!names || names.length === 0) return '';
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} en ${names[1]}`;
    return `${names.slice(0, -1).join(', ')} en ${names[names.length - 1]}`;
}

/**
 * Formatteer namen + eventuele anonieme respondenten.
 *   - 0 namen, 1 anoniem  → "Anoniem"
 *   - 0 namen, 3 anoniem  → "3 anoniem"
 *   - 2 namen, 0 anoniem  → "Maria en Doris"
 *   - 2 namen, 1 anoniem  → "Maria, Doris en 1 anoniem"
 *   - 1 naam, 2 anoniem   → "Maria en 2 anoniem"
 */
function formatPeople(names, anonymousCount = 0) {
    const parts = [...(names || [])];
    if (anonymousCount > 0) {
        parts.push(anonymousCount === 1 ? 'anoniem' : `${anonymousCount} anoniem`);
    }
    if (parts.length === 0) return '';
    if (parts.length === 1) {
        // Speciaal geval: alleen "anoniem" → hoofdletter
        return parts[0] === 'anoniem' ? 'Anoniem' : parts[0];
    }
    if (parts.length === 2) return `${parts[0]} en ${parts[1]}`;
    return `${parts.slice(0, -1).join(', ')} en ${parts[parts.length - 1]}`;
}

// =========================
// DYNAMICS-AS UITLEG — uitgeschreven per richting
// =========================
// Geeft per as een uitgeschreven leeszin afhankelijk van richting & disbalans.
// axis.label is typisch "Creatie vs Structuur" — we matchen op label.

function describeAxis(axis) {
    const total = axis.lv + axis.rv;
    if (total === 0) return axis.desc || '';

    const lPct = Math.round((axis.lv / total) * 100);
    const rPct = 100 - lPct;
    const balanced = Math.abs(lPct - rPct) <= 20;

    const left = (axis.left || '').trim();
    const right = (axis.right || '').trim();
    const dominant = lPct >= rPct ? left : right;
    const recessive = lPct >= rPct ? right : left;

    if (balanced) {
        return `${left} en ${right.toLowerCase()} zijn in dit team in balans. Dat is een rijp patroon — maar alleen als beide kanten ook bewust de ruimte krijgen in overleg en besluitvorming.`;
    }

    return `${dominant} weegt zwaarder dan ${recessive.toLowerCase()} in dit team. Dat geeft beweging en richting, maar ook het risico dat ${recessive.toLowerCase()} sluipenderwijs verdwijnt uit gesprekken en keuzes — terwijl dat juist nodig is om het patroon vol te houden.`;
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
    const dynamicsAxes = useMemo(() => buildDynamicsAxes(sorted, totalScore), [sorted, totalScore]);
    const missingCritical = useMemo(() => findMissingCritical(sorted), [sorted]);
    const leadershipActions = useMemo(() => buildLeadershipActions(sorted), [sorted]);

    // Leadership-wins (de 6 acties) voor zowel het paneel als de PDF.
    const leadershipWins = useMemo(
        () => buildLeadershipSynthesis({
            leadershipActions,
            tensions,
            missingCritical,
            dynamicsAxes,
        }),
        [leadershipActions, tensions, missingCritical, dynamicsAxes]
    );

    // PDF-aggregate: minimal subset wat teamDynamicsPDF nodig heeft.
    const pdfAggregate = useMemo(() => ({
        teamCount: teamResponses.length,
        totalScores: scores,
        totalEnergy: totalScore,
    }), [teamResponses.length, scores, totalScore]);

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

    // ── GEEN TOEGANG ─────────────────────────────────────────
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

    // ── GEEN DATA ────────────────────────────────────────────
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

    // ── TEGELS ───────────────────────────────────────────────
    const TILES = [
        {
            id: 'dynamics',
            eyebrow: 'Dynamiek',
            value: 'Drie assen',
            hint: 'Fundamentele spanningen',
            detailTitle: 'Drie assen van teamdynamiek',
            detailLead: 'Geen van de assen is goed of fout. Ze laten zien waar bewuste sturing het meeste oplevert.',
            render: () => (
                <DynamicsPanel
                    dynamicsAxes={dynamicsAxes}
                    missingCritical={missingCritical}
                />
            ),
        },
        {
            id: 'collaboration',
            eyebrow: 'Samenwerking',
            value: topPersona?.name || 'Per werkstijl',
            hint: 'Hoe loopt het samen',
            detailTitle: 'Hoe deze werkstijlen samenwerken',
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
            eyebrow: 'Spanningen',
            value: tensions.length === 0 ? 'Geen actieve' : `${tensions.length} actief`,
            hint: 'Waar regie helpt',
            detailTitle: 'Waar dit team om regie vraagt',
            detailLead: tensions.length === 0
                ? 'Geen directe spanningsparen — de meest voorkomende combinaties zijn niet tegelijk sterk vertegenwoordigd.'
                : 'Klik op een spanningsveld om risico en leiderschapsadvies te zien.',
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
            eyebrow: 'Leiderschap',
            value: 'Acties',
            hint: 'Synthese voor morgen',
            detailTitle: 'Leiderschap voor dit team',
            detailLead: 'Concrete acties, direct afgeleid uit de dynamiek, samenwerking, spanningen en blinde vlekken in dit dashboard.',
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

    const activeTile = TILES.find((t) => t.id === activeId);

    function handleTileClick(id) {
        setActiveId((prev) => (prev === id ? null : id));
    }

    // ── DASHBOARD ────────────────────────────────────────────
    return (
        <PageShell compact>
            {/* HERO */}
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
                            onClick={() => generateTeamDynamicsPDF({
                                aggregate: pdfAggregate,
                                dynamicsAxes,
                                tensions,
                                leadershipWins,
                                teamName,
                                organization,
                                headline: signatureLine || '',
                            })}
                            style={{ background: ACCENT }}
                        >
                            Download als PDF
                        </PrimaryButton>
                        <SecondaryButton
                            onClick={() => setPage('teamdashboard')}
                        >
                            ← Naar Team Insight
                        </SecondaryButton>
                        {isAdminAccess() ? (
                            <SecondaryButton onClick={() => setPage('team')}>
                                Ander team
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
                        eyebrow="Wie ontbreekt"
                        lead={
                            missingCritical.length === 1
                                ? 'Eén kritieke stem ontbreekt of is nauwelijks aanwezig. Dat vergroot het risico op blinde vlekken bij verandering.'
                                : `${missingCritical.length} kritieke stemmen ontbreken of zijn nauwelijks aanwezig. Dat vergroot het risico op blinde vlekken bij verandering.`
                        }
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
    const total = axis.lv + axis.rv || 1;
    const lPct = Math.round((axis.lv / total) * 100);
    const rPct = 100 - lPct;
    const imbalance = Math.abs(axis.lv - axis.rv) > 20;
    const description = describeAxis(axis);

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
                        Disbalans
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
            <EmptyLine>
                Nog geen samenwerkingspatronen zichtbaar — wacht tot meer teamleden hebben ingevuld.
            </EmptyLine>
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
                        eyebrow="Verder in het team"
                        lead="De overige werkstijlen, met wie ze versterken en waar aandacht voor mag zijn."
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
                        eyebrow="Niet vertegenwoordigd"
                        lead={
                            missingArchetypes.length === 1
                                ? 'Eén werkstijl ontbreekt — die kan nog niet meedoen in deze samenwerking.'
                                : `${missingArchetypes.length} werkstijlen ontbreken — die kunnen nog niet meedoen in deze samenwerking.`
                        }
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
    const color = PERSONA_COLORS[archetype.id];
    const ct = archetype.ct || [];
    const positiveText = ct[0] || null;
    const tensionText = ct[1] || null;
    const generalText = ct[2] || null;

    const positiveMatch = positiveText ? findMentionedPersona(positiveText, presentMap) : null;
    const tensionMatch = tensionText ? findMentionedPersona(tensionText, presentMap) : null;

    return (
        <div style={{ display: 'grid', gap: SPACING.md }}>
            <SectionEyebrow color="var(--tof-text-muted)">
                Dominante werkstijl · {data.percentage}% van het team
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
                    Gedragen door{' '}
                    <strong style={{ color: 'var(--tof-text)' }}>
                        {formatPeople(data.names, data.anonymousCount)}
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
                        <SectionEyebrow color="var(--tof-accent-sage)">Wat werkt goed</SectionEyebrow>
                        <div style={{ display: 'grid', gap: SPACING.xs }}>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                                {positiveText}
                                {(positiveMatch.names.length > 0 || positiveMatch.anonymousCount > 0) ? (
                                    <span style={{ color: 'var(--tof-text-muted)' }}>
                                        {' '}— {formatPeople(positiveMatch.names, positiveMatch.anonymousCount)}
                                    </span>
                                ) : null}
                            </p>
                            <p style={{ ...TYPE.body, fontSize: 13, margin: 0, color: 'var(--tof-text-soft)' }}>
                                {capitalize(buildSynergyReason(archetype.id, positiveMatch.id))}.
                            </p>
                        </div>
                    </>
                ) : null}

                {tensionMatch ? (
                    <>
                        <SectionEyebrow color="var(--tof-accent-rose)">Aandacht voor</SectionEyebrow>
                        <div style={{ display: 'grid', gap: SPACING.xs }}>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>
                                {tensionText}
                                {(tensionMatch.names.length > 0 || tensionMatch.anonymousCount > 0) ? (
                                    <span style={{ color: 'var(--tof-text-muted)' }}>
                                        {' '}— {formatPeople(tensionMatch.names, tensionMatch.anonymousCount)}
                                    </span>
                                ) : null}
                            </p>
                            <p style={{ ...TYPE.body, fontSize: 13, margin: 0, color: 'var(--tof-text-soft)' }}>
                                {capitalize(buildAttentionReason(archetype.id, tensionMatch.id))}.
                            </p>
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}

function CompactCollaborationRow({ archetype, data, presentMap }) {
    const color = PERSONA_COLORS[archetype.id];
    const ct = archetype.ct || [];
    const positiveText = ct[0] || null;
    const tensionText = ct[1] || null;

    const positiveMatch = positiveText ? findMentionedPersona(positiveText, presentMap) : null;
    const tensionMatch = tensionText ? findMentionedPersona(tensionText, presentMap) : null;

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
                        {formatPeople(data.names, data.anonymousCount)}
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
                        Sterk met {positiveMatch.name.toLowerCase()}
                        {(positiveMatch.names.length > 0 || positiveMatch.anonymousCount > 0) ? (
                            <span style={{ color: 'var(--tof-text-muted)', fontWeight: 500, letterSpacing: 0 }}>
                                {' · '}{formatPeople(positiveMatch.names, positiveMatch.anonymousCount)}
                            </span>
                        ) : null}
                    </div>
                    <p style={{ ...TYPE.body, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                        {capitalize(buildSynergyReason(archetype.id, positiveMatch.id))}.
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
                        Aandacht met {tensionMatch.name.toLowerCase()}
                    </div>
                    <p style={{ ...TYPE.body, fontSize: 13, margin: 0, lineHeight: 1.6 }}>
                        {capitalize(buildAttentionReason(archetype.id, tensionMatch.id))}.
                    </p>
                </div>
            ) : null}
        </div>
    );
}

// =========================
// SAMENWERKING — uitgeschreven redenen per persona-paar
// =========================
// Per (persona × match-persona) combinatie een uitleg-zin.
// Fallback: generieke zin op basis van de persona zelf.

const SYNERGY_REASONS = {
    'maker:denker': 'de maker zet ideeën om in beweging, de denker zorgt dat ze richting houden',
    'maker:vernieuwer': 'beiden brengen energie en nieuwe ideeën — samen krijgen ze dingen écht in gang',
    'denker:maker': 'de denker geeft de maker structuur, de maker geeft de denker iets om aan te bouwen',
    'denker:zekerzoeker': 'beiden waarderen zorgvuldigheid — samen voorkomen ze haastige besluiten',
    'verbinder:teamspeler': 'beiden bewaken de menselijke kant van het werk — samen houden ze het team bij elkaar',
    'verbinder:groeier': 'de verbinder ziet wie ondersteuning nodig heeft, de groeier helpt anderen ontwikkelen',
    'teamspeler:verbinder': 'beiden investeren in relaties — samen vormen ze de stabiele basis van het team',
    'teamspeler:zekerzoeker': 'beiden zorgen voor continuïteit en betrouwbaarheid in het werk',
    'presteerder:vernieuwer': 'de presteerder zet vernieuwing om in resultaat',
    'presteerder:groeier': 'beiden willen vooruit — samen houden ze het tempo erin',
    'groeier:presteerder': 'de groeier ontwikkelt zichzelf in tempo, de presteerder houdt focus op uitkomst',
    'zekerzoeker:presteerder': 'de zekerzoeker bouwt de basis waarop de presteerder kan versnellen',
    'zekerzoeker:teamspeler': 'beiden waarderen voorspelbaarheid en stabiele afspraken',
    'vernieuwer:maker': 'de vernieuwer bedenkt het, de maker maakt het',
    'vernieuwer:presteerder': 'de vernieuwer levert nieuwe ideeën, de presteerder zorgt dat ze landen',
};

const ATTENTION_REASONS = {
    'maker:zekerzoeker': 'de maker beweegt sneller dan voor de zekerzoeker comfortabel is',
    'maker:teamspeler': 'de maker werkt vaak alleen, terwijl de teamspeler juist samen wil optrekken',
    'denker:presteerder': 'de denker wil eerst begrijpen, de presteerder wil nu beslissen',
    'denker:maker': 'de denker analyseert door, terwijl de maker al wil doen',
    'verbinder:presteerder': 'de verbinder vertraagt om af te stemmen, terwijl de presteerder vooruit wil',
    'teamspeler:maker': 'de teamspeler verwacht overleg, terwijl de maker liever zelf besluit',
    'teamspeler:vernieuwer': 'de teamspeler hecht aan stabiele werkwijzen, de vernieuwer wil ze juist veranderen',
    'presteerder:verbinder': 'de presteerder kiest voor tempo, de verbinder voor afstemming — beiden onmisbaar, niet altijd verenigbaar',
    'presteerder:denker': 'de presteerder maakt de denker ongeduldig, de denker frustreert de presteerder met details',
    'zekerzoeker:maker': 'de zekerzoeker raakt onrustig van het tempo en de onvoorspelbaarheid van de maker',
    'zekerzoeker:vernieuwer': 'verandering die voor de vernieuwer logisch is, voelt voor de zekerzoeker onvoorspelbaar',
    'zekerzoeker:groeier': 'de zekerzoeker zoekt rust, de groeier juist beweging — dat schuurt zonder afspraken',
    'groeier:zekerzoeker': 'de groeier wil door, de zekerzoeker wil eerst weten waar het naartoe gaat',
    'vernieuwer:zekerzoeker': 'de vernieuwer ondermijnt onbedoeld de zekerheid die de zekerzoeker nodig heeft',
    'vernieuwer:teamspeler': 'de vernieuwer bedenkt nieuwe paden, terwijl de teamspeler eerst draagvlak zoekt',
};

function buildSynergyReason(personaId, matchId) {
    const key = `${personaId}:${matchId}`;
    if (SYNERGY_REASONS[key]) return SYNERGY_REASONS[key];
    return `samen vullen ze elkaar aan in tempo en aanpak`;
}

function buildAttentionReason(personaId, matchId) {
    const key = `${personaId}:${matchId}`;
    if (ATTENTION_REASONS[key]) return ATTENTION_REASONS[key];
    return `hun werkritme botst zonder duidelijke afspraken`;
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

    if (tensions.length === 0) {
        return (
            <EmptyLine>
                Geen directe spanningsparen gedetecteerd. De meest voorkomende combinaties
                zijn niet tegelijk sterk vertegenwoordigd in dit team.
            </EmptyLine>
        );
    }

    return (
        <div style={{ display: 'grid', gap: 0 }}>
            {tensions.map((t, i) => (
                <TensionRow
                    key={i}
                    tension={t}
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
    const pctA = totalScore > 0 ? Math.round(((scores[tension.a] || 0) / totalScore) * 100) : 0;
    const pctB = totalScore > 0 ? Math.round(((scores[tension.b] || 0) / totalScore) * 100) : 0;
    const archA = getArchetype(tension.a);
    const archB = getArchetype(tension.b);

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
                            <span style={{ fontSize: 12, color: 'var(--tof-text-muted)' }}>en</span>
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
                            <SectionEyebrow>Risico</SectionEyebrow>
                            <p style={{ ...TYPE.body, fontSize: 14, margin: 0 }}>{tension.risk}</p>

                            <SectionEyebrow color={ACCENT}>Leiderschapsadvies</SectionEyebrow>
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

const LEADERSHIP_SOURCE_LABELS = {
    dynamics: 'Uit dynamiek',
    collaboration: 'Uit samenwerking',
    tension: 'Uit spanningen',
    missing: 'Uit blinde vlek',
};

function LeadershipPanel({
    leadershipActions,
    tensions,
    missingCritical,
    dynamicsAxes,
}) {
    const wins = buildLeadershipSynthesis({
        leadershipActions,
        tensions,
        missingCritical,
        dynamicsAxes,
    });

    if (wins.length === 0) {
        return (
            <EmptyLine>
                Nog geen leiderschapsacties te genereren — wacht tot meer teamleden hebben ingevuld.
            </EmptyLine>
        );
    }

    return (
        <div style={{ display: 'grid', gap: SPACING.lg }}>
            {wins.map((win, index) => (
                <LeadershipAction
                    key={index}
                    index={index + 1}
                    sourceLabel={LEADERSHIP_SOURCE_LABELS[win.source] || 'Reflectie'}
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
}) {
    const wins = [];

    const sortedAxes = [...(dynamicsAxes || [])]
        .map((axis, i) => ({ axis, i, gap: Math.abs(axis.lv - axis.rv) }))
        .sort((a, b) => b.gap - a.gap);

    // 1. UIT DYNAMIEK — meest disbalans
    const axis1 = sortedAxes[0];
    if (axis1 && axis1.gap > 0) {
        wins.push({
            source: 'dynamics',
            action: dynamicsActionFor(axis1.axis),
        });
    }

    // 2. UIT SAMENWERKING — top-1 dominante persona
    if (leadershipActions && leadershipActions.length > 0) {
        const top = leadershipActions[0];
        const firstAction = top.items?.[0];
        if (firstAction) {
            wins.push({
                source: 'collaboration',
                action: `Voor de ${top.persona.toLowerCase()}: ${decapitalize(firstAction)}`,
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
            action: dynamicsActionFor(axis2.axis),
        });
    }

    // 5. UIT SAMENWERKING — top-2 dominante persona
    if (leadershipActions && leadershipActions.length > 1) {
        const second = leadershipActions[1];
        const firstAction = second.items?.[0];
        if (firstAction) {
            wins.push({
                source: 'collaboration',
                action: `Voor de ${second.persona.toLowerCase()}: ${decapitalize(firstAction)}`,
            });
        }
    }

    // 6. UIT BLINDE VLEK
    if (missingCritical && missingCritical.length > 0) {
        const first = missingCritical[0];
        wins.push({
            source: 'missing',
            action: buildMissingAction(first.archetype),
        });
    }

    if (wins.length < 6) {
        const fallbacks = buildFallbackActions({
            leadershipActions,
            tensions,
            sortedAxes,
            existing: wins,
        });
        for (const f of fallbacks) {
            if (wins.length >= 6) break;
            wins.push(f);
        }
    }

    return wins.slice(0, 6);
}

function buildFallbackActions({ leadershipActions, tensions, sortedAxes, existing }) {
    const out = [];
    const usedActions = new Set(existing.map((w) => w.action));

    if (leadershipActions && leadershipActions.length > 2) {
        const third = leadershipActions[2];
        const firstAction = third.items?.[0];
        if (firstAction) {
            const txt = `Voor de ${third.persona.toLowerCase()}: ${decapitalize(firstAction)}`;
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
            const txt = `Voor de ${top.persona.toLowerCase()}: ${decapitalize(secondAction)}`;
            if (!usedActions.has(txt)) out.push({ source: 'collaboration', action: txt });
        }
    }

    if (sortedAxes && sortedAxes.length > 2) {
        const a = sortedAxes[2];
        if (a && a.gap > 0) {
            const txt = dynamicsActionFor(a.axis);
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
function dynamicsActionFor(axis) {
    if (!axis) return '';
    const total = axis.lv + axis.rv;
    if (total === 0) return '';

    const dominantSide = axis.lv >= axis.rv ? axis.left : axis.right;
    const recessiveSide = axis.lv >= axis.rv ? axis.right : axis.left;

    return `${dominantSide} weegt zwaarder dan ${recessiveSide.toLowerCase()} in dit team. Maak ruimte voor ${recessiveSide.toLowerCase()} in overleg en besluitvorming — niet als formaliteit, maar als actief tegenwicht. Anders verdwijnt deze stem geleidelijk uit het werk.`;
}

function buildMissingAction(archetype) {
    return `${archetype.name} ontbreekt of is nauwelijks aanwezig. Breng dit perspectief actief in besluiten — door iemand expliciet de rol te geven, of door extern advies te vragen. Anders ontstaat een blinde vlek die pas zichtbaar wordt als het misgaat.`;
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
