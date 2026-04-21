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
            .filter(([, value]) => value > 0)
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

        const frontImgData = frontCanvas.toDataURL('image/jpeg', 0.98);
        const backImgData = backCanvas.toDataURL('image/jpeg', 0.98);

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5',
            compress: true,
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

        try {
            const blob = pdf.output('blob');
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.rel = 'noopener noreferrer';
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), 10000);
        } catch (error) {
            console.error('PDF download failed:', error);

            // fallback
            pdf.save(fileName);
        }
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
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 500,
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
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 36px'}>
            <div
                style={{
                    animation: 'tofFadeIn 0.5s ease',
                    display: 'grid',
                    alignSelf: 'start',
                    gridTemplateColumns: '1fr',
                    gap: isMobile ? 20 : 28,
                    width: '100%',
                }}
            >
                {/* ── PROFIELKAART + DOWNLOAD — zelfde breedte ─────── */}
                <div style={{ width: '100%', maxWidth: 920, display: 'grid', gap: isMobile ? 20 : 28, alignSelf: 'start' }}>

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

                    {/* ── PREMIUM DOWNLOAD KAART ────────────────────────── */}
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
                                    onClick={downloadCardAsPDF}
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

                </div> {/* einde maxWidth 920 wrapper */}

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
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 400,
                                fontSize: 31,
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
                                                    fontFamily: "'Playfair Display', serif",
                                                    fontWeight: 500,
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
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 500,
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
                        display: 'flex',
                        flexDirection: 'column',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                    }}
                >
                    {/* Accentlijn rechts */}
                    <div style={{ position: 'absolute', right: 0, top: 0, width: 4, height: '100%', background: primaryColor }} />

                    {/* Premium header-balk */}
                    <div style={{
                        background: primaryColor,
                        padding: '10px 42px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexShrink: 0,
                    }}>
                        <div style={{ fontSize: 8, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
                            Jouw ideale werkplekmix
                        </div>
                        <img
                            src={tofLogo}
                            alt="TOF logo"
                            style={{ width: 18, height: 18, objectFit: 'contain', opacity: 0.7, filter: 'brightness(10)' }}
                        />
                    </div>

                    {/* Werkplekmix content */}
                    <div style={{
                        padding: '14px 42px 0 42px',
                        flex: '0 0 auto',
                    }}>
                        {/* Titel */}
                        <div style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 20, lineHeight: 1.08, color: primaryColor, marginBottom: 16 }}>
                            Wat jij nodig hebt in de werkomgeving
                        </div>

                        {/* Werkplek items — compact, beschrijving ingekort */}
                        <div style={{ display: 'grid', gap: 5 }}>
                            {pdfData.achterkant.workplace.map((item, i) => (
                                <div key={i} style={{
                                    background: 'rgba(255,255,255,0.82)',
                                    borderRadius: 6,
                                    padding: '5px 8px 5px 10px',
                                    borderLeft: `3px solid ${primaryColor}`,
                                    display: 'grid',
                                    gap: 2,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
                                        <div style={{ fontFamily: 'var(--tof-font-heading)', fontSize: 11, color: '#1E1E1E', lineHeight: 1.2 }}>
                                            {item.label}
                                        </div>
                                        <span style={{ fontSize: 7.5, color: '#C5B5A5', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                            score {item.score}
                                        </span>
                                    </div>
                                    {item.text && (
                                        <p style={{ margin: 0, fontSize: 8.5, color: '#777', lineHeight: 1.38 }}>
                                            {/* Eerste zin van de beschrijving */}
                                            {item.text.split('.')[0]}.
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Leiderschap */}
                    <div style={{
                        padding: '8px 42px 0 42px',
                        flex: '0 0 auto',
                    }}>
                        <div style={{ background: 'rgba(255,255,255,0.82)', borderRadius: 8, padding: '8px 10px', border: '1px solid #EADFD4', display: 'grid', gap: 4 }}>
                            <div style={{ fontSize: 7.5, fontWeight: 600, letterSpacing: '2.5px', textTransform: 'uppercase', color: '#C5B5A5' }}>
                                Wat helpt in leiderschap
                            </div>
                            <p style={{ margin: 0, fontSize: 10, color: '#2F2521', lineHeight: 1.55, fontWeight: 500 }}>
                                {pdfData.achterkant.leiderschap}
                            </p>
                        </div>
                    </div>

                    {/* Quote + logo onderaan — flex-end zodat het altijd op de pagina blijft */}
                    <div style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        textAlign: 'center',
                        padding: `8px 42px 16px`,
                        gap: 8,
                        minHeight: 0,
                    }}>
                        {pdfData.achterkant.eindquote?.tekst && (
                            <div style={{
                                maxWidth: 340,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 500,
                                fontSize: 13,
                                lineHeight: 1.5,
                                letterSpacing: '-0.01em',
                                color: '#4D433D',
                                fontStyle: 'italic',
                            }}>
                                "{pdfData.achterkant.eindquote.tekst}"
                            </div>
                        )}
                        <img
                            src={tofLogo}
                            alt="TOF logo"
                            style={{ width: 52, height: 52, objectFit: 'contain', opacity: 0.9 }}
                        />
                        <div style={{ fontSize: 8.5, color: '#C5B5A5', lineHeight: 1.4, letterSpacing: '0.3px' }}>
                            Helping people understand their workplace through insight, design and movement.
                        </div>
                    </div>
                </div>
            </div>
        </PageShell >
    );
}