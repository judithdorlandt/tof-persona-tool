/**
 * Library.jsx — Persona's overzicht
 *
 * UX-verbeteringen:
 * - Compactere expanded content, minder scroll
 * - Bricks-blok toont werkplekmix direct als gescoorde pills + beschrijving
 * - Bytes & Behavior naast elkaar in 2 kolommen
 * - Energie / Frustratie naast elkaar
 * - Leiderschap: 3 compacte bullets
 * - lquote: blijft als afsluitend citaat
 * - Energycost verwijderd (overlap met frustratie)
 */

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
    focus: 'Concentratie',
    work: 'Standaard',
    hybride: 'Hybride',
    meeting: 'Overleg',
    project: 'Creatief',
    team: 'Samenwerken',
    learning: 'Leren',
    retreat: 'Rust',
    social: 'Informeel',
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
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }, [openId]);

    const handleToggle = (id) => setOpenId((prev) => (prev === id ? null : id));

    return (
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 32px'}>
            <div style={{
                animation: 'tofFadeIn 0.5s ease',
                display: 'grid',
                gap: isMobile ? 16 : 20,
            }}>
                {/* ── HERO — rose identiteit (ontdekking) ───────────── */}
                <div style={{
                    background: '#fff',
                    borderRadius: 20,
                    border: '1px solid var(--tof-border)',
                    boxShadow: 'var(--tof-shadow)',
                    padding: isMobile ? '24px 20px 22px' : '34px 40px 30px',
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    <div style={{ position: 'absolute', left: 0, top: 0, width: 4, height: '100%', background: 'var(--tof-accent-rose)', borderRadius: '4px 0 0 4px' }} />
                    <div style={{ paddingLeft: isMobile ? 8 : 16 }}>
                        <SectionEyebrow>05 — Persona&apos;s</SectionEyebrow>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24, flexWrap: 'wrap', marginTop: 10 }}>
                            <h1 style={{
                                margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 500,
                                fontSize: isMobile ? 'clamp(28px, 6vw, 38px)' : 'clamp(34px, 3.5vw, 48px)',
                                lineHeight: 1.06,
                                color: '#1f1b18',
                            }}>
                                Ontdek de 8{' '}
                                <em style={{ color: 'var(--tof-accent-rose)', fontStyle: 'italic' }}>
                                    persona&apos;s.
                                </em>
                            </h1>
                            {!isMobile && (
                                <p style={{ margin: 0, maxWidth: 300, fontSize: 14, lineHeight: 1.7, color: '#6F6A66', paddingBottom: 4, flexShrink: 0 }}>
                                    Klik op een kaart om te ontdekken wat deze persoon nodig heeft — in werkplek, samenwerking en leiderschap.
                                </p>
                            )}
                        </div>
                        {isMobile && (
                            <p style={{ margin: 0, marginTop: 12, fontSize: 14, lineHeight: 1.65, color: '#6F6A66' }}>
                                Klik op een kaart om te ontdekken wat deze persoon nodig heeft.
                            </p>
                        )}
                    </div>
                </div>

                {/* Kaarten grid */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, minmax(0, 1fr))',
                    gap: isMobile ? 12 : 20,
                    alignItems: 'start',
                }}>
                    {ARCHETYPES.map((persona) => {
                        const isOpen = openId === persona.id;
                        const isDimmed = openId !== null && !isOpen;
                        const accent = COLOR_MAP[persona.id] || '#B05252';
                        const soft = SOFT_MAP[persona.id] || '#F3ECE4';

                        // Alle werkplekscores gesorteerd voor de mix
                        const workplaceMix = Object.entries(persona.bricksProfile || {})
                            .sort((a, b) => b[1] - a[1])
                            .map(([key, score]) => ({
                                key, score,
                                label: WORKPLACE_LABELS[key] || key,
                                text: persona.bricksProfileText?.[key] || '',
                            }));

                        // Top 3 voor de uitgelichte toelichting
                        const top3 = workplaceMix.slice(0, 3);

                        return (
                            <div
                                key={persona.id}
                                ref={(el) => { cardRefs.current[persona.id] = el; }}
                                style={{
                                    scrollMarginTop: 24,
                                    transition: 'all 0.25s ease',
                                    opacity: isDimmed ? 0.58 : 1,
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
                                            ? '0 16px 32px rgba(70,45,35,0.10)'
                                            : 'var(--tof-shadow)',
                                        overflow: 'hidden',
                                        transition: 'all 0.25s ease',
                                        filter: isDimmed ? 'saturate(0.9)' : 'none',
                                        outline: 'none',
                                    }}
                                >
                                    {/* ── Kaart-header ─────────────────────── */}
                                    <div style={{ padding: isMobile ? '16px 14px 14px' : '20px 20px 18px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                                            <div style={{ display: 'grid', gap: 8 }}>
                                                <h2 style={{
                                                    fontFamily: "'Playfair Display', serif",
                                                    fontWeight: 500,
                                                    fontSize: isMobile ? 26 : 30,
                                                    lineHeight: 1.04,
                                                    color: accent,
                                                    margin: 0,
                                                }}>
                                                    {persona.name}
                                                </h2>
                                                <p style={{
                                                    margin: 0,
                                                    color: '#4D433D',
                                                    fontSize: isMobile ? 14 : 15,
                                                    lineHeight: 1.6,
                                                    maxWidth: 460,
                                                }}>
                                                    {persona.short}
                                                </p>

                                                {/* Keywords als pills — altijd zichtbaar */}
                                                {!isOpen && persona.kw?.length > 0 && (
                                                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 2 }}>
                                                        {persona.kw.map((kw) => (
                                                            <span key={kw} style={{
                                                                fontSize: 11,
                                                                color: accent,
                                                                background: soft,
                                                                borderRadius: 999,
                                                                padding: '3px 9px',
                                                                fontWeight: 600,
                                                                letterSpacing: 0.3,
                                                            }}>
                                                                {kw}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* +/– knop */}
                                            <div style={{
                                                minWidth: 34, height: 34,
                                                borderRadius: 999,
                                                background: isOpen ? accent : soft,
                                                color: isOpen ? '#FFFFFF' : accent,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: 20, lineHeight: 1, fontWeight: 500,
                                                flexShrink: 0,
                                                transition: 'all 0.2s ease',
                                            }}>
                                                {isOpen ? '–' : '+'}
                                            </div>
                                        </div>
                                    </div>

                                    {/* ── Expanded content ─────────────────── */}
                                    {isOpen && (
                                        <div style={{ padding: isMobile ? '0 14px 18px' : '0 20px 22px', display: 'grid', gap: 14 }}>

                                            {/* Rij 1: Energie & Frustratie naast elkaar */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                                gap: 10,
                                            }}>
                                                <InfoBlock accent={accent} label="Energie van">
                                                    {persona.energy_from}
                                                </InfoBlock>
                                                <InfoBlock accent={accent} label="Frustreert">
                                                    {persona.frustration}
                                                </InfoBlock>
                                            </div>

                                            {/* Rij 2: Bricks — met werkplekmix */}
                                            <div style={{
                                                background: 'rgba(255,255,255,0.82)',
                                                borderRadius: 14,
                                                padding: '14px 14px 12px',
                                                borderLeft: `4px solid ${accent}`,
                                            }}>
                                                <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--tof-text-muted)', fontWeight: 700, marginBottom: 10 }}>
                                                    Bricks — Ideale werkplekmix
                                                </div>

                                                {/* Alle werkplekken als score-pills */}
                                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                                    {workplaceMix.map((item) => (
                                                        <div key={item.key} style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: 5,
                                                            padding: '4px 10px 4px 8px',
                                                            borderRadius: 999,
                                                            background: item.score >= 4 ? accent : item.score >= 3 ? `${accent}40` : `${accent}18`,
                                                            border: `1px solid ${accent}30`,
                                                            fontSize: 12,
                                                            fontWeight: item.score >= 4 ? 700 : 500,
                                                            color: item.score >= 4 ? '#fff' : accent,
                                                        }}>
                                                            <span>{item.label}</span>
                                                            <span style={{
                                                                fontSize: 10,
                                                                opacity: 0.75,
                                                                fontVariantNumeric: 'tabular-nums',
                                                            }}>
                                                                {'●'.repeat(item.score)}{'○'.repeat(4 - item.score)}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>

                                                {/* Top 3 met toelichting */}
                                                <div style={{ display: 'grid', gap: 8 }}>
                                                    {top3.map((item) => (
                                                        <div key={item.key} style={{
                                                            background: '#fff',
                                                            borderRadius: 10,
                                                            padding: '10px 12px',
                                                            borderLeft: `3px solid ${accent}`,
                                                            display: 'grid',
                                                            gap: 3,
                                                        }}>
                                                            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--tof-text)', lineHeight: 1.2 }}>
                                                                {WORKPLACE_LABELS[item.key] || item.key}
                                                            </div>
                                                            <div style={{ fontSize: 12, lineHeight: 1.55, color: '#4D433D' }}>
                                                                {item.text}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Rij 3: Bytes & Behavior naast elkaar */}
                                            <div style={{
                                                display: 'grid',
                                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                                gap: 10,
                                            }}>
                                                <MiniCard title="Bytes" color={accent} text={persona.bytes} />
                                                <MiniCard title="Behavior" color={accent} text={persona.behavior} />
                                            </div>

                                            {/* Rij 4: Leiderschap — 3 compacte bullets */}
                                            {!!persona.leadership?.length && (
                                                <div style={{
                                                    background: 'rgba(255,255,255,0.82)',
                                                    borderRadius: 14,
                                                    padding: '12px 14px',
                                                    borderLeft: `4px solid ${accent}`,
                                                }}>
                                                    <div style={{ fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--tof-text-muted)', fontWeight: 700, marginBottom: 8 }}>
                                                        Wat helpt in leiderschap
                                                    </div>
                                                    <div style={{ display: 'grid', gap: 6 }}>
                                                        {persona.leadership.slice(0, 3).map((item) => (
                                                            <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                                                                <div style={{
                                                                    width: 18, height: 18, borderRadius: 999,
                                                                    background: soft,
                                                                    border: `1.5px solid ${accent}`,
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                    fontSize: 9, fontWeight: 700, color: accent,
                                                                    flexShrink: 0, marginTop: 1,
                                                                }}>✓</div>
                                                                <span style={{ fontSize: 13, lineHeight: 1.6, color: '#4D433D' }}>{item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Citaat */}
                                            {persona.lquote && (
                                                <div style={{
                                                    background: soft,
                                                    borderRadius: 12,
                                                    padding: '13px 14px',
                                                    color: '#4D433D',
                                                    fontSize: 13,
                                                    lineHeight: 1.65,
                                                    fontStyle: 'italic',
                                                    border: `1px solid ${accent}22`,
                                                }}>
                                                    "{persona.lquote}"
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

// ─── UI HELPERS ───────────────────────────────────────────────────────────────

function InfoBlock({ accent, label, children }) {
    return (
        <div style={{
            background: 'rgba(255,255,255,0.82)',
            borderRadius: 14,
            padding: '12px 13px',
            borderLeft: `4px solid ${accent}`,
        }}>
            <div style={{
                fontSize: 11, letterSpacing: 1.5, textTransform: 'uppercase',
                color: 'var(--tof-text-muted)', fontWeight: 700, marginBottom: 5,
            }}>
                {label}
            </div>
            <div style={{ color: '#3F342F', fontSize: 13, lineHeight: 1.6 }}>
                {children}
            </div>
        </div>
    );
}

function MiniCard({ title, color, text }) {
    return (
        <div style={{
            background: '#FFFFFF',
            borderRadius: 14,
            padding: '12px 13px',
            borderTop: `4px solid ${color}`,
            border: '1px solid rgba(0,0,0,0.04)',
        }}>
            <div style={{
                fontFamily: "'Playfair Display', serif",
                fontWeight: 500,
                fontSize: 18, color, marginBottom: 5, lineHeight: 1.1,
            }}>
                {title}
            </div>
            <div style={{ color: '#4D433D', fontSize: 13, lineHeight: 1.6 }}>
                {text}
            </div>
        </div>
    );
}
