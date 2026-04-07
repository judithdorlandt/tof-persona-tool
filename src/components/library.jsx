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
                inline: 'nearest',
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
            style={{
                maxWidth: 1180,
                margin: '0 auto',
                padding: isMobile ? '32px 14px 56px' : '56px 24px 80px',
            }}
        >
            <div
                style={{
                    color: '#b85c5c',
                    letterSpacing: 2,
                    fontSize: 12,
                    marginBottom: 12,
                    textTransform: 'uppercase',
                }}
            >
                04 — Persona&apos;s
            </div>

            <h1
                style={{
                    fontSize: isMobile ? 36 : 54,
                    lineHeight: 1.05,
                    fontFamily: 'Playfair Display',
                    fontWeight: 500,
                    margin: 0,
                }}
            >
                Ontdek de 8 persona&apos;s
            </h1>

            <p
                style={{
                    marginTop: 16,
                    maxWidth: 760,
                    color: '#5d514a',
                    fontSize: isMobile ? 16 : 18,
                    lineHeight: 1.6,
                }}
            >
                Iedere persona werkt net even anders. Klik op een kaart en ontdek wat
                deze persoon nodig heeft in werkomgeving, ICT en samenwerking.
            </p>

            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: 22,
                    marginTop: 34,
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
                                opacity: isDimmed ? 0.55 : 1,
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
                                    borderTop: `6px solid ${accent}`,
                                    borderRadius: 22,
                                    padding: 0,
                                    cursor: 'pointer',
                                    boxShadow: isOpen
                                        ? '0 20px 40px rgba(70, 45, 35, 0.12)'
                                        : '0 8px 22px rgba(70, 45, 35, 0.05)',
                                    overflow: 'hidden',
                                    transition: 'all 0.25s ease',
                                    filter: isDimmed ? 'saturate(0.85)' : 'none',
                                    outline: 'none',
                                }}
                            >
                                <div style={{ padding: isMobile ? '20px 18px 18px' : '24px 24px 20px' }}>
                                    <div
                                        style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'flex-start',
                                            gap: 16,
                                        }}
                                    >
                                        <div>
                                            <h2
                                                style={{
                                                    fontFamily: 'Playfair Display',
                                                    fontSize: isMobile ? 28 : 34,
                                                    lineHeight: 1.05,
                                                    color: accent,
                                                    margin: 0,
                                                }}
                                            >
                                                {a.name}
                                            </h2>

                                            <p
                                                style={{
                                                    marginTop: 12,
                                                    marginBottom: 0,
                                                    color: '#4d433d',
                                                    fontSize: isMobile ? 15 : 17,
                                                    lineHeight: 1.55,
                                                    maxWidth: 460,
                                                }}
                                            >
                                                {a.short}
                                            </p>
                                        </div>

                                        <div
                                            style={{
                                                minWidth: 38,
                                                height: 38,
                                                borderRadius: 999,
                                                background: isOpen ? accent : soft,
                                                color: isOpen ? '#fff' : accent,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: 22,
                                                lineHeight: 1,
                                                fontWeight: 500,
                                                flexShrink: 0,
                                                boxShadow: isOpen
                                                    ? '0 8px 18px rgba(70, 45, 35, 0.12)'
                                                    : 'none',
                                            }}
                                        >
                                            {isOpen ? '–' : '+'}
                                        </div>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div
                                        style={{
                                            padding: isMobile ? '0 18px 18px' : '0 24px 24px',
                                            display: 'grid',
                                            gap: 14,
                                        }}
                                    >
                                        <div
                                            style={{
                                                background: 'rgba(255,255,255,0.78)',
                                                borderRadius: 16,
                                                padding: '16px 18px',
                                                borderLeft: `4px solid ${accent}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    letterSpacing: 1.3,
                                                    textTransform: 'uppercase',
                                                    color: '#7a6d66',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Energie van
                                            </div>
                                            <div
                                                style={{
                                                    color: '#3f342f',
                                                    fontSize: 15,
                                                    lineHeight: 1.55,
                                                }}
                                            >
                                                {a.energy_from}
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                background: 'rgba(255,255,255,0.78)',
                                                borderRadius: 16,
                                                padding: '16px 18px',
                                                borderLeft: `4px solid ${accent}`,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontSize: 12,
                                                    letterSpacing: 1.3,
                                                    textTransform: 'uppercase',
                                                    color: '#7a6d66',
                                                    marginBottom: 6,
                                                }}
                                            >
                                                Frustratie
                                            </div>
                                            <div
                                                style={{
                                                    color: '#3f342f',
                                                    fontSize: 15,
                                                    lineHeight: 1.55,
                                                }}
                                            >
                                                {a.frustration}
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                                                gap: 12,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    background: '#fff',
                                                    borderRadius: 16,
                                                    padding: '16px 16px 14px',
                                                    borderTop: `4px solid ${accent}`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontFamily: 'Playfair Display',
                                                        fontSize: 22,
                                                        color: accent,
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Bricks
                                                </div>
                                                <div
                                                    style={{
                                                        color: '#4d433d',
                                                        fontSize: 14,
                                                        lineHeight: 1.55,
                                                    }}
                                                >
                                                    {a.bricks}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    background: '#fff',
                                                    borderRadius: 16,
                                                    padding: '16px 16px 14px',
                                                    borderTop: `4px solid ${accent}`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontFamily: 'Playfair Display',
                                                        fontSize: 22,
                                                        color: accent,
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Bytes
                                                </div>
                                                <div
                                                    style={{
                                                        color: '#4d433d',
                                                        fontSize: 14,
                                                        lineHeight: 1.55,
                                                    }}
                                                >
                                                    {a.bytes}
                                                </div>
                                            </div>

                                            <div
                                                style={{
                                                    background: '#fff',
                                                    borderRadius: 16,
                                                    padding: '16px 16px 14px',
                                                    borderTop: `4px solid ${accent}`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontFamily: 'Playfair Display',
                                                        fontSize: 22,
                                                        color: accent,
                                                        marginBottom: 6,
                                                    }}
                                                >
                                                    Behavior
                                                </div>
                                                <div
                                                    style={{
                                                        color: '#4d433d',
                                                        fontSize: 14,
                                                        lineHeight: 1.55,
                                                    }}
                                                >
                                                    {a.behavior}
                                                </div>
                                            </div>
                                        </div>

                                        {!!a.energycost?.length && (
                                            <div
                                                style={{
                                                    background: 'rgba(255,255,255,0.78)',
                                                    borderRadius: 16,
                                                    padding: '16px 18px',
                                                    borderLeft: `4px solid ${accent}`,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 12,
                                                        letterSpacing: 1.3,
                                                        textTransform: 'uppercase',
                                                        color: '#7a6d66',
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    Waar deze persona op leegloopt
                                                </div>

                                                <ul
                                                    style={{
                                                        margin: 0,
                                                        paddingLeft: 18,
                                                        color: '#4d433d',
                                                        fontSize: 14,
                                                        lineHeight: 1.55,
                                                    }}
                                                >
                                                    {a.energycost.slice(0, 3).map((item) => (
                                                        <li key={item} style={{ marginBottom: 4 }}>
                                                            {item}
                                                        </li>
                                                    ))}
                                                </ul>
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
    );
}