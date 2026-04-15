import { useEffect, useRef, useState } from 'react';
import { ARCHETYPES } from '../data';
import { PageShell, SectionEyebrow } from '../ui/AppShell';

const COLOR_MAP = {
    maker: '#B05252',
    groeier: '#C28D6B',
    presteerder: '#C7A24A',
    denker: '#6F7F92',
    verbinder: '#7F9A8A',
    teamspeler: '#8B7F9A',
    zekerzoeker: '#7D8A6B',
    vernieuwer: '#D08C5B',
};

const SOFT_MAP = {
    maker: '#F4DFDF',
    groeier: '#F2E2D7',
    presteerder: '#F3EAD1',
    denker: '#DDE3EA',
    verbinder: '#DDE9E2',
    teamspeler: '#E6E0EC',
    zekerzoeker: '#E1E6DA',
    vernieuwer: '#F3DFD2',
};

const WORKPLACE_LABELS = {
    focus: 'Concentratieplekken',
    work: 'Standaard werkplekken',
    hybride: 'Hybride plekken',
    meeting: 'Overlegplekken',
    project: 'Creatieve plekken',
    team: 'Samenwerkplekken',
    learning: 'Leerplekken',
    retreat: 'Rustplekken',
    social: 'Informele plekken',
};

export default function Library() {
    const [openId, setOpenId] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const cardRefs = useRef({});

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        if (!openId) return;
        const card = cardRefs.current[openId];
        if (!card) return;

        requestAnimationFrame(() => {
            card.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        });
    }, [openId]);

    const handleToggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <PageShell padding={isMobile ? '20px 16px 28px' : '24px 20px 36px'}>
            <div
                style={{
                    animation: 'tofFadeIn 0.5s ease',
                    display: 'grid',
                    gridTemplateColumns: '1fr',
                    gap: isMobile ? 24 : 40,
                    width: '100%',
                }}
            >
                <div style={{ display: 'grid', gap: 14 }}>
                    <SectionEyebrow>05 — Persona&apos;s</SectionEyebrow>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: 'var(--tof-font-heading)',
                            fontSize: 'clamp(34px, 5vw, 62px)',
                            lineHeight: 1.04,
                            color: 'var(--tof-text)',
                            maxWidth: 760,
                        }}
                    >
                        Ontdek de 8
                        <br />
                        <span
                            style={{
                                color: 'var(--tof-accent-rose)',
                                fontStyle: 'italic',
                            }}
                        >
                            persona&apos;s.
                        </span>
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            maxWidth: 760,
                            fontSize: 16,
                            lineHeight: 1.7,
                            color: '#6F6A66',
                        }}
                    >
                        Iedere persona werkt net even anders. Klik op een kaart en ontdek wat
                        deze persoon nodig heeft in werkomgeving, ondersteuning en samenwerking.
                    </p>
                </div>

                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                        gap: isMobile ? 14 : 24,
                        alignItems: 'start',
                    }}
                >
                    {ARCHETYPES.map((persona) => {
                        const isOpen = openId === persona.id;
                        const hasOpenCard = openId !== null;
                        const isDimmed = hasOpenCard && !isOpen;

                        const accent = COLOR_MAP[persona.id] || '#B05252';
                        const soft = SOFT_MAP[persona.id] || '#F3ECE4';

                        const topWorkplaceNeeds = Object.entries(persona.bricksProfile || {})
                            .sort((a, b) => b[1] - a[1])
                            .slice(0, 3)
                            .map(([key, value]) => ({
                                key,
                                score: value,
                                label: WORKPLACE_LABELS[key] || key,
                                text: persona.bricksProfileText?.[key] || '',
                            }));

                        return (
                            <div
                                key={persona.id}
                                ref={(el) => {
                                    cardRefs.current[persona.id] = el;
                                }}
                                style={{
                                    scrollMarginTop: 24,
                                    transition: 'all 0.25s ease',
                                    opacity: isDimmed ? 0.62 : 1,
                                    transform: isOpen ? 'translateY(-2px)' : 'translateY(0)',
                                }}
                            >
                                <button
                                    type="button"
                                    onClick={() => handleToggle(persona.id)}
                                    onMouseLeave={(e) => e.currentTarget.blur()}
                                    style={{
                                        width: '100%',
                                        textAlign: 'left',
                                        background: isOpen
                                            ? `linear-gradient(135deg, ${soft} 0%, #F7F3EE 100%)`
                                            : '#FFFFFF',
                                        border: isOpen ? `1px solid ${accent}` : '1px solid var(--tof-border)',
                                        borderTop: `4px solid ${accent}`,
                                        borderRadius: 18,
                                        padding: 0,
                                        cursor: 'pointer',
                                        boxShadow: isOpen
                                            ? '0 16px 32px rgba(70, 45, 35, 0.10)'
                                            : 'var(--tof-shadow)',
                                        overflow: 'hidden',
                                        transition: 'all 0.25s ease',
                                        filter: isDimmed ? 'saturate(0.9)' : 'none',
                                        outline: 'none',
                                    }}
                                >
                                    <div style={{ padding: isMobile ? '16px 14px 14px' : '20px 20px 18px' }}>
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                gap: 12,
                                            }}
                                        >
                                            <div style={{ display: 'grid', gap: 10 }}>
                                                <h2
                                                    style={{
                                                        fontFamily: 'var(--tof-font-heading)',
                                                        fontSize: isMobile ? 26 : 30,
                                                        lineHeight: 1.04,
                                                        color: accent,
                                                        margin: 0,
                                                    }}
                                                >
                                                    {persona.name}
                                                </h2>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: '#4D433D',
                                                        fontSize: isMobile ? 14 : 15,
                                                        lineHeight: 1.6,
                                                        maxWidth: 460,
                                                    }}
                                                >
                                                    {persona.short}
                                                </p>
                                            </div>

                                            <div
                                                style={{
                                                    minWidth: 34,
                                                    height: 34,
                                                    borderRadius: 999,
                                                    background: isOpen ? accent : soft,
                                                    color: isOpen ? '#FFFFFF' : accent,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: 20,
                                                    lineHeight: 1,
                                                    fontWeight: 500,
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isOpen ? '–' : '+'}
                                            </div>
                                        </div>
                                    </div>

                                    {isOpen && (
                                        <div
                                            style={{
                                                padding: isMobile ? '0 14px 14px' : '0 20px 20px',
                                                display: 'grid',
                                                gap: 12,
                                            }}
                                        >
                                            <InfoBlock accent={accent} label="Energie van">
                                                {persona.energy_from}
                                            </InfoBlock>

                                            <InfoBlock accent={accent} label="Frustratie">
                                                {persona.frustration}
                                            </InfoBlock>

                                            <div
                                                style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr',
                                                    gap: 12,
                                                }}
                                            >
                                                <MiniCard title="Bricks" color={accent} text={persona.bricks} />
                                                <MiniCard title="Bytes" color={accent} text={persona.bytes} />
                                                <MiniCard title="Behavior" color={accent} text={persona.behavior} />
                                            </div>

                                            {!!topWorkplaceNeeds.length && (
                                                <InfoBlock accent={accent} label="Ideale werkplekmix">
                                                    <div style={{ display: 'grid', gap: 10 }}>
                                                        {topWorkplaceNeeds.map((item) => (
                                                            <div
                                                                key={item.key}
                                                                style={{
                                                                    background: '#FFFFFF',
                                                                    borderRadius: 12,
                                                                    padding: '12px 12px 10px',
                                                                    borderLeft: `4px solid ${accent}`,
                                                                    display: 'grid',
                                                                    gap: 6,
                                                                }}
                                                            >
                                                                <div
                                                                    style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        gap: 12,
                                                                        alignItems: 'center',
                                                                        flexWrap: 'wrap',
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontFamily: 'var(--tof-font-heading)',
                                                                            fontSize: 18,
                                                                            lineHeight: 1.1,
                                                                            color: 'var(--tof-text)',
                                                                        }}
                                                                    >
                                                                        {item.label}
                                                                    </div>

                                                                    <div
                                                                        style={{
                                                                            fontSize: 12,
                                                                            color: 'var(--tof-text-muted)',
                                                                            background: soft,
                                                                            borderRadius: 999,
                                                                            padding: '4px 8px',
                                                                        }}
                                                                    >
                                                                        score {item.score}
                                                                    </div>
                                                                </div>

                                                                <div
                                                                    style={{
                                                                        color: '#4D433D',
                                                                        fontSize: 13,
                                                                        lineHeight: 1.6,
                                                                    }}
                                                                >
                                                                    {item.text}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </InfoBlock>
                                            )}

                                            {!!persona.energycost?.length && (
                                                <InfoBlock accent={accent} label="Waar deze persona op leegloopt">
                                                    <ul
                                                        style={{
                                                            margin: 0,
                                                            paddingLeft: 18,
                                                            color: '#4D433D',
                                                            fontSize: 13,
                                                            lineHeight: 1.6,
                                                        }}
                                                    >
                                                        {persona.energycost.slice(0, 3).map((item) => (
                                                            <li key={item} style={{ marginBottom: 4 }}>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </InfoBlock>
                                            )}

                                            {!!persona.leadership?.length && (
                                                <InfoBlock accent={accent} label="Wat helpt in leiderschap">
                                                    <ul
                                                        style={{
                                                            margin: 0,
                                                            paddingLeft: 18,
                                                            color: '#4D433D',
                                                            fontSize: 13,
                                                            lineHeight: 1.6,
                                                        }}
                                                    >
                                                        {persona.leadership.slice(0, 3).map((item) => (
                                                            <li key={item} style={{ marginBottom: 4 }}>
                                                                {item}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </InfoBlock>
                                            )}

                                            {persona.lquote && (
                                                <div
                                                    style={{
                                                        background: soft,
                                                        borderRadius: 14,
                                                        padding: '14px 14px',
                                                        color: '#4D433D',
                                                        fontSize: 13,
                                                        lineHeight: 1.65,
                                                        fontStyle: 'italic',
                                                        border: `1px solid ${accent}22`,
                                                    }}
                                                >
                                                    “{persona.lquote}”
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </PageShell>
    );
}

function InfoBlock({ accent, label, children }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.82)',
                borderRadius: 14,
                padding: '14px 14px',
                borderLeft: `4px solid ${accent}`,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    letterSpacing: 1.5,
                    textTransform: 'uppercase',
                    color: 'var(--tof-text-muted)',
                    fontWeight: 700,
                    marginBottom: 6,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    color: '#3F342F',
                    fontSize: 14,
                    lineHeight: 1.6,
                }}
            >
                {children}
            </div>
        </div>
    );
}

function MiniCard({ title, color, text }) {
    return (
        <div
            style={{
                background: '#FFFFFF',
                borderRadius: 14,
                padding: '14px 14px 12px',
                borderTop: `4px solid ${color}`,
                border: '1px solid rgba(0,0,0,0.03)',
            }}
        >
            <div
                style={{
                    fontFamily: 'var(--tof-font-heading)',
                    fontSize: 20,
                    color,
                    marginBottom: 6,
                    lineHeight: 1.1,
                }}
            >
                {title}
            </div>

            <div
                style={{
                    color: '#4D433D',
                    fontSize: 13,
                    lineHeight: 1.6,
                }}
            >
                {text}
            </div>
        </div>
    );
}