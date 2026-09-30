import { useState } from 'react';

import PinButton from '../components/result/PinButton';
import ResultDistribution from '../components/result/ResultDistribution';
import { riseIn } from '../components/result/motion';
import { useCopy } from '../i18n/LanguageContext';
import { PERSONA_COLORS, getReadableTextOnColor } from '../lib/resultDerivations';
import { PageShell } from '../ui/AppShell';

/**
 * ProfileScreen — jouw profiel zoals de app het toont.
 *
 * Op het web is het resultaat één brede kaart met twee kolommen; dat leest op
 * een telefoon niet. Hier staat alles onder elkaar.
 *
 * Alles onder elkaar wérd het ook letterlijk: negen blokken, 3506 pixels, ruim
 * vier telefoonschermen scrollen voordat je beneden was. Daarom is het scherm
 * nu in twee helften geknipt. Bovenaan staat wie je bent — dat lees je één keer
 * en dat verandert niet. Daaronder kies je zelf welk hoofdstuk je erbij wil:
 * Energie, Werkplek, Digitaal, Gedrag of Cultuur. Eén tegelijk, dus je kunt
 * echt lezen wat er staat. Die laatste vier volgen het TOF-model — Bricks,
 * Bytes, Behavior, Belonging — maar op de knop staat gewone taal.
 *
 * Je aantekeningen staan hier niet meer, en Leiderschap ook niet. Allebei horen
 * ze bij je gesprek, en dat is een eigen scherm geworden (ConversationPrep.jsx,
 * tabblad "Gesprek").
 *
 * De afleidingen komen kant-en-klaar binnen uit `Results.jsx`, zodat web, PDF
 * en app gegarandeerd hetzelfde rekenen (zie src/lib/resultDerivations.js).
 * Alle teksten komen uit `resultsCard.profile` — dezelfde als op het web.
 */
