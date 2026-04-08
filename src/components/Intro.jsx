import React from 'react';

export default function Intro({ setPage }) {
    const isMobile = window.innerWidth < 900;

    return (
        <div
            className="fade-up"
            style={{
                minHeight: 'calc(100vh - 88px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: isMobile ? '20px 16px 24px' : '20px 16px',
                background: '#f7f2ec',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 980,
                    display: 'grid',
                    gap: isMobile ? 16 : 20,
                }}
            >
                {/* HEADER */}
                <div>
                    <div
                        style={{
                            color: '#b85c5c',
                            letterSpacing: 2,
                            fontSize: 12,
                            marginBottom: 12,
                            textTransform: 'uppercase',
                        }}
                    >
                        02 — Voor je begint
                    </div>

                    <h1
                        style={{
                            fontSize: 'clamp(32px, 4.4vw, 58px)',
                            lineHeight: 1.08,
                            fontFamily: 'Playfair Display',
                            fontWeight: 500,
                            margin: 0,
                            maxWidth: 760,
                            color: '#1f1b18',
                        }}
                    >
                        Kort voordat je start.
                    </h1>

                    <p
                        style={{
                            marginTop: 14,
                            maxWidth: 680,
                            lineHeight: 1.58,
                            color: '#444',
                            fontSize: isMobile ? 15 : 16,
                        }}
                    >
                        Je krijgt straks een reeks vragen over hoe jij werkt, keuzes maakt en
                        energie krijgt. Er passen soms meerdere antwoorden bij je. Kies dan
                        steeds het antwoord dat het meest dichtbij voelt.
                    </p>
                </div>

                {/* UITLEG BLOKKEN */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                        gap: 14,
                    }}
                >
                    <InfoCard
                        accent="#b85c5c"
                        title="Hoe kies je?"
                        text="Kies het antwoord dat het meest op jou lijkt. Twijfel je tussen meerdere? Ga voor wat het sterkst voelt."
                    />

                    <InfoCard
                        accent="#6b8f7b"
                        title="Meerdere passend?"
                        text="Dat is normaal. Je bent geen hokje. Het resultaat laat juist ook je mix van persona’s zien."
                    />

                    <InfoCard
                        accent="#c7a24a"
                        title="Hoe lang duurt het?"
                        text="Ongeveer 5 minuten. Je hoeft niets voor te bereiden."
                    />
                </div>

                {/* EXTRA REGEL */}
                <div
                    style={{
                        background: 'white',
                        borderRadius: 14,
                        padding: isMobile ? '16px 16px' : '18px 20px',
                        borderTop: '4px solid #b85c5c',
                        border: '1px solid #e7ddd4',
                    }}
                >
                    <p
                        style={{
                            margin: 0,
                            color: '#4a433e',
                            fontSize: isMobile ? 14 : 15,
                            lineHeight: 1.6,
                        }}
                    >
                        <strong style={{ color: '#1f1b18' }}>Belangrijk:</strong> dit is geen
                        goed-fout test. Het gaat niet om wat beter klinkt, maar om wat het
                        meest natuurlijk bij jou past.
                    </p>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setPage('quiz')}
                        style={{
                            background: '#b85c5c',
                            color: 'white',
                            padding: '14px 22px',
                            borderRadius: 10,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 15,
                            fontWeight: 500,
                            minWidth: isMobile ? '100%' : 180,
                        }}
                    >
                        Start de test
                    </button>

                    <button
                        onClick={() => setPage('home')}
                        style={{
                            background: 'transparent',
                            color: '#1a1a1a',
                            border: '1px solid #1a1a1a',
                            padding: '14px 22px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontSize: 15,
                            fontWeight: 500,
                            minWidth: isMobile ? '100%' : 180,
                        }}
                    >
                        Terug
                    </button>
                </div>
            </div>
        </div>
    );
}

function InfoCard({ accent, title, text }) {
    return (
        <div
            style={{
                background: 'white',
                borderRadius: 14,
                padding: 18,
                borderTop: `4px solid ${accent}`,
                border: '1px solid #e7ddd4',
                minHeight: 122,
            }}
        >
            <h3
                style={{
                    fontFamily: 'Playfair Display',
                    marginTop: 0,
                    marginBottom: 8,
                    fontSize: 20,
                    color: '#1f1b18',
                }}
            >
                {title}
            </h3>

            <p
                style={{
                    color: '#555',
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.65,
                }}
            >
                {text}
            </p>
        </div>
    );
}