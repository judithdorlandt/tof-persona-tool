import React from 'react';

function StatCard({ label, value, accent = 'var(--tof-accent-rose)', subtext = '' }) {
    return (
        <div
            style={{
                background: 'linear-gradient(135deg, #FFFFFF 0%, #F8F3EE 100%)',
                border: '1px solid #E8DDD2',
                borderRadius: 20,
                padding: 22,
                display: 'grid',
                gap: 10,
                boxShadow: '0 12px 28px rgba(60, 38, 28, 0.06)',
                minHeight: 132,
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
                    opacity: 0.95,
                }}
            />

            <div
                style={{
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: 1.6,
                    color: '#8A7E76',
                    fontWeight: 700,
                    paddingLeft: 8,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 30,
                    lineHeight: 1.02,
                    color: 'var(--tof-text)',
                    paddingLeft: 8,
                }}
            >
                {value}
            </div>

            {subtext ? (
                <div
                    style={{
                        fontSize: 13,
                        lineHeight: 1.55,
                        color: 'var(--tof-text-soft)',
                        paddingLeft: 8,
                    }}
                >
                    {subtext}
                </div>
            ) : null}
        </div>
    );
}

export default function TeamStatsCards({ aggregate }) {
    const dominant = aggregate?.sortedPersonas?.[0]?.name || '-';
    const topNeed = aggregate?.sortedWorkplaceNeeds?.[0]?.key || '-';

    return (
        <div
            style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 16,
            }}
        >
            <StatCard
                label="Aantal reacties"
                value={aggregate?.teamCount ?? 0}
                accent="var(--tof-accent-rose)"
                subtext="Aantal ingevulde profielen in dit dashboard"
            />

            <StatCard
                label="Dominante werkstijl"
                value={dominant}
                accent="var(--tof-accent-sage)"
                subtext="Meest aanwezige primaire werkstijl in het team"
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