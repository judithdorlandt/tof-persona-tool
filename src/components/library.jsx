import { useEffect, useRef, useState } from 'react';
import { ARCHETYPES } from '../data';

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

    const colorMap = {
        maker: '#b85c5c',
        groeier: '#c28d6b',
        presteerder: '#c7a24a',
        denker: '#6f7f92',
        verbinder: '#7f9a8a',
        teamspeler: '#8b7f9a',
        zekerzoeker: '#7d8a6b',
        vernieuwer: '#d08c5b',
    };

    const softMap = {
        maker: '#f4dfdf',
        groeier: '#f2e2d7',
        presteerder: '#f3ead1',
        denker: '#dde3ea',
        verbinder: '#dde9e2',
        teamspeler: '#e6e0ec',
        zekerzoeker: '#e1e6da',
        vernieuwer: '#f3dfd2',
    };

    const handleToggle = (id) => {
        setOpenId((prev) => (prev === id ? null : id));
    };

    return (
        <div
            className="fade-up"
            style={{
                maxWidth: 1120,
                margin: '0 auto',
                padding: isMobile ? '20px 12px 40px' : '40px 20px 64px',
            }}
        >
            <div
                style={{
                    color: '#b85c5c',
                    letterSpacing: 2,
                    fontSize: 12,
                    marginBottom: 10,
                    textTransform: 'uppercase',
                }}
            >
                05 — Persona&apos;s
            </div>

            <h1
                style={{
                    fontSize: isMobile ? 34 : 48,
                    lineHeight: 1.02,
                    fontFamily: 'Playfair Display',
                    fontWeight: 500,
                    margin: 0,
                    color: '#1f1b18',
                }}
            >
                Ontdek de 8 persona&apos;s
            </h1>

            <p
                style={{
                    marginTop: 14,
                    maxWidth: 760,
                    color: '#5d514a',
                    fontSize: isMobile ? 15 : 17,
                    lineHeight: 1.6,
                }}
            >
                Iedere persona werkt net even anders. Klik op een kaart en ontdek wat
                deze persoon nodig heeft in werkomgeving, ondersteuning en samenwerking.
            </p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: 16,
                    marginTop: 22,
                    alignItems: 'start',
                }}
            >
                {ARCHETYPES.map((a) => {
                    const isOpen = openId === a.id;
                    const hasOpenCard = openId !== null;
                    const isDimmed = hasOpenCard && !isOpen;

                    const accent = colorMap[a.id] || '#b85c5c';
                    const soft = softMap[a.id] || '#f3ece4';

                    return (
                        <div
                            key={a.id}
                            ref={(el) => {
                                cardRefs.current[a.id] = el;
                            }}
                            style={{
                                scrollMarginTop: 24,
                                transition: 'all 0.25s ease',
                                opacity: isDimmed ? 0.6 : 1,
                                transform: isOpen ? 'translateY(-2px)' : 'translateY(0)',
                            }}
                        >
                            <button
                                type="button"
                                onClick={() => handleToggle(a.id)}
                                onMouseLeave={(e) => e.currentTarget.blur()}
                                style={{
                                    width: '100%',
                                    textAlign: 'left',
                                    background: isOpen
                                        ? `linear-gradient(135deg, ${soft} 0%, #f7f2ec 100%)`
                                        : '#ffffff',
                                    border: isOpen ? `1px solid ${accent}` : '1px solid #e5d9ce',
                                    borderTop: `4px solid ${accent}`,
                                    borderRadius: 18,
                                    padding: 0,
                                    cursor: 'pointer',
                                    boxShadow: isOpen
                                        ? '0 16px 32px rgba(70, 45, 35, 0.10)'
                                        : '0 8px 20px rgba(70, 45, 35, 0.05)',
                                    overflow: 'hidden',
                                    transition: 'all 0.25s ease',
                                    filter: isDimmed ? 'saturate(0.9)' : 'none',
                                    outline: 'none',
                                }}
                            >
                                <div style={{ padding: isMobile ? '16px 14px 14px' : '18px 18px 16px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: 12,
                                        }}
                                    >
                                        <div>
                                            <h2
                                                style={{
                                                    fontFamily: 'Playfair Display',
                                                    fontSize: isMobile ? 26 : 30,
                                                    lineHeight: 1.04,
                                                    color: accent,
                                                    margin: 0,
                                                }}
                                            >
                                                {a.name}
                                            </h2>

                                            <p
                                                style={{
                                                    marginTop: 10,
                                                    marginBottom: 0,
                                                    color: '#4d433d',
                                                    fontSize: isMobile ? 14 : 15,
                                                    lineHeight: 1.5,
                                                    maxWidth: 460,
                                                }}
                                            >
                                                {a.short}
                                            </p>
                                        </div>

                                        <div
                                            style={{
                                                minWidth: 34,
                                                height: 34,
                                                borderRadius: 999,
                                                background: isOpen ? accent : soft,
                                                color: isOpen ? '#fff' : accent,
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
                                            padding: isMobile ? '0 14px 14px' : '0 18px 18px',
                                            display: 'grid',
                                            gap: 10,
                                        }}
                                    >
                                        <InfoBlock accent={accent} label="Energie van">
                                            {a.energy_from}
                                        </InfoBlock>

                                        <InfoBlock accent={accent} label="Frustratie">
                                            {a.frustration}
                                        </InfoBlock>

                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: isMobile ? '1fr' : '1fr',
                                                gap: 10,
                                            }}
                                        >
                                            <MiniCard title="Bricks" color={accent} text={a.bricks} />
                                            <MiniCard title="Bytes" color={accent} text={a.bytes} />
                                            <MiniCard title="Behavior" color={accent} text={a.behavior} />
                                        </div>

                                        {!!a.energycost?.length && (
                                            <InfoBlock accent={accent} label="Waar deze persona op leegloopt">
                                                <ul
                                                    style={{
                                                        margin: 0,
                                                        paddingLeft: 18,
                                                        color: '#4d433d',
                                                        fontSize: 13,
                                                        lineHeight: 1.5,
                                                    }}
                                                >
                                                    {a.energycost.slice(0, 3).map((item) => (
                                                        <li key={item} style={{ marginBottom: 4 }}>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </InfoBlock>
                                        )}
                                    </div>
                                )}
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function InfoBlock({ accent, label, children }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.8)',
                borderRadius: 14,
                padding: '14px 14px',
                borderLeft: `4px solid ${accent}`,
            }}
        >
            <div
                style={{
                    fontSize: 11,
                    letterSpacing: 1.3,
                    textTransform: 'uppercase',
                    color: '#7a6d66',
                    marginBottom: 6,
                }}
            >
                {label}
            </div>

            <div
                style={{
                    color: '#3f342f',
                    fontSize: 14,
                    lineHeight: 1.55,
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
                background: '#fff',
                borderRadius: 14,
                padding: '14px 14px 12px',
                borderTop: `4px solid ${color}`,
            }}
        >
            <div
                style={{
                    fontFamily: 'Playfair Display',
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
                    color: '#4d433d',
                    fontSize: 13,
                    lineHeight: 1.55,
                }}
            >
                {text}
            </div>
        </div>
    );
}