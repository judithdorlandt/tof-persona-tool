/**
 * TeamStrategic — Module 3: Het Strategisch Kompas
 *
 * Familie-taal afgestemd op TeamDashboard (Module 1) en TeamDynamics (Module 2):
 *   - HeroBlock direct op canvas (rose accent)
 *   - SectionCard's daaronder voor de inhoudelijke blokken
 *   - InteractiveRow / InnerCard waar het past
 *
 * Toegang: alleen via een strategic-level access code, gevalideerd in TeamIntro.
 * Inhoud: port van het static HTML-prototype (strategisch-kompas.html) naar
 * de standaard AppShell-vormgeving, dezelfde "voelt-als-dashboard"-look.
 */

import React from 'react';
import {
    PageShell,
    HeroBlock,
    PrimaryButton,
    SecondaryButton,
    SectionCard,
    SectionEyebrow,
    InnerCard,
    InteractiveRow,
} from '../ui/AppShell';
import { SPACING, TYPE } from '../ui/tokens';

const ACCENT = 'var(--tof-accent-rose)';

// ─── DATA ────────────────────────────────────────────────────────────────────

const TRENDS = [
    { num: '01', title: 'Experience based working', body: 'Van "wat je doet" naar "hoe je het ervaart". De werkplek wordt beoordeeld op gevoel, beleving en kwaliteit van de dag — niet op stoel en bureau.' },
    { num: '02', title: 'Van aanwezigheid naar waarde', body: 'Niet langer "twee dagen kantoor", maar: waarom kom je samen, wat levert dat op, en wat moet de omgeving daarvoor doen?' },
    { num: '03', title: 'Piekregie — de kamelenweek temmen', body: '75% wil op dinsdag of donderdag op kantoor. Sturen op samenkomst-momenten wordt cruciaal — niet op aantal dagen, maar op kwaliteit van die dagen.' },
    { num: '04', title: 'DEIB als ontwerp, niet als beleid', body: 'Inclusie verschuift van ambitie naar ontwerpvraagstuk: toegankelijkheid, prikkelarme zones, sociale veiligheid — zichtbaar in keuzes, niet in policy-documenten.' },
    { num: '05', title: 'Social based working', body: 'De werkplek als sociaal weefsel. Verbinding ontstaat niet vanzelf bij meer aanwezigheid — wel bij betekenisvolle momenten en goede sociale architectuur.' },
    { num: '06', title: 'Servicerevolutie', body: 'Het kantoor als hospitality-omgeving. Services en beleving — niet vierkante meters — bepalen of de plek aantrekkelijk is voor medewerkers.' },
    { num: '07', title: 'Van megacampus naar maatwerk', body: 'Kleinere, gerichte locaties dichter bij waar mensen wonen. Het centrale hoofdkantoor maakt plaats voor een netwerk van kleinere, persoonlijkere plekken.' },
    { num: '08', title: 'AI in de werkplek', body: 'AI als stuurinstrument: continu meten van beleving, frictie en effectiviteit. Niet om medewerkers te controleren, maar om hun omgeving fijner te maken.' },
];

const STEPS = [
    { num: '01', name: 'Intake', meta: '60 min · MT / bestuur', body: 'Wat is jullie organisatie-ambitie de komende 3–5 jaar? Welke beweging willen jullie maken? Wat zit er al, wat ontbreekt?' },
    { num: '02', name: 'Trend-spiegeling', meta: 'Voorbereiding · 2–3 weken', body: 'Welke van de 8 trends raken jullie organisatie het hardst? Welke versterken jullie ambitie, welke kruisen het? Hier komt de buitenwereld scherp binnen.' },
    { num: '03', name: 'Persona-overlay', meta: 'Uit Module 1 + 2', body: 'Hoe verhouden jullie persona\'s zich tot die trends? Een Maker-zwaar team in een DEIB-gedreven organisatie vraagt iets héél anders dan een Verbinder-zwaar team in een AI-getransformeerde sector.' },
    { num: '04', name: 'Ontwerpgesprek', meta: 'Halve dag · MT / bestuur', body: 'Trend-radar + persona-overlay komen samen op tafel. We maken keuzes voor leiderschap, werkomgeving, cultuur en technologie — onderbouwd, herkenbaar en uitlegbaar.' },
    { num: '05', name: 'Het Kompas', meta: 'Levend document · jaarlijks bijgewerkt', body: 'Een ~20-pagina premium PDF plus een éénpager-overzicht voor MT-meetings. Geen plan in een la — een kompas dat jaarlijks meebeweegt met nieuwe trends en nieuwe persona-data.' },
];

