import React from 'react';
import { useCopy } from '../../i18n/LanguageContext';

export default function TeamEnergyFriction({ insights }) {
    const t = useCopy().teamPanels.energyFriction;
    const energy = insights?.energy || [];
    const friction = insights?.friction || [];

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <SectionHeading
                eyebrow={t.section.eyebrow}
                title={t.section.title}
                lead={t.section.lead}
            />

            {/* ENERGIE */}
            <div style={{ display: 'grid', gap: 12 }}>
                <BlockHeader
                    icon="↑"
                    accent="var(--tof-accent-sage)"
                    title={t.energy.title}
                    description={t.energy.description}
                />

                {energy.length === 0 ? (
                    <EmptyState text={t.energy.empty} />
                ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                        {energy.map((item, index) => (
                            <InsightCard
                                key={index}
                                accent="var(--tof-accent-sage)"
                                label={t.energy.label(item.persona, item.percentage)}
                                body={item.body}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* WRIJVING */}
            <div style={{ display: 'grid', gap: 12, marginTop: 8 }}>
                <BlockHeader
                    icon="↔"
                    accent="var(--tof-accent-rose)"
                    title={t.friction.title}
                    description={t.friction.description}
                />

                {friction.length === 0 ? (
                    <EmptyState text={t.friction.empty} />
                ) : (
                    <div style={{ display: 'grid', gap: 10 }}>
                        {friction.map((item, index) => (
                            <InsightCard
                                key={index}
                                accent="var(--tof-accent-rose)"
                                label={item.label}
                                body={item.body}
                                detail={item.detail}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
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
                        maxWidth: 680,
                    }}
                >
                    {lead}
                </p>
            ) : null}
        </div>
    );
}

function BlockHeader({ icon, accent, title, description }) {
    return (
        <div style={{ display: 'grid', gap: 4 }}>
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                }}
            >
                <div
                    style={{
                        width: 28,
                        height: 28,
                        borderRadius: 999,
                        background: `${accent}22`,
                        border: `1px solid ${accent}66`,
                        color: accent,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </div>

                <h3
                    style={{
                        margin: 0,
                        fontFamily: 'var(--tof-font-heading)',
                        fontSize: 18,
                        lineHeight: 1.2,
                        color: 'var(--tof-text)',
                    }}
                >
                    {title}
                </h3>
            </div>

            {description ? (
                <p
                    style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'var(--tof-text-muted)',
                        paddingLeft: 38,
                    }}
                >
                    {description}
                </p>
            ) : null}
        </div>
    );
}

function InsightCard({ accent, label, body, detail }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderLeft: `3px solid ${accent}`,
                borderRadius: 12,
                padding: '14px 16px',
                display: 'grid',
                gap: 6,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: accent,
                    textTransform: 'uppercase',
                    letterSpacing: 1.4,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontSize: 14,
                    color: 'var(--tof-text)',
                    lineHeight: 1.7,
                }}
            >
                {body}
            </div>

            {detail ? (
                <div
                    style={{
                        fontSize: 12,
                        color: 'var(--tof-text-muted)',
                        fontStyle: 'italic',
                        marginTop: 2,
                    }}
                >
                    {detail}
                </div>
            ) : null}
        </div>
    );
}

function EmptyState({ text }) {
    return (
        <div
            style={{
                padding: 14,
                fontSize: 14,
                color: 'var(--tof-text-muted)',
                textAlign: 'center',
                background: 'var(--tof-bg)',
                borderRadius: 12,
                border: '1px solid var(--tof-border)',
                lineHeight: 1.6,
            }}
        >
            {text}
        </div>
    );
}
