import { useEffect, useMemo, useState } from 'react';
import { IS_NATIVE } from '../config/platform';
import { useArchetypes } from '../i18n/archetypes';
import { useCopy, useLang } from '../i18n/LanguageContext';
import {
    PageShell,
    PrimaryButton,
    SecondaryButton,
    SectionEyebrow,
} from '../ui/AppShell';
import {
    PERSONA_COLORS as COLOR_MAP,
    DEFAULT_PERSONA_COLOR,
    buildBricksItems,
    buildLeadershipItems,
    buildScoreDistribution,
    buildWorkplaceNeedsForMix,
} from '../lib/resultDerivations';
import ProfileScreen from '../native/ProfileScreen';
import usePinned from '../native/usePinned';
import ResultsDownloadCard from './ResultsDownloadCard';
import ResultsProfileCard from './ResultsProfileCard';

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

// `noteEntry` is het bewaarde profiel uit de lokale opslag van de app. Alleen
// als dat meekomt kun je inzichten vastprikken en weet het scherm wanneer je
// de test hebt afgerond; op het web en tijdens de quiz is het `null`.
export default function Results({ resultData, setPage, noteEntry = null }) {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);
    const ARCHETYPES = useArchetypes();
    const { lang } = useLang();
    const { resultsCard: copy } = useCopy();
    // Alleen in de app, en alleen bij een bewaard profiel: `null` op het web.
    const pinning = usePinned(noteEntry);

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

    const primaryColor = COLOR_MAP[primary?.id] || DEFAULT_PERSONA_COLOR;
    const workplaceLabels = copy.profile.workplaceLabels;

    const topScoreEntries = useMemo(
        () => buildScoreDistribution(resultData?.scores, ARCHETYPES),
        [resultData, ARCHETYPES]
    );

    const bricksItems = useMemo(
        () => buildBricksItems(primary, workplaceLabels),
        [primary, workplaceLabels]
    );

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

    const leadershipItems = useMemo(() => buildLeadershipItems(primary), [primary]);

    const leadershipSentence = useMemo(() => {
        if (!leadershipItems.length) return '';

        return leadershipItems.join(' ');
    }, [leadershipItems]);

    const workplaceNeedsForMix = useMemo(
        () => buildWorkplaceNeedsForMix([primary, secondary, tertiary], workplaceLabels),
        [primary, secondary, tertiary, workplaceLabels]
    );

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
                    bar: item.barWidth,
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
            // Dynamisch: jsPDF (~0,5 MB) blijft zo uit de hoofdbundel.
            const { downloadPersonaCardVectorPDF } = await import(
                '../utils/personaCardPdf'
            );
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

    // In de app is dit hét scherm van de hele tool: één kolom, negen blokken,
    // gemaakt om op een telefoon te lezen. De afleidingen hierboven zijn
    // gedeeld, dus web en app rekenen hetzelfde. Op het web verandert er niets.
    if (IS_NATIVE) {
        return (
            <ProfileScreen
                isMobile={isMobile}
                primary={primary}
                secondary={secondary}
                tertiary={tertiary}
                primaryColor={primaryColor}
                topScoreEntries={topScoreEntries}
                bytesBehaviorBlocks={bytesBehaviorBlocks}
                leadershipItems={leadershipItems}
                bricksItems={bricksItems}
                resultData={resultData}
                pinning={pinning}
                noteEntry={noteEntry}
            />
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
                        pinning={pinning}
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