const DELIVERABLES = [
    { strong: 'Trend-radar', body: '8 trends, gewogen op relevantie voor jullie organisatie' },
    { strong: 'Persona-overlay', body: 'hoe jullie team-mix verhoudt zich tot die trends' },
    { strong: 'Strategische keuzes', body: 'voor leiderschap, werkomgeving, cultuur, technologie' },
    { strong: 'Kompas-éénpager', body: 'printbaar overzicht, klaar voor MT-meeting' },
    { strong: 'Jaarritme', body: 'vaste momenten om het kompas te herijken' },
];

const COMPARE_ROWS = [
    { label: 'Blik', cells: ['Naar binnen — individu', 'Naar binnen — team', 'Van buiten naar binnen'] },
    { label: 'Tijdshorizon', cells: ['Nu', 'Komende kwartalen', '3–5 jaar'] },
    { label: 'Deliverable', cells: ['Persona-kaart', 'Team-dynamics rapport', 'Strategisch richtingsdocument'] },
    { label: 'Doelgroep', cells: ['Iedereen', 'Teamleiders, HR', 'MT, bestuur, huisvesting'] },
];

const MODULES = [
    { eyebrow: 'Module 01 · Persona Insight', title: 'Wie ben jij?', body: 'Self-service persona-tool. Individueel inzicht in werkstijl en werkplek­behoefte. Laagdrempelig.', price: '€1.250 / team' },
    { eyebrow: 'Module 02 · Team Dynamics', title: 'Hoe werken jullie samen?', body: 'Team-rapport plus sessie. Persona-mix, spanningen, werkplek­behoefte. Voor teamleiders.', price: '€5.000 / team' },
    { eyebrow: 'Module 03 · Strategisch Kompas', title: 'Waar gaan we naartoe?', body: 'Buiten naar binnen — trends + persona\'s vertaald naar strategie. Voor MT en bestuur.', price: '€20.000 / organisatie', current: true },
];

// ─── COMPONENT ───────────────────────────────────────────────────────────────

