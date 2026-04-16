import React, { useEffect, useState } from 'react';
import { isMakerAccess } from '../utils/access';
import {
    PageShell,
    SectionCard,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

export default function TeamIntro({ setPage }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const [openBlock, setOpenBlock] = useState(null);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [accessInput, setAccessInput] = useState('');

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const makerMode = isMakerAccess();

    const toggleBlock = (id) => {
        setOpenBlock((current) => (current === id ? null : id));
    };

    const handleAccessSubmit = () => {
        if (accessInput === '1980!T03g4ngPERSONA') {
            setShowAccessModal(false);
            setAccessInput('');
            setPage('teamselector');
        } else {
            window.alert('Onjuiste toegangscode');
        }
    };

    return (
        <PageShell padding={isMobile ? '20px 16px 28px' : '24px 20px 36px'}>
            <div
                style={{
                    animation: 'tofFadeIn 0.5s ease',
                    display: 'grid',
                    gap: isMobile ? 24 : 36,
                }}
            >
                <SectionCard padding={isMobile ? 20 : 30}>
                    <div style={{ display: 'grid', gap: 14 }}>
                        <SectionEyebrow>02 — Voor teams & organisaties</SectionEyebrow>

                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 'clamp(34px, 5vw, 62px)',
                                lineHeight: 1.04,
                                color: 'var(--tof-text)',
                                maxWidth: 760,
                            }}
                        >
                            Van losse profielen —
                            <br />
                            <span
                                style={{
                                    color: 'var(--tof-accent-rose)',
                                    fontStyle: 'italic',
                                }}
                            >
                                naar echt teaminzicht.
                            </span>
                        </h1>

                        <p
                            style={{
                                margin: 0,
                                maxWidth: 700,
                                fontSize: 16,
                                lineHeight: 1.7,
                                color: 'var(--tof-text-soft)',
                            }}
                        >
                            Deze omgeving is bedoeld voor organisaties die werkstijlen willen
                            vertalen naar samenwerking, leiderschap en werkplek. Wil je ontdekken
                            wat de verschillende modules inhouden en welk niveau past bij jouw vraag,
                            plan dan een afspraak in.
                        </p>

                        {makerMode ? (
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    background: 'var(--tof-rose-soft)',
                                    border: '1px solid rgba(176,82,82,0.12)',
                                    borderRadius: 999,
                                    padding: '8px 14px',
                                    fontSize: 12,
                                    color: 'var(--tof-text-muted)',
                                    width: 'fit-content',
                                }}
                            >
                                <span>🛠</span>
                                <span>Maker mode actief</span>
                            </div>
                        ) : null}
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <PrimaryButton onClick={() => setPage('home')}>
                            Terug naar home
                        </PrimaryButton>

                        <SecondaryButton
                            onClick={() =>
                                window.open(
                                    'https://www.tof.services/contact',
                                    '_blank',
                                    'noopener,noreferrer'
                                )
                            }
                        >
                            Plan een gesprek
                        </SecondaryButton>
                    </div>
                </SectionCard>

                {!isMobile && (
                    <>
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, minmax(0, 1fr))',
                                gap: isMobile ? 14 : 20,
                                alignItems: 'stretch',
                            }}
                        >
                            <ExpandableOfferCard
                                id="team-insight"
                                isOpen={openBlock === 'team-insight'}
                                onToggle={toggleBlock}
                                eyebrow="Voor teams · premium traject"
                                title="Team Insight & Quick Wins"
                                teaser="Inzicht in hoe jouw team écht werkt — waar energie zit, waar het schuurt en wat direct helpt."
                                accent="var(--tof-accent-sage)"
                            >
                                <p style={offerBodyText}>
                                    Elk team heeft een eigen samenstelling — en die samenstelling bepaalt
                                    meer dan de meeste managers denken. Waar energie ontstaat, waar het
                                    schuurt, en wat mensen nodig hebben om goed te werken. Dit blok maakt
                                    dat zichtbaar.
                                </p>

                                <p style={offerBodyText}>
                                    Teamleden vullen individueel de persona tool in. Op basis van die
                                    uitkomsten ontstaat een teamdashboard dat laat zien hoe werkstijlen
                                    zich binnen het team verdelen, welke werkplekbehoefte daaruit voortkomt
                                    en waar de samenwerking versterkt of juist vertraagt.
                                </p>

                                <p style={offerBodyText}>
                                    Je ziet in één oogopslag waar de spanning zit — en waar de grootste
                                    kansen liggen. Het dashboard is direct bruikbaar: als gespreksonderwerp,
                                    als input voor een teamoverleg, of als eerste stap richting scherpere
                                    werkplek- en samenwerkingsafspraken.
                                </p>

                                <div style={offerHighlightStyle}>
                                    <strong>Wat je krijgt</strong>
                                    <br />
                                    Een teamdashboard met concrete inzichten in werkstijlen,
                                    werkplekbehoefte en directe verbeterkansen. Geen eindpunt,
                                    maar een helder vertrekpunt voor teams die bewuster willen samenwerken.
                                </div>

                                <div style={offerFootnoteStyle}>
                                    Beschikbaar als onderdeel van de Team Insight omgeving voor teams en organisaties.
                                </div>
                            </ExpandableOfferCard>

                            <ExpandableOfferCard
                                id="team-dynamics"
                                isOpen={openBlock === 'team-dynamics'}
                                onToggle={toggleBlock}
                                eyebrow="Voor teams & organisaties · premium traject"
                                title="Team Dynamics Sessie"
                                teaser="Voor teams die verschillen niet alleen willen zien, maar ook samen willen bespreken en benutten."
                                accent="var(--tof-accent-rose)"
                            >
                                <p style={offerBodyText}>
                                    Het teamdashboard laat zien hoe werkstijlen verdeeld zijn.
                                    Maar wat er écht gebeurt in samenwerking, besluitvorming en
                                    teamritme, vraagt meer diepgang. Deze module bouwt voort op de
                                    uitkomsten van de module Team Insight & Quick Wins
                                    en legt bloot wat onder de oppervlakte speelt.
                                </p>

                                <p style={offerBodyText}>
                                    Je krijgt een verdiept dashboard met inzicht in waar gesprekken vastlopen,
                                    waarom tempo en structuur botsen, wat dit vraagt van leiderschap en
                                    hoe de werkplek daarop aansluit — of juist niet.
                                </p>

                                <p style={offerBodyText}>
                                    De uitkomsten licht ik toe — live of online, afhankelijk van wat past.
                                    Zo worden de inzichten niet alleen begrijpelijk, maar ook direct
                                    vertaalbaar naar keuzes voor samenwerking, leiderschap en werkplek.
                                </p>

                                <div style={offerHighlightStyle}>
                                    <strong>Wat je krijgt</strong>
                                    <br />
                                    Een verdiept dashboard met duiding op de teamdynamiek,
                                    toegelicht in een live sessie. Inclusief concrete handvatten
                                    voor samenwerking, leiderschap en werkplekkeuzes.
                                </div>

                                <div style={offerFootnoteStyle}>
                                    Beschikbaar als verdiepend traject binnen de Team Insight omgeving.
                                </div>
                            </ExpandableOfferCard>

                            <ExpandableOfferCard
                                id="strategisch"
                                isOpen={openBlock === 'strategisch'}
                                onToggle={toggleBlock}
                                eyebrow="Voor organisaties · premium & op aanvraag"
                                title="Strategisch Team- & Werkplekinzicht"
                                teaser="Voor mensgerichte organisaties die teamdynamiek willen koppelen aan ambitie, leiderschap en werkplekstrategie."
                                accent="var(--tof-text)"
                            >
                                <p style={offerBodyText}>
                                    Organisaties die hun werkplekbeleid voor de komende jaren willen onderbouwen,
                                    hebben meer nodig dan een teambeeld. Ze hebben richting nodig — gebaseerd op
                                    eigen visie én op wat er in de buitenwereld speelt.
                                </p>

                                <p style={offerBodyText}>
                                    Deze module start met een gerichte vragenlijst over de visie en ambitie van de
                                    organisatie op het gebied van werken, werkplek en verandering. Vervolgens bespreek
                                    ik de antwoorden in een gesprek van ongeveer 45 minuten — niet om te toetsen,
                                    maar om de juiste nuance op te halen.
                                </p>

                                <p style={offerBodyText}>
                                    Op basis daarvan ontvang je een strategisch dashboard dat richting geeft voor de
                                    komende jaren. Het combineert de eigen input van de organisatie met actuele inzichten
                                    over werkplekbeleid, bezetting, beleving en organisatieverandering.
                                </p>

                                <p style={offerBodyText}>
                                    Dit dashboard geeft richting voor de komende vijf jaar. Maar richting alleen is niet
                                    genoeg — het vraagt ook om iemand die naast je staat als het spannend wordt.
                                    Ik begeleid je graag bij de eerste stappen, de moeilijke keuzes en de momenten
                                    waarop het proces even stokt.
                                </p>

                                <div style={offerHighlightStyle}>
                                    <strong>Wat je krijgt</strong>
                                    <br />
                                    Een strategisch dashboard als kompas voor de komende jaren, gebaseerd op
                                    jouw visie en actuele inzichten.
                                    <br />
                                    Optioneel: businesscoach die naast je gaat zitten als het ingewikkeld wordt.
                                </div>

                                <div style={offerFootnoteStyle}>
                                    Beschikbaar voor organisaties die teaminzicht willen vertalen naar structurele keuzes.
                                </div>
                            </ExpandableOfferCard>
                        </div>

                        <SectionCard
                            padding={26}
                            background="var(--tof-surface-soft)"
                            borderTopColor="var(--tof-accent-sage)"
                        >
                            <div style={{ display: 'grid', gap: 12 }}>
                                <SectionEyebrow>Waarom dit waardevol is</SectionEyebrow>

                                <h2
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--tof-font-heading)',
                                        fontSize: 28,
                                        lineHeight: 1.08,
                                        color: 'var(--tof-text)',
                                    }}
                                >
                                    Je team werkt.
                                    <br />
                                    Werkt het ook samen?
                                </h2>

                                <p
                                    style={{
                                        margin: 0,
                                        maxWidth: 760,
                                        color: 'var(--tof-text-soft)',
                                        fontSize: 15,
                                        lineHeight: 1.75,
                                    }}
                                >
                                    Teamdynamiek gaat niet alleen over wie er in een team zit, maar over
                                    hoe verschillen in tempo, structuur, verbinding en vernieuwing elkaar
                                    versterken of juist tegenwerken. Dáár ontstaat het echte gesprek.
                                </p>
                            </div>
                        </SectionCard>

                        <SectionCard
                            padding={26}
                            background="var(--tof-surface)"
                            borderTopColor="var(--tof-accent-rose)"
                        >
                            <div style={{ display: 'grid', gap: 12 }}>
                                <SectionEyebrow>Volgende stap</SectionEyebrow>

                                <h2
                                    style={{
                                        margin: 0,
                                        fontFamily: 'var(--tof-font-heading)',
                                        fontSize: 28,
                                        lineHeight: 1.08,
                                        color: 'var(--tof-text)',
                                    }}
                                >
                                    Klaar om verder te gaan
                                    <br />
                                    richting teamomgeving?
                                </h2>

                                <p
                                    style={{
                                        margin: 0,
                                        maxWidth: 760,
                                        color: 'var(--tof-text-soft)',
                                        fontSize: 15,
                                        lineHeight: 1.75,
                                    }}
                                >
                                    De teamomgeving is onderdeel van een traject voor organisaties en alleen toegankelijk met een persoonlijke code.
                                </p>

                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 4 }}>
                                    <PrimaryButton onClick={() => setShowAccessModal(true)}>
                                        🔒 Naar teamomgeving →
                                    </PrimaryButton>

                                    <SecondaryButton onClick={() => setPage('home')}>
                                        Terug
                                    </SecondaryButton>
                                </div>
                            </div>
                        </SectionCard>
                    </>
                )}
            </div>

            {!isMobile && showAccessModal && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 1000,
                        padding: 16,
                    }}
                >
                    <div
                        style={{
                            background: '#fff',
                            borderRadius: 16,
                            padding: 24,
                            width: '100%',
                            maxWidth: 360,
                            display: 'grid',
                            gap: 14,
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                            border: '1px solid #E5D9CD',
                        }}
                    >
                        <div
                            style={{
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 22,
                                lineHeight: 1.1,
                                color: 'var(--tof-text)',
                            }}
                        >
                            Toegangscode
                        </div>

                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                lineHeight: 1.6,
                                color: 'var(--tof-text-soft)',
                            }}
                        >
                            Voer je persoonlijke code in om door te gaan naar de teamomgeving.
                        </p>

                        <input
                            value={accessInput}
                            onChange={(e) => setAccessInput(e.target.value)}
                            placeholder="Voer code in"
                            autoFocus
                            style={{
                                padding: '10px 12px',
                                borderRadius: 8,
                                border: '1px solid #E5D9CD',
                                fontSize: 14,
                                outline: 'none',
                            }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleAccessSubmit();
                                }
                            }}
                        />

                        <div style={{ display: 'flex', gap: 10 }}>
                            <PrimaryButton
                                onClick={handleAccessSubmit}
                                style={{ flex: 1 }}
                            >
                                Ga verder
                            </PrimaryButton>

                            <SecondaryButton
                                onClick={() => {
                                    setShowAccessModal(false);
                                    setAccessInput('');
                                }}
                            >
                                Sluiten
                            </SecondaryButton>
                        </div>
                    </div>
                </div>
            )}
        </PageShell>
    );
}

