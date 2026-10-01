import { useEffect, useMemo, useState } from 'react';
import { useArchetypes } from '../i18n/archetypes';
import { useCopy } from '../i18n/LanguageContext';
import {
    PERSONA_COLORS,
    DEFAULT_PERSONA_COLOR,
    resolvePinned,
} from '../lib/resultDerivations';
import { PageShell, PrimaryButton, SecondaryButton, SectionEyebrow } from '../ui/AppShell';
import {
    closeConversation,
    getCurrentEntry,
    hasOpenConversation,
    subscribe,
} from './localStore';
import { tap } from './nativeShell';
import ProfileNotes from './ProfileNotes';

/**
 * ConversationPrep — alles wat je wilt bespreken, op één scherm.
 *
 * Bestaat alleen in app-modus. Dit is geen nieuw inzicht maar wat je zélf hebt
 * aangewezen: de vastgeprikte punten uit je profiel, en hieronder de drie vragen
 * die je zelf invult. Bewust zonder export of PDF — dit is om bij je te hebben,
 * niet om te versturen.
 *
 * De drie vragen stonden eerst onderaan je profiel, waar ze het scherm nog eens
 * 767 pixels langer maakten en niemand ze ooit bereikte. Ze horen hier: op de
 * plek waar je je gesprek voorbereidt.
 *
 * Er loopt altijd precies één gesprek. Heb je het gehad, dan rond je het af:
 * het krijgt de datum van vandaag, verhuist naar "Eerdere gesprekken" onderaan
 * en je begint met een leeg blad. Zonder dat bleef wat je een half jaar eerder
 * had opgeschreven eeuwig in de invulvelden staan, en werd het bij het volgende
 * gesprek overschreven — precies wat je wilt terugkunnen lezen.
 */
