/**
 * ResultsProfileCard — premium hero-kaart op de Results-pagina met alle
 * inzichten over de primaire persona (verdeling, mix, kracht, leeglopers,
 * bytes/behavior, leiderschap, werkomgeving). Ge\u00ebxtraheerd uit Results.jsx
 * om de hoofdcomponent overzichtelijk te houden.
 */
import React from 'react';
import tofLogo from '../assets/tof-logo.png';

// Lokale kopie — voorkomt circulaire import vanuit Results.jsx.
// Wanneer dit op meer plekken nodig is → verplaatsen naar src/data.
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

const INFO_LABEL_STYLE = {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'var(--tof-text-muted)',
    fontWeight: 700,
};

const leadText = {
    margin: 0,
    color: 'var(--tof-text-soft)',
    lineHeight: 1.7,
    fontSize: 15,
};

function InnerCard({ label, title, titleColor = '#1F1F1F', children }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid #EADFD4',
                borderRadius: 14,
                padding: '14px 16px',
                display: 'grid',
                alignSelf: 'start',
                gap: 10,
            }}
        >
            <div style={INFO_LABEL_STYLE}>{label}</div>
            {title ? (
                <div
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: 24,
                        lineHeight: 1.08,
                        color: titleColor,
                        marginTop: -2,
                    }}
                >
                    {title}
                </div>
            ) : null}
            {children}
        </div>
    );
}

function getReadableQuoteColor(hexColor) {
    const hex = String(hexColor || '').replace('#', '');
    if (hex.length !== 6) return '#2F2521';
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.62 ? '#2F2521' : '#F7F3EE';
}

