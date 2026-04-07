export default function Home({ setPage }) {
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
                    maxWidth: 1100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 20,
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
                        01 — TOF Persona Tool
                    </div>

                    <h1
                        style={{
                            fontSize: 'clamp(34px, 4.5vw, 64px)',
                            lineHeight: 1.08,
                            fontFamily: 'Playfair Display',
                            fontWeight: 500,
                            margin: 0,
                            maxWidth: 760,
                        }}
                    >
                        Je werkplek klopt.
                        <br />
                        <span style={{ color: '#b85c5c', fontStyle: 'italic' }}>
                            Je mensen nog niet altijd.
                        </span>
                    </h1>

                    <p
                        style={{
                            marginTop: 16,
                            maxWidth: 560,
                            lineHeight: 1.55,
                            color: '#444',
                            fontSize: 16,
                        }}
                    >
                        Niet omdat ze niet willen — maar omdat de omgeving niet aansluit op hoe ze werken.
                        Dit instrument maakt dat zichtbaar.
                    </p>
                </div>

                {/* CTA */}
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                    <button
                        onClick={() => setPage('intro')}
                        style={{
                            background: '#b85c5c',
                            color: 'white',
                            padding: '14px 22px',
                            borderRadius: 10,
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: 15,
                            fontWeight: 500,
                        }}
                    >
                        Start de test
                    </button>

                    <button
                        onClick={() => setPage('library')}
                        style={{
                            background: 'transparent',
                            border: '1px solid #1a1a1a',
                            padding: '14px 22px',
                            borderRadius: 10,
                            cursor: 'pointer',
                            fontSize: 15,
                            fontWeight: 500,
                        }}
                    >
                        Bekijk persona&apos;s
                    </button>
                </div>

                {/* CARDS */}
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                        gap: 16,
                    }}
                >
                    <div
                        style={{
                            background: 'white',
                            borderRadius: 14,
                            padding: 20,
                            borderTop: '4px solid #b85c5c',
                        }}
                    >
                        <h3 style={{ fontFamily: 'Playfair Display', marginTop: 0, fontSize: 20 }}>
                            Voor jezelf
                        </h3>
                        <p style={{ color: '#555', marginBottom: 0, fontSize: 14 }}>
                            Ontdek hoe jij werkt en wat je nodig hebt.
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'white',
                            borderRadius: 14,
                            padding: 20,
                            borderTop: '4px solid #6b8f7b',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                background: '#6b8f7b',
                                color: 'white',
                                fontSize: 10,
                                padding: '3px 6px',
                                borderRadius: 6,
                            }}
                        >
                            🔒
                        </div>

                        <h3 style={{ fontFamily: 'Playfair Display', marginTop: 0, fontSize: 20 }}>
                            Teams
                        </h3>
                        <p style={{ color: '#555', marginBottom: 0, fontSize: 14 }}>
                            Zie waar energie lekt en waar het schuurt.
                        </p>
                    </div>

                    <div
                        style={{
                            background: 'white',
                            borderRadius: 14,
                            padding: 20,
                            borderTop: '4px solid #c7a24a',
                            position: 'relative',
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 10,
                                right: 10,
                                background: '#c7a24a',
                                color: 'white',
                                fontSize: 10,
                                padding: '3px 6px',
                                borderRadius: 6,
                            }}
                        >
                            🔒
                        </div>

                        <h3 style={{ fontFamily: 'Playfair Display', marginTop: 0, fontSize: 20 }}>
                            Leiding
                        </h3>
                        <p style={{ color: '#555', marginBottom: 0, fontSize: 14 }}>
                            Stuur beter op gedrag, niet alleen op output.
                        </p>
                    </div>
                </div>

                {/* FOOTER */}
                <p style={{ marginTop: 6, color: '#666', fontSize: 13 }}>
                    🔒 Premium: Vertaal dit naar team- en organisatie-inzicht.
                </p>
            </div>
        </div>
    );
}