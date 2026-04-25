import React from 'react';

export default function TeamUsage({ insights }) {
    const usage = insights?.usage || [];

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <SectionHeading
                eyebrow="Zo gebruik je dit"
                title="Klaar voor een teamoverleg, werkplekbeslissing of leiderschapsgesprek"
                lead="Niet de data zelf maakt dit dashboard waardevol — maar het gesprek dat eruit volgt. Drie concrete manieren om dit morgen al in te zetten."
            />

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 14,
                }}
            >
                {usage.map((block, index) => (
                    <UsageCard
                        key={index}
                        situation={block.situation}
                        title={block.title}
                        items={block.items}
                        accent={accentForIndex(index)}
                    />
                ))}
            </div>
        </div>
    );
}

function accentForIndex(index) {
    const colors = [
        'var(--tof-accent-rose)',
        'var(--tof-accent-sage)',
        'var(--tof-text)',
    ];
    return colors[index % colors.length];
}

// =========================
// BUILDING BLOCKS
// =========================
function SectionHeading({ eyebrow, title, lead }) {
    return (
        <div style={{ display: 'grid', gap: 8 }}>
            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.8,
                    color: 'var(--tof-text-muted)',
                    fontWeight: 700,
                }}
            >
                {eyebrow}
            </div>

            <h2
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 'clamp(22px, 2.6vw, 30px)',
                    lineHeight: 1.08,
                    color: 'var(--tof-text)',
                }}
            >
                {title}
            </h2>

            {lead ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: 14,
                        lineHeight: 1.7,
                        color: 'var(--tof-text-soft)',
                        maxWidth: 720,
                    }}
                >
                    {lead}
                </p>
            ) : null}
        </div>
    );
}

function UsageCard({ situation, title, items, accent }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderTop: `3px solid ${accent}`,
                borderRadius: 14,
                padding: '18px 20px',
                display: 'grid',
                gap: 14,
                alignContent: 'start',
            }}
        >
            <div style={{ display: 'grid', gap: 4 }}>
                <div
                    style={{
                        fontSize: 11,
                        textTransform: 'uppercase',
                        letterSpacing: 1.4,
                        color: accent,
                        fontWeight: 700,
                    }}
                >
                    {situation}
                </div>

                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 18,
                        lineHeight: 1.25,
                        color: 'var(--tof-text)',
                    }}
                >
                    {title}
                </h3>
            </div>

            <div
                style={{
                    display: 'grid',
                    gap: 10,
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            display: 'grid',
                            gridTemplateColumns: '20px 1fr',
                            gap: 10,
                            alignItems: 'start',
                        }}
                    >
                        <div
                            style={{
                                width: 20,
                                height: 20,
                                borderRadius: 999,
                                background: `${accent}18`,
                                border: `1px solid ${accent}55`,
                                color: accent,
                                fontSize: 11,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                                marginTop: 2,
                            }}
                        >
                            {index + 1}
                        </div>

                        <p
                            style={{
                                margin: 0,
                                fontSize: 14,
                                color: 'var(--tof-text-soft)',
                                lineHeight: 1.7,
                            }}
                        >
                            {item}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}
