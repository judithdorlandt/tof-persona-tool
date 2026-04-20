import React from 'react';

export default function TeamPersonaDistribution({ aggregate }) {
    const items = aggregate?.sortedPersonas || [];

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
                Verdeling van werkstijlen
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
                Hoe dit team is opgebouwd
            </h3>

            <div
                style={{
                    display: 'grid',
                    gap: 12,
                    padding: 18,
                    background: 'linear-gradient(135deg, #FCF8F4 0%, #F5EEE7 100%)',
                    borderRadius: 18,
                    border: '1px solid #E7DBCF',
                }}
            >
                {items.map((item, index) => {
                    const percentage =
                        aggregate?.teamCount > 0
                            ? Math.round((item.count / aggregate.teamCount) * 100)
                            : 0;

                    return (
                        <div
                            key={item.id}
                            style={{
                                display: 'grid',
                                gap: 6,
                                background: '#fff',
                                borderRadius: 14,
                                padding: '12px 14px',
                                border: '1px solid #EEE4DA',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 10,
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 24,
                                            height: 24,
                                            borderRadius: 999,
                                            background: index === 0 ? 'var(--tof-accent-rose)' : '#EADFD4',
                                            color: index === 0 ? '#fff' : '#6D615A',
                                            fontSize: 12,
                                            fontWeight: 700,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                        }}
                                    >
                                        {index + 1}
                                    </div>

                                    <span
                                        style={{
                                            fontWeight: 600,
                                            fontSize: 14,
                                            color: '#3F342F',
                                        }}
                                    >
                                        {item.name}
                                    </span>
                                </div>

                                <span
                                    style={{
                                        fontSize: 13,
                                        color: '#7C7069',
                                        fontWeight: 600,
                                    }}
                                >
                                    {percentage}%
                                </span>
                            </div>

                            <div
                                style={{
                                    height: 9,
                                    background: '#EFE3D8',
                                    borderRadius: 999,
                                    overflow: 'hidden',
                                }}
                            >
                                <div
                                    style={{
                                        width: `${Math.max(percentage, 4)}%`,
                                        height: '100%',
                                        background: index === 0 ? 'var(--tof-accent-rose)' : '#CDB8A7',
                                        borderRadius: 999,
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}