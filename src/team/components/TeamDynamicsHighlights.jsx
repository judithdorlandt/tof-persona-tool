import React from 'react';

export default function TeamDynamicsHighlights({ insights }) {
    const items = insights?.highlights || [];

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.6,
                    color: 'var(--tof-text-muted)',
                    fontWeight: 700,
                }}
            >
                Teamdynamiek
            </div>

            <h3
                style={{
                    margin: 0,
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 24,
                    lineHeight: 1.08,
                    color: 'var(--tof-text)',
                }}
            >
                Wat opvalt in dit team
            </h3>

            <div
                style={{
                    display: 'grid',
                    gap: 12,
                    padding: 18,
                    background: 'linear-gradient(135deg, #FCF7F3 0%, #F3E8DE 100%)',
                    borderRadius: 18,
                    border: '1px solid #E7DBCF',
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#fff',
                            borderRadius: 14,
                            padding: '14px 14px',
                            borderLeft: '4px solid var(--tof-accent-rose)',
                            display: 'grid',
                            gap: 6,
                        }}
                    >
                        <div
                            style={{
                                fontSize: 12,
                                fontWeight: 700,
                                color: 'var(--tof-accent-rose)',
                                textTransform: 'uppercase',
                                letterSpacing: 1.2,
                            }}
                        >
                            Inzicht {index + 1}
                        </div>

                        <div
                            style={{
                                fontSize: 14,
                                color: '#4D433D',
                                lineHeight: 1.65,
                            }}
                        >
                            {item}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}