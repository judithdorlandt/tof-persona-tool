import { useEffect, useMemo, useState } from 'react';
import { useArchetypes } from '../i18n/archetypes';
import { useCopy } from '../i18n/LanguageContext';
import {
    PERSONA_COLORS,
    DEFAULT_PERSONA_COLOR,
    resolvePinned,
} from '../lib/resultDerivations';
import { PageShell, PrimaryButton, SectionEyebrow } from '../ui/AppShell';
import { getCurrentEntry } from './localStore';
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
 */
export default function ConversationPrep({ setPage }) {
    const { native: copy, resultsCard } = useCopy();
    const ARCHETYPES = useArchetypes();
    const [entry] = useState(() => getCurrentEntry());
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const primary = ARCHETYPES.find((a) => a.id === entry?.result?.primary);
    const color = PERSONA_COLORS[primary?.id] || DEFAULT_PERSONA_COLOR;
    const workplaceLabels = resultsCard.profile.workplaceLabels;

    const pinnedItems = useMemo(
        () => resolvePinned(entry?.pinned, primary, workplaceLabels),
        [entry, primary, workplaceLabels]
    );

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

                {/* Hier schrijf je zelf. Typen is opslaan, op het toestel. */}
                {entry && (
                    <ProfileNotes
                        entryId={entry.id}
                        initialNotes={entry.notes}
                        isMobile={isMobile}
                    />
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