export default function ProfileScreen({
    isMobile,
    primary,
    secondary,
    tertiary,
    primaryColor,
    topScoreEntries,
    bricksItems,
    resultData,
    pinning = null,
    noteEntry = null,
}) {
    const { resultsCard, native } = useCopy();
    const t = resultsCard.profile;
    const heads = native.chapterHeads;
    const quoteTextColor = getReadableTextOnColor(primaryColor);
    const mix = [secondary, tertiary].filter(Boolean);
    const drains = (primary?.energycost || []).slice(0, 3);
    const friction = primary?.friction || [];
    const belonging = primary?.ct || [];

    // Welk hoofdstuk je nu leest. "Energie" staat vooraan omdat het over jou
    // gaat; de rest gaat over wat je nodig hebt. De volgorde daarna volgt het
    // TOF-model: Bricks, Bytes, Behavior, Belonging.
    //
    // "Leiderschap" stond hier ook. Die teksten zijn geschreven tégen een
    // leidinggevende, over jou — een vreemde spiegel in je eigen profiel. Ze
    // staan nu in de ik-vorm op het gespreksscherm (ConversationPrep.jsx).
    const [chapter, setChapter] = useState('motion');
    const chapters = [
        { key: 'motion', label: native.chapters.motion, show: true },
        { key: 'workplace', label: native.chapters.workplace, show: bricksItems.length > 0 },
        { key: 'bytes', label: native.chapters.bytes, show: !!primary?.bytes },
        { key: 'behavior', label: native.chapters.behavior, show: friction.length > 0 },
        { key: 'culture', label: native.chapters.culture, show: belonging.length > 0 },
    ].filter((c) => c.show);

    // De randen van de pagina; de hero trekt zich hier met een negatieve marge
    // weer uit, zodat de kleurwaas de hele breedte pakt.
    const rand = isMobile ? 16 : 20;

    return (
        <PageShell maxWidth={720} padding={`0 ${rand}px ${isMobile ? 28 : 36}px`}>
            <div style={{ display: 'grid', gap: isMobile ? 16 : 20, width: '100%' }}>

                {/* 1 — HERO: schermbrede waas in je eigen kleur */}
                <div
                    style={{
                        margin: `0 ${-rand}px`,
                        padding: isMobile ? `28px ${rand}px 26px` : `40px ${rand}px 34px`,
                        background: `linear-gradient(160deg, ${primaryColor}1F 0%, ${primaryColor}0A 46%, var(--tof-bg) 100%)`,
                        display: 'grid',
                        gap: 12,
                        ...riseIn(0),
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span
                            style={{
                                background: primaryColor,
                                color: getReadableTextOnColor(primaryColor),
                                borderRadius: 20,
                                padding: '5px 12px',
                                fontSize: 9,
                                fontWeight: 600,
                                letterSpacing: '2.5px',
                                textTransform: 'uppercase',
                                lineHeight: 1,
                            }}
                        >
                            {t.badge}
                        </span>

                        {resultData?.name?.trim() && (
                            <span style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                {resultData.name.trim()}
                            </span>
                        )}

                        {noteEntry?.savedAt && (
                            <span style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                {native.start.formatDate(noteEntry.savedAt)}
                            </span>
                        )}
                    </div>

                    <h2
                        style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: isMobile ? 30 : 40,
                            lineHeight: 1.06,
                            letterSpacing: '-0.02em',
                            color: 'var(--tof-text)',
                        }}
                    >
                        {t.dominantPrefix}{' '}
                        {/* `inherit` is nodig: index.css zet elke span op de body-font. */}
                        <span style={{ fontFamily: 'inherit', color: primaryColor, fontStyle: 'italic' }}>
                            {primary?.name}.
                        </span>
                    </h2>

                    <p style={{ margin: 0, fontSize: 15, lineHeight: 1.74, color: 'var(--tof-text-soft)' }}>
                        {primary?.short}
                    </p>

                    <div style={{ width: 52, height: 3, background: primaryColor, borderRadius: 999 }} />
                </div>

                {/* 2 — VERDELING (zelfde component als het web) */}
                <div style={riseIn(1)}>
                    <ResultDistribution
                        label={t.distributionLabel}
                        labelStyle={LABEL}
                        items={topScoreEntries}
                    />
                </div>

                {/* 3 — JOUW MIX */}
                {mix.length > 0 && (
                    <Sectie label={t.mixLabel} accent={primaryColor} isMobile={isMobile} style={riseIn(2)}>
                        <div style={{ display: 'grid', gap: 10 }}>
                            {mix.map((persona) => (
                                <div
                                    key={persona.id}
                                    style={{
                                        background: 'var(--tof-bg)',
                                        borderRadius: 12,
                                        padding: '12px 14px',
                                        borderTop: '1px solid var(--tof-border)',
                                        borderRight: '1px solid var(--tof-border)',
                                        borderBottom: '1px solid var(--tof-border)',
                                        borderLeft: `4px solid ${PERSONA_COLORS[persona.id] || primaryColor}`,
                                        display: 'grid',
                                        gap: 4,
                                    }}
                                >
                                    <div
                                        style={{
                                            fontFamily: "'Playfair Display', serif",
                                            fontWeight: 500,
                                            fontSize: 18,
                                            lineHeight: 1.1,
                                            color: 'var(--tof-text)',
                                        }}
                                    >
                                        {persona.name}
                                    </div>

                                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--tof-text-soft)' }}>
                                        {persona.short}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Sectie>
                )}

                {/* 4 — DE HOOFDSTUKKEN: vijf knoppen, één hoofdstuk open */}
                <div
                    role="group"
                    aria-label={native.chapters.label}
                    style={{
                        // Vijf knoppen passen niet naast elkaar op een smalle
                        // telefoon, dus vallen ze om naar een tweede regel in
                        // plaats van dat de tekst afbreekt. Gecentreerd, zodat
                        // die tweede regel niet links blijft hangen.
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'center',
                        gap: 6,
                        ...riseIn(3),
                    }}
                >
                    {chapters.map((c) => {
                        const isOpen = c.key === chapter;
                        return (
                            <button
                                key={c.key}
                                type="button"
                                onClick={() => setChapter(c.key)}
                                aria-pressed={isOpen}
                                style={{
                                    ...CHIP,
                                    // Het open hoofdstuk krijgt je eigen kleur; de rest
                                    // blijft rustig, anders concurreren ze met de inhoud.
                                    background: isOpen ? primaryColor : 'var(--tof-surface)',
                                    color: isOpen ? getReadableTextOnColor(primaryColor) : 'var(--tof-text-soft)',
                                    borderColor: isOpen ? primaryColor : 'var(--tof-border)',
                                }}
                            >
                                {c.label}
                            </button>
                        );
                    })}
                </div>

                {/* 5a — BEWEGING: wat jou in beweging brengt, waar je op leegloopt */}
                {chapter === 'motion' && (
                    <Sectie label={t.motionLabel} accent={primaryColor} isMobile={isMobile} style={riseIn(4)}>
                        <div style={{ display: 'grid', gap: 8 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                                <span
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: 500,
                                        fontSize: 20,
                                        lineHeight: 1.18,
                                        color: primaryColor,
                                    }}
                                >
                                    {t.motionTitle}
                                </span>

                                <PinButton pin={{ kind: 'energy', key: 'from' }} pinning={pinning} color={primaryColor} />
                            </div>

                            <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--tof-text-soft)' }}>
                                {primary?.energy_from}
                            </p>
                        </div>

                        {drains.length > 0 && (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <div style={LABEL}>{t.drainLabel}</div>

                                {drains.map((item, index) => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                        <span style={{ color: primaryColor, fontWeight: 700, fontSize: 14, lineHeight: 1.6, flexShrink: 0 }}>
                                            ×
                                        </span>

                                        <span style={{ flex: 1, fontSize: 14, lineHeight: 1.62, color: 'var(--tof-text-soft)' }}>
                                            {item}
                                        </span>

                                        <PinButton
                                            pin={{ kind: 'drain', key: String(index) }}
                                            pinning={pinning}
                                            color={primaryColor}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </Sectie>
                )}

                {/* 5b — WERKPLEK: je ideale werkplekmix (Bricks) */}
                {chapter === 'workplace' && (
                    <Sectie
                        label={heads.workplace.label}
                        title={heads.workplace.title}
                        accent={primaryColor}
                        isMobile={isMobile}
                        style={riseIn(4)}
                    >
                        {/* De sterkste drie: dit is je mix, met uitleg erbij. */}
                        <div style={{ display: 'grid', gap: 10 }}>
                            {bricksItems.slice(0, 3).map((item) => (
                                <div
                                    key={item.key}
                                    style={{
                                        background: 'var(--tof-bg)',
                                        borderRadius: 12,
                                        padding: '12px 14px',
                                        borderTop: '1px solid var(--tof-border)',
                                        borderRight: '1px solid var(--tof-border)',
                                        borderBottom: '1px solid var(--tof-border)',
                                        borderLeft: `4px solid ${primaryColor}`,
                                        display: 'grid',
                                        gap: 6,
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                        <span
                                            style={{
                                                fontFamily: "'Playfair Display', serif",
                                                fontWeight: 500,
                                                fontSize: 17,
                                                lineHeight: 1.12,
                                                color: 'var(--tof-text)',
                                            }}
                                        >
                                            {item.label}
                                        </span>

                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                                            <span
                                                style={{
                                                    fontSize: 11,
                                                    fontWeight: 600,
                                                    color: primaryColor,
                                                    background: `${primaryColor}14`,
                                                    borderRadius: 999,
                                                    padding: '4px 8px',
                                                }}
                                            >
                                                {t.scorePrefix} {item.score}
                                            </span>

                                            <PinButton
                                                pin={{ kind: 'workplace', key: item.key }}
                                                pinning={pinning}
                                                color={primaryColor}
                                            />
                                        </span>
                                    </div>

                                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.62, color: 'var(--tof-text-soft)' }}>
                                        {item.text}
                                    </p>
                                </div>
                            ))}
                        </div>

                        {/* En de rest van de acht, zonder uitleg. Wat je mínder
                            nodig hebt is voor een gesprek net zo bruikbaar — maar
                            het hoeft niet evenveel ruimte te krijgen. */}
                        {bricksItems.length > 3 && (
                            <div style={{ display: 'grid', gap: 8 }}>
                                <div style={LABEL}>{t.bricksRestLabel}</div>

                                {bricksItems.slice(3).map((item) => (
                                    <div
                                        key={item.key}
                                        style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                                    >
                                        <span style={{ flex: 1, fontSize: 14, lineHeight: 1.5, color: 'var(--tof-text-soft)' }}>
                                            {item.label}
                                        </span>

                                        {/* Een streepje in plaats van een getal: het
                                            gaat om de verhouding, niet om de score.
                                            Vier is het hoogste dat voorkomt. */}
                                        <span
                                            aria-hidden="true"
                                            style={{ width: 44, height: 4, borderRadius: 999, background: 'var(--tof-border)' }}
                                        >
                                            <span
                                                style={{
                                                    display: 'block',
                                                    width: `${(item.score / 4) * 100}%`,
                                                    height: '100%',
                                                    borderRadius: 999,
                                                    background: primaryColor,
                                                    opacity: 0.5,
                                                }}
                                            />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Sectie>
                )}

                {/* 5c — DIGITAAL (Bytes): de gereedschappen die bij je passen */}
                {chapter === 'bytes' && (
                    <Sectie
                        label={heads.bytes.label}
                        title={heads.bytes.title}
                        accent={primaryColor}
                        isMobile={isMobile}
                        style={riseIn(4)}
                    >
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: 'var(--tof-text-soft)' }}>
                            {primary.bytes}
                        </p>
                    </Sectie>
                )}

                {/* 5d — GEDRAG (Behavior): waar de manier van werken gaat wringen */}
                {chapter === 'behavior' && (
                    <Sectie
                        label={heads.behavior.label}
                        title={heads.behavior.title}
                        accent={primaryColor}
                        isMobile={isMobile}
                        style={riseIn(4)}
                    >
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                            {friction.map((item) => (
                                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    <span style={{ color: primaryColor, fontWeight: 700, fontSize: 14, lineHeight: 1.65, flexShrink: 0 }}>
                                        ·
                                    </span>

                                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: 'var(--tof-text-soft)' }}>
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Sectie>
                )}

                {/* 5e — CULTUUR (Belonging): je plek tussen de anderen */}
                {chapter === 'culture' && (
                    <Sectie
                        label={heads.culture.label}
                        title={heads.culture.title}
                        accent={primaryColor}
                        isMobile={isMobile}
                        style={riseIn(4)}
                    >
                        <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
                            {belonging.map((item) => (
                                <li key={item} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    <span style={{ color: primaryColor, fontWeight: 700, fontSize: 14, lineHeight: 1.65, flexShrink: 0 }}>
                                        ·
                                    </span>

                                    <span style={{ flex: 1, fontSize: 14, lineHeight: 1.65, color: 'var(--tof-text-soft)' }}>
                                        {item}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Sectie>
                )}

                {/* 6 — QUOTE: het slotakkoord, onder elk hoofdstuk. `quote`, niet
                    `lquote`: dit is jouw profiel, dus de zin spreekt jou aan. */}
                {primary?.quote && (
                    <div
                        style={{
                            background: primaryColor,
                            borderRadius: 18,
                            padding: isMobile ? '20px 18px' : '24px 26px',
                            color: quoteTextColor,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: isMobile ? 19 : 22,
                            lineHeight: 1.45,
                            fontStyle: 'italic',
                            letterSpacing: '-0.01em',
                            ...riseIn(5),
                        }}
                    >
                        {primary.quote}
                    </div>
                )}

            </div>
        </PageShell>
    );
}

const LABEL = {
    fontSize: 11,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    color: 'var(--tof-text-muted)',
    fontWeight: 700,
};

/**
 * Eén hoofdstukknop. Vijf stuks, dus ze vullen niet de breedte maar krijgen de
 * ruimte die hun woord nodig heeft; de regel breekt vanzelf. Binnen een knop
 * mag de tekst níét afbreken — daarom `nowrap`, en geen langere labels dan die
 * in `native.chapters`.
 */
const CHIP = {
    borderRadius: 999,
    borderWidth: 1,
    borderStyle: 'solid',
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 600,
    lineHeight: 1.2,
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    // Apples ondergrens voor raakvlakken.
    minHeight: 40,
};

/**
 * Eén blok op het profielscherm: kaart met een gekleurde bovenrand.
 *
 * Losse randzijden in plaats van de `border`-shorthand — shorthand naast
 * longhand laat React de shorthand wissen.
 */
function Sectie({ label, title, accent, isMobile, style = {}, children }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding: isMobile ? '18px 18px' : '22px 24px',
                borderTop: `3px solid ${accent}`,
                borderRight: '1px solid var(--tof-border)',
                borderBottom: '1px solid var(--tof-border)',
                borderLeft: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 14,
                ...style,
            }}
        >
            <div style={LABEL}>{label}</div>

            {title && (
                <div
                    style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 500,
                        fontSize: isMobile ? 22 : 24,
                        lineHeight: 1.1,
                        color: accent,
                        marginTop: -6,
                    }}
                >
                    {title}
                </div>
            )}

            {children}
        </div>
    );
}
