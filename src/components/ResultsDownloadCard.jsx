/**
 * ResultsDownloadCard — premium PDF-download kaart op de Results-pagina.
 *
 * Geëxtraheerd uit Results.jsx om de hoofdcomponent overzichtelijk te
 * houden. Render-logica is identiek; props zijn alle waardes die het
 * gebruikt.
 */
import React from 'react';
import { SecondaryButton } from '../ui/AppShell';

export default function ResultsDownloadCard({
    primary,
    primaryColor,
    isMobile,
    onDownload,
    setPage,
    resultData,
}) {
    return (
        <div style={{
            borderRadius: 20,
            border: '1px solid var(--tof-border)',
            overflow: 'hidden',
            boxShadow: '0 12px 32px rgba(31,31,31,0.07)',
        }}>
            {/* Gekleurde topper */}
            <div style={{
                background: primaryColor,
                padding: '12px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700, color: 'rgba(255,255,255,0.65)' }}>
                        Jouw personakaart
                    </span>
                    <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,0.35)', display: 'inline-block' }} />
                    <span style={{ fontSize: 13, fontFamily: "'Playfair Display', serif", fontWeight: 500, fontStyle: 'italic', color: '#fff' }}>
                        {primary?.name}
                    </span>
                </div>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: 600 }}>
                    PDF · 2 pagina&apos;s · A5
                </span>
            </div>

            {/* Body */}
            <div style={{
                background: 'var(--tof-surface)',
                padding: isMobile ? '20px 20px 22px' : '24px 28px 28px',
                display: 'grid',
                gap: 20,
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                    gap: isMobile ? 12 : 20,
                }}>
                    {/* Wat er in zit */}
                    <div style={{ display: 'grid', gap: 10 }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 700, color: 'var(--tof-text-muted)' }}>
                            Wat je downloadt
                        </div>
                        <div style={{ display: 'grid', gap: 7 }}>
                            {[
                                'Jouw dominante persona en profielverdeling',
                                'Jouw mix van secundaire persona\'s',
                                'Wat jou in beweging brengt',
                                'Jouw ideale werkplekmix (top 3)',
                                'Wat helpt in leiderschap',
                            ].map((item, i) => (
                                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                                    <div style={{
                                        width: 18, height: 18, borderRadius: 999,
                                        background: `${primaryColor}18`,
                                        border: `1.5px solid ${primaryColor}50`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 9, fontWeight: 700, color: primaryColor,
                                        flexShrink: 0, marginTop: 1,
                                    }}>✓</div>
                                    <span style={{ fontSize: 14, lineHeight: 1.55, color: 'var(--tof-text-soft)' }}>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Preview beschrijving */}
                    <div style={{
                        background: 'var(--tof-surface-soft)',
                        borderRadius: 14,
                        padding: '16px 18px',
                        border: '1px solid var(--tof-border)',
                        display: 'grid',
                        gap: 8,
                        alignContent: 'start',
                    }}>
                        <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 1.6, fontWeight: 700, color: 'var(--tof-text-muted)' }}>
                            Hoe te gebruiken
                        </div>
                        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.72, color: 'var(--tof-text-soft)' }}>
                            De kaart is ontworpen om te delen — met je manager, je team of je organisatie.
                            Gebruik hem als gespreksstarter of als input voor werkplek- en samenwerkingsafspraken.
                        </p>
                        {resultData?.name?.trim() && (
                            <div style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                fontSize: 12,
                                color: primaryColor,
                                background: `${primaryColor}10`,
                                border: `1px solid ${primaryColor}30`,
                                borderRadius: 999,
                                padding: '3px 10px',
                                width: 'fit-content',
                                marginTop: 4,
                            }}>
                                Opgemaakt voor {resultData.name.trim().split(/\s+/)[0]}
                            </div>
                        )}
                    </div>
                </div>

                {/* Download knop */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <button
                        onClick={onDownload}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 10,
                            padding: '13px 28px',
                            borderRadius: 999,
                            background: primaryColor,
                            color: '#fff',
                            fontFamily: 'var(--tof-font-body)',
                            fontWeight: 700,
                            fontSize: 15,
                            border: 'none',
                            cursor: 'pointer',
                            letterSpacing: 0.2,
                            boxShadow: `0 6px 20px ${primaryColor}50`,
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = `0 10px 28px ${primaryColor}60`;
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = `0 6px 20px ${primaryColor}50`;
                        }}
                    >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                            <path d="M8 1v9M8 10l-3-3M8 10l3-3M2 13h12" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Download personakaart
                    </button>
                    <span style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                        PDF · gratis · direct beschikbaar
                    </span>
                </div>

                {/* Navigatie onderaan */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', paddingTop: 4, borderTop: '1px solid var(--tof-border)' }}>
                    <SecondaryButton onClick={() => setPage('library')}>
                        Bekijk alle persona&apos;s
                    </SecondaryButton>
                    <SecondaryButton onClick={() => setPage('quiz')}>
                        Test opnieuw
                    </SecondaryButton>
                </div>
            </div>
        </div>
    );
}
