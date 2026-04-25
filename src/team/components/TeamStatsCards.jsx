import React from 'react';

function StatCard({ label, value, accent = 'var(--tof-accent-rose)', subtext = '' }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                border: '1px solid var(--tof-border)',
                borderRadius: 18,
                padding: 22,
                display: 'grid',
                gap: 10,
                boxShadow: 'var(--tof-shadow)',
                minHeight: 136,
                alignContent: 'start',
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
                }}
            />

            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.8,
                    color: 'var(--tof-text-muted)',
                    fontWeight: 700,
                    paddingLeft: 10,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 'clamp(24px, 2.6vw, 32px)',
                    lineHeight: 1.05,
                    color: 'var(--tof-text)',
                    paddingLeft: 10,
                    wordBreak: 'break-word',
                }}
            >
                {value}
            </div>

            {subtext ? (
                <div
                    style={{
                        fontSize: 13,
                        lineHeight: 1.6,
                        color: 'var(--tof-text-soft)',
                        paddingLeft: 10,
                    }}
                >
                    {subtext}
                </div>
            ) : null}
        </div>
    );
}

export default function TeamStatsCards({ aggregate }) {
    const dominant = aggregate?.sortedPersonas?.[0]?.name || '—';
    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0]?.label
        || aggregate?.sortedWorkplaceNeeds?.[0]?.key
        || '—';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 16,
            }}
        >
            <StatCard
                label="Aantal responses"
                value={aggregate?.teamCount ?? 0}
                accent="var(--tof-accent-rose)"
                subtext="Ingevulde profielen in dit dashboard"
            />

            <StatCard
                label="Dominante werkstijl"
                value={dominant}
                accent="var(--tof-accent-sage)"
                subtext="Meest aanwezige primaire werkstijl"
            />

            <StatCard
                label="Top werkplekbehoefte"
                value={topNeed}
                accent="var(--tof-text)"
                subtext="Sterkste ruimtelijke behoefte op teamniveau"
            />
        </div>
    );
}
