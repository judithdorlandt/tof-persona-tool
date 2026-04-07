export default function Intro({ setPage }) {
    return (
        <div
            style={{
                minHeight: 'calc(100vh - 88px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '20px 16px',
                background: '#f7f2ec',
                boxSizing: 'border-box',
            }}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: 960,
                    display: 'grid',
                    gap: 18,
                }}
            >
                <div>
                    <div
                        style={{
                            color: '#b85c5c',
                            letterSpacing: 2,
                            fontSize: 12,
                            marginBottom: 10,
                            textTransform: 'uppercase',
                        }}
                    >
                        02 — Voordat je begint
                    </div>

                    <h1
                        style={{
                            fontSize: 'clamp(32px, 4vw, 46px)',
                            lineHeight: 1.08,
                            fontFamily: 'Playfair Display',
                            fontWeight: 500,
                            margin: 0,
                            color: '#1f1b18',
                            maxWidth: 760,
                        }}
                    >
                        In een paar minuten ontdek je hoe jij het liefst werkt.
                    </h1>

                    <p
                        style={{
                            marginTop: 12,
                            marginBottom: 0,
                            color: '#4d433d',
                            fontSize: 16,
                            lineHeight: 1.55,
                            maxWidth: 720,
                        }}
                    >
                        Je ontdekt waar jij energie van krijgt, wat je leegtrekt en wat jij nodig hebt in werk, ICT en samenwerking.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 14,
                    }}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 18,
                            padding: '18px 18px 16px',
                            borderTop: '4px solid #b85c5c',
                            boxShadow: '0 8px 22px rgba(70, 45, 35, 0.05)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.3,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 6,
                            }}
                        >
                            Wat je doet
                        </div>

                        <div
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: 24,
                                color: '#1f1b18',
                                marginBottom: 6,
                            }}
                        >
                            Kort en scherp
                        </div>

                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#4d433d' }}>
                            Je beantwoordt een reeks vragen over hoe jij werkt in de praktijk.
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'white',
                            borderRadius: 18,
                            padding: '18px 18px 16px',
                            borderTop: '4px solid #7f9a8a',
                            boxShadow: '0 8px 22px rgba(70, 45, 35, 0.05)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.3,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 6,
                            }}
                        >
                            Hoe je kiest
                        </div>

                        <div
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: 24,
                                color: '#1f1b18',
                                marginBottom: 6,
                            }}
                        >
                            Kies wat het dichtstbij ligt
                        </div>

                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#4d433d' }}>
                            Soms passen meerdere antwoorden. Kies dan steeds wat het meest op jou lijkt.
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'white',
                            borderRadius: 18,
                            padding: '18px 18px 16px',
                            borderTop: '4px solid #c7a24a',
                            boxShadow: '0 8px 22px rgba(70, 45, 35, 0.05)',
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                letterSpacing: 1.3,
                                textTransform: 'uppercase',
                                color: '#7a6d66',
                                marginBottom: 6,
                            }}
                        >
                            Goed om te weten
                        </div>

                        <div
                            style={{
                                fontFamily: 'Playfair Display',
                                fontSize: 24,
                                color: '#1f1b18',
                                marginBottom: 6,
                            }}
                        >
                            ± 5 minuten
                        </div>

                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.5, color: '#4d433d' }}>
                            Geen goed of fout. Je eerste gevoel is meestal het meest eerlijk.
                        </p>
                    </div>
                </div>

                <div
                    style={{
                        background: '#f3ece4',
                        borderRadius: 18,
                        padding: '16px 18px',
                        borderLeft: '4px solid #6f7f92',
                    }}
                >
                    <div
                        style={{
                            fontSize: 12,
                            letterSpacing: 1.3,
                            textTransform: 'uppercase',
                            color: '#7a6d66',
                            marginBottom: 6,
                        }}
                    >
                        Wat je krijgt
                    </div>

                    <p
                        style={{
                            margin: 0,
                            color: '#4d433d',
                            fontSize: 15,
                            lineHeight: 1.55,
                        }}
                    >
                        Na afloop zie je jouw persona, jouw mix en wat jij nodig hebt in <strong>Bricks, Bytes en Behavior</strong>.
                    </p>
                </div>

                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginTop: 2,
                    }}
                >
                    <button
                        onClick={() => setPage('home')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #1f1b18',
                            color: '#1f1b18',
                            padding: '12px 18px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontSize: 14,
                        }}
                    >
                        Terug
                    </button>

                    <button
                        onClick={() => setPage('quiz')}
                        style={{
                            background: '#b85c5c',
                            color: 'white',
                            padding: '14px 22px',
                            borderRadius: 12,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 16,
                            fontWeight: 500,
                        }}
                    >
                        Start de vragen
                    </button>
                </div>
            </div>
        </div>
    );
}