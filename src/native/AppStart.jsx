import { useEffect, useState } from 'react';
import { riseIn } from '../components/result/motion';
import { useArchetypes } from '../i18n/archetypes';
import { useCopy } from '../i18n/LanguageContext';
import { DEFAULT_PERSONA_COLOR, PERSONA_COLORS } from '../lib/resultDerivations';
import { PageShell, PrimaryButton, SectionEyebrow } from '../ui/AppShell';
import { getCurrentEntry } from './localStore';
import { tap } from './nativeShell';

/**
 * AppStart — waar de app op opent.
 *
 * Het web opent op een uitleg-/verkooppagina; de app hoort te openen op jóuw
 * profiel. Wie de test al deed ziet meteen wie hij is en kan door naar het
 * volledige profiel, de historie of de bibliotheek. Wie nog niets heeft, ziet
 * precies één ding: de test.
 *
 * Bestaat alleen in app-modus (zie App.js); de webversie blijft Home.jsx.
 */
export default function AppStart({ setPage }) {
    const { native: copy } = useCopy();
    const t = copy.start;
    const ARCHETYPES = useArchetypes();
    // Bij elke route-wissel wordt dit scherm opnieuw opgebouwd, dus één keer
    // lezen bij het opstarten is genoeg.
    const [entry] = useState(() => getCurrentEntry());
    const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 900);
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    const primary = ARCHETYPES.find((a) => a.id === entry?.result?.primary);
    const kleur = PERSONA_COLORS[primary?.id] || DEFAULT_PERSONA_COLOR;
    const heeftProfiel = Boolean(primary);

    const ga = (page) => {
        tap();
        setPage(page);
    };

    return (
        <PageShell padding={isMobile ? '16px 16px 28px' : '20px 20px 36px'}>
            <div
                style={{
                    display: 'grid',
                    alignSelf: 'start',
                    gap: isMobile ? 20 : 28,
                    width: '100%',
                    maxWidth: 720,
                }}
            >
                <div style={{ display: 'grid', gap: 12, ...riseIn(0) }}>
                    <SectionEyebrow>{t.eyebrow}</SectionEyebrow>

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
                        {heeftProfiel ? t.title : t.emptyTitle}
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
                        {heeftProfiel ? t.intro : t.emptyIntro}
                    </p>
                </div>

                {heeftProfiel ? (
                    <>
                        <Kaart accent={kleur} isMobile={isMobile} style={riseIn(1)}>
                            <SectionEyebrow>{t.profileEyebrow}</SectionEyebrow>

                            <div style={{ display: 'grid', gap: 6 }}>
                                <span
                                    style={{
                                        fontFamily: "'Playfair Display', serif",
                                        fontWeight: 500,
                                        fontSize: isMobile ? 34 : 42,
                                        lineHeight: 1.06,
                                        color: kleur,
                                    }}
                                >
                                    {primary.name}
                                </span>

                                <span style={{ fontSize: 13, color: 'var(--tof-text-muted)' }}>
                                    {t.formatDate(entry.savedAt)}
                                </span>
                            </div>

                            <p
                                style={{
                                    margin: 0,
                                    color: 'var(--tof-text-soft)',
                                    lineHeight: 1.7,
                                    fontSize: 15,
                                }}
                            >
                                {primary.short}
                            </p>

                            <div>
                                <PrimaryButton
                                    onClick={() => ga('results')}
                                    style={{ background: kleur }}
                                >
                                    {t.openProfile}
                                </PrimaryButton>
                            </div>
                        </Kaart>

                        <div
                            style={{
                                display: 'grid',
                                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr',
                                gap: isMobile ? 12 : 14,
                                ...riseIn(2),
                            }}
                        >
                            <Vervolgstap
                                {...t.actions.history}
                                accent={kleur}
                                onClick={() => ga('historie')}
                            />
                            <Vervolgstap
                                {...t.actions.library}
                                accent={kleur}
                                onClick={() => ga('library')}
                            />
                            <Vervolgstap
                                {...t.actions.again}
                                accent={kleur}
                                onClick={() => ga('quiz')}
                            />
                        </div>
                    </>
                ) : (
                    <Kaart accent={kleur} isMobile={isMobile} style={riseIn(1)}>
                        <div>
                            <PrimaryButton onClick={() => ga('quiz')}>
                                {t.startTest}
                            </PrimaryButton>
                        </div>
                    </Kaart>
                )}

                {/* Beide stores eisen dat de privacyverklaring vindbaar is; in
                    een app die offline werkt hoort die in de app te staan, niet
                    achter een link naar buiten. */}
                <button
                    type="button"
                    onClick={() => ga('privacy')}
                    style={{
                        justifySelf: 'start',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        fontFamily: 'var(--tof-font-body)',
                        fontSize: 13,
                        color: 'var(--tof-text-muted)',
                        textDecoration: 'underline',
                        ...riseIn(3),
                    }}
                >
                    {t.privacyLink}
                </button>
            </div>
        </PageShell>
    );
}

/**
 * Kaart met een gekleurde linkerrand.
 *
 * Losse zijden in plaats van de `border`-shorthand: zodra één zijde afwijkt
 * botst shorthand met longhand en waarschuwt React.
 */
function Kaart({ children, accent, isMobile, style = {} }) {
    return (
        <div
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 18,
                padding: isMobile ? 20 : 26,
                borderTop: '1px solid var(--tof-border)',
                borderRight: '1px solid var(--tof-border)',
                borderBottom: '1px solid var(--tof-border)',
                borderLeft: `4px solid ${accent}`,
                boxShadow: 'var(--tof-shadow)',
                display: 'grid',
                gap: 14,
                ...style,
            }}
        >
            {children}
        </div>
    );
}

/** Eén vervolgstap onder de profielkaart — de hele kaart is de knop. */
function Vervolgstap({ title, text, accent, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            style={{
                background: 'var(--tof-surface)',
                borderRadius: 16,
                padding: '16px 18px',
                borderTop: `3px solid ${accent}`,
                borderRight: '1px solid var(--tof-border)',
                borderBottom: '1px solid var(--tof-border)',
                borderLeft: '1px solid var(--tof-border)',
                boxShadow: 'var(--tof-shadow)',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'var(--tof-font-body)',
                display: 'grid',
                gap: 6,
                alignContent: 'start',
            }}
        >
            <span
                style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 500,
                    fontSize: 19,
                    lineHeight: 1.15,
                    color: 'var(--tof-text)',
                }}
            >
                {title}
            </span>

            <span style={{ fontSize: 13, lineHeight: 1.55, color: 'var(--tof-text-soft)' }}>
                {text}
            </span>
        </button>
    );
}