export default function TeamStrategic({ setPage, selectedTeam }) {
    const orgName = selectedTeam?.organization || '';

    return (
        <PageShell compact>
            {/* ── HERO ── */}
            <HeroBlock
                compact
                eyebrow="Module 3 · Het Strategisch Kompas"
                title="Wat de wereld vraagt,"
                titleAccent="vertaald naar wie je team is."
                titleAccentColor={ACCENT}
                lead="Voor MT, bestuur en huisvesting: een levend richtingsdocument dat externe trends koppelt aan jullie team-persona's. Geen plan in een la — een kompas voor de komende drie tot vijf jaar."
                actions={
                    <>
                        <PrimaryButton
                            onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')}
                            style={{ background: ACCENT, borderColor: ACCENT }}
                        >
                            Plan een gesprek
                        </PrimaryButton>
                        <SecondaryButton onClick={() => setPage && setPage('team')}>
                            ← Terug
                        </SecondaryButton>
                    </>
                }
            />

            {/* Meta-strip, identiek aan TeamDynamics signature-block */}
            <div style={{
                display: 'flex',
                gap: SPACING.sm + 2,
                flexWrap: 'wrap',
                fontSize: 12,
                color: 'var(--tof-text-muted)',
                letterSpacing: 0.4,
                textTransform: 'uppercase',
                fontWeight: 600,
            }}>
                <Chip>3–5 jaar</Chip>
                <Chip>Traject van 8–12 weken</Chip>
                <Chip>€20.000 / organisatie</Chip>
                {orgName && <Chip>{orgName}</Chip>}
            </div>

            {/* ── WAAROM MODULE 3 ── */}
            <SectionCard accent={ACCENT} eyebrow="Waarom Module 3" title="Strategie zonder mensbeeld is een kompas zonder noord.">
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                    Veel strategie-trajecten kijken naar de buitenwereld — trends, markt, technologie. Andere kijken naar binnen — cultuur, leiderschap, teams. Het Strategisch Kompas doet beide. Trends raken organisaties altijd anders, afhankelijk van wie er werkt. Daar zit de waarde.
                </p>
                <CompareTable />
            </SectionCard>

            {/* ── 8 TRENDS ── */}
            <SectionCard accent={ACCENT} eyebrow="De 8 trends die we volgen" title="De wereld waarin jouw team straks werkt.">
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                    Gecureerd uit Colliers Insights, WorkWire Trendrapport 2025–2026, Social Based Working en het AI Index Report 2026. Elk jaar herzien, zodat het kompas mee­beweegt.
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                    gap: SPACING.md,
                }}>
                    {TRENDS.map((t) => (
                        <InnerCard key={t.num}>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <span style={{
                                    ...TYPE.eyebrow,
                                    color: ACCENT,
                                    fontSize: 11,
                                }}>{t.num}</span>
                            </div>
                            <div style={{
                                ...TYPE.subhead,
                                fontSize: 17,
                                color: 'var(--tof-text)',
                                lineHeight: 1.25,
                            }}>
                                {t.title}
                            </div>
                            <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0, fontSize: 13.5 }}>
                                {t.body}
                            </p>
                        </InnerCard>
                    ))}
                </div>
            </SectionCard>

            {/* ── DE AANPAK ── */}
            <SectionCard accent={ACCENT} eyebrow="De aanpak" title="In 5 stappen naar jullie kompas.">
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                    Het Strategisch Kompas wordt gebouwd over 8 tot 12 weken, in nauwe samenwerking met MT of bestuur. Geen losse adviesnota — een levend document dat ingebed wordt in jullie ritme.
                </p>
                <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                    {STEPS.map((s) => (
                        <InteractiveRow key={s.num} accent={ACCENT}>
                            <div style={{
                                ...TYPE.eyebrow,
                                color: ACCENT,
                                fontSize: 11,
                                minWidth: 28,
                            }}>
                                {s.num}
                            </div>
                            <div style={{
                                display: 'grid',
                                gap: 4,
                                flex: 1,
                                minWidth: 200,
                            }}>
                                <div style={{
                                    ...TYPE.subhead,
                                    fontSize: 16,
                                    color: 'var(--tof-text)',
                                }}>
                                    {s.name}
                                </div>
                                <div style={{
                                    ...TYPE.eyebrow,
                                    color: 'var(--tof-text-muted)',
                                    fontSize: 10,
                                }}>
                                    {s.meta}
                                </div>
                            </div>
                            <p style={{
                                ...TYPE.body,
                                color: 'var(--tof-text-soft)',
                                margin: 0,
                                flex: 2,
                                minWidth: 240,
                                fontSize: 14,
                            }}>
                                {s.body}
                            </p>
                        </InteractiveRow>
                    ))}
                </div>
            </SectionCard>

            {/* ── WAT JE IN HANDEN KRIJGT ── */}
            <SectionCard accent={ACCENT} eyebrow="Wat je in handen krijgt" title="Een document dat MT-meetings opent, niet sluit.">
                <div style={{ display: 'grid', gap: SPACING.sm + 2 }}>
                    {DELIVERABLES.map((d, i) => (
                        <InteractiveRow key={i} accent={ACCENT} subtle>
                            <div style={{
                                ...TYPE.subhead,
                                fontSize: 15,
                                color: 'var(--tof-text)',
                                minWidth: 180,
                            }}>
                                {d.strong}
                            </div>
                            <p style={{
                                ...TYPE.body,
                                color: 'var(--tof-text-soft)',
                                margin: 0,
                                flex: 1,
                                minWidth: 240,
                                fontSize: 14,
                            }}>
                                {d.body}
                            </p>
                        </InteractiveRow>
                    ))}
                </div>
            </SectionCard>

            {/* ── WAAR MODULE 3 IN PAST ── */}
            <SectionCard accent={ACCENT} eyebrow="Waar Module 3 in past" title="Drie modules, één verhaal.">
                <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0 }}>
                    Module 3 staat op de schouders van Module 1 en 2. Pas als je weet wie er werkt en hoe ze samenwerken, kan je betekenisvol kijken naar waar je heen wilt.
                </p>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                    gap: SPACING.md,
                }}>
                    {MODULES.map((m, i) => (
                        <div key={i} style={{
                            background: m.current ? 'rgba(176,82,82,0.06)' : 'rgba(255,255,255,0.82)',
                            border: m.current ? `1px solid ${ACCENT}` : '1px solid #EADFD4',
                            borderRadius: 14,
                            padding: '16px 18px',
                            display: 'grid',
                            gap: SPACING.sm,
                        }}>
                            <SectionEyebrow color={m.current ? ACCENT : 'var(--tof-text-muted)'}>
                                {m.eyebrow}
                            </SectionEyebrow>
                            <div style={{
                                ...TYPE.subhead,
                                fontSize: 18,
                                color: 'var(--tof-text)',
                            }}>
                                {m.title}
                            </div>
                            <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0, fontSize: 13.5 }}>
                                {m.body}
                            </p>
                            <div style={{
                                ...TYPE.eyebrow,
                                color: m.current ? ACCENT : 'var(--tof-text)',
                                fontSize: 12,
                                marginTop: 4,
                            }}>
                                {m.price}
                            </div>
                        </div>
                    ))}
                </div>
            </SectionCard>

            {/* ── CTA-rij ── */}
            <SectionCard accent={ACCENT}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: SPACING.md,
                    alignItems: 'flex-start',
                }}>
                    <SectionEyebrow color={ACCENT}>Vervolgstap</SectionEyebrow>
                    <h2 style={TYPE.heading}>
                        Klaar voor een{' '}
                        <span style={{ color: ACCENT, fontStyle: 'italic' }}>scherper kompas?</span>
                    </h2>
                    <p style={{ ...TYPE.body, color: 'var(--tof-text-soft)', margin: 0, maxWidth: 560 }}>
                        Plan een vrijblijvend gesprek van 30 minuten. We kijken samen of dit traject past bij waar jullie organisatie staat.
                    </p>
                    <div style={{ display: 'flex', gap: SPACING.sm + 2, flexWrap: 'wrap', marginTop: 4 }}>
                        <PrimaryButton
                            onClick={() => window.open('https://www.tof.services/contact', '_blank', 'noopener,noreferrer')}
                            style={{ background: ACCENT, borderColor: ACCENT }}
                        >
                            Plan een gesprek
                        </PrimaryButton>
                        <SecondaryButton
                            onClick={() => window.open('https://www.tof.services', '_blank', 'noopener,noreferrer')}
                        >
                            Meer over TOF
                        </SecondaryButton>
                    </div>
                </div>
            </SectionCard>
        </PageShell>
    );
}

