import React, { useEffect, useState } from 'react';

export default function Pricing() {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const openWebsite = () => {
        window.open('https://www.tof.services', '_blank', 'noopener,noreferrer');
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                background: '#f7f2ec',
                padding: isMobile ? '24px 16px 40px' : '48px 24px 72px',
            }}
        >
            <div
                style={{
                    maxWidth: 1180,
                    margin: '0 auto',
                    display: 'grid',
                    gap: 24,
                }}
            >
                <div style={{ maxWidth: 820 }}>
                    <div
                        style={{
                            color: '#b85c5c',
                            letterSpacing: 2,
                            fontSize: 12,
                            marginBottom: 12,
                            textTransform: 'uppercase',
                        }}
                    >
                        Aanbod
                    </div>

                    <h1
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: isMobile ? 34 : 54,
                            lineHeight: 1.05,
                            margin: 0,
                            color: '#1f1b18',
                        }}
                    >
                        Van inzicht naar echte
                        <br />
                        <span style={{ color: '#b85c5c', fontStyle: 'italic' }}>
                            beweging in je team
                        </span>
                    </h1>

                    <p
                        style={{
                            marginTop: 16,
                            color: '#555',
                            fontSize: 16,
                            lineHeight: 1.7,
                            maxWidth: 760,
                        }}
                    >
                        Niet alleen zien hoe mensen werken — maar begrijpen waar het schuurt,
                        waarom het schuurt en wat je morgen anders doet.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
                        gap: 16,
                        alignItems: 'stretch',
                    }}
                >
                    <PricingCard
                        eyebrow="Instap"
                        title="Persona Insight"
                        price="Gratis"
                        text="Voor individueel inzicht in hoe jij werkt en waar jouw energie zit."
                        bullets={[
                            'Inzicht in jouw werkstijl',
                            'Waar je energie van krijgt en verliest',
                            'Eerste vertaalslag naar gedrag en werkomgeving',
                        ]}
                        buttonLabel="Start de test"
                        onClick={openWebsite}
                    />

                    <PricingCard
                        eyebrow="Team"
                        title="Team Insight & Quick Wins"
                        price="€1.250"
                        text="Van losse profielen naar helder teaminzicht — inclusief wat je morgen al anders kunt doen."
                        bullets={[
                            'Verdeling van persona’s in je team',
                            'Waar energie ontstaat en waar het schuurt',
                            'Bricks, Bytes, Behaviour vertaald naar team',
                            'Direct toepasbare interventies',
                        ]}
                        buttonLabel="Maak dit zichtbaar in je team"
                        onClick={openWebsite}
                        highlight
                    />

                    <PricingCard
                        eyebrow="Sessie"
                        title="Team Dynamics Sessie"
                        price="€2.500"
                        text="Hier ontstaat het echte gesprek over samenwerking, spanningen en wat dit vraagt van leiderschap."
                        bullets={[
                            'Live sessie met team of MT',
                            'Duiding van patronen en spanningen',
                            'Concrete interventies voor samenwerking',
                            'Vertaling naar leiderschap en teamritme',
                        ]}
                        buttonLabel="Plan een teamsessie"
                        onClick={openWebsite}
                    />

                    <PricingCard
                        eyebrow="Strategisch"
                        title="Strategisch Team- & Werkplekinzicht"
                        price="vanaf €3.950"
                        text="Voor organisaties die teamdynamiek willen koppelen aan visie, ambitie en werkplekstrategie."
                        bullets={[
                            'Alles uit Team Insight + sessie',
                            'Verdieping op visie en richting',
                            'Vertaling naar samenwerking, leiderschap en werkplek',
                            'Concrete strategische interventies',
                        ]}
                        buttonLabel="Plan een strategisch gesprek"
                        onClick={openWebsite}
                    />
                </div>

                <div
                    style={{
                        background: 'white',
                        borderRadius: 18,
                        padding: isMobile ? 18 : 24,
                        border: '1px solid #e7ddd4',
                        display: 'grid',
                        gap: 12,
                    }}
                >
                    <div
                        style={{
                            fontSize: 11,
                            textTransform: 'uppercase',
                            letterSpacing: 1.6,
                            color: '#7a6d66',
                        }}
                    >
                        Twijfel waar je moet starten?
                    </div>

                    <h2
                        style={{
                            fontFamily: 'Playfair Display',
                            fontSize: isMobile ? 26 : 34,
                            lineHeight: 1.08,
                            margin: 0,
                            color: '#1f1b18',
                        }}
                    >
                        Begin klein.
                    </h2>

                    <p
                        style={{
                            margin: 0,
                            color: '#555',
                            lineHeight: 1.7,
                            fontSize: 15,
                            maxWidth: 760,
                        }}
                    >
                        De meeste organisaties starten met een Team Insight Scan en gebruiken dat
                        als basis voor verdere keuzes. Je hoeft het nog niet groot te maken om het
                        goed te doen.
                    </p>
                </div>
            </div>
        </div>
    );
}

function PricingCard({
    eyebrow,
    title,
    price,
    text,
    bullets,
    buttonLabel,
    onClick,
    highlight = false,
}) {
    return (
        <div
            style={{
                background: highlight ? '#1f1b18' : 'white',
                color: highlight ? 'white' : '#1f1b18',
                borderRadius: 18,
                padding: 20,
                border: highlight ? '1px solid #1f1b18' : '1px solid #e7ddd4',
                boxShadow: highlight
                    ? '0 16px 36px rgba(31,27,24,0.18)'
                    : '0 10px 26px rgba(70, 45, 35, 0.05)',
                display: 'grid',
                gap: 14,
            }}
        >
            <div>
                <div
                    style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.6,
                        color: highlight ? '#d8a8a8' : '#7a6d66',
                        marginBottom: 10,
                        fontWeight: 700,
                    }}
                >
                    {eyebrow}
                </div>

                <h3
                    style={{
                        fontFamily: 'Playfair Display',
                        fontSize: 28,
                        lineHeight: 1.08,
                        margin: 0,
                        marginBottom: 8,
                        color: highlight ? '#fff' : '#1f1b18',
                    }}
                >
                    {title}
                </h3>

                <div
                    style={{
                        fontSize: 24,
                        fontWeight: 700,
                        color: highlight ? '#fff' : '#b85c5c',
                        marginBottom: 10,
                    }}
                >
                    {price}
                </div>

                <p
                    style={{
                        margin: 0,
                        color: highlight ? '#f0e7df' : '#555',
                        fontSize: 14,
                        lineHeight: 1.7,
                    }}
                >
                    {text}
                </p>
            </div>

            <ul
                style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: highlight ? '#f0e7df' : '#4d433d',
                    fontSize: 14,
                    lineHeight: 1.8,
                }}
            >
                {bullets.map((item) => (
                    <li key={item}>{item}</li>
                ))}
            </ul>

            <button
                type="button"
                onClick={onClick}
                style={{
                    marginTop: 4,
                    background: highlight ? '#b85c5c' : '#1f1b18',
                    color: 'white',
                    padding: '12px 16px',
                    borderRadius: 10,
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                }}
            >
                {buttonLabel} →
            </button>
        </div>
    );
}