export default function ConversationPrep({ setPage }) {
    const { native: copy, resultsCard } = useCopy();
    const ARCHETYPES = useArchetypes();
    const [entry, setEntry] = useState(() => getCurrentEntry());
    // Afronden vraagt eerst na — je begint erna met een leeg blad, en dat hoort
    // niet per ongeluk te kunnen.
    const [vraagtNa, setVraagtNa] = useState(false);
    const [netAfgerond, setNetAfgerond] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    // Meelezen met de opslag. Nodig voor de afrond-knop: die hoort te
    // verschijnen zodra je iets opschrijft, en niet pas als je het scherm
    // verlaat en terugkomt. ProfileNotes houdt zijn eigen tekst vast en wordt
    // hier dus niet door overschreven (zie de `key` verderop).
    useEffect(() => subscribe(() => setEntry(getCurrentEntry())), []);

    const primary = ARCHETYPES.find((a) => a.id === entry?.result?.primary);
    const color = PERSONA_COLORS[primary?.id] || DEFAULT_PERSONA_COLOR;
    const workplaceLabels = resultsCard.profile.workplaceLabels;

    const pinnedItems = useMemo(
        () => resolvePinned(entry?.pinned, primary, workplaceLabels),
        [entry, primary, workplaceLabels]
    );

    // Nieuwste eerst in de opslag, maar de nummering loopt met de tijd mee: het
    // oudste gesprek is gesprek 1. Dus omdraaien voor het nummer, niet voor de
    // volgorde op het scherm.
    const past = entry?.conversations || [];

    const rondAf = () => {
        if (!closeConversation(entry.id)) return;
        tap(true);
        setEntry(getCurrentEntry());
        setVraagtNa(false);
        setNetAfgerond(true);
    };

    return (
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 36px'}>
            <div
                style={{
                    animation: 'tofFadeIn 0.5s ease',
                    display: 'grid',
                    alignSelf: 'start',
                    gap: isMobile ? 20 : 28,
                    width: '100%',
                    maxWidth: 920,
                }}
            >
                <div style={{ display: 'grid', gap: 12 }}>
                    <SectionEyebrow>{copy.prep.eyebrow}</SectionEyebrow>

                    <h1
                        style={{
                            margin: 0,
                            fontFamily: "'Playfair Display', serif",
                            fontWeight: 500,
                            fontSize: 'clamp(30px, 4vw, 44px)',
                            lineHeight: 1.08,
                            color: 'var(--tof-text)',
                        }}
                    >
                        {copy.prep.title}
                    </h1>

                    <p
                        style={{
                            margin: 0,
                            color: 'var(--tof-text-soft)',
                            lineHeight: 1.7,
                            fontSize: 15,
                            maxWidth: 620,
                        }}
                    >
                        {copy.prep.intro}
                    </p>
                </div>

                {/* De persona in één alinea — meer hoeft je gesprekspartner niet. */}
                {primary ? (
                    <Card isMobile={isMobile} accent={color}>
                        <h2
                            style={{
                                margin: 0,
                                fontFamily: "'Playfair Display', serif",
                                fontWeight: 500,
                                fontSize: isMobile ? 24 : 28,
                                lineHeight: 1.12,
                                color,
                            }}
                        >
                            {primary.name}
                        </h2>

                        <p style={bodyText}>{primary.short}</p>
                    </Card>
                ) : null}

                {/* Wat je van je leidinggevende nodig hebt — in de ik-vorm, dus
                    letterlijk voor te lezen. Stond eerst als "Leiderschap" in
                    je profiel, maar sprak daar over jou in de derde persoon. */}
                {primary?.needs?.length ? (
                    <Card isMobile={isMobile}>
                        <SectionEyebrow>{copy.prep.needsTitle}</SectionEyebrow>

                        <p style={bodyText}>{copy.prep.needsIntro}</p>

                        <ul
                            style={{
                                margin: 0,
                                padding: 0,
                                listStyle: 'none',
                                display: 'grid',
                                gap: 10,
                            }}
                        >
                            {primary.needs.map((line) => (
                                <li
                                    key={line}
                                    style={{
                                        ...bodyText,
                                        borderLeft: `4px solid ${color}`,
                                        paddingLeft: 12,
                                        color: 'var(--tof-text)',
                                    }}
                                >
                                    {line}
                                </li>
                            ))}
                        </ul>
                    </Card>
                ) : null}

                <Card isMobile={isMobile}>
                    <SectionEyebrow>{copy.prep.pinnedTitle}</SectionEyebrow>

                    {pinnedItems.length === 0 ? (
                        <p style={bodyText}>{copy.prep.pinnedEmpty}</p>
                    ) : (
                        <div style={{ display: 'grid', gap: 12 }}>
                            {pinnedItems.map((item) => (
                                <div
                                    key={`${item.kind}-${item.key}`}
                                    style={{
                                        borderLeft: `4px solid ${color}`,
                                        paddingLeft: 12,
                                        display: 'grid',
                                        gap: 4,
                                    }}
                                >
                                    <span
                                        style={{
                                            fontSize: 11,
                                            letterSpacing: 1.4,
                                            textTransform: 'uppercase',
                                            fontWeight: 700,
                                            color: 'var(--tof-text-muted)',
                                        }}
                                    >
                                        {copy.prep.kinds[item.kind] || item.kind}
                                    </span>

                                    {item.label ? (
                                        <span style={{ fontWeight: 600, fontSize: 15, color: 'var(--tof-text)' }}>
                                            {item.label}
                                        </span>
                                    ) : null}

                                    <p style={bodyText}>{item.text}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Hier schrijf je zelf. Typen is opslaan, op het toestel.

                    De `key` loopt mee met het aantal afgeronde gesprekken: na
                    afronden is dit een leeg blad, en een leeg blad is voor React
                    een ander blok. Zonder die sleutel blijft de oude tekst in de
                    velden staan, want het profiel-id verandert niet. */}
                {entry && (
                    <ProfileNotes
                        key={`${entry.id}-${past.length}`}
                        entryId={entry.id}
                        initialNotes={entry.notes}
                        isMobile={isMobile}
                    />
                )}

                {/* Afronden: alleen als er iets ís om af te ronden. Een leeg
                    blad met een datum erop bewaren heeft geen zin. */}
                {entry && hasOpenConversation(entry) && (
                    <Card isMobile={isMobile} accent={color}>
                        <SectionEyebrow>{copy.prep.close.title}</SectionEyebrow>

                        <p style={bodyText}>{copy.prep.close.text}</p>

                        {vraagtNa ? (
                            <>
                                <p style={{ ...bodyText, color: 'var(--tof-text)', fontWeight: 600 }}>
                                    {copy.prep.close.confirm}
                                </p>

                                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                                    <PrimaryButton onClick={rondAf}>
                                        {copy.prep.close.confirmYes}
                                    </PrimaryButton>

                                    <SecondaryButton onClick={() => setVraagtNa(false)}>
                                        {copy.prep.close.confirmCancel}
                                    </SecondaryButton>
                                </div>
                            </>
                        ) : (
                            <div>
                                <SecondaryButton onClick={() => setVraagtNa(true)}>
                                    {copy.prep.close.button}
                                </SecondaryButton>
                            </div>
                        )}
                    </Card>
                )}

                {netAfgerond && (
                    <p style={{ ...bodyText, color: 'var(--tof-text)' }} role="status">
                        {copy.prep.close.done}
                    </p>
                )}

                {/* Wat je eerder vastlegde. Alleen-lezen: dit is gebeurd. */}
                {past.length > 0 && (
                    <div style={{ display: 'grid', gap: isMobile ? 14 : 18 }}>
                        <div style={{ display: 'grid', gap: 6 }}>
                            <h2
                                style={{
                                    margin: 0,
                                    fontFamily: "'Playfair Display', serif",
                                    fontWeight: 500,
                                    fontSize: isMobile ? 24 : 28,
                                    lineHeight: 1.12,
                                    color: 'var(--tof-text)',
                                }}
                            >
                                {copy.prep.past.title}
                            </h2>

                            <p style={bodyText}>{copy.prep.past.intro}</p>
                        </div>

                        {past.map((gesprek, index) => (
                            <PastConversation
                                key={gesprek.id}
                                copy={copy}
                                isMobile={isMobile}
                                color={color}
                                gesprek={gesprek}
                                nummer={past.length - index}
                                primary={primary}
                                workplaceLabels={workplaceLabels}
                            />
                        ))}
                    </div>
                )}

                <div>
                    <PrimaryButton onClick={() => setPage('results')}>
                        {copy.prep.backToProfile}
                    </PrimaryButton>
                </div>
            </div>
        </PageShell>
    );
}

const bodyText = {
    margin: 0,
    color: 'var(--tof-text-soft)',
    lineHeight: 1.7,
    fontSize: 15,
};

/** De drie vragen, in de volgorde waarin je ze invulde. */
const NOTE_FIELDS = ['recognize', 'drains', 'ask'];

/**
 * Eén afgerond gesprek: datum, wat je opschreef, wat je meenam.
 *
 * Alleen-lezen en stiller dan het lopende gesprek — geen invulvelden, geen
 * gekleurde randen, geen knoppen. Dit is er om terug te lezen, niet om aan te
 * werken. Vragen die je toen hebt overgeslagen laten we weg: een rij lege
 * kopjes zegt niets.
 */
function PastConversation({ copy, isMobile, color, gesprek, nummer, primary, workplaceLabels }) {
    const beantwoord = NOTE_FIELDS.filter((field) => gesprek.notes?.[field]?.trim());
    const pinnedItems = resolvePinned(gesprek.pinned, primary, workplaceLabels);

    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding: isMobile ? 18 : 24,
                border: '1px solid var(--tof-border)',
                display: 'grid',
                gap: 14,
            }}
        >
            <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 600, color }}>
                    {copy.prep.past.label(nummer)}
                </span>

                <span style={{ fontSize: 14, color: 'var(--tof-text-muted)' }}>
                    {copy.prep.past.formatDate(gesprek.closedAt)}
                </span>
            </div>

            {beantwoord.length === 0 ? (
                <p style={{ ...bodyText, fontSize: 14 }}>{copy.prep.past.noAnswer}</p>
            ) : (
                beantwoord.map((field) => (
                    <div key={field} style={{ display: 'grid', gap: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--tof-text)', lineHeight: 1.45 }}>
                            {copy.notes.fields[field].label}
                        </span>

                        {/* `pre-wrap`: regeleinden die je zelf hebt getypt horen
                            te blijven staan, anders wordt een lijstje één lap. */}
                        <p style={{ ...bodyText, fontSize: 14, whiteSpace: 'pre-wrap' }}>
                            {gesprek.notes[field].trim()}
                        </p>
                    </div>
                ))
            )}

            <div style={{ display: 'grid', gap: 6 }}>
                <span
                    style={{
                        fontSize: 11,
                        letterSpacing: 1.4,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        color: 'var(--tof-text-muted)',
                    }}
                >
                    {copy.prep.pinnedTitle}
                </span>

                {pinnedItems.length === 0 ? (
                    <p style={{ ...bodyText, fontSize: 14 }}>{copy.prep.past.nothingPinned}</p>
                ) : (
                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
                        {pinnedItems.map((item) => (
                            <li
                                key={`${item.kind}-${item.key}`}
                                style={{
                                    ...bodyText,
                                    fontSize: 14,
                                    borderLeft: '2px solid var(--tof-border)',
                                    paddingLeft: 10,
                                }}
                            >
                                {item.label ? (
                                    <span style={{ fontWeight: 600, color: 'var(--tof-text)' }}>
                                        {item.label}:{' '}
                                    </span>
                                ) : null}
                                {item.text}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function Card({ children, isMobile, accent }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding: isMobile ? 20 : 26,
                // Losse zijden i.p.v. de `border`-shorthand: die botst met een
                // afwijkende linkerrand zodra React beide bijwerkt.
                borderTop: '1px solid var(--tof-border)',
                borderRight: '1px solid var(--tof-border)',
                borderBottom: '1px solid var(--tof-border)',
                borderLeft: accent
                    ? `4px solid ${accent}`
                    : '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 12,
            }}
        >
            {children}
        </div>
    );
}
