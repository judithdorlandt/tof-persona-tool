import { useEffect, useMemo, useRef, useState } from 'react';
import { ARCHETYPES } from '../data';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import tofLogo from '../assets/tof-logo.png';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';

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

const bodyText = {
    margin: 0,
    color: '#4D433D',
    lineHeight: 1.65,
    fontSize: 14,
};

const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
};

const PDF_GRID = {
    pageX: 42,
    pageY: 18,
    gutter: 16,
    contentWidth: 559 - 42 - 42,
};

function SoftCard({ children, padding = 22 }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding,
                border: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                alignSelf: 'start',
                gap: 16,
            }}
        >
            {children}
        </div>
    );
}

function InnerCard({ label, title, titleColor = '#1F1F1F', children }) {
    return (
        <div
            style={{
                background: 'rgba(255,255,255,0.82)',
                border: '1px solid #EADFD4',
                borderRadius: 18,
                padding: '16px 18px',
                display: 'grid',
                alignSelf: 'start',
                gap: 10,
            }}
        >
            <div style={INFO_LABEL_STYLE}>{label}</div>

            {title ? (
                <div
                    style={{
                        fontFamily: 'var(--tof-font-heading)',
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

function InfoPanel({ children }) {
    return (
        <div
            style={{
                background: '#F4EDE6',
                borderRadius: 16,
                padding: '16px 18px',
                color: '#4D433D',
                fontSize: 13,
                lineHeight: 1.6,
                border: '1px solid rgba(120, 90, 70, 0.06)',
            }}
        >
            {children}
        </div>
    );
}

function getFirstName(fullName) {
    const cleaned = String(fullName || '').trim();
    if (!cleaned) return '';
    return cleaned.split(/\s+/)[0];
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

export default function Results({ resultData, setPage }) {
    const pdfFrontRef = useRef(null);
    const pdfBackRef = useRef(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const getArchetype = (id) =>
        ARCHETYPES.find((archetype) => archetype.id === id);

    const primary = getArchetype(resultData?.primary);
    const secondary = getArchetype(resultData?.secondary);
    const tertiary = getArchetype(resultData?.tertiary);

    const primaryColor = COLOR_MAP[primary?.id] || '#B05252';
    const quoteTextColor = getReadableQuoteColor(primaryColor);

    const scoreEntries = useMemo(() => {
        return Object.entries(resultData?.scores || {}).sort((a, b) => b[1] - a[1]);
    }, [resultData]);

    const topScoreEntries = useMemo(() => {
        const maxScore = Math.max(
            ...Object.values(resultData?.scores || {}).map(Number),
            1
        );

        return scoreEntries.map(([id, value]) => {
            const archetype = getArchetype(id);
            const normalizedPercentage = Math.round((Number(value) / maxScore) * 100);

            return {
                id,
                name: archetype?.name || id,
                value: Number(value),
                percentage: normalizedPercentage,
                color: COLOR_MAP[id] || primaryColor,
                opacity: 1,
            };
        });
    }, [scoreEntries, resultData, primaryColor]);

    const bricksItems = useMemo(() => {
        if (!primary?.bricksProfile) return [];

        return Object.entries(primary.bricksProfile)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, value]) => ({
                key,
                score: value,
                label: WORKPLACE_LABELS[key] || key,
                text: primary?.bricksProfileText?.[key] || '',
            }));
    }, [primary]);

    const bytesBehaviorBlocks = useMemo(() => {
        return [
            {
                key: 'bytes',
                label: 'Bytes',
                title: 'Digitale ondersteuning',
                text: primary?.bytes || '',
            },
            {
                key: 'behavior',
                label: 'Behavior',
                title: 'Gedrag & cultuur',
                text: primary?.behavior || '',
            },
        ].filter((item) => item.text);
    }, [primary]);

    const leadershipItems = useMemo(() => {
        return (primary?.leadership || []).slice(0, 3);
    }, [primary]);

    const leadershipSentence = useMemo(() => {
        if (!leadershipItems.length) return '';

        return leadershipItems.join(' ');
    }, [leadershipItems]);

    const workplaceNeedsForMix = useMemo(() => {
        const personas = [primary, secondary, tertiary].filter(Boolean);

        const totals = {
            focus: 0,
            work: 0,
            hybride: 0,
            meeting: 0,
            project: 0,
            team: 0,
            learning: 0,
            retreat: 0,
            social: 0,
        };

        personas.forEach((persona, index) => {
            const weight = index === 0 ? 1 : index === 1 ? 0.7 : 0.45;
            const profile = persona?.bricksProfile || {};

            Object.keys(totals).forEach((key) => {
                totals[key] += Number(profile[key] || 0) * weight;
            });
        });

        return Object.entries(totals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, value]) => ({
                key,
                score: Number(value.toFixed(1)),
                label: WORKPLACE_LABELS[key] || key,
                text:
                    primary?.bricksProfileText?.[key] ||
                    secondary?.bricksProfileText?.[key] ||
                    tertiary?.bricksProfileText?.[key] ||
                    '',
            }));
    }, [primary, secondary, tertiary]);

    const pdfData = useMemo(() => {
        const firstName = getFirstName(resultData?.name) || 'Jouw profiel';
        const roleLine = resultData?.role || resultData?.team_size || 'TOF Persona Tool';

        return {
            voorkant: {
                naam: firstName,
                rol: roleLine,
                persona: primary?.name || '',
                subline: primary?.short || '',
                verdeling: topScoreEntries.map((item) => ({
                    name: item.name,
                    pct: item.percentage,
                    color: item.color,
                    opacity: item.opacity ?? 1,
                })),
                mix: [secondary, tertiary].filter(Boolean).map((persona, index) => ({
                    name: persona?.name || '',
                    text: persona?.short || '',
                    color: COLOR_MAP[persona?.id] || primaryColor,
                    opacity: index === 0 ? 0.9 : 0.7,
                })),
                kracht: primary?.energy_from || '',
                leeglopers: (primary?.energycost || []).slice(0, 3),
                quote: '',
            },

            achterkant: {
                naam: firstName,
                persona: primary?.name || '',
                workplace: workplaceNeedsForMix,
                leiderschap: leadershipSentence,
                eindquote: {
                    tekst:
                        primary?.lquote ||
                        'Je werkt het sterkst wanneer je omgeving aansluit op hoe jij van nature werkt.',
                    bron: 'TOF · The Office Factory',
                },
            },
        };
    }, [
        resultData,
        primary,
        secondary,
        tertiary,
        primaryColor,
        topScoreEntries,
        workplaceNeedsForMix,
        leadershipSentence,
    ]);

    const downloadCardAsPDF = async () => {
        if (!pdfFrontRef.current || !pdfBackRef.current) return;

        const frontCanvas = await html2canvas(pdfFrontRef.current, {
            scale: 2,
            backgroundColor: '#F7F3EE',
            useCORS: true,
        });

        const backCanvas = await html2canvas(pdfBackRef.current, {
            scale: 2,
            backgroundColor: '#F7F3EE',
            useCORS: true,
        });

        const frontImgData = frontCanvas.toDataURL('image/png');
        const backImgData = backCanvas.toDataURL('image/png');

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5',
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.addImage(frontImgData, 'PNG', 0, 0, pageWidth, pageHeight);
        pdf.addPage('a5', 'portrait');
        pdf.addImage(backImgData, 'PNG', 0, 0, pageWidth, pageHeight);

        const firstName = getFirstName(resultData?.name);
        const fileName = firstName
            ? `${firstName} - personakaart TOF.pdf`
            : 'personakaart TOF.pdf';

        pdf.save(fileName);
    };

    if (!resultData) {
        return (
            <PageShell padding={isMobile ? '20px 16px 28px' : '24px 20px 36px'}>
                <div
                    style={{
                        animation: 'tofFadeIn 0.5s ease',
                        display: 'grid',
                        alignSelf: 'start',
                        gap: isMobile ? 24 : 32,
                    }}
                >
                    <SoftCard padding={isMobile ? 20 : 30}>
                        <SectionEyebrow>04 — Jouw resultaat</SectionEyebrow>

                        <h1
                            style={{
                                margin: 0,
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 'clamp(30px, 4vw, 48px)',
                                lineHeight: 1.08,
                                color: 'var(--tof-text)',
                            }}
                        >
                            Nog geen resultaat beschikbaar
                        </h1>

                        <p style={leadText}>
                            Vul eerst de test in om jouw persona-profiel te bekijken.
                        </p>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <PrimaryButton onClick={() => setPage('quiz')}>
                                Start de test
                            </PrimaryButton>

                            <SecondaryButton onClick={() => setPage('home')}>
                                Terug naar home
                            </SecondaryButton>
                        </div>
                    </SoftCard>
                </div>
            </PageShell>
        );
    }

    return (
        <PageShell padding={isMobile ? '20px 16px 28px' : '24px 20px 36px'}>
            <div
                style={{
                    animation: 'tofFadeIn 0.5s ease',
                    display: 'grid',
                    alignSelf: 'start',
                    gridTemplateColumns: '1fr',
                    gap: isMobile ? 24 : 40,
                    width: '100%',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: isMobile ? 'stretch' : 'flex-end',
                        gap: 16,
                        flexWrap: 'wrap',
                    }}
                >
                    <div style={{ display: 'grid', gap: 10 }}>
                        <SectionEyebrow>04 — Jouw profiel</SectionEyebrow>

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
                            Jouw profiel in
                            <br />
                            <span
                                style={{
                                    color: primaryColor,
                                    fontStyle: 'italic',
                                }}
                            >
                                één oogopslag.
                            </span>
                        </h1>
                    </div>

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <PrimaryButton
                            onClick={downloadCardAsPDF}
                            style={{ width: isMobile ? '100%' : 'auto' }}
                        >
                            Download profiel →
                        </PrimaryButton>

                        <SecondaryButton onClick={() => setPage('library')}>
                            Bekijk alle persona&apos;s
                        </SecondaryButton>
                    </div>
                </div>

                <div
                    style={{
                        width: '100%',
                        maxWidth: 920,
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
                            gap: 16,
                            paddingLeft: isMobile ? 8 : 18,
                            maxWidth: isMobile ? '100%' : 760,
                        }}
                    >
                        <div
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 8,
                                background: primaryColor,
                                borderRadius: 20,
                                padding: '6px 14px',
                                minHeight: 36,
                                boxSizing: 'border-box',
                                width: 'fit-content',
                                marginBottom: 6,
                            }}
                        >
                            <div
                                style={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: '50%',
                                    background: '#fff',
                                    opacity: 0.7,
                                    flexShrink: 0,
                                }}
                            />
                            <span
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    fontSize: 9,
                                    fontWeight: 600,
                                    letterSpacing: '2.5px',
                                    textTransform: 'uppercase',
                                    color: '#fff',
                                    lineHeight: 1,
                                    transform: 'translateY(0.5px)',
                                }}
                            >
                                Primaire persona
                            </span>
                        </div>

                        <div
                            style={{
                                fontSize: isMobile ? 15 : 16,
                                color: '#9A9088',
                                marginBottom: 4,
                                letterSpacing: 0.2,
                            }}
                        >
                            {resultData?.name?.trim() ? `${resultData.name}` : 'Jouw profiel'}
                        </div>

                        <h2
                            style={{
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: isMobile ? 36 : 52,
                                lineHeight: 1,
                                letterSpacing: '-0.025em',
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
                                fontFamily: 'var(--tof-font-heading)',
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

                    {/* 2 KOLOMMEN */}
                    <div
                        style={{
                            display: 'grid',
                            gridTemplateColumns: isMobile ? '1fr' : '1.16fr 0.94fr',
                            gap: isMobile ? 16 : 20,
                            alignItems: 'start',
                        }}
                    >
                        {/* LINKERKOLOM */}
                        <div
                            style={{
                                display: 'grid',
                                gap: 16,
                                alignContent: 'start',
                            }}
                        >
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
                                                        fontFamily: 'var(--tof-font-heading)',
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
                                                    fontFamily: 'var(--tof-font-heading)',
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

                        {/* RECHTERKOLOM */}
                        <div
                            style={{
                                display: 'grid',
                                gap: 14,
                                alignContent: 'start',
                            }}
                        >
                            <div
                                style={{
                                    background: 'rgba(255,255,255,0.72)',
                                    borderRadius: 18,
                                    padding: '16px 18px',
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
                                    borderRadius: 18,
                                    padding: '16px 18px',
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
                                                    fontFamily: 'var(--tof-font-heading)',
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
                    </div>

                    {/* QUOTE */}
                    {primary?.lquote ? (
                        <div
                            style={{
                                background: primaryColor,
                                borderRadius: 20,
                                padding: isMobile ? '16px 16px' : '18px 22px',
                                color: quoteTextColor,
                                fontFamily: 'var(--tof-font-heading)',
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
            </div>

            <div
                style={{
                    position: 'fixed',
                    left: '-99999px',
                    top: 0,
                    pointerEvents: 'none',
                    opacity: 0,
                }}
            >
                {/* PDF PERSONAKAART - VOORKANT */}
                <div
                    ref={pdfFrontRef}
                    style={{
                        width: '559px',
                        height: '794px',
                        background: '#F7F3EE',
                        fontFamily: 'Inter, Arial, sans-serif',
                        position: 'relative',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box',
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
                        }}
                    />

                    <div
                        style={{
                            padding: `${SPACING.xl + 14}px ${PDF_GRID.pageX}px 0 ${PDF_GRID.pageX}px`,
                            flexShrink: 0,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: 26,
                            }}
                        >
                            <div
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 7,
                                    background: primaryColor,
                                    borderRadius: 20,
                                    padding: '5px 14px',
                                    minHeight: 30,
                                    boxSizing: 'border-box',
                                }}
                            >
                                <div
                                    style={{
                                        width: 6,
                                        height: 6,
                                        borderRadius: '50%',
                                        background: '#fff',
                                        opacity: 0.7,
                                        flexShrink: 0,
                                    }}
                                />
                                <span
                                    style={{
                                        fontSize: 9,
                                        fontWeight: 600,
                                        letterSpacing: '2.5px',
                                        textTransform: 'uppercase',
                                        color: '#fff',
                                        lineHeight: 1,
                                    }}
                                >
                                    Primaire persona
                                </span>
                            </div>

                            <img
                                src={tofLogo}
                                alt="TOF logo"
                                style={{
                                    width: 26,
                                    height: 26,
                                    objectFit: 'contain',
                                    opacity: 0.55,
                                    flexShrink: 0,
                                }}
                            />
                        </div>

                        <p
                            style={{
                                fontSize: 12,
                                color: '#999',
                                margin: '0 0 6px',
                                letterSpacing: '0.3px',
                            }}
                        >
                            {pdfData.voorkant.naam} · {pdfData.voorkant.rol}
                        </p>

                        <h1
                            style={{
                                fontFamily: 'var(--tof-font-heading)',
                                fontSize: 31,
                                fontWeight: 400,
                                color: '#1E1E1E',
                                lineHeight: 1.12,
                                margin: '0 0 12px',
                            }}
                        >
                            Jouw dominante profiel is{' '}
                            <em style={{ color: primaryColor, fontStyle: 'italic' }}>
                                {pdfData.voorkant.persona}.
                            </em>
                        </h1>

                        <p
                            style={{
                                fontSize: 12,
                                color: '#777',
                                lineHeight: 1.72,
                                maxWidth: 360,
                                margin: '0 0 18px',
                            }}
                        >
                            {pdfData.voorkant.subline}
                        </p>

                        <div
                            style={{
                                width: 32,
                                height: 2,
                                background: primaryColor,
                                marginBottom: 20,
                            }}
                        />
                    </div>

                    <div
                        style={{
                            padding: `0 ${PDF_GRID.pageX}px 0 ${PDF_GRID.pageX}px`,
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            minHeight: 0,
                        }}
                    >
                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: `calc((100% - ${PDF_GRID.gutter}px) / 2) calc((100% - ${PDF_GRID.gutter}px) / 2)`,
                                gap: PDF_GRID.gutter,
                                marginBottom: SPACING.md,
                                flexShrink: 0,
                            }}
                        >
                            <div>
                                <p
                                    style={{
                                        fontSize: 8,
                                        fontWeight: 600,
                                        letterSpacing: '2.5px',
                                        textTransform: 'uppercase',
                                        color: '#C5B5A5',
                                        margin: '0 0 11px',
                                    }}
                                >
                                    Verdeling profiel
                                </p>

                                {pdfData.voorkant.verdeling.map((b, i) => (
                                    <div key={i} style={{ marginBottom: 8 }}>
                                        <div
                                            style={{
                                                display: 'grid',
                                                gridTemplateColumns: '1fr auto',
                                                columnGap: 10,
                                                alignItems: 'center',
                                            }}
                                        >
                                            <div>
                                                <div
                                                    style={{
                                                        fontSize: 10,
                                                        color: '#555',
                                                        fontWeight: 500,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {b.name}
                                                </div>

                                                <div
                                                    style={{
                                                        height: 2,
                                                        background: '#EDE6DC',
                                                        borderRadius: 1,
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    <div
                                                        style={{
                                                            height: 2,
                                                            borderRadius: 1,
                                                            width: `${Math.max(b.pct, 6)}%`,
                                                            background: b.color,
                                                            opacity: b.opacity ?? 1,
                                                        }}
                                                    />
                                                </div>
                                            </div>

                                            <span
                                                style={{
                                                    color: '#C5B5A5',
                                                    fontWeight: 400,
                                                    fontSize: 10,
                                                    whiteSpace: 'nowrap',
                                                    alignSelf: 'start',
                                                }}
                                            >
                                                {b.pct}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div>
                                <p
                                    style={{
                                        fontSize: 8,
                                        fontWeight: 600,
                                        letterSpacing: '2.5px',
                                        textTransform: 'uppercase',
                                        color: '#C5B5A5',
                                        margin: '0 0 11px',
                                    }}
                                >
                                    Jouw mix
                                </p>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: SPACING.sm }}>
                                    {pdfData.voorkant.mix.map((m, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                padding: '10px 12px',
                                                background: '#fff',
                                                borderRadius: 8,
                                                borderLeft: `2px solid ${m.color}`,
                                            }}
                                        >
                                            <p
                                                style={{
                                                    fontFamily: 'var(--tof-font-heading)',
                                                    fontSize: 13,
                                                    color: '#1E1E1E',
                                                    margin: '0 0 3px',
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {m.name}
                                            </p>

                                            <p
                                                style={{
                                                    fontSize: 10,
                                                    color: '#888',
                                                    lineHeight: 1.55,
                                                    margin: 0,
                                                }}
                                            >
                                                {m.text}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div
                            style={{
                                background: '#fff',
                                borderRadius: 10,
                                padding: '14px 16px',
                                marginBottom: SPACING.md,
                                flexShrink: 0,
                            }}
                        >
                            <p
                                style={{
                                    fontSize: 8,
                                    fontWeight: 600,
                                    letterSpacing: '2.5px',
                                    textTransform: 'uppercase',
                                    color: '#C5B5A5',
                                    margin: '0 0 5px',
                                }}
                            >
                                Wat jou in beweging brengt
                            </p>

                            <p
                                style={{
                                    fontFamily: 'var(--tof-font-heading)',
                                    fontSize: 13,
                                    color: primaryColor,
                                    fontStyle: 'italic',
                                    lineHeight: 1.55,
                                    margin: `${SPACING.sm}px 0 0`,
                                }}
                            >
                                {pdfData.voorkant.kracht}
                            </p>
                        </div>

                        <div style={{ flexShrink: 0 }}>
                            <p
                                style={{
                                    fontSize: 8,
                                    fontWeight: 600,
                                    letterSpacing: '2.5px',
                                    textTransform: 'uppercase',
                                    color: '#C5B5A5',
                                    margin: '0 0 10px',
                                }}
                            >
                                Waar je op leegloopt
                            </p>

                            {pdfData.voorkant.leeglopers.map((l, i) => (
                                <div
                                    key={i}
                                    style={{
                                        display: 'flex',
                                        gap: 6,
                                        fontSize: 10,
                                        color: '#888',
                                        padding: '5px 0',
                                        borderBottom:
                                            i < pdfData.voorkant.leeglopers.length - 1
                                                ? '1px solid #EDE6DC'
                                                : 'none',
                                    }}
                                >
                                    <span
                                        style={{
                                            color: primaryColor,
                                            fontWeight: 600,
                                            flexShrink: 0,
                                        }}
                                    >
                                        ×
                                    </span>
                                    {l}
                                </div>
                            ))}
                        </div>

                        <div
                            style={{
                                padding: `12px 0 ${SPACING.lg}px`,
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                marginTop: 'auto',
                                flexShrink: 0,
                            }}
                        >
                            <span
                                style={{
                                    fontSize: 8,
                                    fontWeight: 600,
                                    letterSpacing: '1.5px',
                                    textTransform: 'uppercase',
                                    color: '#C5B5A5',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                → Zie achterkant
                            </span>
                        </div>
                    </div>
                </div>

                {/* PDF PERSONAKAART - ACHTERKANT */}
                <div
                    ref={pdfBackRef}
                    style={{
                        width: '559px',
                        height: '794px',
                        background: '#F7F3EE',
                        fontFamily: 'Inter, Arial, sans-serif',
                        position: 'relative',
                        display: 'grid',
                        gridTemplateRows: 'auto 1fr auto',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            right: 0,
                            top: 0,
                            width: 4,
                            height: '100%',
                            background: primaryColor,
                        }}
                    />

                    {/* Bovenste deel */}
                    <div
                        style={{
                            padding: `${SPACING.lg + 14}px ${PDF_GRID.pageX}px 0 ${PDF_GRID.pageX}px`,
                            display: 'grid',
                            gap: SPACING.sm,
                            alignContent: 'start',
                        }}
                    >
                        <div
                            style={{
                                background: 'rgba(255,255,255,0.82)',
                                borderRadius: 12,
                                padding: '14px 16px',
                                border: '1px solid #EADFD4',
                                display: 'grid',
                                gap: SPACING.sm,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 8,
                                    fontWeight: 600,
                                    letterSpacing: '2.5px',
                                    textTransform: 'uppercase',
                                    color: '#C5B5A5',
                                    margin: 0,
                                }}
                            >
                                Jouw ideale werkplekmix
                            </div>

                            <div
                                style={{
                                    fontFamily: 'var(--tof-font-heading)',
                                    fontSize: 21,
                                    lineHeight: 1.08,
                                    color: primaryColor,
                                }}
                            >
                                Wat jij nodig hebt in de werkomgeving
                            </div>

                            <div
                                style={{
                                    display: 'grid',
                                    gap: SPACING.sm,
                                    marginTop: SPACING.sm,
                                }}
                            >
                                {pdfData.achterkant.workplace.map((item, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            background: '#fff',
                                            borderRadius: 8,
                                            padding: '8px 10px',
                                            borderLeft: `3px solid ${primaryColor}`,
                                            display: 'grid',
                                            gap: 3,
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                gap: SPACING.sm,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    fontFamily: 'var(--tof-font-heading)',
                                                    fontSize: 13,
                                                    color: '#1E1E1E',
                                                    lineHeight: 1.2,
                                                }}
                                            >
                                                {item.label}
                                            </div>

                                            <span
                                                style={{
                                                    fontSize: 9,
                                                    color: '#C5B5A5',
                                                    whiteSpace: 'nowrap',
                                                }}
                                            >
                                                score {item.score}
                                            </span>
                                        </div>

                                        <p
                                            style={{
                                                margin: 0,
                                                fontSize: 10,
                                                color: '#777',
                                                lineHeight: 1.5,
                                            }}
                                        >
                                            {item.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div
                            style={{
                                background: 'rgba(255,255,255,0.82)',
                                borderRadius: 12,
                                padding: '12px 14px',
                                border: '1px solid #EADFD4',
                                display: 'grid',
                                gap: 6,
                            }}
                        >
                            <div
                                style={{
                                    fontSize: 8,
                                    fontWeight: 600,
                                    letterSpacing: '2.5px',
                                    textTransform: 'uppercase',
                                    color: '#C5B5A5',
                                    margin: 0,
                                }}
                            >
                                Wat helpt in leiderschap
                            </div>

                            <p
                                style={{
                                    margin: 0,
                                    fontSize: 10,
                                    color: '#555',
                                    lineHeight: 1.58,
                                }}
                            >
                                {pdfData.achterkant.leiderschap}
                            </p>
                        </div>
                    </div>

                    {/* Midden */}
                    <div
                        style={{
                            display: 'grid',
                            alignContent: 'center',
                            justifyItems: 'center',
                            textAlign: 'center',
                            padding: `0 ${PDF_GRID.pageX}px`,
                            gap: SPACING.md,
                            marginTop: -8,
                        }}
                    >
                        {pdfData.achterkant.eindquote?.tekst ? (
                            <div
                                style={{
                                    maxWidth: 320,
                                    fontFamily: 'var(--tof-font-heading)',
                                    fontSize: 14,
                                    lineHeight: 1.52,
                                    letterSpacing: '-0.01em',
                                    color: '#4D433D',
                                    fontStyle: 'italic',
                                }}
                            >
                                “{pdfData.achterkant.eindquote.tekst}”
                            </div>
                        ) : null}

                        <img
                            src={tofLogo}
                            alt="TOF logo"
                            style={{
                                width: 68,
                                height: 68,
                                objectFit: 'contain',
                                opacity: 0.95,
                            }}
                        />
                    </div>

                    {/* Onder */}
                    <div
                        style={{
                            padding: `0 ${PDF_GRID.pageX}px ${SPACING.lg}px ${PDF_GRID.pageX}px`,
                            textAlign: 'center',
                            fontSize: 10,
                            color: '#C5B5A5',
                            lineHeight: 1.45,
                            letterSpacing: '0.3px',
                        }}
                    >
                        Helping people understand their workplace through insight, design and movement.
                    </div>
                </div>
            </div>
        </PageShell >
    );
}