export default function ResultsProfileCard({
    isMobile,
    primary,
    secondary,
    tertiary,
    primaryColor,
    topScoreEntries,
    workplaceNeedsForMix,
    bytesBehaviorBlocks,
    leadershipItems,
    bricksItems,
    resultData,
}) {
    const quoteTextColor = getReadableQuoteColor(primaryColor);

    return (
                    <div
                        style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #F7F3EE 0%, #EFE6DC 100%)',
                            borderRadius: 32,
                            border: '1px solid #E5D9CD',
                            boxShadow: '0 20px 52px rgba(70, 45, 35, 0.07)',
                            position: 'relative',
                            overflow: 'hidden',
                            padding: isMobile ? '22px 18px 20px' : '32px 32px 28px',
                            display: 'grid',
                            alignSelf: 'start',
                            gap: isMobile ? 18 : 20,
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                left: 0,
                                top: 0,
                                width: 4,
                                height: '100%',
                                background: primaryColor,
                                opacity: 0.95,
                            }}
                        />

                        <img
                            src={tofLogo}
                            alt="TOF logo"
                            style={{
                                position: 'absolute',
                                top: 18,
                                right: 18,
                                width: 24,
                                height: 24,
                                objectFit: 'contain',
                                opacity: 0.35,
                            }}
                        />

                        {/* JOUW PROFIEL */}

                        <div
                            style={{
                                display: 'grid',
                                gap: 12,
                                paddingLeft: isMobile ? 8 : 18,
                                maxWidth: isMobile ? '100%' : 760,
                            }}
                        >
                            {/* Eyebrow rij: badge + naam */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <div
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 7,
                                        background: primaryColor,
                                        borderRadius: 20,
                                        padding: '5px 12px',
                                        width: 'fit-content',
                                    }}
                                >
                                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#fff', opacity: 0.7, flexShrink: 0 }} />
                                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#fff', lineHeight: 1 }}>
                                        Primaire persona
                                    </span>
                                </div>
                                {resultData?.name?.trim() && (
                                    <span style={{ fontSize: 14, color: '#9A9088', letterSpacing: 0.2 }}>
                                        {resultData.name}
                                    </span>
                                )}
                            </div>

                            <h2
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 500,
                                    fontSize: isMobile ? 30 : 42,
                                    lineHeight: 1.04,
                                    letterSpacing: '-0.02em',
                                    margin: 0,
                                    color: 'var(--tof-text)',
                                    maxWidth: 760,
                                }}
                            >
                                Jouw dominante profiel is{' '}
                                <span
                                    style={{
                                        color: primaryColor,
                                        fontStyle: 'italic',
                                    }}
                                >
                                    {primary?.name}.
                                </span>
                            </h2>

                            <p
                                style={{
                                    marginTop: 4,
                                    marginBottom: 0,
                                    fontSize: isMobile ? 15 : 16,
                                    color: '#6F6862',
                                    lineHeight: 1.74,
                                    maxWidth: 720,
                                }}
                            >
                                {primary?.short}
                            </p>

                            <div
                                style={{
                                    width: 52,
                                    height: 3,
                                    background: primaryColor,
                                    marginTop: 4,
                                    borderRadius: 999,
                                }}
                            />
                        </div>

                        {/* WAT DIT BETEKENT */}
                        <div
                            style={{
                                background: '#F4EDE6',
                                borderRadius: 20,
                                padding: isMobile ? '16px 16px' : '18px 22px',
                                color: '#4D433D',
                                fontSize: 14,
                                lineHeight: 1.7,
                                border: '1px solid rgba(120, 90, 70, 0.06)',
                            }}
                        >
                            <strong style={{ color: 'var(--tof-text)' }}>
                                Wat dit betekent in de praktijk
                            </strong>
                            <br />
                            Je werkt het sterkst wanneer je omgeving aansluit op hoe jij van nature werkt.
                            Zit daar verschil in, dan kost dat energie en wordt het moeilijker om echt tot
                            je recht te komen.
                        </div>

                        {/* WAT JOU IN BEWEGING BRENGT */}
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.82)',
                                border: '1px solid #EADFD4',
                                borderRadius: 20,
                                padding: isMobile ? '16px 16px' : '18px 22px',
                                display: 'grid',
                                gap: 10,
                            }}
                        >
                            <div style={INFO_LABEL_STYLE}>Wat jou in beweging brengt</div>

                            <div
                                style={{
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 500,
                                    fontSize: isMobile ? 18 : 22,
                                    lineHeight: 1.18,
                                    color: primaryColor,
                                }}
                            >
                                Jouw natuurlijke kracht
                            </div>

                            <p
                                style={{
                                    margin: 0,
                                    color: '#4D433D',
                                    lineHeight: 1.7,
                                    fontSize: 14,
                                }}
                            >
                                {primary?.energy_from}
                            </p>
                        </div>

                        {/* 2 KOLOMMEN — gelijke breedte, elk blok op eigen hoogte */}
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                                gap: isMobile ? 14 : 16,
                                alignItems: 'start',
                            }}
                        >
                            {/* LINKERKOLOM */}
                            <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
                                <div
                                    style={{
                                        background: 'rgba(255,255,255,0.82)',
                                        borderRadius: 14,
                                        padding: '14px 16px',
                                        border: '1px solid #E7DBCF',
                                        display: 'grid',
                                        gap: 10,
                                    }}
                                >
                                    <div style={INFO_LABEL_STYLE}>Verdeling van jouw profiel</div>

                                    <div style={{ display: 'grid', gap: 8 }}>
                                        {topScoreEntries.map((item) => (
                                            <div key={item.id} style={{ display: 'grid', gap: 4 }}>
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        gap: 10,
                                                        fontSize: 12,
                                                        color: '#3F342F',
                                                    }}
                                                >
                                                    <span style={{ fontWeight: 600 }}>{item.name}</span>
                                                    <span>{item.percentage}%</span>
                                                </div>

                                                <div
                                                    style={{
                                                        height: 8,
                                                        background: '#EADFD4',
                                                        borderRadius: 999,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            width: `${Math.max(item.percentage, 6)}%`,
                                                            height: '100%',
                                                            background: item.color,
                                                            opacity: item.opacity,
                                                            borderRadius: 999,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div
                                    style={{
                                        background: '#F3ECE4',
                                        borderRadius: 14,
                                        padding: '14px 16px',
                                        display: 'grid',
                                        gap: 10,
                                        borderLeft: `4px solid ${primaryColor}`,
                                    }}
                                >
                                    <div style={INFO_LABEL_STYLE}>Jouw mix</div>

                                    <div style={{ display: 'grid', gap: 8 }}>
                                        {[secondary, tertiary].filter(Boolean).map((persona, index) => (
                                            <div
                                                key={persona?.id || index}
                                                style={{
                                                    background: 'rgba(255,255,255,0.82)',
                                                    borderRadius: 12,
                                                    padding: '10px 12px',
                                                    borderLeft: `4px solid ${COLOR_MAP[persona?.id] || primaryColor}`,
                                                    opacity: index === 0 ? 0.95 : 0.8,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontFamily: "'Playfair Display', serif",
                                                        fontWeight: 500,
                                                        fontSize: 18,
                                                        lineHeight: 1.1,
                                                        color: 'var(--tof-text)',
                                                        marginBottom: 3,
                                                    }}
                                                >
                                                    {persona?.name}
                                                </div>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: '#4D433D',
                                                        lineHeight: 1.54,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {persona?.short}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {leadershipItems.length > 0 ? (
                                    <InnerCard
                                        label="Wat helpt in leiderschap"
                                        title="Zo kom jij beter tot je recht"
                                        titleColor={primaryColor}
                                    >
                                        <ul
                                            style={{
                                                margin: 0,
                                                paddingLeft: 18,
                                                color: '#4D433D',
                                                lineHeight: 1.65,
                                                fontSize: 13,
                                            }}
                                        >
                                            {leadershipItems.map((item) => (
                                                <li key={item} style={{ marginBottom: 6 }}>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </InnerCard>
                                ) : null}
                            </div>

                            {/* RECHTERKOLOM */}
                            <div style={{ display: 'grid', gap: 14, alignContent: 'start' }}>
                                <InnerCard
                                    label="Bricks"
                                    title="Jouw ideale werkplekmix"
                                    titleColor={primaryColor}
                                >
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {bricksItems.map((item) => (
                                            <div
                                                key={item.key}
                                                style={{
                                                    background: 'rgba(255,255,255,0.9)',
                                                    borderRadius: 14,
                                                    padding: '12px 14px',
                                                    borderLeft: `4px solid ${primaryColor}`,
                                                    display: 'grid',
                                                    gap: 6,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        gap: 10,
                                                        alignItems: 'center',
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            fontFamily: "'Playfair Display', serif",
                                                            fontWeight: 500,
                                                            fontSize: 17,
                                                            lineHeight: 1.12,
                                                            color: 'var(--tof-text)',
                                                        }}
                                                    >
                                                        {item.label}
                                                    </div>

                                                    <div
                                                        style={{
                                                            fontSize: 11,
                                                            color: primaryColor,
                                                            background: '#F4EDE6',
                                                            borderRadius: 999,
                                                            padding: '4px 8px',
                                                            fontWeight: 600,
                                                        }}
                                                    >
                                                        score {item.score}
                                                    </div>
                                                </div>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: '#4D433D',
                                                        lineHeight: 1.62,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {item.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </InnerCard>

                                <InnerCard
                                    label="Bytes & Behavior"
                                    title="Wat jij nodig hebt"
                                    titleColor={primaryColor}
                                >
                                    <div style={{ display: 'grid', gap: 10 }}>
                                        {bytesBehaviorBlocks.map((item) => (
                                            <div
                                                key={item.key}
                                                style={{
                                                    background: 'rgba(255,255,255,0.9)',
                                                    borderRadius: 14,
                                                    padding: '12px 14px',
                                                    borderLeft: `4px solid ${primaryColor}`,
                                                    display: 'grid',
                                                    gap: 6,
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        fontSize: 11,
                                                        letterSpacing: 1.3,
                                                        textTransform: 'uppercase',
                                                        color: primaryColor,
                                                        fontWeight: 700,
                                                    }}
                                                >
                                                    {item.label}
                                                </div>

                                                <div
                                                    style={{
                                                        fontFamily: "'Playfair Display', serif",
                                                        fontWeight: 500,
                                                        fontSize: 17,
                                                        lineHeight: 1.14,
                                                        color: 'var(--tof-text)',
                                                    }}
                                                >
                                                    {item.title}
                                                </div>

                                                <p
                                                    style={{
                                                        margin: 0,
                                                        color: '#4D433D',
                                                        lineHeight: 1.66,
                                                        fontSize: 13,
                                                    }}
                                                >
                                                    {item.text}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </InnerCard>
                            </div>
                        </div>

                        {/* WAAR JE OP LEEGLOOPT */}
                        {primary?.energycost?.length > 0 && (
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.82)',
                                    border: '1px solid #EADFD4',
                                    borderRadius: 20,
                                    padding: isMobile ? '16px 16px' : '18px 22px',
                                    display: 'grid',
                                    gap: 12,
                                }}
                            >
                                <div style={INFO_LABEL_STYLE}>Waar je op leegloopt</div>
                                <div style={{ display: 'grid', gap: 8 }}>
                                    {primary.energycost.slice(0, 3).map((item) => (
                                        <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                            <span style={{ color: primaryColor, fontWeight: 700, fontSize: 14, flexShrink: 0, lineHeight: 1.6 }}>×</span>
                                            <span style={{ fontSize: 14, color: '#4D433D', lineHeight: 1.62 }}>{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* QUOTE */}
                        {primary?.lquote ? (
                            <div
                                style={{
                                    background: primaryColor,
                                    borderRadius: 20,
                                    padding: isMobile ? '16px 16px' : '18px 22px',
                                    color: quoteTextColor,
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 500,
                                    fontSize: isMobile ? 18 : 22,
                                    lineHeight: 1.45,
                                    fontStyle: 'italic',
                                    letterSpacing: '-0.01em',
                                }}
                            >
                                {primary.lquote}
                            </div>
                        ) : null}
                    </div>
    );
}

// Re-export helpers for callers that nog gebruik maken van het oude
// patroon in Results.jsx (alleen op tijdelijke basis aanwezig).
export { INFO_LABEL_STYLE, leadText, InnerCard, getReadableQuoteColor };
