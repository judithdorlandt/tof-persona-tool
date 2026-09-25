import { useEffect, useMemo, useState } from 'react';
import { useArchetypes } from '../i18n/archetypes';
import { useCopy, useLang } from '../i18n/LanguageContext';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';
import { downloadPersonaCardVectorPDF } from '../utils/personaCardPdf';
import ResultsDownloadCard from './ResultsDownloadCard';
import ResultsProfileCard from './ResultsProfileCard';

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

const leadText = {
    margin: 0,
    color: 'var(--tof-text-soft)',
    lineHeight: 1.7,
    fontSize: 15,
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

function getFirstName(fullName) {
    const cleaned = String(fullName || '').trim();
    if (!cleaned) return '';
    return cleaned.split(/\s+/)[0];
}

export default function Results({ resultData, setPage }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const ARCHETYPES = useArchetypes();
    const { lang } = useLang();
    const { resultsCard: copy } = useCopy();

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
    const workplaceLabels = copy.profile.workplaceLabels;

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
        // `getArchetype` is een render-lokale helper over ARCHETYPES; die staat al in deps.
    }, [scoreEntries, resultData, primaryColor, ARCHETYPES]); // eslint-disable-line react-hooks/exhaustive-deps

    const bricksItems = useMemo(() => {
        if (!primary?.bricksProfile) return [];

        return Object.entries(primary.bricksProfile)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([key, value]) => ({
                key,
                score: value,
                label: workplaceLabels[key] || key,
                text: primary?.bricksProfileText?.[key] || '',
            }));
    }, [primary, workplaceLabels]);

    const bytesBehaviorBlocks = useMemo(() => {
        const blocks = copy.profile.bytesBlocks;

        return [
            {
                key: 'bytes',
                label: blocks.bytes.label,
                title: blocks.bytes.title,
                text: primary?.bytes || '',
            },
            {
                key: 'behavior',
                label: blocks.behavior.label,
                title: blocks.behavior.title,
                text: primary?.behavior || '',
            },
        ].filter((item) => item.text);
    }, [primary, copy]);

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
                label: workplaceLabels[key] || key,
                text:
                    primary?.bricksProfileText?.[key] ||
                    secondary?.bricksProfileText?.[key] ||
                    tertiary?.bricksProfileText?.[key] ||
                    '',
            }));
    }, [primary, secondary, tertiary, workplaceLabels]);

    const pdfData = useMemo(() => {
        const firstName = getFirstName(resultData?.name) || copy.download.nameFallback;
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
                    tekst: primary?.lquote || copy.download.fallbackQuote,
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
        copy,
    ]);

    const downloadCardAsPDF = async () => {
        // Vector PDF: tekst is scherp, selecteerbaar en doorzoekbaar.
        // Geheel los van de schermweergave — geen html2canvas meer.
        const firstName = getFirstName(resultData?.name);
        const fileName = copy.download.fileName(firstName);

        try {
            downloadPersonaCardVectorPDF({
                pdfData,
                primaryColor,
                fileName,
                lang,
            });
        } catch (error) {
            console.error('Vector PDF download failed:', error);
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
                        <SectionEyebrow>{copy.empty.eyebrow}</SectionEyebrow>

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
                            {copy.empty.title}
                        </h1>

                        <p style={leadText}>{copy.empty.body}</p>

                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                            <PrimaryButton onClick={() => setPage('quiz')}>
                                {copy.empty.startTest}
                            </PrimaryButton>

                            <SecondaryButton onClick={() => setPage('home')}>
                                {copy.empty.backHome}
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

                    <ResultsProfileCard
                        isMobile={isMobile}
                        primary={primary}
                        secondary={secondary}
                        tertiary={tertiary}
                        primaryColor={primaryColor}
                        topScoreEntries={topScoreEntries}
                        workplaceNeedsForMix={workplaceNeedsForMix}
                        bytesBehaviorBlocks={bytesBehaviorBlocks}
                        leadershipItems={leadershipItems}
                        bricksItems={bricksItems}
                        resultData={resultData}
                    />


                    {/* ── PREMIUM DOWNLOAD KAART ────────────────────────── */}
                    <ResultsDownloadCard
                        primary={primary}
                        primaryColor={primaryColor}
                        isMobile={isMobile}
                        onDownload={downloadCardAsPDF}
                        setPage={setPage}
                        resultData={resultData}
                    />

                </div> {/* einde maxWidth 920 wrapper */}

            </div>

        </PageShell >
    );
}