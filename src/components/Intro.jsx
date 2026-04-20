/**
 * Intro.jsx — Pagina 02: Voor je begint
 * Identiteit: sage groen — kalm, voorbereidend, menselijk
 */
import React, { useEffect, useState } from 'react';

export default function Intro({ setPage }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div
            className="fade-up"
            style={{
                minHeight: 'calc(100vh - 88px)',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'center',
                padding: isMobile ? '16px 16px 28px' : '20px 20px 32px',
                background: '#f7f2ec',
                boxSizing: 'border-box',
            }}
        >
            <div style={{ width: '100%', maxWidth: 880, display: 'grid', gap: isMobile ? 14 : 16 }}>

                {/* ── HERO — sage identiteit ─────────────────────────── */}
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    border: '1px solid #e7ddd4',
                    boxShadow: '0 10px 26px rgba(70,45,35,0.05)',
                    padding: isMobile ? '24px 20px 22px' : '34px 40px 30px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Sage accentlijn links */}
                    <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: '#6b8f7b', borderRadius: '4px 0 0 4px' }} />

                    <div style={{ display: 'grid', gap: isMobile ? 14 : 18, paddingLeft: isMobile ? 8 : 16 }}>
                        <div style={{ color: '#6b8f7b', letterSpacing: 2, fontSize: 11, textTransform: 'uppercase', fontWeight: 700 }}>
                            02 — Voor je begint
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap' }}>
                            <h1 style={{
                                margin: 0,
                                fontFamily: 'Playfair Display',
                                fontWeight: 500,
                                fontSize: isMobile ? 'clamp(28px, 6vw, 38px)' : 'clamp(34px, 3.5vw, 48px)',
                                lineHeight: 1.06,
                                color: '#1f1b18',
                                maxWidth: 520,
                            }}>
                                Kort voordat{' '}
                                <em style={{ color: '#6b8f7b', fontStyle: 'italic' }}>
                                    je start.
                                </em>
                            </h1>
                            {!isMobile && (
                                <p style={{ margin: 0, maxWidth: 260, fontSize: 14, lineHeight: 1.7, color: '#6F6A66', paddingBottom: 4, flexShrink: 0 }}>
                                    Je krijgt vragen over hoe jij werkt en energie krijgt. Kies steeds wat het meest bij jou past — niet wat goed klinkt.
                                </p>
                            )}
                        </div>
                        {isMobile && (
                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: '#6F6A66' }}>
                                Je krijgt vragen over hoe jij werkt. Kies steeds wat het meest bij jou past.
                            </p>
                        )}
                    </div>
                </div>

                {/* ── DRIE INFO-KAARTEN ──────────────────────────────── */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: 12,
                }}>
                    <InfoCard
                        accent="#b85c5c"
                        soft="#FDF6F6"
                        title="Hoe kies je?"
                        text="Kies wat het meest op jou lijkt. Twijfel je? Ga voor wat het sterkst voelt — niet wat 'goed' klinkt."
                    />
                    <InfoCard
                        accent="#6b8f7b"
                        soft="#EDF4EF"
                        title="Meerdere passend?"
                        text="Normaal. Je bent geen hokje. Het resultaat laat juist ook je mix van persona's zien."
                    />
                    <InfoCard
                        accent="#c7a24a"
                        soft="#FBF5E9"
                        title="Hoe lang duurt het?"
                        text="Ongeveer 15 minuten. Niets voorbereiden nodig. Gewoon eerlijk invullen."
                    />
                </div>

                {/* ── ACTIE-BALK ─────────────────────────────────────── */}
                <div style={{
                    background: '#fff',
                    borderRadius: 14,
                    padding: isMobile ? '16px 18px' : '16px 24px',
                    border: '1px solid #e7ddd4',
                    borderLeft: '4px solid #b85c5c',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: isMobile ? 'wrap' : 'nowrap',
                    boxShadow: '0 4px 14px rgba(70,45,35,0.04)',
                }}>
                    <p style={{ margin: 0, color: '#4a433e', fontSize: 14, lineHeight: 1.55, flex: 1, minWidth: 0 }}>
                        <strong style={{ color: '#1f1b18' }}>Belangrijk:</strong> dit is geen goed-fout test. Het gaat om wat het meest natuurlijk bij jou past.
                    </p>
                    <div style={{ display: 'flex', gap: 10, flexShrink: 0, flexWrap: 'wrap' }}>
                        <button
                            type="button"
                            onClick={() => setPage('quiz')}
                            style={{
                                background: '#b85c5c', color: '#fff', border: 'none',
                                padding: '12px 22px', borderRadius: 10, cursor: 'pointer',
                                fontSize: 14, fontWeight: 600,
                                boxShadow: '0 4px 12px rgba(176,82,82,0.28)',
                                transition: 'transform 0.15s, box-shadow 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 18px rgba(176,82,82,0.36)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(176,82,82,0.28)'; }}
                        >
                            Start met de vragen
                        </button>
                        <button
                            type="button"
                            onClick={() => setPage('home')}
                            style={{
                                background: 'transparent', color: '#1a1a1a',
                                border: '1px solid #d8cec4', padding: '12px 18px',
                                borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 500,
                            }}
                        >
                            Terug
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}

function InfoCard({ accent, soft, title, text }) {
    return (
        <div style={{
            background: soft,
            borderRadius: 16,
            padding: '20px 20px 18px',
            borderTop: `4px solid ${accent}`,
            border: `1px solid ${accent}22`,
            boxShadow: '0 4px 12px rgba(70,45,35,0.04)',
        }}>
            <h3 style={{
                fontFamily: 'Playfair Display',
                fontWeight: 500,
                marginTop: 0,
                marginBottom: 8,
                fontSize: 18,
                lineHeight: 1.15,
                color: '#1f1b18',
            }}>
                {title}
            </h3>
            <p style={{ color: '#5a5550', margin: 0, fontSize: 14, lineHeight: 1.65 }}>
                {text}
            </p>
        </div>
    );
}