// ─── SUB-COMPONENTS ──────────────────────────────────────────────────────────

function Chip({ children }) {
    return (
        <span style={{
            background: 'var(--tof-surface)',
            border: '1px solid var(--tof-border)',
            borderRadius: 999,
            padding: '6px 12px',
            fontSize: 11,
            color: 'var(--tof-text-muted)',
            letterSpacing: 0.6,
            fontWeight: 600,
        }}>
            {children}
        </span>
    );
}

function CompareTable() {
    const headerStyle = {
        ...TYPE.eyebrow,
        color: 'var(--tof-text)',
        padding: '10px 12px',
        fontSize: 11,
        borderBottom: '1px solid var(--tof-border)',
        background: 'rgba(176,82,82,0.04)',
    };

    const labelStyle = {
        ...TYPE.eyebrow,
        color: 'var(--tof-text-muted)',
        padding: '10px 12px',
        fontSize: 10,
        borderBottom: '1px solid var(--tof-border)',
    };

    const cellStyle = {
        padding: '10px 12px',
        borderBottom: '1px solid var(--tof-border)',
        color: 'var(--tof-text-soft)',
        fontSize: 13.5,
    };

    const m3Style = {
        ...cellStyle,
        background: 'rgba(176,82,82,0.04)',
        color: 'var(--tof-text)',
        fontWeight: 500,
    };

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: '140px 1fr 1fr 1fr',
            gap: 0,
            borderTop: '1px solid var(--tof-border)',
            borderLeft: '1px solid var(--tof-border)',
            borderRight: '1px solid var(--tof-border)',
            borderRadius: 10,
            overflow: 'hidden',
            background: 'var(--tof-surface)',
        }}>
            <div style={headerStyle} />
            <div style={{ ...headerStyle, color: 'var(--tof-text-muted)' }}>Module 1</div>
            <div style={{ ...headerStyle, color: 'var(--tof-text-muted)' }}>Module 2</div>
            <div style={{ ...headerStyle, color: ACCENT, fontWeight: 700 }}>Module 3</div>

            {COMPARE_ROWS.map((r, i) => (
                <React.Fragment key={i}>
                    <div style={labelStyle}>{r.label}</div>
                    <div style={cellStyle}>{r.cells[0]}</div>
                    <div style={cellStyle}>{r.cells[1]}</div>
                    <div style={m3Style}>{r.cells[2]}</div>
                </React.Fragment>
            ))}
        </div>
    );
}