function ExpandableOfferCard({
    id,
    isOpen,
    onToggle,
    eyebrow,
    title,
    teaser,
    accent = 'var(--tof-text)',
    children,
}) {
    return (
        <div
            onClick={() => onToggle(id)}
            style={{
                background: isOpen
                    ? 'linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(244,237,230,0.92) 100%)'
                    : 'var(--tof-surface)',
                borderRadius: 16,
                padding: 22,
                borderTop: `4px solid ${accent}`,
                border: isOpen ? `1px solid ${accent}` : '1px solid var(--tof-border)',
                gap: 10,
                minHeight: 240,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isOpen
                    ? '0 12px 30px rgba(40, 25, 20, 0.08)'
                    : 'var(--tof-shadow)',
                cursor: 'pointer',
                transition: 'all 0.25s ease',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <div
                style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 4,
                    height: '100%',
                    background: accent,
                    opacity: isOpen ? 1 : 0.65,
                    transition: 'all 0.25s ease',
                }}
            />

            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 12,
                }}
            >
                <div
                    style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.6,
                        color: accent,
                        fontWeight: 700,
                    }}
                >
                    {eyebrow}
                </div>

                <div
                    style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: accent,
                        lineHeight: 1,
                        transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                        flexShrink: 0,
                    }}
                >
                    +
                </div>
            </div>

            <h3
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 22,
                    lineHeight: 1.12,
                    color: 'var(--tof-text)',
                }}
            >
                {title}
            </h3>

            <p
                style={{
                    margin: 0,
                    color: 'var(--tof-text-soft)',
                    fontSize: 14,
                    lineHeight: 1.7,
                }}
            >
                {teaser}
            </p>

            {isOpen ? (
                <div style={{ display: 'grid', gap: 12, marginTop: 6 }}>
                    {children}
                </div>
            ) : null}

            <div
                style={{
                    marginTop: 4,
                    fontSize: 12,
                    color: 'var(--tof-text-muted)',
                }}
            >
                {isOpen ? 'Minder tonen' : 'Meer weten'}
            </div>
        </div>
    );
}

const offerBodyText = {
    margin: 0,
    fontSize: 14,
    lineHeight: 1.7,
    color: '#4D433D',
};

const offerHighlightStyle = {
    background: '#F4EDE6',
    borderRadius: 14,
    padding: '12px 14px',
    fontSize: 13,
    color: '#4D433D',
    lineHeight: 1.6,
};

const offerFootnoteStyle = {
    marginTop: 2,
    fontSize: 12,
    color: '#9A9088',
    fontStyle: 'italic',
};