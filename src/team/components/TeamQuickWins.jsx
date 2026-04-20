import React from 'react';

export default function TeamQuickWins({ insights }) {
    const items = insights?.quickWins || [];

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
                Direct toepasbaar
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
                Quick wins voor dit team
            </h3>

            <div
                style={{
                    display: 'grid',
                    gap: 12,
                    background: 'linear-gradient(135deg, #FBF6F1 0%, #F2E8DE 100%)',
                    padding: 18,
                    borderRadius: 18,
                    border: '1px solid #E8DDD2',
                }}
            >
                {items.map((item, index) => (
                    <div
                        key={index}
                        style={{
                            background: '#fff',
                            borderRadius: 14,
                            padding: '14px 14px',
                            display: 'flex',
                            gap: 12,
                            alignItems: 'flex-start',
                            border: '1px solid #EFE3D8',
                        }}
                    >
                        <div
                            style={{
                                width: 26,
                                height: 26,
                                borderRadius: 999,
                                background: 'var(--tof-accent-rose)',
                                color: '#fff',
                                fontSize: 13,
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                            }}
                        >
                            {index + 1}
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